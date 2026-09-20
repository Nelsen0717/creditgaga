<script>
/* ---------- helpers ---------- */
function go(id){$$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));if(id==='home'){renderHome();}if(id==='galaxy'){renderGalaxy();}}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
let toastT;function toast(msg,err){const el=$('#toast');el.innerHTML='<div class="'+(err?'err':'')+'">'+msg+'</div>';clearTimeout(toastT);toastT=setTimeout(()=>el.innerHTML='',err?4200:2200);}
function sheet(html){$('#sheetIn').innerHTML=html;$('#sheet').classList.add('on');}
function closeSheet(){$('#sheet').classList.remove('on');}
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet();});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function cardFace(card,cls){const art=CARD_ART[card.id];if(art)return '<div class="'+cls+'"><img src="'+art+'" alt=""></div>';return '<div class="'+cls+' solid" style="background:'+(card.color||'#333')+';color:'+(lightBg(card.color)?'#000':'#fff')+'">'+esc(L(card.name))+'</div>';}
function lightBg(hex){if(!hex)return false;const n=parseInt(hex.slice(1),16);const r=n>>16,g=(n>>8)&255,b=n&255;return (r*299+g*587+b*114)/1000>150;}
function applyT(){$$('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));$('#langBtn').textContent=LANG==='zh'?'EN':'繁';document.documentElement.lang=LANG==='zh'?'zh-Hant':'en';}
function setLang(l){LANG=l;S.lang=l;save();applyT();renderLvl();renderHome();const act=$$('.screen.active')[0];if(act&&act.id==='wallet')renderWallet();if(act&&act.id==='statement'&&lastStmt)renderStmtResult(lastStmt);if(act&&act.id==='result'&&lastRec)renderResult(lastRec);if(act&&act.id==='galaxy')renderGalaxy();}
$('#langBtn').addEventListener('click',()=>setLang(LANG==='zh'?'en':'zh'));
function renderLvl(){const li=levelInfo();$('#lvlPill').innerHTML='<span>'+t('lvlShort',{n:li.n})+' '+esc(li.name)+'</span><span style="opacity:.7">·</span><span>'+money(S.saved)+'</span>';const g=$('#gxLvl');if(g)g.innerHTML=$('#lvlPill').innerHTML;}

/* confetti (accent only, brief) */
function confetti(){const cv=$('#confetti'),ctx=cv.getContext('2d');cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);const P=[];for(let i=0;i<70;i++)P.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:3+Math.random()*4,a:1,c:Math.random()<.7?'#30e3a2':'#fff'});let f=0;(function step(){ctx.clearRect(0,0,innerWidth,innerHeight);f++;for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.vx*=.98;p.a-=.016;ctx.globalAlpha=Math.max(0,p.a);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.r,p.r*1.6);}if(f<80)requestAnimationFrame(step);else ctx.clearRect(0,0,innerWidth,innerHeight);})();}

/* ---------- HOME / stack / tilt ---------- */
let camOn=false,tiltOn=false,camTried=false;
async function startCam(){camTried=true;try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw 0;const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});const v=$('#cam');v.srcObject=s;await v.play();camOn=true;document.body.classList.remove('nocam');}catch(e){camOn=false;document.body.classList.add('nocam');}renderHome();}
function renderHome(){
  $('#homeHint').innerHTML='<b>'+esc(t('hintTitle'))+'</b>'+esc(camOn?t('hintSub'):t('hintNoCam'));
  const sc=$('#scenes');sc.innerHTML='<span class="lab">'+esc(t('scenesLab'))+'</span>'+t('scenes').map((s,i)=>'<button data-i="'+i+'">'+s[0]+' '+esc(s[1])+'</button>').join('');
  sc.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>runScene(+b.dataset.i)));
  const st=$('#stack');const cards=walletCards();st.innerHTML='';
  const n=cards.length;
  cards.forEach((c,i)=>{const el=document.createElement('div');el.className='stk';el.innerHTML=cardFace(c,'').replace('<div class=""','<div').replace('<div class=" solid"','<div class="solid"');
    if(!CARD_ART[c.id]){el.classList.add('solid');el.style.background=c.color;el.style.color=lightBg(c.color)?'#000':'#fff';el.textContent=L(c.name);}
    const k=i-(n-1)/2;el.style.transform='translateX('+(k*34)+'px) translateY('+(Math.abs(k)*6)+'px) rotate('+(k*7)+'deg)';el.style.zIndex=10-Math.abs(k);el.dataset.id=c.id;el.addEventListener('click',()=>{requestTilt();go('wallet');});st.appendChild(el);});
  const add=document.createElement('div');add.className='stk add';add.textContent='＋';add.style.transform='translateX('+((n)/2*34+20)+'px) translateY(10px) rotate('+((n)/2*7+4)+'deg)';add.style.zIndex=0;add.addEventListener('click',()=>{go('wallet');openAdd();});st.appendChild(add);
  if(!n){add.style.transform='';add.textContent='＋ '+t('addcard');}
}
function requestTilt(){if(tiltOn)return;const D=window.DeviceOrientationEvent;if(D&&typeof D.requestPermission==='function'){D.requestPermission().then(r=>{if(r==='granted')bindTilt();}).catch(()=>{});}else if(D){bindTilt();}}
function bindTilt(){if(tiltOn)return;tiltOn=true;window.addEventListener('deviceorientation',e=>{const g=(e.gamma||0),b=(e.beta||0)-45;const st=$('#stack');st.style.transform='rotateY('+(g*.35)+'deg) rotateX('+(-b*.25)+'deg)';const h=$('.hero');if(h){h.style.transform='rotateY('+(g*.5)+'deg) rotateX('+(-b*.35)+'deg)';h.style.setProperty('--shx',(50+g*2.5)+'%');}},true);}
window.addEventListener('mousemove',e=>{const g=(e.clientX/innerWidth-.5)*40,b=(e.clientY/innerHeight-.5)*30;const h=$('.hero');if(h&&h.getAnimations().every(a=>a.playState==='finished')){h.style.transform='rotateY('+(g*.5)+'deg) rotateX('+(-b*.35)+'deg)';h.style.setProperty('--shx',(50+g*2.5)+'%');}});

/* ---------- capture ---------- */
function snapshot(){const v=$('#cam');const c=$('#work');const w=v.videoWidth||1280,h=v.videoHeight||720;const s=Math.min(1,1280/Math.max(w,h));c.width=Math.round(w*s);c.height=Math.round(h*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.82);}
function fileToDataURL(file,max=1280){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));const c=$('#work');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82));};img.onerror=rej;img.src=u;});}
let filePick=null;
function pickFile(useCam){return new Promise(res=>{filePick=res;const inp=useCam?$('#fileCam'):$('#fileIn');inp.value='';inp.click();});}
['#fileIn','#fileCam'].forEach(id=>$(id).addEventListener('change',async e=>{const f=e.target.files[0];if(!f||!filePick)return;const cb=filePick;filePick=null;try{cb(await fileToDataURL(f));}catch(err){cb(null);}}));

/* ---------- PURCHASE FLOW ---------- */
let lastRec=null,pendingImg=null;
$('#shutter').addEventListener('click',async()=>{
  if(camOn){analyzePurchase(snapshot(),'');}
  else{const img=await pickFile(true);if(img)analyzePurchase(img,'');}
});
function runScene(i){const s=t('scenes')[i];const img=sceneImage(s);analyzePurchase(img,s[4],{sceneCat:s[2],sceneAmt:s[3],sceneName:s[1]});}
let scanTimer;
function showScan(keys,sub){go('result');$('#resBody').innerHTML='';$('#scanUI').style.display='flex';$('#resMerchant').textContent='';$('#resAmt').textContent='';const ks=t(keys);let i=0;$('#scanTxt').textContent=ks[0];$('#scanSub').textContent=sub||t('scanSub');mood('#scanMascot','think');scanChipsStart();clearInterval(scanTimer);scanTimer=setInterval(()=>{i=(i+1)%ks.length;$('#scanTxt').textContent=ks[i];},1400);}
function hideScan(){clearInterval(scanTimer);scanChipsStop();$('#scanUI').style.display='none';}
async function analyzePurchase(img,hint,demo){
  pendingImg=img;$('#resBgImg').src=img;showScan('scanning');
  let ctx;
  try{ctx=await readPurchase(img,hint,demo);}catch(e){hideScan();showError(e);return;}
  if(ctx.amount==null&&ctx.amount_twd!=null)ctx.amount=ctx.amount_twd;ctx.amount=ctx.amount==null||isNaN(ctx.amount)?null:+ctx.amount;if(!ctx.brand)ctx.brand=ctx.merchant;
  if(!CATS.includes(ctx.category))ctx.category='general';
  if(ctx.amount==null||ctx.amount<=0){hideScan();askAmount(ctx);return;}
  finishPurchase(ctx);
}
function askAmount(ctx){sheet('<h3>'+esc(t('amtTitle'))+'</h3><p>'+esc(ctx.merchant||'')+' · '+esc(t('amtSub'))+'</p><div class="field"><input class="big" id="amtIn" type="number" inputmode="decimal" placeholder="0"></div><button class="btn accent block" id="amtGo">'+esc(t('calc'))+' →</button>');setTimeout(()=>$('#amtIn').focus(),50);$('#amtGo').addEventListener('click',()=>{const v=+$('#amtIn').value;if(!(v>0))return;ctx.amount=v;closeSheet();finishPurchase(ctx);});}
function finishPurchase(ctx){hideScan();const rec=recommend(ctx);rec.img=pendingImg;lastRec=rec;gainXP(10);renderResult(rec);}
function showError(e){go('home');const m=String(e&&e.message||e);toast(m==='NOKEY'?t('errKey'):t('errNet',{e:m.slice(0,160)}),true);if(m==='NOKEY')setTimeout(openSettings,600);}
$('#resClose').addEventListener('click',()=>go('home'));
$('#resEdit').addEventListener('click',()=>{if(!lastRec)return;const c=lastRec.ctx;sheet('<h3>'+esc(t('editTitle'))+'</h3><div class="field"><label>'+esc(t('merchant'))+'</label><input id="edM" value="'+esc(c.merchant||'')+'"></div><div class="field"><label>'+esc(t('amount'))+'</label><input id="edA" type="number" inputmode="decimal" value="'+(c.amount||'')+'"></div><div class="field"><label>'+esc(t('category'))+'</label><select id="edC">'+CATS.map(k=>'<option value="'+k+'"'+(k===c.category?' selected':'')+'>'+esc(catName(k))+'</option>').join('')+'</select></div><button class="btn accent block" id="edGo">'+esc(t('calc'))+' →</button>');$('#edGo').addEventListener('click',()=>{c.merchant=$('#edM').value;c.brand=c.merchant;c.amount=+$('#edA').value||c.amount;c.category=$('#edC').value;closeSheet();const rec=recommend(c);rec.img=lastRec.img;lastRec=rec;renderResult(rec);});});
function payLine(opt,ctx){const pm=ctx.payment_methods||[];if(ctx.online)return t('payOnline');if(opt.card.id==='ctbc_linepay'&&pm.includes('linepay'))return t('payLine');return t('payCard');}
function renderResult(rec,showAlts){
  const ctx=rec.ctx,w=rec.winner;
  $('#resMerchant').textContent=(ctx.merchant||'?');
  const d=new Date();$('#resAmt').textContent=money(ctx.amount)+' · '+catName(ctx.category)+(ctx.country&&ctx.country!=='TW'?' · '+ctx.country:'')+' · '+(LANG==='zh'?'週':'')+t('dow')[d.getDay()];
  const body=$('#resBody');
  if(!w){body.innerHTML='<div class="empty">'+esc(t('noCards'))+'</div><button class="btn accent block" onclick="go(\'wallet\');openAdd()">'+esc(t('addcard'))+'</button>';return;}
  let h=cardFace(w.card,'hero');
  h+='<div class="rate">'+pct(w.rule.rate)+'</div>';
  h+='<div class="cardname">'+esc(L(w.card.name))+' · '+esc(L(w.rule.label))+'</div>';
  h+='<div class="back">'+esc(t('back'))+' <b>'+esc(w.card.currency.type==='cash'?money(w.reward):rewardLabel(w.card,w.reward))+'</b>'+(w.capped?'<small>'+esc(t('capHit',{r:pct(w.fb)}))+'</small>':'')+'</div>';
  const cond=w.capped?t('capHit',{r:pct(w.fb)}):(L(w.rule.cond)||t('noCap'));
  h+='<div class="cond"><span class="k">'+esc(t('theOne'))+'</span><span>'+esc(cond)+'</span></div>';
  if(rec.unlock){const u=rec.unlock;const gain=u.reward-w.reward;h+='<div class="unlock"><div class="k">'+esc(t('unlockK',{x:money(gain)}))+'</div><div class="v">'+esc(L(u.card.name))+' · '+pct(u.rule.rate)+' → '+esc(u.card.currency.type==='cash'?money(u.reward):rewardLabel(u.card,u.reward))+'</div><div class="h">'+esc(L((unmetReq(u.rule,S.flags)||reqs(u.rule)[0]).howto))+'</div><button class="b" id="unlockDo">'+esc(t('unlockDone'))+'</button></div>';}
  h+='<div class="pay">'+payLine(w,ctx)+'</div>';
  h+='<div class="actions"><button class="btn ghost" id="altBtn">'+esc(t('others'))+'</button><button class="btn accent" id="useBtn">✓ '+esc(t('useThis'))+'</button></div>';
  if(showAlts){h+='<div class="alts">'+rec.evals.map(e=>{const o=e.best||e.options[0];if(!o)return '';const locked=!e.best;return '<div class="alt'+(locked?' locked':'')+'">'+cardFace(e.card,'thumb')+'<div class="n">'+esc(L(e.card.name))+'<small>'+esc(L(o.rule.label))+(locked?' · 🔒':'')+'</small></div><div class="r">'+pct(o.rule.rate)+'<small>'+esc(money(o.reward))+'</small></div></div>';}).join('')+'</div>';}
  body.innerHTML=h;
  $('#altBtn').addEventListener('click',()=>renderResult(rec,!showAlts));
  $('#useBtn').addEventListener('click',()=>{applyUsage(w);const base=evalCard(cardById(S.defaultCard)||w.card,ctx).best;const gain=Math.max(0,w.reward-(base?base.reward:0));S.saved+=gain;S.history.unshift({m:ctx.merchant,a:ctx.amount,c:w.card.id,r:w.reward,g:gain,d:Date.now()});S.history=S.history.slice(0,50);save();confetti();mood('#gxMascot','happy');setTimeout(()=>mood('#gxMascot',null),6000);gainXP(25,gain>0?'+'+money(gain):'');setTimeout(()=>{if($('#result').classList.contains('active'))go('home');},1400);});
  const ub=$('#unlockDo');if(ub)ub.addEventListener('click',()=>{const r=unmetReq(rec.unlock.rule,S.flags)||reqs(rec.unlock.rule)[0];if(r.type==='plan')S.flags[r.key]=r.value;else S.flags[r.key]=true;save();gainXP(50);const nr=recommend(ctx);nr.img=rec.img;lastRec=nr;renderResult(nr);});
}
</script>
