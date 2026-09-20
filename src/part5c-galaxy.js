<script>
/* ---------- GALAXY: strategy map, the entry screen ---------- */
const GX_CATS=[['drinks',60,'🧋'],['dining',500,'🍣'],['convenience',100,'🏪'],['supermarket',1000,'🛒'],['drugstore',500,'🧴'],['apparel',2000,'👕'],['apple',30000,'💻'],['home',3000,'🛋️'],['online',2000,'📦'],['streaming',390,'📺'],['ai_subscription',640,'🤖'],['telecom',1399,'📱'],['utilities',1000,'💡'],['gas',1000,'⛽'],['travel',10000,'✈️'],['overseas_jkt',3000,'🗼']];
let gxStars=null,gxRAF=null,gxTipT=null;
function strategy(){const cards=walletCards();const rows=[];for(const [cat,amt,em] of GX_CATS){const ctx={merchant:'',brand:'',category:cat,amount:amt,country:cat==='overseas_jkt'?'JP':'TW',online:['online','streaming','ai_subscription'].includes(cat)};const r=recommend(ctx,cards);rows.push({cat,amt,em,winner:r.winner,unlock:r.unlock});}return rows;}
function renderGalaxy(){
  const W=innerWidth,H=innerHeight;const cards=walletCards();const rows=strategy();
  // starfield
  const cv=$('#gxCv');cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;const g=cv.getContext('2d');g.scale(devicePixelRatio,devicePixelRatio);
  if(!gxStars||gxStars.W!==W){gxStars={W,list:Array.from({length:140},(_,i)=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.3,p:Math.random()*6.28,s:.4+Math.random()*.6}))};}
  cancelAnimationFrame(gxRAF);let t0=null;(function frame(ts){if(!$('#galaxy').classList.contains('active')){return;}t0=t0||ts;const t=(ts-t0)/1000;g.clearRect(0,0,W,H);const rg=g.createRadialGradient(W/2,H*.5,20,W/2,H*.5,H*.7);rg.addColorStop(0,'#0f1a16');rg.addColorStop(1,'#000');g.fillStyle=rg;g.fillRect(0,0,W,H);for(const s of gxStars.list){const a=.35+.65*Math.abs(Math.sin(t*s.s+s.p));g.globalAlpha=a;g.fillStyle=s.r>1.2?'#c9fff0':'#fff';g.beginPath();g.arc(s.x,s.y,s.r,0,6.28);g.fill();}g.globalAlpha=1;gxRAF=requestAnimationFrame(frame);})(performance.now());
  // layout: cards on inner ring, categories on outer ring
  const cx=W/2,cy=H*.47,RX1=W*.27,RY1=H*.10,RX2=W*.43,RY2=H*.29;
  const pos={};const nodes=$('#gxNodes');nodes.innerHTML='';const svg=$('#gxSvg');svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML='';
  const winCount={};rows.forEach(r=>{if(r.winner)winCount[r.winner.card.id]=(winCount[r.winner.card.id]||0)+1;});
  cards.forEach((c,i)=>{const a=-Math.PI/2+i*(2*Math.PI/Math.max(1,cards.length));const x=cx+Math.cos(a)*RX1,y=cy+Math.sin(a)*RY1;pos[c.id]=[x,y];const n=winCount[c.id]||0;const size=52+Math.min(34,n*6);
    const el=document.createElement('div');el.className='gx-node card';el.style.left=x+'px';el.style.top=y+'px';el.style.zIndex=3;
    el.innerHTML='<div class="pl'+(CARD_ART[c.id]?'':' solid')+'" style="width:'+size+'px;height:'+size+'px;animation-delay:'+(i*.4)+'s;'+(CARD_ART[c.id]?'':'background:'+c.color+';color:'+(lightBg(c.color)?'#000':'#fff'))+'">'+(CARD_ART[c.id]?'<img src="'+CARD_ART[c.id]+'" alt="">':esc(L(c.name)).slice(0,6))+(n?'<b>'+n+'</b>':'')+'</div>';
    el.addEventListener('click',()=>{requestTilt();cardSheet(c.id);});nodes.appendChild(el);});
  rows.forEach((r,i)=>{const a=-Math.PI/2+i*(2*Math.PI/rows.length);const x=cx+Math.cos(a)*RX2,y=cy+Math.sin(a)*RY2;
    const el=document.createElement('div');el.className='gx-node cat'+(r.unlock?' locked':'');el.style.left=x+'px';el.style.top=y+'px';el.style.zIndex=2;
    el.innerHTML='<div class="em">'+r.em+'</div><div class="nm">'+esc(catName(r.cat))+'</div>';
    el.addEventListener('click',()=>gxTip(x,y,r));nodes.appendChild(el);
    if(r.winner&&pos[r.winner.card.id]){const [px,py]=pos[r.winner.card.id];const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',px);l.setAttribute('y2',py);l.setAttribute('class','win');svg.appendChild(l);}
    if(r.unlock&&pos[r.unlock.card.id]){const [px,py]=pos[r.unlock.card.id];const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',px);l.setAttribute('y2',py);l.setAttribute('class','pot');svg.appendChild(l);}});
  // strategy line
  const top=Object.entries(winCount).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>'<b>'+esc(L(cardById(id).name).replace(/^(合庫|國泰世華|台灣大哥大|中信|元大|星展)\s?/,''))+'</b> '+n).join(' · ');
  const k=rows.filter(r=>r.unlock).length;
  $('#gxStrat').innerHTML=cards.length?esc(t('strat',{n:rows.length,top:''})).replace(/·\s*$/,'')+' · '+top+(k?'<br>'+esc(t('stratLock',{k})):''):esc(t('noCards'));
  $('#gxLvl').innerHTML=$('#lvlPill').innerHTML;$('#gxLang').textContent=LANG==='zh'?'EN':'繁';
}
function gxTip(x,y,r){clearTimeout(gxTipT);$$('.gx-tip').forEach(e=>e.remove());const d=document.createElement('div');d.className='gx-tip';d.style.left='50%';d.style.top=Math.max(90,Math.min(innerHeight-160,y-70))+'px';
  const w=r.winner;d.innerHTML=(w?'<span>'+esc(catName(r.cat))+' → '+esc(L(w.card.name))+' '+pct(w.rule.rate)+'</span><small>'+esc(money(r.amt))+' → '+esc(money(w.reward))+(r.unlock?' · 🔓 '+esc(L(r.unlock.card.name))+' '+pct(r.unlock.rule.rate):'')+'</small>':esc(t('noCards')));
  $('#galaxy').appendChild(d);gxTipT=setTimeout(()=>d.remove(),3200);}
$('#gxGo').addEventListener('click',()=>{go('home');if(!camOn&&!camTried)startCam();});
$('#gxWallet').addEventListener('click',()=>{go('wallet');renderWallet();});
$('#gxStmt').addEventListener('click',()=>{go('statement');renderStmtIntro();});
$('#gxLang').addEventListener('click',()=>setLang(LANG==='zh'?'en':'zh'));
$('#gxGear').addEventListener('click',openSettings);
$('#gxLvl').addEventListener('click',()=>{go('wallet');renderWallet();});
$('#homeBack').addEventListener('click',()=>go('galaxy'));
window.addEventListener('resize',()=>{if($('#galaxy').classList.contains('active'))renderGalaxy();});

/* ---------- TEXT INPUT (dictation-friendly) ---------- */
$('#typeBtn').addEventListener('click',openType);
function openType(){sheet('<h3>'+esc(t('typeTitle'))+'</h3><p>'+esc(t('typeSub'))+'</p><div class="field"><textarea id="typeIn" placeholder="'+esc(t('typeHint').replace(/^.*?[:：]\s*/,''))+'"></textarea></div><button class="btn accent block" id="typeGo">'+esc(t('typeGo'))+' →</button>');setTimeout(()=>$('#typeIn').focus(),80);$('#typeGo').addEventListener('click',()=>{const v=$('#typeIn').value.trim();if(!v)return;closeSheet();analyzeText(v);});}
async function analyzeText(text){
  pendingImg=textImage(text);$('#resBgImg').src=pendingImg;showScan('scanning');
  let ctx;try{ctx=await readPurchaseText(text);}catch(e){hideScan();showError(e);return;}
  if(ctx.amount==null&&ctx.amount_twd!=null)ctx.amount=ctx.amount_twd;ctx.amount=ctx.amount==null||isNaN(ctx.amount)?null:+ctx.amount;if(!ctx.brand)ctx.brand=ctx.merchant;
  if(!CATS.includes(ctx.category))ctx.category='general';
  if(ctx.amount==null||ctx.amount<=0){hideScan();askAmount(ctx);return;}
  finishPurchase(ctx);
}
function textImage(text){const c=$('#work');c.width=900;c.height=1200;const x=c.getContext('2d');x.fillStyle='#101513';x.fillRect(0,0,900,1200);x.fillStyle='#30e3a2';x.font='bold 120px -apple-system, PingFang TC, sans-serif';x.textAlign='center';x.fillText('“',450,420);x.fillStyle='#fff';x.font='bold 54px -apple-system, PingFang TC, sans-serif';wrap(x,text,450,560,720,72);return c.toDataURL('image/jpeg',.8);}
/* local parser: used in demo mode / no key, and as a safety net */
const KW=[['convenience',['7-11','7-eleven','小七','全家','萊爾富','超商','ok超商']],['supermarket',['全聯','家樂福','好市多','costco','超市','量販','大潤發']],['drugstore',['屈臣氏','康是美','藥妝','寶雅']],['apple',['apple store','apple','iphone','macbook','ipad','airpods','mac ']],['home',['ikea','宜得利','nitori','特力屋','家具','hola','燦坤','全國電子']],['online',['momo','pchome','蝦皮','shopee','amazon','網購','酷澎','coupang']],['streaming',['netflix','spotify','disney','youtube','串流']],['ai_subscription',['chatgpt','openai','gemini','perplexity','copilot','grok','claude']],['telecom',['月租','電信','台灣大哥大','中華電信','遠傳']],['utilities',['台電','電費','水費','瓦斯']],['gas',['加油','中油','台塑','油錢']],['travel',['機票','飯店','訂房','高鐵','agoda','booking','klook','kkday','uber']],['jp_transit_topup',['suica','pasmo','icoca','西瓜卡','儲值']],['overseas_jkt',['東京','日本','大阪','首爾','韓國','曼谷','泰國']],['drinks',['50嵐','清心','可不可','珍奶','奶茶','手搖','星巴克','拿鐵','咖啡','路易莎','cama','茶']],['dining',['壽司','餐廳','麥當勞','肯德基','摩斯','鼎泰豐','火鍋','燒肉','拉麵','吃飯','晚餐','午餐','早餐','八方','客美多','subway','漢堡']],['apparel',['uniqlo','gu','zara','h&m','衣服','外套','褲子','net']]];
function localParse(text){const low=text.toLowerCase();let category='general',brand='';for(const [cat,ks] of KW){const hit=ks.find(k=>low.includes(k.toLowerCase()));if(hit){category=cat;brand=hit;break;}}
  let work=low.replace(/,/g,'');if(brand)work=work.split(brand.toLowerCase()).join(' ');let amount=null,amtStr='';let m=work.match(/(\d+(?:\.\d+)?)\s*(元|塊|nt\$?|twd|dollars?|\$)/i)||work.match(/(?:nt\$?|\$)\s*(\d+(?:\.\d+)?)/i);if(!m){const all=[...work.matchAll(/\d+(?:\.\d+)?/g)];if(all.length){m=all[all.length-1];}}if(m){amount=+(m[1]||m[0]);amtStr=m[0];}
  const merchant=(amtStr?text.replace(new RegExp(amtStr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),''):text).replace(/(元|塊|nt\$?|twd)/ig,'').replace(/[，,。\.\s]+$/,'').trim().slice(0,30)||brand||text;
  return {merchant,brand:brand||merchant,category,amount_twd:amount,country:category==='overseas_jkt'||category==='jp_transit_topup'?'JP':'TW',online:['online','streaming','ai_subscription'].includes(category),payment_methods:['card','linepay'],items:text,confidence:.6,local:true};}

/* ---------- mascot moods + scan chips ---------- */
function mood(sel,m){const el=$(sel);if(!el)return;el.classList.remove('think','happy','wow','wink','sad');if(m)el.classList.add(m);}
let chipT;function scanChipsStart(){const c=$('#scanChips');const ks=t('scanChips');c.innerHTML=ks.map(k=>'<span>'+esc(k)+'</span>').join('');let i=0;clearInterval(chipT);const step=()=>{[...c.children].forEach((e,j)=>e.classList.toggle('on',j<=i));i=(i+1)%(ks.length+1);};step();chipT=setInterval(step,900);}
function scanChipsStop(){clearInterval(chipT);}
</script>
