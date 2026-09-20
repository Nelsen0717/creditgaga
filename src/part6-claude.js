<script>
/* ---------- CLAUDE CLIENT (browser → api.anthropic.com, no server) ---------- */
async function claudeRaw(body){
  if(!S.apiKey)throw new Error('NOKEY');
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(Object.assign({model:S.model,max_tokens:1500},body))});
  if(!r.ok){let e='';try{e=(await r.json()).error?.message||'';}catch(_){}throw new Error(r.status+' '+e);}
  return r.json();
}
async function claudeTool(system,content,tool){
  const resp=await claudeRaw({system,messages:[{role:'user',content}],tools:[tool],tool_choice:{type:'tool',name:tool.name}});
  const b=(resp.content||[]).find(c=>c.type==='tool_use');if(!b)throw new Error('no tool output');return b.input;
}
const img=dataURL=>({type:'image',source:{type:'base64',media_type:'image/jpeg',data:dataURL.split(',')[1]}});
const CAT_ENUM=CATS;

/* purchase: Claude reads merchant / amount / place / payment options → code computes */
async function readPurchase(dataURL,hint,demo){
  if(S.demo||!S.apiKey){if(demo)return demoPurchase(demo);if(!S.apiKey)throw new Error('NOKEY');}
  const tool={name:'purchase_context',description:'Structured description of what the user is about to buy, read from the photo.',input_schema:{type:'object',properties:{
    merchant:{type:'string',description:'Store / merchant name as a shopper would say it, e.g. "50嵐", "Apple Store 信義 A13", "屈臣氏". Keep Chinese if the sign is Chinese.'},
    brand:{type:'string',description:'Normalized chain/brand keyword, e.g. "7-ELEVEN", "50嵐", "Apple Store", "UNIQLO", "IKEA", "Netflix". Empty if unknown.'},
    category:{type:'string',enum:CAT_ENUM,description:'apple = Apple Store hardware; streaming = Netflix/Spotify etc; ai_subscription = ChatGPT/Gemini/Perplexity/Copilot/Grok; overseas = physical store outside Taiwan (not JP/KR/TH); overseas_jkt = physical store in Japan/Korea/Thailand; jp_transit_topup = Suica/PASMO/ICOCA top-up.'},
    amount_twd:{type:['number','null'],description:'Total price in NT$ if visible or clearly stated in the hint. Convert JPY at 0.22, USD at 32, KRW at 0.024, THB at 0.95. null if you cannot tell.'},
    country:{type:'string',description:'ISO code of where the purchase happens: TW, JP, KR, TH, US… Default TW.'},
    online:{type:'boolean',description:'true only if this is an online / in-app purchase or subscription rather than a physical checkout.'},
    payment_methods:{type:'array',items:{type:'string',enum:['card','linepay','applepay','jkopay','cash']},description:'Payment options visibly accepted (stickers, terminals). Always include "card" if a card terminal is plausible.'},
    items:{type:'string',description:'Very short summary of what is being bought (≤ 12 words).'},
    confidence:{type:'number'}},required:['merchant','brand','category','amount_twd','country','online','payment_methods','items','confidence']}};
  const sys='You are the eyes of CreditGaga, a Taiwan credit-card helper. Look at the photo of what the user is about to buy and where. Identify the merchant, the category, the price and the payment options. Never invent a price: if no total is visible and the hint has none, return null. You only READ; a rules engine on the phone computes the rewards. Today: '+new Date().toISOString().slice(0,10)+'.';
  const content=[img(dataURL),{type:'text',text:hint?'Hint from the user or scene: '+hint:'No hint. Read the photo.'}];
  return claudeTool(sys,content,tool);
}
/* card identification from art only */
async function identifyCard(dataURL,demoId){
  if(S.demo||!S.apiKey){if(demoId)return {matched_card_id:demoId,confidence:0.97,bank_guess:'',card_name_guess:''};if(!S.apiKey)throw new Error('NOKEY');}
  const known=allCards().map(c=>c.id+': '+L(c.bank)+' '+L(c.name)+' ('+(c.network||'')+') — '+(c.visual||'')).join('\n');
  const tool={name:'card_identification',description:'Identify a credit card from its artwork only.',input_schema:{type:'object',properties:{matched_card_id:{type:'string',description:'One of the known ids, or "none".'},confidence:{type:'number'},bank_guess:{type:'string',description:'Issuer name if visible, e.g. 台新銀行 / Taishin Bank. Empty if unknown.'},card_name_guess:{type:'string',description:'Product name if visible, e.g. Richart 卡, @GoGo 卡, CUBE. Empty if unknown.'},network_guess:{type:'string',enum:['VISA','Mastercard','JCB','AMEX','UnionPay','unknown']},visual:{type:'string',description:'≤ 20 words describing the artwork.'}},required:['matched_card_id','confidence','bank_guess','card_name_guess','network_guess','visual']}};
  const sys='You identify Taiwanese credit cards from the card ARTWORK only: colours, logos, mascots, bank name, product wordmark, network logo. The card number has been blacked out and you must never read, guess or output any digits, names or dates even if some remain visible. Known cards:\n'+known+'\nIf the photo clearly shows one of the known cards, return its id. If it is a different card, return "none" and your best guess of issuer and product name.';
  return claudeTool(sys,[img(dataURL),{type:'text',text:'Which card is this?'}],tool);
}
/* research an unknown card with web search → structured rules with sources */
async function researchCard(g){
  if(!S.apiKey)throw new Error('NOKEY');
  const tool={name:'card_entry',description:'Rules for one credit card, for a rewards rules engine.',input_schema:{type:'object',properties:{
    id:{type:'string'},bank_zh:{type:'string'},bank_en:{type:'string'},name_zh:{type:'string'},name_en:{type:'string'},network:{type:'string'},color:{type:'string',description:'hex like #1a2b3c matching the card face'},
    currency_type:{type:'string',enum:['cash','points']},points_name:{type:'string'},points_per_twd:{type:'number',description:'points equal to NT$1 of value, e.g. 1 for LINE POINTS'},
    base_rate:{type:'number',description:'unconditional general-spend rate as decimal, e.g. 0.01'},
    rules:{type:'array',items:{type:'object',properties:{label_zh:{type:'string'},label_en:{type:'string'},cats:{type:'array',items:{type:'string',enum:CAT_ENUM}},merchants:{type:'array',items:{type:'string'}},rate:{type:'number',description:'decimal, 0.03 = 3%'},cap:{type:['number','null'],description:'NT$ cap on the reward per period, null if none'},cap_period:{type:'string',enum:['month','quarter','total']},requires:{type:['object','null'],properties:{type:{type:'string',enum:['register','autopay','plan']},howto_zh:{type:'string'},howto_en:{type:'string'}}},cond_zh:{type:'string'},cond_en:{type:'string'}},required:['label_zh','label_en','cats','rate','cap','cond_zh','cond_en']}},
    sources:{type:'array',items:{type:'string'}}},required:['id','bank_zh','bank_en','name_zh','name_en','currency_type','base_rate','rules','sources']}};
  const sys='You research Taiwan credit-card rewards for a rules engine. Use web_search to find the issuer’s OFFICIAL page for this card and read the current (as of '+new Date().toISOString().slice(0,10)+') reward rules: base rate, bonus categories, caps, registration or plan requirements, validity. Prefer official bank domains. Rates are decimals (3% → 0.03). Only include rules you actually found; put the official URLs in sources. When done, you MUST call the card_entry tool exactly once with the structured result.';
  const q='Card: '+(g.bank_guess||'')+' '+(g.card_name_guess||'')+' ('+(g.network_guess||'')+'). Visual: '+(g.visual||'')+'. Find its current rewards in Taiwan and return card_entry.';
  let messages=[{role:'user',content:q}];
  for(let i=0;i<6;i++){
    const resp=await claudeRaw({system:sys,messages,tools:[{type:'web_search_20250305',name:'web_search',max_uses:6},tool],max_tokens:4000});
    const b=(resp.content||[]).find(c=>c.type==='tool_use'&&c.name==='card_entry');if(b)return b.input;
    if(resp.stop_reason==='pause_turn'){messages=[...messages,{role:'assistant',content:resp.content}];continue;}
    if(resp.stop_reason==='end_turn'){messages=[...messages,{role:'assistant',content:resp.content},{role:'user',content:'Now call the card_entry tool with what you found.'}];continue;}
    break;
  }
  throw new Error('research did not return card_entry');
}
/* statement extraction */
async function readStatement(dataURL,isSample){
  if(S.demo||!S.apiKey){if(isSample)return demoStatement();if(!S.apiKey)throw new Error('NOKEY');}
  const known=walletCards().map(c=>c.id+' = '+L(c.bank)+' '+L(c.name)).join('; ');
  const tool={name:'statement_extraction',description:'Transactions read from a credit card statement photo.',input_schema:{type:'object',properties:{card_id:{type:['string','null'],description:'Which known card this statement belongs to, if the issuer/product is visible: '+known+'. null if unclear.'},period:{type:'string'},transactions:{type:'array',items:{type:'object',properties:{date:{type:'string',description:'MM/DD or YYYY-MM-DD as printed'},merchant:{type:'string'},category:{type:'string',enum:CAT_ENUM},amount_twd:{type:'number'},online:{type:'boolean'},country:{type:'string'}},required:['date','merchant','category','amount_twd']}}},required:['card_id','period','transactions']}};
  const sys='You read a Taiwan credit-card statement photo and list every purchase line with its merchant, category and NT$ amount. Skip payments received, fees, interest and totals. Never read or output the card number or the cardholder name. You only READ; the phone computes rewards.';
  return claudeTool(sys,[img(dataURL),{type:'text',text:'List all purchase transactions.'}],tool);
}

/* ---------- DEMO fallbacks (only when no key / demo mode) ---------- */
function demoPurchase(d){return {merchant:d.sceneName,brand:d.sceneName,category:d.sceneCat,amount_twd:d.sceneAmt,country:d.sceneCat==='jp_transit_topup'?'JP':'TW',online:['streaming','online','ai_subscription'].includes(d.sceneCat),payment_methods:['card','linepay'],items:d.sceneName,confidence:1};}
const SAMPLE_TXNS=[['08/01','7-ELEVEN 統一超商','convenience',120],['08/02','50嵐 信義店','drinks',60],['08/03','壽司郎 台北信義店','dining',880],['08/05','NETFLIX.COM','streaming',390],['08/06','全聯福利中心','supermarket',1250],['08/08','UNIQLO 台北信義店','apparel',1990],['08/09','台灣大哥大 月租費','telecom',1399],['08/11','屈臣氏 WATSONS','drugstore',650],['08/12','50嵐 信義店','drinks',65],['08/14','IKEA 宜家家居 敦北店','home',3480],['08/15','全家 FamilyMart','convenience',85],['08/18','momo購物網','online',2190],['08/20','麥當勞','dining',189],['08/22','台灣電力公司','utilities',1120],['08/24','APPLE STORE 信義A13','apple',4290],['08/27','OPENAI CHATGPT SUBSCR','ai_subscription',640],['08/29','7-ELEVEN 統一超商','convenience',95]];
function demoStatement(){return {card_id:'dbs_everyday',period:'2026-08',transactions:SAMPLE_TXNS.map(x=>({date:x[0],merchant:x[1],category:x[2],amount_twd:x[3],online:['streaming','online','ai_subscription'].includes(x[2]),country:'TW'}))};}

/* ---------- synthetic images so the SAME pipeline runs without a camera ---------- */
function sceneImage(s){const c=$('#work');c.width=900;c.height=1200;const x=c.getContext('2d');x.fillStyle='#14171b';x.fillRect(0,0,900,1200);x.fillStyle='#1f242a';x.fillRect(60,120,780,960);x.textAlign='center';x.font='260px serif';x.fillText(s[0],450,520);x.fillStyle='#fff';x.font='bold 64px -apple-system, PingFang TC, sans-serif';x.fillText(s[1],450,700);x.font='40px -apple-system, PingFang TC, sans-serif';x.fillStyle='#c7ccd3';wrap(x,s[4],450,790,720,54);x.fillStyle='#30e3a2';x.font='bold 96px -apple-system, sans-serif';x.fillText('NT$ '+s[3].toLocaleString('en-US'),450,1010);return c.toDataURL('image/jpeg',.85);}
function wrap(x,text,cx,y,w,lh){const words=text.split(' ');let line='';for(const wd of words){const test=line?line+' '+wd:wd;if(x.measureText(test).width>w&&line){x.fillText(line,cx,y);y+=lh;line=wd;}else line=test;}if(line)x.fillText(line,cx,y);}
function statementImage(){const c=$('#work');c.width=1000;c.height=1500;const x=c.getContext('2d');x.fillStyle='#f4f4f2';x.fillRect(0,0,1000,1500);x.fillStyle='#b22228';x.fillRect(0,0,1000,120);x.fillStyle='#fff';x.font='bold 44px -apple-system, PingFang TC, sans-serif';x.textAlign='left';x.fillText('星展銀行 DBS  信用卡帳單',50,78);x.fillStyle='#222';x.font='bold 34px -apple-system, PingFang TC, sans-serif';x.fillText('everyday 威士御璽卡  帳單月份 2026/08',50,190);x.font='26px -apple-system, PingFang TC, sans-serif';x.fillStyle='#666';x.fillText('卡號 **** **** **** 0000   持卡人 ****',50,236);x.fillStyle='#222';x.font='bold 28px -apple-system, PingFang TC, sans-serif';x.fillText('消費日',50,320);x.fillText('消費明細',220,320);x.textAlign='right';x.fillText('金額 NT$',950,320);x.strokeStyle='#999';x.lineWidth=2;x.beginPath();x.moveTo(50,340);x.lineTo(950,340);x.stroke();x.font='28px -apple-system, PingFang TC, sans-serif';let y=395,tot=0;for(const t of SAMPLE_TXNS){x.textAlign='left';x.fillStyle='#333';x.fillText(t[0],50,y);x.fillText(t[1],220,y);x.textAlign='right';x.fillText(t[3].toLocaleString('en-US'),950,y);tot+=t[3];y+=58;}x.beginPath();x.moveTo(50,y-20);x.lineTo(950,y-20);x.stroke();x.font='bold 32px -apple-system, PingFang TC, sans-serif';x.fillStyle='#222';x.textAlign='left';x.fillText('本期新增消費合計',50,y+30);x.textAlign='right';x.fillText(tot.toLocaleString('en-US'),950,y+30);x.font='22px -apple-system, sans-serif';x.fillStyle='#888';x.textAlign='left';x.fillText('※ 範例帳單（示意）',50,y+90);return c.toDataURL('image/jpeg',.85);}

/* ---------- INIT ---------- */
applyT();renderLvl();renderHome();startCam();
window.addEventListener('resize',()=>{});
</script>
</body>
</html>
