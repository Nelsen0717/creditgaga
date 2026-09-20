<script>
/* ---------- STATE ---------- */
const S=Object.assign({wallet:DEFAULT_WALLET.slice(),custom:[],flags:{cube_plan:null},usage:{},xp:0,saved:0,history:[],lang:'zh',apiKey:'',model:'claude-sonnet-5',demo:false,defaultCard:'dbs_everyday',ym:''},JSON.parse(localStorage.getItem('cg_state')||'{}'));
function save(){localStorage.setItem('cg_state',JSON.stringify(S));}
function monthKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
if(S.ym!==monthKey()){S.ym=monthKey();S.usage={};S.saved=0;save();}
LANG=S.lang||'zh';
const allCards=()=>[...CATALOG,...S.custom];
const cardById=id=>allCards().find(c=>c.id===id);
const walletCards=()=>S.wallet.map(cardById).filter(Boolean);

/* ---------- FORMAT ---------- */
const pct=r=>String(+(r*100).toFixed(2))+'%';
const money=v=>{const a=Math.abs(v);const s=a<10?(Math.round(a*10)/10).toString():Math.round(a).toLocaleString('en-US');return (v<0?'-':'')+'NT$'+s;};
const num=v=>Math.round(v).toLocaleString('en-US');
function rewardLabel(card,v){if(card.currency.type==='cash')return money(v);const pts=v*(card.currency.perTWD||1);return '≈ '+num(pts)+' '+L(card.currency.name)+' ≈ '+money(v);}

/* ---------- ENGINE: rules in data, computed here, never by the model ---------- */
const JKT=['JP','KR','TH'];
function ruleMatches(rule,ctx){
  if(rule.cats&&rule.cats.length===0&&!rule.merchants)return false;
  const overseas=ctx.country&&ctx.country!=='TW';
  if(rule.region==='TW'&&overseas)return false;
  if(rule.channel==='physical'&&ctx.online)return false;
  if(rule.channel==='online'&&!ctx.online)return false;
  if(rule.minTxn&&ctx.amount<rule.minTxn)return false;
  const m=((ctx.merchant||'')+' '+(ctx.brand||'')).toLowerCase();
  if(rule.merchants&&rule.merchants.some(k=>m.includes(k.toLowerCase())))return true;
  if(rule.cats&&rule.cats.includes(ctx.category))return true;
  if(rule.cats&&rule.cats.includes('general')){
    if(overseas)return false;              // overseas handled by explicit overseas rules
    return true;
  }
  return false;
}
const reqs=rule=>rule.requires?(Array.isArray(rule.requires)?rule.requires:[rule.requires]):[];
const reqOk=(r,flags)=>r.type==='plan'?flags[r.key]===r.value:!!flags[r.key];
function reqMet(rule,flags){return reqs(rule).every(r=>reqOk(r,flags));}
function unmetReq(rule,flags){return reqs(rule).find(r=>!reqOk(r,flags))||null;}
function activeGeneralRate(card,flags){let best=0;for(const r of card.rules){if(r.cats&&r.cats.includes('general')&&reqMet(r,flags)&&r.rate>best)best=r.rate;}return best;}
function computeReward(card,rule,ctx,usage,flags){
  const key=(rule.capPerMerchant?rule.id+':'+(ctx.brand||ctx.merchant||''):(rule.capKey||rule.id));
  const used=usage[key]||0;
  const capRem=rule.cap!=null?Math.max(0,rule.cap-used):Infinity;
  const bonusAmt=rule.rate>0?Math.min(ctx.amount,capRem/rule.rate):ctx.amount;
  const fb=rule.fallbackRate??activeGeneralRate(card,flags);
  const reward=bonusAmt*rule.rate+(ctx.amount-bonusAmt)*fb;
  return {reward,capped:bonusAmt<ctx.amount-0.001,bonusAmt,key,fb};
}
function evalCard(card,ctx,opts={}){
  const flags=opts.flags||S.flags, usage=opts.usage||S.usage;
  const opts_=[];
  for(const rule of card.rules){
    if(!ruleMatches(rule,ctx))continue;
    if(rule.minBill&&opts.monthTotal!=null&&opts.monthTotal<rule.minBill)continue;
    const c=computeReward(card,rule,ctx,usage,flags);
    opts_.push({card,rule,reward:c.reward,capped:c.capped,capKey:c.key,fb:c.fb,active:reqMet(rule,flags),effRate:ctx.amount?c.reward/ctx.amount:0});
  }
  opts_.sort((a,b)=>b.reward-a.reward);
  const best=opts_.find(o=>o.active)||null;
  const potential=opts_.find(o=>!o.active&&(!best||o.reward>best.reward+0.005))||null;
  return {card,options:opts_,best,potential};
}
function recommend(ctx,cards=walletCards(),opts={}){
  const evals=cards.map(c=>evalCard(c,ctx,opts));
  const ranked=evals.filter(e=>e.best).sort((a,b)=>b.best.reward-a.best.reward);
  const winner=ranked[0]||null;
  let unlock=null;
  for(const e of evals){if(e.potential&&(!winner||e.potential.reward>winner.best.reward+0.005)&&(!unlock||e.potential.reward>unlock.reward))unlock=e.potential;}
  return {ctx,evals,ranked,winner:winner?winner.best:null,unlock};
}
function applyUsage(opt){if(opt.rule.cap!=null){S.usage[opt.capKey]=(S.usage[opt.capKey]||0)+Math.min(opt.reward,opt.rule.cap);}}

/* statement analysis: actual vs best-now vs best-with-actions, greedy caps in date order */
function analyzeStatement(txns,cardUsedId){
  const cards=walletCards();
  const used=cardById(cardUsedId)||cards[0];
  const total=txns.reduce((s,x)=>s+x.amount,0);
  const uA={},uN={},uP={};
  const allOn=Object.assign({},S.flags);
  for(const c of cards){for(const r of c.rules){for(const q of reqs(r)){if(q.type!=='plan')allOn[q.key]=true;}}}
  const rows=[];let actual=0,bestNow=0,bestPot=0;
  const fixGain={};
  const addFix=(key,gain,meta)=>{if(gain<=0.001)return;fixGain[key]=fixGain[key]||{gain:0,n:0,meta};fixGain[key].gain+=gain;fixGain[key].n++;};
  for(const x of [...txns].sort((a,b)=>(a.date||'').localeCompare(b.date||''))){
    const ctx={merchant:x.merchant,brand:x.brand||x.merchant,category:x.category||'general',amount:x.amount,country:x.country||'TW',online:!!x.online};
    // actual: card used, current flags
    const ea=used?evalCard(used,ctx,{usage:uA,monthTotal:total}):null;
    const a=ea&&ea.best?ea.best.reward:0; if(ea&&ea.best)bump(uA,ea.best);
    // best now: any wallet card, current flags
    const rn=recommend(ctx,cards,{usage:uN,monthTotal:total});
    const n=rn.winner?rn.winner.reward:0; if(rn.winner)bump(uN,rn.winner);
    // best possible: all registrations on + best plan per day
    let p=0,pOpt=null;
    for(const c of cards){
      const plans=c.plan?Object.keys(c.plan.options):[null];
      for(const pl of plans){
        const fl=Object.assign({},allOn);if(c.plan)fl[c.plan.key]=pl;
        const e=evalCard(c,ctx,{flags:fl,usage:uP,monthTotal:total});
        if(e.best&&e.best.reward>p){p=e.best.reward;pOpt=e.best;}
      }
    }
    if(pOpt)bump(uP,pOpt);
    actual+=a;bestNow+=n;bestPot+=p;
    // attribute fixes
    if(pOpt&&reqs(pOpt.rule).length){const q=reqs(pOpt.rule).find(x=>!reqOk(x,S.flags))||reqs(pOpt.rule)[0];addFix(q.type==='plan'?('plan:'+pOpt.card.id):q.key,p-n,{card:pOpt.card,rule:pOpt.rule,req:q});}
    if(rn.winner&&rn.winner.card.id!==(used&&used.id)){addFix('switch:'+rn.winner.card.id,n-a,{card:rn.winner.card,from:used});}
    rows.push({txn:x,actual:a,bestNow:n,bestPot:p,winner:rn.winner,pot:pOpt});
  }
  function bump(u,opt){if(opt.rule.cap!=null)u[opt.capKey]=(u[opt.capKey]||0)+Math.min(opt.reward,opt.rule.cap);}
  const fixes=Object.entries(fixGain).map(([k,v])=>({key:k,...v})).sort((a,b)=>b.gain-a.gain).slice(0,3);
  const byCat={};for(const r of rows){const c=r.txn.category||'general';byCat[c]=byCat[c]||{actual:0,best:0,amt:0};byCat[c].actual+=r.actual;byCat[c].best+=r.bestPot;byCat[c].amt+=r.txn.amount;}
  return {rows,total,actual,bestNow,bestPot,left:bestPot-actual,fixes,byCat,used};
}

/* ---------- gamification ---------- */
const LEVELS=[0,100,300,700,1500];
function levelInfo(){let i=0;while(i<LEVELS.length-1&&S.xp>=LEVELS[i+1])i++;const cur=LEVELS[i],next=LEVELS[i+1]??LEVELS[i]*2;return {n:i+1,name:t('lvl')[i],p:Math.min(1,(S.xp-cur)/Math.max(1,next-cur)),next};}
function gainXP(n,msg){S.xp+=n;save();toast((msg?msg+'  ':'')+t('xpGain',{n}));renderLvl();}
</script>
