<script>
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CARD_ART = /*__CARD_ART_JSON__*/{}/*__END__*/;

/* ---------- i18n ---------- */
const I18N={
zh:{galaxySub:'你的卡片星系',goBuy:'我要買東西',typeHint:'或打字說一句：在 50嵐買珍奶 60 元',typeTitle:'打字告訴卡卡',typeSub:'店家、東西、大概多少錢，一句就好。',typeGo:'幫我選怎麼付',strat:'{n} 種消費 · {top}',stratLock:'解鎖後還有 {k} 種可以更好',eqTitle:'少賺的錢，一年能換什麼',eqYear:'照這個月推一整年',eqItems:[['cup','杯珍奶',60],['coffee','杯拿鐵',150],['ticket','張電影票',350],['tv','年 Netflix',4680],['headphones','副 AirPods',5990],['plane','張東京來回機票',8000],['phone','支 iPhone',30000],['bag','個名牌包',60000]],sbCats:'{n} 類消費最划算',wlHead:'主力卡 <b>{c}</b> · {n} 類消費最划算',wlLock:'{k} 種消費解鎖後更好',wlTap:'點一張卡看它擅長什麼',savedStmts:'已存的帳單',stmtLeft:'少拿',stmtNew:'再分析一張',stmtDel:'刪除',sbBest:'最高',sbLock:'解鎖後會更好',sbNone:'目前沒有它最划算的類別',eqOf:'{n} {u}',eqTo:'離 {u} 還差 {x}',donutA:'實際拿到',donutL:'留在桌上',scanChips:['店名','金額','付款方式','你的卡'],app:'刷神卡卡',wallet:'錢包',stmt:'帳單',addcard:'加一張卡',maskTitle:'先塗掉個資',maskSub:'用手指把卡號、姓名、效期塗黑。這一步在手機裡完成，塗完才會送出。',undo:'復原',autoMask:'一鍵遮卡號區',onDevice:'🔒 只在手機內',maskDone:'塗好了，辨識卡面',stmtTitle:'留在桌上的錢',
hintTitle:'對準要買的東西',hintSub:'點一下，卡卡告訴你刷哪張。',hintNoCam:'沒相機也能玩：選一個場景',scenesLab:'模擬',
scanning:['卡卡看看…','看店名、看價錢…','算一算你的卡…'],scanSub:'Claude 讀畫面，規則由本機算',
useThis:'就刷這張',others:'看其他卡',retake:'再拍一次',back:'這筆拿回',theOne:'注意',unlockK:'多拿 {x} 的方法',unlockDone:'我弄好了 ✓',unlockLater:'先不管',
payCard:'用 <b>實體卡 / Apple Pay</b> 感應',payLine:'打開 <b>LINE Pay</b>，選這張卡付',payOnline:'線上結帳選這張',
noCap:'免登記、沒有上限，刷就有。',capHit:'加碼額度快用完了，超過的部分算 {r}。我已經算進去了。',
lvl:['卡卡新手','省錢學徒','回饋獵人','刷神','卡卡大師'],lvlShort:'Lv.{n}',
savedMonth:'這個月多拿',savedSub:'比隨手刷多拿的回饋',cards:'我的卡',quests:'任務 · 解鎖更多回饋',bestRates:'現在刷就有的回饋率',noCards:'錢包還是空的，加第一張卡吧。',
addTitle:'把卡交給卡卡',addSub:'拍一張卡面就好。卡號會先塗掉，卡卡只看卡面設計，不讀數字。',takePhoto:'拍卡面',pickPhoto:'從相簿選',samples:'沒相機？用範例卡試',loadDemo:'一鍵載入範例錢包',
idTitle:'是這張卡嗎？',idSub:'只看卡面，不讀卡號。',yesAdd:'對，加入我的卡',noRe:'不是，重選',notFound:'卡卡沒看過這張',research:'讓卡卡上網查權益',researching:['卡卡上網查中…','翻銀行官網…','整理回饋規則…'],researchSub:'用 Claude web search 查發卡行官網，附來源',aiCard:'AI 研究 · 待你確認',
stmtIntro:'拍一張月結帳單',stmtSub:'卡卡看每一筆消費，算出如果用對卡，你能多拿多少。',stmtShoot:'拍帳單',stmtPick:'從相簿選',stmtSample:'用範例帳單試試',stmtScan:['讀帳單中…','逐筆比對你的卡…','算留在桌上的錢…'],
leftTitle:'你少拿了',leftSub:'實際拿到 {a}，用對卡可拿 {b}',fixes:'先修這三件事',txns:'逐筆看',byCat:'依類別 · 實際 vs 最佳',fixed:'搞定 +{xp} XP',doFix:'去弄',
setTitle:'設定',apiKey:'Anthropic API Key',apiHint:'存在這支手機的瀏覽器裡，直接呼叫 api.anthropic.com，不經任何伺服器。',model:'模型',lang:'語言',save:'儲存',resetData:'清空進度與錢包',demoMode:'沒有 key？先用示範模式（不呼叫 Claude、用預錄結果）',
amtTitle:'金額沒看清楚',amtSub:'補一個數字，卡卡用這個算。',calc:'用這個金額算',editTitle:'改一下',merchant:'店家',amount:'金額 NT$',category:'類別',
errKey:'還沒設定 API key。點右上角 ⚙ 貼上，或先用示範模式。',errNet:'Claude 沒回應：{e}',
xpGain:'+{n} XP',done:'完成',default:'平常刷',setDefault:'設為平常刷的卡',remove:'移除',
sourceLab:'來源',verified:'查證',cubeNone:'尚未選方案',cubePlan:'目前方案：{p}',
catNames:{general:'一般消費',convenience:'超商',drinks:'手搖飲／咖啡',dining:'餐飲',supermarket:'超市量販',drugstore:'藥妝',department:'百貨',apparel:'服飾',electronics:'3C',apple:'Apple',home:'居家',online:'網購',streaming:'串流',ai_subscription:'AI 訂閱',telecom:'電信月租',utilities:'水電瓦斯',gas:'加油',transport:'交通',travel:'旅遊',insurance:'保費',overseas:'海外實體',overseas_jkt:'日韓泰實體',jp_transit_topup:'日本交通卡儲值'},
scenes:[['🧋','50嵐 手搖飲','drinks',60,'50嵐 信義店 · 珍珠奶茶 NT$60 · LINE Pay 可用'],['💻','Apple Store 信義','apple',36900,'Apple Store 信義 A13 · MacBook Air NT$36,900'],['🍣','壽司郎','dining',880,'壽司郎 台北信義店 · 結帳 NT$880 · JCB 通路'],['🧴','屈臣氏','drugstore',650,'屈臣氏 門市 · 合計 NT$650 · LINE Pay 可用'],['🏪','7-ELEVEN','convenience',120,'7-ELEVEN 統一超商 · NT$120'],['🛋️','IKEA','home',3480,'IKEA 敦北店 · NT$3,480'],['👕','UNIQLO','apparel',1990,'UNIQLO 台北信義店 · NT$1,990'],['🚃','東京 Suica 儲值','jp_transit_topup',2200,'JR 東日本 Suica チャージ ¥10,000（約 NT$2,200）'],['⛽','台塑加油','gas',1200,'台塑石油 加油站 · NT$1,200']],
dow:['日','一','二','三','四','五','六'],
},
en:{galaxySub:'your card galaxy',goBuy:'I’m about to buy',typeHint:'or type it: bubble tea at 50嵐, NT$60',typeTitle:'Tell Gaga in words',typeSub:'Where, what, roughly how much. One line.',typeGo:'Pick how to pay',strat:'{n} categories · {top}',stratLock:'{k} more improve after unlocks',eqTitle:'What the missed money buys in a year',eqYear:'This month × 12',eqItems:[['cup','bubble teas',60],['coffee','lattes',150],['ticket','movie tickets',350],['tv','years of Netflix',4680],['headphones','AirPods',5990],['plane','Tokyo return flights',8000],['phone','iPhones',30000],['bag','designer bags',60000]],sbCats:'best for {n} categories',wlHead:'Main card <b>{c}</b> · best for {n} categories',wlLock:'{k} categories improve after unlocks',wlTap:'Tap a card to see what it is best at',savedStmts:'Saved statements',stmtLeft:'left',stmtNew:'Analyze another',stmtDel:'Delete',sbBest:'top',sbLock:'Better after unlocks',sbNone:'Not the best card for anything yet',eqOf:'{n} {u}',eqTo:'{x} short of {u}',donutA:'Earned',donutL:'Left on the table',scanChips:['Store','Price','Payment','Your cards'],app:'CreditGaga',wallet:'Wallet',stmt:'Statement',addcard:'Add a card',maskTitle:'Rub out the number',maskSub:'Use your thumb to black out the number, name and expiry. This happens on your phone; nothing leaves until you are done.',undo:'Undo',autoMask:'Auto-cover number area',onDevice:'🔒 On device only',maskDone:'Done, identify the card',stmtTitle:'Left on the table',
hintTitle:'Point at what you are buying',hintSub:'Tap. Gaga picks the card.',hintNoCam:'No camera? Pick a scene',scenesLab:'Simulate',
scanning:['Let me look…','Reading the store and price…','Running your cards…'],scanSub:'Claude reads, your phone computes',
useThis:'Pay with this',others:'Other cards',retake:'Retake',back:'You get back',theOne:'Note',unlockK:'Unlock {x} more',unlockDone:'Done it ✓',unlockLater:'Not now',
payCard:'Tap <b>physical card / Apple Pay</b>',payLine:'Open <b>LINE Pay</b> and pick this card',payOnline:'Choose this card at online checkout',
noCap:'No registration, no cap. Just pay.',capHit:'Bonus cap nearly used up; the excess earns {r}. Already included.',
lvl:['Rookie','Saver','Hunter','Optimizer','Gaga Master'],lvlShort:'Lv.{n}',
savedMonth:'Extra this month',savedSub:'vs. paying with your usual card',cards:'My cards',quests:'Quests · unlock more',bestRates:'Rates you get right now',noCards:'Your wallet is empty. Add the first card.',
addTitle:'Hand Gaga your card',addSub:'One photo of the card face. The number gets rubbed out first; Gaga matches the art, never the digits.',takePhoto:'Photograph card',pickPhoto:'Pick from photos',samples:'No camera? Try a sample card',loadDemo:'Load the sample wallet',
idTitle:'Is this the card?',idSub:'Matched from the art, not the number.',yesAdd:'Yes, add it',noRe:'No, pick again',notFound:'Gaga has not seen this card',research:'Let Gaga research its rewards',researching:['Searching the web…','Reading the issuer site…','Writing the rules…'],researchSub:'Claude web search on the issuer site, with sources',aiCard:'AI researched · confirm',
stmtIntro:'Photograph a monthly statement',stmtSub:'Gaga reads every line and computes what the right cards would have paid.',stmtShoot:'Photograph statement',stmtPick:'Pick from photos',stmtSample:'Try the sample statement',stmtScan:['Reading the statement…','Matching each line to your cards…','Adding up what you left…'],
leftTitle:'You left',leftSub:'You earned {a}. The right cards pay {b}',fixes:'Fix these three',txns:'Line by line',byCat:'By category · actual vs best',fixed:'Fixed +{xp} XP',doFix:'Do it',
setTitle:'Settings',apiKey:'Anthropic API Key',apiHint:'Stored in this phone’s browser and sent straight to api.anthropic.com. No server in between.',model:'Model',lang:'Language',save:'Save',resetData:'Reset progress and wallet',demoMode:'No key? Use demo mode (pre-recorded results, no Claude call)',
amtTitle:'Could not read the amount',amtSub:'Type it and Gaga computes with that.',calc:'Compute with this',editTitle:'Adjust',merchant:'Merchant',amount:'Amount NT$',category:'Category',
errKey:'No API key yet. Tap ⚙ to paste one, or use demo mode.',errNet:'Claude did not answer: {e}',
xpGain:'+{n} XP',done:'Done',default:'Usual',setDefault:'Set as my usual card',remove:'Remove',
sourceLab:'Source',verified:'verified',cubeNone:'No plan selected',cubePlan:'Current plan: {p}',
catNames:{general:'General',convenience:'Convenience store',drinks:'Drinks / coffee',dining:'Dining',supermarket:'Supermarket',drugstore:'Drugstore',department:'Department store',apparel:'Apparel',electronics:'Electronics',apple:'Apple',home:'Home',online:'Online shopping',streaming:'Streaming',ai_subscription:'AI subscription',telecom:'Mobile plan',utilities:'Utilities',gas:'Fuel',transport:'Transport',travel:'Travel',insurance:'Insurance',overseas:'Overseas in-store',overseas_jkt:'Japan/Korea/Thailand in-store',jp_transit_topup:'Japan transit card top-up'},
scenes:[['🧋','50嵐 bubble tea','drinks',60,'50嵐 Xinyi · Pearl milk tea NT$60 · LINE Pay accepted'],['💻','Apple Store Xinyi','apple',36900,'Apple Store Xinyi A13 · MacBook Air NT$36,900'],['🍣','Sushiro','dining',880,'Sushiro Taipei Xinyi · Bill NT$880 · JCB merchant'],['🧴','Watsons','drugstore',650,'Watsons store · Total NT$650 · LINE Pay accepted'],['🏪','7-ELEVEN','convenience',120,'7-ELEVEN · NT$120'],['🛋️','IKEA','home',3480,'IKEA Dunbei · NT$3,480'],['👕','UNIQLO','apparel',1990,'UNIQLO Taipei Xinyi · NT$1,990'],['🚃','Tokyo Suica top-up','jp_transit_topup',2200,'JR East Suica charge ¥10,000 (≈NT$2,200)'],['⛽','Formosa fuel','gas',1200,'Formosa Petrochemical station · NT$1,200']],
dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
}};
let LANG='zh';
const t=(k,v)=>{let s=I18N[LANG][k]??I18N.zh[k]??k;if(typeof s==='string'&&v)for(const [a,b] of Object.entries(v))s=s.split('{'+a+'}').join(b);return s;};
const L=o=>(o&&typeof o==='object'&&!Array.isArray(o))?(o[LANG]??o.zh??o.en??''):(o??'');
const catName=c=>(t('catNames')[c]||c);

/* ---------- CATALOG: every number on screen comes from here ---------- */
const CATS=['general','convenience','drinks','dining','supermarket','drugstore','department','apparel','electronics','apple','home','online','streaming','ai_subscription','telecom','utilities','gas','transport','travel','insurance','overseas','overseas_jkt','jp_transit_topup'];
const CATALOG=[
{id:'tcb_home',bank:{zh:'合作金庫',en:'Taiwan Cooperative Bank'},name:{zh:'合庫 御璽愛家卡',en:'TCB Home Visa Signature'},network:'VISA Signature',color:'#7fb3a3',
 visual:'teal/mint card, concentric tech circles like a lens, gold chip, 合作金庫銀行 gold logo, VISA Signature',
 currency:{type:'cash'},source:'https://www.tcb-bank.com.tw/personal-banking/credit-card/intro/overview/house-loan',verified:'2026-09-06',valid:'2026-12-31',
 rules:[
  {id:'tcb_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.012,cond:{zh:'無上限、免登記，效期至 2026-12-31。',en:'No cap, no registration, valid to 2026-12-31.'}},
  {id:'tcb_home3c',label:{zh:'指定 3C 居家百貨 14 店',en:'14 named home & 3C stores'},merchants:['IKEA','宜家','特力屋','宜得利','NITORI','詩肯柚木','全國電子','燦坤','順發','大同3C','HOLA','特力和樂','小北百貨','歐德','優渥實木','綠的傢俱','生活工場'],rate:0.05,cap:300,capPeriod:'month',minBill:2999,fallbackRate:0.012,cond:{zh:'當期帳單一般消費滿 NT$2,999 才啟動；每月上限 NT$300（約刷 NT$6,000 封頂）。',en:'Needs NT$2,999 general spend on the same statement; capped at NT$300/month (about NT$6,000 of spend).'}},
  {id:'tcb_util',label:{zh:'水電費',en:'Utilities'},cats:['utilities'],merchants:['中華電信','台電','台灣電力','自來水','瓦斯'],rate:0.002,cap:300,capPeriod:'month',cond:{zh:'每月上限 NT$300，與居家 3C 各自獨立。',en:'Capped at NT$300/month, separate from the home/3C cap.'}},
 ]},
{id:'cathay_cube',bank:{zh:'國泰世華',en:'Cathay United Bank'},name:{zh:'國泰世華 CUBE 卡',en:'Cathay CUBE Card'},network:'VISA',color:'#e9eaee',
 visual:'plain white/silver card, small grey "cube" wordmark with a geometric cube logo in the centre, Cathay United Bank grey text top-right, blue VISA',
 currency:{type:'points',name:{zh:'小樹點',en:'Tree Points'},perTWD:1},source:'https://www.cathay-cube.com.tw/cathaybk/personal/product/credit-card/cards/cube-list',verified:'2026-09-20',valid:'2026-12-31',
 plan:{key:'cube_plan',options:{digital:{zh:'玩數位',en:'Digital'},dining:{zh:'樂饗購',en:'Dining & Shopping'},travel:{zh:'趣旅行',en:'Travel'},select:{zh:'集精選',en:'Select'}}},
 rules:(()=>{const AP={type:'autopay',key:'cube_autopay',howto:{zh:'用 CUBE App 繳信用卡費、或設定本行帳戶自動扣繳，方案回饋才從 2% 升到 3%。',en:'Pay the bill through the CUBE app or set up Cathay auto-pay to lift plan rewards from 2% to 3%.'}};
  const PL=(v,zh,en)=>({type:'plan',key:'cube_plan',value:v,howto:{zh:'打開 CUBE App，切換到「'+zh+'」。當日生效，一天只能切一次。',en:'Open the CUBE app and switch to "'+en+'". Same-day effect, one switch per day.'}});
  const D={cats:['online','streaming','ai_subscription'],merchants:['App Store','Apple Music','iCloud','Apple TV','Apple One','iTunes','Netflix','Spotify','Disney','YouTube','momo','PChome','蝦皮','Shopee','Amazon','Google Play','Uber Eats','foodpanda','酷澎','Coupang']};
  const F={cats:['dining','drinks','department','supermarket','drugstore'],merchants:['50嵐','麻古','拉亞','Arabica','黑沃','SUBWAY','六扇門','八方雲集','麥當勞','McDonald','Uber Eats','康是美','屈臣氏','Watsons']};
  const T={cats:['travel'],merchants:['中華航空','長榮航空','星宇','KKday','Klook','Agoda','Airbnb','Booking','Trip.com','易遊網','台灣高鐵','Uber','iRent']};
  const C={cats:['convenience'],merchants:['7-ELEVEN','7-11','統一超商','全家','FamilyMart','中油','全聯','PX']};
  return [
  {id:'cube_digital3',label:{zh:'玩數位方案',en:'Digital plan'},...D,rate:0.03,requires:[PL('digital','玩數位','Digital'),AP],cond:{zh:'App Store／串流／網購適用；Apple Store 買硬體不算。需切「玩數位」且用 CUBE App 繳費或自扣。',en:'App Store, streaming and online shopping; Apple Store hardware excluded. Needs the "Digital" plan plus CUBE-app bill pay or auto-pay.'}},
  {id:'cube_digital2',label:{zh:'玩數位方案（未綁繳費）',en:'Digital plan (no auto-pay)'},...D,rate:0.02,requires:[PL('digital','玩數位','Digital')],cond:{zh:'切「玩數位」即有 2%；用 CUBE App 繳費或自扣可到 3%。',en:'2% with the "Digital" plan; 3% once bills are paid via the CUBE app or auto-pay.'}},
  {id:'cube_dining3',label:{zh:'樂饗購方案',en:'Dining & Shopping plan'},...F,rate:0.03,requires:[PL('dining','樂饗購','Dining & Shopping'),AP],cond:{zh:'國內餐飲（含 50嵐等手搖飲）、指定百貨藥妝；商場美食街內的店不算。需切「樂饗購」且用 CUBE App 繳費或自扣。',en:'Domestic dining incl. drink shops like 50嵐, selected stores; food-court outlets excluded. Needs the "Dining & Shopping" plan plus CUBE-app bill pay or auto-pay.'}},
  {id:'cube_dining2',label:{zh:'樂饗購方案（未綁繳費）',en:'Dining & Shopping plan (no auto-pay)'},...F,rate:0.02,requires:[PL('dining','樂饗購','Dining & Shopping')],cond:{zh:'切「樂饗購」即有 2%；用 CUBE App 繳費或自扣可到 3%。',en:'2% with the "Dining & Shopping" plan; 3% once bills are paid via the CUBE app or auto-pay.'}},
  {id:'cube_travel3',label:{zh:'趣旅行方案',en:'Travel plan'},...T,rate:0.03,requires:[PL('travel','趣旅行','Travel'),AP],cond:{zh:'機票限航空公司官網／App／臨櫃直購；Agoda、Booking、KKday、高鐵、Uber 適用。',en:'Flights only direct from the airline; Agoda, Booking, KKday, THSR and Uber count.'}},
  {id:'cube_travel2',label:{zh:'趣旅行方案（未綁繳費）',en:'Travel plan (no auto-pay)'},...T,rate:0.02,requires:[PL('travel','趣旅行','Travel')],cond:{zh:'切「趣旅行」即有 2%；綁 CUBE App 繳費可到 3%。',en:'2% with the "Travel" plan; 3% with CUBE-app bill pay.'}},
  {id:'cube_select',label:{zh:'集精選方案',en:'Select plan'},...C,rate:0.02,requires:[PL('select','集精選','Select')],cond:{zh:'7-ELEVEN、全家實體門市、中油直營站、全聯；萊爾富與台塑加油要切「台塑家」。',en:'7-ELEVEN, FamilyMart stores, CPC-owned stations and PX Mart; Hi-Life and Formosa fuel need the "Formosa" plan instead.'}},
  {id:'cube_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.003,cond:{zh:'方案外的消費一律 0.3%（Apple Store 買硬體也是）。',en:'Everything outside the plan earns 0.3% (Apple Store hardware included).'}},
  ];})()},
{id:'fubon_j',bank:{zh:'台北富邦',en:'Taipei Fubon Bank'},name:{zh:'富邦 J 卡 OMIYAGE',en:'Fubon J Card OMIYAGE'},network:'JCB',color:'#6b3fa0',
 visual:'colourful purple card with a big red daruma doll mascot, "OMIYAGE" wordmark, green and yellow flowers, JCB logo',
 currency:{type:'cash'},source:'https://www.fubon.com/banking/personal/credit_card/all_card/omiyage/omiyage.htm',verified:'2026-09-06',valid:'2026-12-31',
 rules:[
  {id:'j_jp_topup',label:{zh:'日本交通卡儲值',en:'Japan transit card top-up'},cats:['jp_transit_topup'],rate:0.10,minTxn:2000,cap:200,capPeriod:'total',fallbackRate:0.03,cond:{zh:'單筆滿 NT$2,000；活動總上限 NT$200，超過退回 3%。',en:'Single top-up ≥ NT$2,000; total cap NT$200, then 3%.'}},
  {id:'j_jkt6',label:{zh:'日韓泰實體加碼',en:'Japan/Korea/Thailand in-store bonus'},cats:['overseas_jkt'],channel:'physical',rate:0.06,minTxn:1000,cap:1000,capPeriod:'quarter',fallbackRate:0.03,requires:{type:'register',key:'fubon_j_jkt_registered',howto:{zh:'到富邦活動頁登錄「日韓泰加碼」，登錄後才算 6%。',en:'Register for the JP/KR/TH bonus on the Fubon promo page; 6% only after registering.'}},cond:{zh:'需登錄；單筆滿 NT$1,000；每季上限 NT$1,000。',en:'Registration required; single purchase ≥ NT$1,000; NT$1,000 cap per quarter.'}},
  {id:'j_jkt3',label:{zh:'日韓泰實體',en:'Japan/Korea/Thailand in-store'},cats:['overseas_jkt'],channel:'physical',rate:0.03,cond:{zh:'未登錄加碼時的基礎 3%。',en:'Base 3% without the bonus registration.'}},
  {id:'j_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],region:'TW',rate:0.01,requires:{type:'autopay',key:'fubon_j_autopay',howto:{zh:'設定富邦帳戶自動扣繳或電子帳單，一般消費才有 1%。',en:'Set up auto-pay or e-statement with Fubon to earn 1% on general spend.'}},cond:{zh:'需自動扣繳或電子帳單，否則 0.5%。',en:'Needs auto-pay or e-statement, otherwise 0.5%.'}},
  {id:'j_general_lo',label:{zh:'一般消費（未設自扣）',en:'General spend (no auto-pay)'},cats:['general'],region:'TW',rate:0.005,cond:{zh:'未設定自動扣繳／電子帳單。',en:'Without auto-pay / e-statement.'}},
  {id:'j_overseas',label:{zh:'海外其他地區',en:'Other overseas'},cats:['overseas'],rate:0.01,requires:{type:'autopay',key:'fubon_j_autopay',howto:{zh:'設定自動扣繳或電子帳單。',en:'Set up auto-pay or e-statement.'}},cond:{zh:'需自動扣繳或電子帳單，否則 0.5%。',en:'Needs auto-pay or e-statement, otherwise 0.5%.'}},
  {id:'j_overseas_lo',label:{zh:'海外其他地區（未設自扣）',en:'Other overseas (no auto-pay)'},cats:['overseas'],rate:0.005,cond:{zh:'未設定自動扣繳／電子帳單。',en:'Without auto-pay / e-statement.'}},
 ]},
{id:'fubon_op',bank:{zh:'台北富邦',en:'Taipei Fubon Bank'},name:{zh:'台灣大哥大 Open Possible 聯名卡',en:'Taiwan Mobile Open Possible Card'},network:'VISA Signature',color:'#1b1b1b',
 visual:'black card with a rainbow low-poly geometric crystal on top, 台灣大哥大 logo in white, gold VISA Signature at bottom right',
 currency:{type:'cash'},source:'https://www.fubon.com/banking/Personal/credit_card/all_card/OpenPossible/OpenPossible.htm',verified:'2026-09-11',valid:'2027-01-31',
 rules:[
  {id:'op_5g',label:{zh:'台灣大哥大 5G 月租',en:'Taiwan Mobile 5G plan'},cats:['telecom'],merchants:['台灣大哥大','Taiwan Mobile','台灣大'],rate:0.035,minBill:5000,cap:500,capPeriod:'month',fallbackRate:0.01,cond:{zh:'5G 月租（4G 為 2%）；當期帳單滿 NT$5,000 才加碼；每月上限 NT$500。',en:'5G plan (4G earns 2%); needs NT$5,000 on the statement; NT$500 cap per month.'}},
  {id:'op_ai',label:{zh:'五大 AI 訂閱',en:'Five AI subscriptions'},cats:['ai_subscription'],merchants:['ChatGPT','OpenAI','Gemini','Google One','Perplexity','Copilot','Grok'],rate:0.02,minBill:5000,cap:600,capPeriod:'month',capKey:'op_pool',fallbackRate:0.01,cond:{zh:'ChatGPT／Gemini／Perplexity／Copilot／Grok；帳單滿 NT$5,000；每月 NT$600 上限與超商加油共用。',en:'ChatGPT/Gemini/Perplexity/Copilot/Grok; NT$5,000 statement minimum; NT$600/month cap shared with convenience & fuel.'}},
  {id:'op_cvs_gas',label:{zh:'兩大超商＋加油',en:'7-ELEVEN, FamilyMart & fuel'},cats:['gas'],merchants:['7-ELEVEN','7-11','統一超商','全家','FamilyMart'],rate:0.02,minBill:5000,cap:600,capPeriod:'month',capKey:'op_pool',fallbackRate:0.01,cond:{zh:'帳單滿 NT$5,000；每月 NT$600 上限與 AI 訂閱共用。',en:'NT$5,000 statement minimum; NT$600/month cap shared with AI subscriptions.'}},
  {id:'op_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.01,requires:{type:'autopay',key:'fubon_op_autopay',howto:{zh:'設定富邦帳戶自動扣繳卡費，一般消費才有 1%。',en:'Set up auto-pay from a Fubon account to earn 1% on general spend.'}},cond:{zh:'需本行帳戶自動扣繳，否則 0.5%。',en:'Needs Fubon auto-pay, otherwise 0.5%.'}},
  {id:'op_general_lo',label:{zh:'一般消費（未設自扣）',en:'General spend (no auto-pay)'},cats:['general'],rate:0.005,cond:{zh:'未設定自動扣繳。',en:'Without auto-pay.'}},
 ]},
{id:'ctbc_linepay',bank:{zh:'中國信託',en:'CTBC Bank'},name:{zh:'中信 LINE Pay 卡 JCB Precious',en:'CTBC LINE Pay Card JCB Precious'},network:'JCB',color:'#d9dbe0',
 visual:'white/silver card covered with LINE Friends characters (Brown bear, Cony rabbit, Sally) in silver line art, "LINE POINTS" and "PRECIOUS" text, holographic LINE Pay badge, JCB logo',
 currency:{type:'points',name:{zh:'LINE POINTS',en:'LINE POINTS'},perTWD:1},source:'https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/store.html',verified:'2026-09-06',valid:'2026-12-31',
 rules:[
  {id:'ctbc_jcb10',label:{zh:'JCB 指定 9 通路加碼',en:'JCB 9 selected merchants bonus'},merchants:['壽司郎','Sushiro','客美多','Komeda','摩斯','MOS','藏壽司','Kura','UNIQLO','GU','DON DON DONKI','DONKI','唐吉訶德','宜得利','NITORI','台灣虎航','Tigerair'],rate:0.10,cap:200,capPeriod:'quarter',capPerMerchant:true,fallbackRate:0.01,requires:{type:'register',key:'ctbc_jcb_registered',howto:{zh:'到中信 LINE Pay 卡活動頁登錄 JCB 通路加碼（每月名額有限）。',en:'Register for the JCB merchant bonus on the CTBC LINE Pay card promo page (monthly quota).'}},cond:{zh:'需登錄（每月限量 5,000 名）；每季每戶上限 200 點（約刷 NT$2,000）。',en:'Registration required, limited monthly quota; 200 points per merchant per quarter (about NT$2,000 of spend).'}},
  {id:'ctbc_overseas',label:{zh:'海外實體商店',en:'Overseas in-store'},cats:['overseas','overseas_jkt','jp_transit_topup'],channel:'physical',rate:0.028,cond:{zh:'無上限、免登記，最高 2.8%。',en:'No cap, no registration, up to 2.8%.'}},
  {id:'ctbc_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.01,cond:{zh:'無上限、免登記；LINE POINTS 效期 180 天。',en:'No cap, no registration; LINE POINTS expire in 180 days.'}},
 ]},
{id:'yuanta_biz',bank:{zh:'元大銀行',en:'Yuanta Bank'},name:{zh:'元大 商務御璽卡',en:'Yuanta Business Visa Signature'},network:'VISA Business Signature',color:'#35507a',
 visual:'dark card with a large translucent blue flower/clover graphic and holographic sheen, 元大銀行 Yuanta Bank logo, VISA Signature Business',
 currency:{type:'cash'},source:'https://www.yuantabank.com.tw/bank/creditCard/creditCard/in.do?id=275749274200000501ef',verified:'2026-09-06',valid:'2026-12-31',
 rules:[
  {id:'yt_overseas',label:{zh:'海外消費',en:'Overseas spend'},cats:['overseas','overseas_jkt','jp_transit_topup'],rate:0.015,cond:{zh:'每滿 NT$30,000 結算一次；回饋需達 NT$300 倍數才能折抵。',en:'Settled per NT$30,000 block; rebates only redeem in NT$300 multiples.'}},
  {id:'yt_insurance',label:{zh:'保費',en:'Insurance premiums'},cats:['insurance'],rate:0.01,cond:{zh:'每滿 NT$30,000 結算一次，NT$300 倍數折抵。',en:'Settled per NT$30,000 block; NT$300 multiples.'}},
  {id:'yt_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.006,cond:{zh:'無上限，但要湊到 NT$300 倍數才能折抵，小額不易兌現。',en:'No cap, but rebates only redeem in NT$300 multiples, so small amounts sit idle.'}},
 ]},
{id:'dbs_everyday',bank:{zh:'星展銀行',en:'DBS Bank'},name:{zh:'星展 everyday 威士御璽卡',en:'DBS everyday Visa Signature'},network:'VISA Signature',color:'#b22228',
 visual:'solid red card with wavy line texture, white DBS logo top-right, large silver "everyday" wordmark with a swoosh, VISA Signature',
 currency:{type:'points',name:{zh:'DBS 積分',en:'DBS points'},perTWD:25},source:'https://www.dbs.com.tw/personal-zh/cards/everyday/index.html',verified:'2026-09-06',valid:null,
 rules:[
  {id:'dbs_stream',label:{zh:'指定海外串流',en:'Selected streaming'},cats:['streaming'],merchants:['Netflix','Disney','YouTube','Spotify','iTunes'],rate:0.016,cond:{zh:'每 NT$25 得 10 點，換算 1.6%。',en:'10 points per NT$25, about 1.6%.'}},
  {id:'dbs_general',label:{zh:'一般消費',en:'General spend'},cats:['general'],rate:0.0016,cond:{zh:'每 NT$25 得 1 點、每點 NT$0.04；要累積 5,000 點（約刷 NT$125,000）才能首次兌換。',en:'1 point per NT$25, each worth NT$0.04; first redemption needs 5,000 points (about NT$125,000 of spend).'}},
 ]},
];
const DEFAULT_WALLET=['tcb_home','cathay_cube','fubon_op','ctbc_linepay','yuanta_biz','dbs_everyday'];
const CATALOG_MAP=Object.fromEntries(CATALOG.map(c=>[c.id,c]));
</script>
