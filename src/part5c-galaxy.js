<script>
/* ---------- GALAXY: strategy map, the entry screen ---------- */
const GX_CATS=[['drinks',60,'🧋'],['dining',500,'🍣'],['convenience',100,'🏪'],['supermarket',1000,'🛒'],['drugstore',500,'🧴'],['apparel',2000,'👕'],['apple',30000,'💻'],['home',3000,'🛋️'],['online',2000,'📦'],['streaming',390,'📺'],['ai_subscription',640,'🤖'],['telecom',1399,'📱'],['utilities',1000,'💡'],['gas',1000,'⛽'],['travel',10000,'✈️'],['overseas_jkt',3000,'🗼']];
let gxStars=null,gxRAF=null,gxTipT=null;
function strategy(){const cards=walletCards();const rows=[];for(const [cat,amt,em] of GX_CATS){const ctx={merchant:'',brand:'',category:cat,amount:amt,country:cat==='overseas_jkt'?'JP':'TW',online:['online','streaming','ai_subscription'].includes(cat)};const r=recommend(ctx,cards);rows.push({cat,amt,em,winner:r.winner,unlock:r.unlock});}return rows;}
const ICONS={wallet:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><rect x="14" y="12.5" width="5" height="3" rx="1"/></svg>',receipt:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',camera:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',type:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h1M11 10h1M15 10h1M8 14h8"/></svg>',cup:'<svg viewBox="0 0 24 24"><path d="M6 7h12l-1.5 13h-9z"/><path d="M13 7l2-4"/><path d="M6.5 12h11"/></svg>',coffee:'<svg viewBox="0 0 24 24"><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M8 4v2M11 3v3"/></svg>',ticket:'<svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 0 0 4v5h16v-5a2 2 0 0 0 0-4V7H4z"/><path d="M12 7v10"/></svg>',tv:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',headphones:'<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="7" rx="1.5"/><rect x="17" y="13" width="4" height="7" rx="1.5"/></svg>',plane:'<svg viewBox="0 0 24 24"><path d="M2 14l20-9-5 16-5-6z"/><path d="M12 15l-3 4"/></svg>',phone:'<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/></svg>',bag:'<svg viewBox="0 0 24 24"><path d="M5 9h14l-1 12H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>',register:'<svg viewBox="0 0 24 24"><path d="M5 4h10l4 4v12H5z"/><path d="M9 13l2 2 4-4"/></svg>',bank:'<svg viewBox="0 0 24 24"><path d="M3 9l9-5 9 5H3z"/><path d="M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18"/></svg>',check:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',plan:'<svg viewBox="0 0 24 24"><path d="M4 7h10M4 17h10"/><path d="M11 4l3 3-3 3M11 14l3 3-3 3"/><path d="M18 5v14"/></svg>'};
const ic=n=>'<span class="ic">'+(ICONS[n]||'')+'</span>';
function mountIcons(){$$('[data-ic]').forEach(el=>{if(!el.innerHTML)el.innerHTML=ICONS[el.dataset.ic]||'';});}
const shortName=c=>L(c.name).replace(/^(合庫|國泰世華|台灣大哥大|中信|元大|星展)\s?/,'').replace(/^(Cathay|CTBC|DBS|Yuanta|Taipei Fubon|Fubon|TCB)\s/,'');
let wlFocus=null,wlOpened=false;
function renderGalaxy(){
  const W=innerWidth,H=innerHeight;const cards=walletCards();const rows=strategy();
  const cv=$('#gxCv');cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;const g=cv.getContext('2d');g.scale(devicePixelRatio,devicePixelRatio);
  if(!gxStars||gxStars.W!==W){gxStars={W,list:Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+.3,p:Math.random()*6.28,s:.3+Math.random()*.5}))};}
  cancelAnimationFrame(gxRAF);let t0=null;(function frame(ts){if(!$('#galaxy').classList.contains('active'))return;t0=t0||ts;const t=(ts-t0)/1000;g.clearRect(0,0,W,H);g.fillStyle='#050607';g.fillRect(0,0,W,H);for(const s of gxStars.list){g.globalAlpha=.25+.55*Math.abs(Math.sin(t*s.s+s.p));g.fillStyle='#fff';g.beginPath();g.arc(s.x,s.y,s.r,0,6.28);g.fill();}g.globalAlpha=1;gxRAF=requestAnimationFrame(frame);})(performance.now());
  const byCard={};rows.forEach(r=>{if(r.winner)(byCard[r.winner.card.id]=byCard[r.winner.card.id]||[]).push(r);});
  const order=cards.slice().sort((a,b)=>(byCard[b.id]||[]).length-(byCard[a.id]||[]).length);
  const stage=$('#wlStage');stage.querySelectorAll('.wl-card').forEach(e=>e.remove());
  const n=order.length;const stageH=stage.clientHeight||H*.5;
  order.forEach((c,i)=>{const el=document.createElement('div');el.className='wl-card'+(CARD_ART[c.id]?'':' solid');if(!CARD_ART[c.id]){el.style.background=c.color;el.style.color=lightBg(c.color)?'#000':'#fff';el.textContent=L(c.name);}else{el.innerHTML='<img src="'+CARD_ART[c.id]+'" alt="">';}
    const wins=(byCard[c.id]||[]).length;if(wins)el.insertAdjacentHTML('beforeend','<b class="w">'+wins+'</b>');
    el.dataset.id=c.id;el.style.zIndex=10+n-i;el.style.transitionDelay=(wlOpened?0:.25+i*.09)+'s';
    el.addEventListener('click',()=>{requestTilt();wlFocus=wlFocus===c.id?null:c.id;layoutWallet(order,byCard,rows,true);});stage.appendChild(el);});
  layoutWallet(order,byCard,rows,false);
  if(!wlOpened){const m=$('#gxMascot');m.classList.remove('jump');void m.offsetWidth;m.classList.add('jump');mood('#gxMascot','wow');setTimeout(()=>mood('#gxMascot','happy'),900);setTimeout(()=>mood('#gxMascot',null),3200);}
  wlOpened=true;
  $('#gxLvl').innerHTML=$('#lvlPill').innerHTML;$('#gxLang').textContent=LANG==='zh'?'EN':'繁';mountIcons();
}
function layoutWallet(order,byCard,rows,instant){
  const stage=$('#wlStage');const els=[...stage.querySelectorAll('.wl-card')];const n=els.length;const stageH=stage.clientHeight||innerHeight*.5;
  const baseY=Math.min(stageH*.46,stageH-70);   // fan centre, in px from stage top
  const spread=Math.min(44,(innerWidth-176)/Math.max(1,n-1));
  requestAnimationFrame(()=>{els.forEach((el,i)=>{const k=i-(n-1)/2;const focus=wlFocus===el.dataset.id;
    if(instant)el.style.transitionDelay='0s';
    if(wlFocus&&!focus){el.classList.add('dim');el.style.transform='translate3d('+(k*spread)+'px,'+(baseY-stageH*.14+70+Math.abs(k)*7)+'px,0) rotate('+(k*6)+'deg) scale(.86)';el.style.opacity=1;}
    else if(focus){el.classList.remove('dim');el.style.transform='translate3d(0,'+(baseY-stageH*.14-30)+'px,0) rotate(0deg) scale(1.2)';el.style.opacity=1;el.style.zIndex=40;}
    else{el.classList.remove('dim');el.style.transform='translate3d('+(k*spread)+'px,'+(baseY-stageH*.14+Math.abs(k)*7)+'px,0) rotate('+(k*6)+'deg) scale(1)';el.style.opacity=1;el.style.zIndex=10+n-i;}});});
  setTimeout(()=>els.forEach(el=>{el.style.opacity=1;}),1800);   // insurance: never leave a card invisible if transitions stall
  const cards=walletCards();const lead=order[0];const wins=lead?(byCard[lead.id]||[]).length:0;const locked=rows.filter(r=>r.unlock).length;
  let h='';
  if(!cards.length)h='<div class="wl-head">'+esc(t('noCards'))+'</div>';
  else if(wlFocus){const c=cardById(wlFocus);const w=(byCard[c.id]||[]).slice().sort((a,b)=>b.winner.rule.rate-a.winner.rule.rate);let best=0;w.forEach(r=>{if(r.winner.rule.rate>best)best=r.winner.rule.rate;});const lk=rows.filter(r=>r.unlock&&r.unlock.card.id===c.id).slice(0,3);
    h='<div class="wl-focus"><div class="nm">'+esc(L(c.name))+'</div>'+(w.length?'<div class="rt">'+pct(best)+'</div><div class="sb-chips">'+w.slice(0,6).map(r=>'<span>'+esc(catName(r.cat))+'<i>'+pct(r.winner.rule.rate)+'</i></span>').join('')+(w.length>6?'<span class="none">+'+(w.length-6)+'</span>':'')+'</div>':'<div class="sb-chips"><span class="none">'+esc(t('sbNone'))+'</span></div>')+(lk.length?'<div class="sb-chips" style="margin-top:6px">'+lk.map(r=>'<span class="lock">'+esc(catName(r.cat))+'<i>'+pct(r.unlock.rule.rate)+'</i></span>').join('')+'</div>':'')+'</div>';}
  else h='<div class="wl-head">'+t('wlHead',{c:esc(shortName(lead)),n:wins})+(locked?'<br><span class="gold">'+esc(t('wlLock',{k:locked}))+'</span>':'')+'<br><span style="font-size:12px">'+esc(t('wlTap'))+'</span></div>';
  $('#wlInfo').innerHTML=h;
}
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
