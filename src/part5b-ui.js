<script>
/* ---------- WALLET ---------- */
$('#walletBtn').addEventListener('click',()=>{go('wallet');renderWallet();});
$('#addCardBtn').addEventListener('click',openAdd);
function questList(){
  const q=[];const cards=walletCards();
  for(const c of cards){for(const r of c.rules){for(const req of reqs(r)){if(req.type==='plan')continue;const key=req.key;if(q.some(x=>x.key===key))continue;const done=!!S.flags[key];q.push({key,done,card:c,rule:r,req,xp:50});}}
    if(c.plan){const key='plan:'+c.id;q.push({key,done:!!S.flags[c.plan.key],card:c,plan:true,xp:30});}}
  return q.sort((a,b)=>(a.done?1:0)-(b.done?1:0));
}
function renderWallet(){
  const cards=walletCards();const li=levelInfo();
  let h='<div class="page-title">'+esc(t('wallet'))+'</div>';
  h+='<div class="two"><div class="stat"><div class="k">'+esc(t('savedMonth'))+'</div><div class="v acc mono">'+esc(money(S.saved))+'</div><div class="s">'+esc(t('savedSub'))+'</div></div>';
  h+='<div class="lvl-ring" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ring" style="--p:'+Math.round(li.p*100)+'%"><i>'+li.n+'</i></div><div class="tx"><b>'+esc(li.name)+'</b><small>'+S.xp+' / '+li.next+' XP</small></div></div></div>';
  h+='<div class="h2">'+esc(t('cards'))+' · '+cards.length+'</div>';
  if(!cards.length)h+='<div class="empty">'+esc(t('noCards'))+'</div>';
  h+='<div class="card-row">'+cards.map(c=>{const g=activeGeneralRate(c,S.flags);let top=0,topR=null;for(const r of c.rules){if(reqMet(r,S.flags)&&r.rate>top&&!(r.cats&&r.cats.length===0)){top=r.rate;topR=r;}}
    const tags=[];if(c.unverified)tags.push('<span class="tag ai">'+esc(t('aiCard'))+'</span>');else{const pend=c.rules.some(r=>reqs(r).some(q=>q.type!=='plan'&&!S.flags[q.key]));if(pend)tags.push('<span class="tag warn">!</span>');}
    return '<div class="wcard'+(S.defaultCard===c.id?' def':'')+'" data-id="'+c.id+'">'+cardFace(c,'face')+tags.join('')+'<div class="nm">'+esc(L(c.name))+'</div><div class="bt"><b>'+pct(top)+'</b><small>'+esc(topR?L(topR.label):'')+'</small></div><div class="bt"><small>'+esc(t('general'==='x'?'':catName('general')))+' '+pct(g)+'</small>'+(c.plan?'<small>'+esc(S.flags[c.plan.key]?t('cubePlan',{p:L(c.plan.options[S.flags[c.plan.key]])}):t('cubeNone'))+'</small>':'')+'</div></div>';}).join('')+'</div>';
  const qs=questList();
  if(qs.length){h+='<div class="h2">'+esc(t('quests'))+'</div>'+qs.map(q=>{if(q.plan){const c=q.card;return '<div class="quest'+(q.done?' done':'')+'" data-q="'+q.key+'"><div class="ic">'+(q.done?'✅':'🔀')+'</div><div class="tx"><b>'+esc(L(c.name))+' · '+esc(q.done?t('cubePlan',{p:L(c.plan.options[S.flags[c.plan.key]])}):t('cubeNone'))+'</b><small>'+Object.entries(c.plan.options).map(([k,v])=>'<span class="tap" data-plan="'+k+'" data-card="'+c.id+'">'+esc(L(v))+'</span>').join(' · ')+'</small></div><div class="xp">+'+q.xp+'</div></div>';}
    return '<div class="quest'+(q.done?' done':'')+'" data-q="'+q.key+'"><div class="ic">'+(q.done?'✅':(q.req.type==='register'?'📝':'🏦'))+'</div><div class="tx"><b>'+esc(L(q.card.name))+' · '+esc(L(q.rule.label))+' '+pct(q.rule.rate)+'</b><small>'+esc(L(q.req.howto))+'</small></div><div class="xp">'+(q.done?'✓':'+'+q.xp)+'</div></div>';}).join('');}
  h+='<div class="h2">'+esc(t('bestRates'))+'</div><div class="bars">'+cards.map(c=>{let top=0;for(const r of c.rules){if(reqMet(r,S.flags)&&r.rate>top&&!(r.cats&&r.cats.length===0))top=r.rate;}return '<div class="bar"><div class="n">'+esc(L(c.name))+'</div><div class="t"><div class="f" style="width:'+Math.min(100,top/0.10*100)+'%"></div></div><div class="v">'+pct(top)+'</div></div>';}).join('')+'<div class="note" style="margin-top:8px">'+esc(LANG==='zh'?'依目前登錄／方案狀態算出的最高回饋率；上限與門檻在推薦時才套用。':'Highest rate under current registration/plan state; caps and thresholds apply at recommendation time.')+'</div></div>';
  h+='<div class="h2">'+esc(t('sourceLab'))+'</div><div class="src">'+cards.map(c=>'<div>'+esc(L(c.name))+' · <a href="'+esc(c.source)+'" target="_blank" rel="noopener">'+esc((c.source||'').replace(/^https?:\/\//,'').slice(0,42))+'…</a> · '+esc(t('verified'))+' '+esc(c.verified||'')+'</div>').join('')+'</div>';
  const b=$('#walletBody');b.innerHTML=h;
  b.querySelectorAll('.wcard').forEach(el=>el.addEventListener('click',()=>cardSheet(el.dataset.id)));
  b.querySelectorAll('[data-plan]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();const c=cardById(el.dataset.card);const was=S.flags[c.plan.key];S.flags[c.plan.key]=el.dataset.plan;save();if(!was)gainXP(30);renderWallet();}));
  b.querySelectorAll('.quest:not(.done)[data-q]').forEach(el=>{const key=el.dataset.q;if(key.startsWith('plan:'))return;el.addEventListener('click',()=>{S.flags[key]=true;save();gainXP(50,t('done'));renderWallet();});});
}
function cardSheet(id){const c=cardById(id);if(!c)return;let h='<h3>'+esc(L(c.name))+'</h3><p>'+esc(L(c.bank))+' · '+esc(c.network||'')+(c.unverified?' · '+esc(t('aiCard')):'')+'</p>';
  h+=c.rules.filter(r=>!(r.cats&&r.cats.length===0&&!r.merchants)).map(r=>'<div class="alt"><div class="n">'+esc(L(r.label))+'<small>'+esc(L(r.cond)||'')+'</small></div><div class="r'+(reqMet(r,S.flags)?'':' locked')+'">'+pct(r.rate)+(reqMet(r,S.flags)?'':'<small>🔒</small>')+'</div></div>').join('');
  h+='<div class="src">'+esc(t('sourceLab'))+': <a href="'+esc(c.source)+'" target="_blank" rel="noopener">'+esc(c.source)+'</a>'+(c.sources?c.sources.map(s=>'<br><a href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(s)+'</a>').join(''):'')+' · '+esc(t('verified'))+' '+esc(c.verified||'')+'</div>';
  h+='<div class="grid-btns" style="margin-top:14px"><button class="btn ghost sm block" id="csDef">'+esc(t('setDefault'))+'</button><button class="btn ghost sm block" id="csRm" style="color:var(--danger)">'+esc(t('remove'))+'</button></div>';
  sheet(h);$('#csDef').addEventListener('click',()=>{S.defaultCard=id;save();closeSheet();renderWallet();});$('#csRm').addEventListener('click',()=>{S.wallet=S.wallet.filter(x=>x!==id);save();closeSheet();renderWallet();renderHome();});}

/* ---------- ADD CARD ---------- */
function openAdd(){go('addcard');
  let h='<div class="page-title">'+esc(t('addTitle'))+'</div><div class="page-sub">'+esc(t('addSub'))+'</div>';
  h+='<div class="grid-btns"><button class="btn accent" id="addShoot">📷 '+esc(t('takePhoto'))+'</button><button class="btn ghost" id="addPick">🖼 '+esc(t('pickPhoto'))+'</button></div>';
  h+='<div class="h2">'+esc(t('samples'))+'</div><div class="samples">'+CATALOG.filter(c=>CARD_ART[c.id]).map(c=>'<button data-s="'+c.id+'" class="'+(S.wallet.includes(c.id)?'has':'')+'"><img src="'+CARD_ART[c.id]+'" alt=""></button>').join('')+'</div>';
  h+='<div style="margin-top:14px"><button class="btn ghost sm block" id="loadDemo">'+esc(t('loadDemo'))+'</button></div>';
  $('#addBody').innerHTML=h;
  $('#addShoot').addEventListener('click',async()=>{const img=await pickFile(true);if(img)openMask(img);});
  $('#addPick').addEventListener('click',async()=>{const img=await pickFile(false);if(img)openMask(img);});
  $$('#addBody [data-s]').forEach(b=>b.addEventListener('click',()=>openMask(CARD_ART[b.dataset.s],b.dataset.s)));
  $('#loadDemo').addEventListener('click',()=>{S.wallet=DEFAULT_WALLET.slice();save();renderHome();go('wallet');renderWallet();toast('✓');});
}
/* MASK: draw on canvas, nothing leaves until done */
let maskBase=null,maskStrokes=[],maskDemoId=null,drawing=false;
function openMask(dataURL,demoId){maskDemoId=demoId||null;go('mask');const img=new Image();img.onload=()=>{maskBase=img;const cv=$('#maskCv');cv.width=img.width;cv.height=img.height;maskStrokes=[];redrawMask();};img.src=dataURL;}
function redrawMask(){const cv=$('#maskCv'),c=cv.getContext('2d');c.drawImage(maskBase,0,0);c.fillStyle='#0b0b0c';c.strokeStyle='#0b0b0c';c.lineCap='round';c.lineJoin='round';for(const s of maskStrokes){if(s.rect){c.fillRect(...s.rect);continue;}c.lineWidth=s.w;c.beginPath();s.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(s.pts.length===1)c.lineTo(s.pts[0][0]+.1,s.pts[0][1]);c.stroke();}}
(function(){const cv=$('#maskCv');const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
cv.addEventListener('pointerdown',e=>{drawing=true;cv.setPointerCapture(e.pointerId);maskStrokes.push({w:Math.max(28,cv.width*.07),pts:[pos(e)]});redrawMask();e.preventDefault();});
cv.addEventListener('pointermove',e=>{if(!drawing)return;maskStrokes[maskStrokes.length-1].pts.push(pos(e));redrawMask();e.preventDefault();});
const end=()=>{drawing=false;};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);})();
$('#maskUndo').addEventListener('click',()=>{maskStrokes.pop();redrawMask();});
$('#maskAuto').addEventListener('click',()=>{const cv=$('#maskCv');const W=cv.width,H=cv.height;const portrait=H>W;
  // cover the usual number/name band: middle-lower band for landscape, left-middle band for portrait (card rotated)
  maskStrokes.push({rect:portrait?[0,H*.12,W*.2,H*.45]:[W*.05,H*.5,W*.75,H*.22]});redrawMask();});
$('#maskBack').addEventListener('click',()=>openAdd());
$('#maskDone').addEventListener('click',async()=>{const cv=$('#maskCv');const out=$('#work');const s=Math.min(1,900/Math.max(cv.width,cv.height));out.width=Math.round(cv.width*s);out.height=Math.round(cv.height*s);out.getContext('2d').drawImage(cv,0,0,out.width,out.height);const masked=out.toDataURL('image/jpeg',.8);identifyFlow(masked);});
async function identifyFlow(masked){
  showScan('scanning',t('idSub'));
  let r;try{r=await identifyCard(masked,maskDemoId);}catch(e){hideScan();showError(e);return;}
  hideScan();go('addcard');
  const c=r&&r.matched_card_id&&r.matched_card_id!=='none'?cardById(r.matched_card_id):null;
  if(c){sheet('<h3>'+esc(t('idTitle'))+'</h3><p>'+esc(t('idSub'))+' · '+Math.round((r.confidence||0)*100)+'%</p>'+cardFace(c,'hero').replace('class="hero"','class="hero" style="animation:none;margin:0 auto 14px"')+'<div style="text-align:center;font-weight:800;font-size:20px;margin-bottom:14px">'+esc(L(c.name))+'</div><button class="btn accent block" id="idYes">'+esc(t('yesAdd'))+'</button><div style="height:10px"></div><button class="btn ghost block" id="idNo">'+esc(t('noRe'))+'</button>');
    $('#idYes').addEventListener('click',()=>{if(!S.wallet.includes(c.id))S.wallet.push(c.id);save();closeSheet();confetti();gainXP(40,'+ '+L(c.name));renderHome();go('wallet');renderWallet();});
    $('#idNo').addEventListener('click',closeSheet);
  }else{
    sheet('<h3>'+esc(t('notFound'))+'</h3><p>'+esc((r&&(r.bank_guess||''))+' '+(r&&(r.card_name_guess||'')))+'</p><button class="btn accent block" id="idRes">🔎 '+esc(t('research'))+'</button><div class="note" style="margin-top:8px">'+esc(t('researchSub'))+'</div>');
    $('#idRes').addEventListener('click',()=>{closeSheet();researchFlow(r);});
  }
}
async function researchFlow(guess){
  showScan('researching',t('researchSub'));
  let entry;try{entry=await researchCard(guess);}catch(e){hideScan();showError(e);return;}
  hideScan();go('addcard');
  const c=normalizeResearched(entry);
  sheet('<h3>'+esc(L(c.name))+'</h3><p>'+esc(L(c.bank))+' · '+esc(t('aiCard'))+'</p>'+c.rules.map(r=>'<div class="alt"><div class="n">'+esc(L(r.label))+'<small>'+esc(L(r.cond)||'')+'</small></div><div class="r">'+pct(r.rate)+'</div></div>').join('')+'<div class="src">'+(c.sources||[]).map(s=>'<a href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(s)+'</a>').join('<br>')+'</div><div style="height:12px"></div><button class="btn accent block" id="rsYes">'+esc(t('yesAdd'))+'</button>');
  $('#rsYes').addEventListener('click',()=>{S.custom=S.custom.filter(x=>x.id!==c.id);S.custom.push(c);if(!S.wallet.includes(c.id))S.wallet.push(c.id);save();closeSheet();confetti();gainXP(60,'+ '+L(c.name));renderHome();go('wallet');renderWallet();});
}
function normalizeResearched(e){
  const id='ai_'+String(e.id||e.name_en||'card').toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,32);
  const rules=(e.rules||[]).map((r,i)=>{const rr={id:id+'_r'+i,label:{zh:r.label_zh||r.label_en||'',en:r.label_en||r.label_zh||''},cats:(r.cats||[]).filter(c=>CATS.includes(c)),merchants:r.merchants&&r.merchants.length?r.merchants:undefined,rate:Math.max(0,Math.min(0.5,+r.rate||0)),cond:{zh:r.cond_zh||'',en:r.cond_en||''}};
    if(r.cap>0){rr.cap=+r.cap;rr.capPeriod=r.cap_period||'month';}
    if(r.requires&&r.requires.type){rr.requires={type:r.requires.type==='plan'?'register':r.requires.type,key:id+'_req'+i,howto:{zh:r.requires.howto_zh||'',en:r.requires.howto_en||''}};}
    if(!rr.cats.length&&!rr.merchants)rr.cats=['general'];return rr;});
  if(!rules.some(r=>r.cats&&r.cats.includes('general')))rules.push({id:id+'_base',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:Math.max(0,Math.min(0.5,+e.base_rate||0)),cond:{zh:'AI 研究值，請對照官網。',en:'AI-researched, check the issuer site.'}});
  return {id,bank:{zh:e.bank_zh||e.bank||'',en:e.bank_en||e.bank||''},name:{zh:e.name_zh||e.name_en||'',en:e.name_en||e.name_zh||''},network:e.network||'',color:/^#[0-9a-f]{6}$/i.test(e.color||'')?e.color:'#2f3a4a',currency:e.currency_type==='points'?{type:'points',name:{zh:e.points_name||'點數',en:e.points_name||'points'},perTWD:+e.points_per_twd||1}:{type:'cash'},source:(e.sources||[])[0]||'',sources:e.sources||[],verified:new Date().toISOString().slice(0,10),unverified:true,rules};
}

/* ---------- STATEMENT ---------- */
let lastStmt=null;
$('#stmtBtn').addEventListener('click',()=>{go('statement');renderStmtIntro();});
function renderStmtIntro(){$('#stmtBody').innerHTML='<div class="page-title">'+esc(t('stmtIntro'))+'</div><div class="page-sub">'+esc(t('stmtSub'))+'</div><div class="grid-btns"><button class="btn accent" id="stShoot">📷 '+esc(t('stmtShoot'))+'</button><button class="btn ghost" id="stPick">🖼 '+esc(t('stmtPick'))+'</button></div><div style="height:12px"></div><button class="btn ghost sm block" id="stSample">🧾 '+esc(t('stmtSample'))+'</button>';
  $('#stShoot').addEventListener('click',async()=>{const img=await pickFile(true);if(img)stmtFlow(img);});
  $('#stPick').addEventListener('click',async()=>{const img=await pickFile(false);if(img)stmtFlow(img);});
  $('#stSample').addEventListener('click',()=>stmtFlow(statementImage(),true));}
async function stmtFlow(img,isSample){
  $('#resBgImg').src=img;showScan('stmtScan');
  let ex;try{ex=await readStatement(img,isSample);}catch(e){hideScan();showError(e);return;}
  hideScan();go('statement');
  const txns=(ex.transactions||[]).map(x=>({date:x.date||'',merchant:x.merchant||'',brand:x.merchant||'',category:CATS.includes(x.category)?x.category:'general',amount:+x.amount_twd||0,online:!!x.online,country:x.country||'TW'})).filter(x=>x.amount>0);
  const cardId=ex.card_id&&cardById(ex.card_id)?ex.card_id:S.defaultCard;
  const res=analyzeStatement(txns,cardId);res.cardId=cardId;lastStmt=res;gainXP(100);renderStmtResult(res);
}
function renderStmtResult(res){
  let h='<div class="bigwrap"><div class="bigk">'+esc(t('leftTitle'))+'</div><div class="bignum mono" id="bigLeft"><small>NT$</small>0</div><div class="bigk">'+esc(t('leftSub',{a:money(res.actual),b:money(res.bestPot)}))+'</div><div class="note" style="margin-top:6px">'+esc(L(res.used.name))+' · '+res.rows.length+(LANG==='zh'?' 筆 · ':' lines · ')+money(res.total)+'</div></div>';
  // what the missed money buys in a year
  const year=res.left*12;const items=t('eqItems');
  h+='<div class="h2">'+esc(t('eqTitle'))+'</div><div class="eq-wrap"><div class="eq-year">'+esc(t('eqYear'))+'<b class="mono">'+esc(money(year))+'</b></div>';
  const cupsN=Math.min(60,Math.floor(year/items[0][2]));h+='<div class="cups">'+Array.from({length:60},(_,i)=>'<i class="'+(i<cupsN?'':'g')+'" style="animation-delay:'+(i*25)+'ms"></i>').join('')+'</div><div class="note" style="margin-top:6px">'+esc(t('eqOf',{n:Math.floor(year/items[0][2]),u:items[0][1]}))+' '+items[0][0]+'</div>';
  const pick=[];for(const it of items.slice(1)){if(year>=it[2])pick.push({it,n:Math.floor(year/it[2]),p:1});else pick.push({it,n:0,p:year/it[2]});}
  const shown=pick.filter(x=>x.n>0).slice(-3).concat(pick.filter(x=>x.n===0).slice(0,1));
  h+='<div class="eq-grid">'+shown.map(x=>'<div class="eq'+(x.n?'':' locked')+'"><div class="em">'+x.it[0]+'</div><div class="n">'+(x.n?esc(t('eqOf',{n:x.n,u:x.it[1]})):Math.round(x.p*100)+'%')+'</div><div class="l">'+(x.n?'≈ '+esc(money(x.it[2]))+' / 1':esc(t('eqTo',{u:'1 '+x.it[1],x:money(x.it[2]-year)})))+'</div><div class="p" style="width:'+Math.round(x.p*100)+'%"></div></div>').join('')+'</div></div>';
  // donut: earned vs left
  const tot=Math.max(1,res.bestPot),ea=res.actual/tot;const C=2*Math.PI*34;
  h+='<div class="donut" style="margin-top:12px"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12"/><circle cx="42" cy="42" r="34" fill="none" stroke="#30e3a2" stroke-width="12" stroke-dasharray="'+(C*(1-ea))+' '+C+'" stroke-dashoffset="'+(-C*ea)+'"/><circle cx="42" cy="42" r="34" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="'+(C*ea)+' '+C+'"/></svg><div class="tx"><b>'+Math.round((1-ea)*100)+'%</b> '+esc(t('donutL'))+' · '+esc(money(res.left))+'<br>'+esc(t('donutA'))+' '+esc(money(res.actual))+' · '+Math.round(ea*100)+'%</div></div>';
  h+='<div class="h2">'+esc(t('fixes'))+'</div>'+res.fixes.map((f,i)=>{let title='',sub='';const m=f.meta;
    if(f.key.startsWith('switch:')){title=(LANG==='zh'?'把日常消費改刷 ':'Move everyday spend to ')+L(m.card.name);sub=(LANG==='zh'?'原本刷 ':'Instead of ')+L(m.from.name)+' · '+f.n+(LANG==='zh'?' 筆':' lines');}
    else if(f.key.startsWith('plan:')){title=L(m.card.name)+(LANG==='zh'?' 依當天消費切方案':' switch plan per day');sub=L(m.req.howto);}
    else{title=L(m.card.name)+' · '+L(m.rule.label)+' '+pct(m.rule.rate);sub=L(m.req.howto);}
    const done=f.key.startsWith('plan:')||f.key.startsWith('switch:')?false:!!S.flags[f.key];
    return '<div class="fix"><div class="no">'+(i+1)+'</div><div class="tx"><b>'+esc(title)+'</b><small>'+esc(sub)+'</small>'+(done?'':(f.key.startsWith('switch:')||f.key.startsWith('plan:')?'':'<div style="margin-top:8px"><button class="btn accent sm" data-fix="'+esc(f.key)+'">'+esc(t('doFix'))+' +50 XP</button></div>'))+'</div><div class="g">+'+esc(money(f.gain))+'</div></div>';}).join('');
  const cats=Object.entries(res.byCat).sort((a,b)=>b[1].best-a[1].best);const mx=Math.max(1,...cats.map(x=>x[1].best));
  h+='<div class="h2">'+esc(t('byCat'))+'</div><div class="bars">'+cats.map(([c,v])=>'<div class="bar"><div class="n">'+esc(catName(c))+'</div><div class="t"><div class="f" style="width:'+(v.best/mx*100)+'%"></div><div class="f dim" style="width:'+(v.actual/mx*100)+'%;margin-top:-10px"></div></div><div class="v">'+esc(money(v.best))+'</div></div>').join('')+'</div>';
  h+='<div class="h2">'+esc(t('txns'))+'</div><div>'+res.rows.map(r=>'<div class="txn"><div class="m">'+esc(r.txn.merchant)+'</div><div class="a">'+esc(money(r.txn.amount))+'</div><div class="d">'+esc(r.txn.date)+' · '+esc(catName(r.txn.category))+(r.pot?' → '+esc(L(r.pot.card.name))+' '+pct(r.pot.rule.rate):'')+'</div><div class="g'+(r.bestPot-r.actual<0.05?' z':'')+'">'+(r.bestPot-r.actual<0.05?'—':'+'+esc(money(r.bestPot-r.actual)))+'</div></div>').join('')+'</div>';
  h+='<div style="height:16px"></div><button class="btn ghost block" id="stAgain">'+esc(t('stmtIntro'))+'</button>';
  const b=$('#stmtBody');b.innerHTML=h;b.scrollTop=0;
  countUp($('#bigLeft'),res.left);
  b.querySelectorAll('[data-fix]').forEach(el=>el.addEventListener('click',()=>{S.flags[el.dataset.fix]=true;save();gainXP(50,t('done'));const nr=analyzeStatement(res.rows.map(r=>r.txn),res.cardId);nr.cardId=res.cardId;lastStmt=nr;renderStmtResult(nr);}));
  $('#stAgain').addEventListener('click',renderStmtIntro);
}
function countUp(el,v){const t0=performance.now(),dur=1400;(function f(now){const p=Math.min(1,(now-t0)/dur);const e=1-Math.pow(1-p,3);el.innerHTML='<small>NT$</small>'+num(v*e);if(p<1)requestAnimationFrame(f);})(t0);}

/* ---------- SETTINGS ---------- */
$('#gearBtn').addEventListener('click',openSettings);
function openSettings(){
  sheet('<h3>'+esc(t('setTitle'))+'</h3><div class="field"><label>'+esc(t('apiKey'))+'</label><input id="stKey" type="password" autocomplete="off" placeholder="sk-ant-…" value="'+esc(S.apiKey)+'"></div><div class="note" style="margin:-6px 0 12px">'+esc(t('apiHint'))+'</div>'
  +'<div class="field"><label>'+esc(t('model'))+'</label><select id="stModel"><option value="claude-sonnet-5">Claude Sonnet 5 · '+(LANG==='zh'?'快':'fast')+'</option><option value="claude-fable-5-1">Claude Fable 5.1 · '+(LANG==='zh'?'最聰明':'smartest')+'</option><option value="claude-opus-5">Claude Opus 5</option></select></div>'
  +'<div class="field"><label>'+esc(t('lang'))+'</label><div class="seg"><button id="lzh" class="'+(LANG==='zh'?'on':'')+'">繁體中文</button><button id="len" class="'+(LANG==='en'?'on':'')+'">English</button></div></div>'
  +'<div class="field"><label style="display:flex;align-items:center;gap:10px;text-transform:none;font-size:14px;color:#fff"><input type="checkbox" id="stDemo" style="width:22px;height:22px" '+(S.demo?'checked':'')+'>'+esc(t('demoMode'))+'</label></div>'
  +'<button class="btn accent block" id="stSave">'+esc(t('save'))+'</button><div style="height:10px"></div><button class="btn ghost sm block" id="stReset" style="color:var(--danger)">'+esc(t('resetData'))+'</button>'
  +'<div class="note" style="margin-top:14px">CreditGaga · Claude reads, your phone computes · <a href="https://github.com/Nelsen0717/creditgaga" target="_blank" rel="noopener">github</a></div>');
  $('#stModel').value=S.model;
  $('#lzh').addEventListener('click',()=>{setLang('zh');openSettings();});$('#len').addEventListener('click',()=>{setLang('en');openSettings();});
  $('#stSave').addEventListener('click',()=>{S.apiKey=$('#stKey').value.trim();S.model=$('#stModel').value;S.demo=$('#stDemo').checked;save();closeSheet();toast('✓ '+t('save'));});
  $('#stReset').addEventListener('click',()=>{const k=S.apiKey,m=S.model;localStorage.removeItem('cg_state');location.reload();});
}
</script>
