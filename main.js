
// ═══════════════════════════════════════════════
//  CFG
// ═══════════════════════════════════════════════
const CFG = {
  baseSpeed:340, gravity:1100, thrustPower:-2600,
  maxFall:600, maxRise:-500, spawnRate:0.9, gapSize:250,
  hitRadiusFactor:0.28, maxPart:200, maxObs:24, maxCoins:40,
  obstacleWidth:90, explosionParticles:40,
  speedIncreaseInterval:80, speedIncreaseAmount:20, scorePerObstacle:10,
  shakeIntensity:16, shakeDecay:55, minObstacleHeight:65,
  playerW:100, playerH:84, playerXFrac:0.15,
  coinR:10, coinValue:5, coinSpawnChance:0.6, coinsPerGap:4,
  powerupSpawnChance:0.25, starCount:120,
  trailLength:18, trailSpacing:4,
  entryDuration:1.15,
  gameoverDelay:1600,
  fadeTime:350,
  zoneScoreStep:150,
  comboWindow:1.85,
  comboMaxMult:5,
  magnetBaseRange:180,
  maxMeteors:10,
  easyGapBonus:28,
};

const ZONE_FLAVOR={
  0:'Sector 1 — Nebula delivery lane',
  1:'Sector 2 — Asteroid belt crossing',
  2:'Sector 3 — Ion storm corridor',
  3:'Sector 4 — Deep void express',
};

const TRAIL_SKINS={
  default:null,
  gold:'#ffd700',
  plasma:'#e040fb',
  inferno:'#ff5722',
};

// ═══════════════════════════════════════════════
//  SALVATAGGIO / RETENTION
// ═══════════════════════════════════════════════
const Save={
  playerName:'PILOT',
  unlockedChars:[0],
  upgrades:{coinBonus:0,magnetRange:0,shieldStart:0},
  trailSkin:'default',
  settings:{easyMode:false,reduceFlash:true,vibrate:true},
  lifetime:{runs:0,deaths:0,playTime:0,totalCoinsEarned:0,bestCombo:0,obstaclesTotal:0},
  dailyRunBest:{},
  leaderboard:[],
  challengesWon:{},
  tutorialDone:false,
  achievements:[],
  daily:null,
  load(){
    try{
      const n=localStorage.getItem('fs_name');if(n)this.playerName=n;
      const u=localStorage.getItem('fs_unlocked');
      if(u){const a=JSON.parse(u);if(Array.isArray(a)&&a.length)this.unlockedChars=a;}
      const up=localStorage.getItem('fs_upgrades');
      if(up)Object.assign(this.upgrades,JSON.parse(up));
      const lb=localStorage.getItem('fs_leaderboard');
      if(lb)this.leaderboard=JSON.parse(lb).slice(0,5);
      const cw=localStorage.getItem('fs_challenges');
      if(cw)this.challengesWon=JSON.parse(cw);
      this.tutorialDone=localStorage.getItem('fs_tutorial')==='1';
      const ach=localStorage.getItem('fs_achievements');
      if(ach)this.achievements=JSON.parse(ach);
      const d=localStorage.getItem('fs_daily');
      if(d)this.daily=JSON.parse(d);
      const st=localStorage.getItem('fs_settings');
      if(st)Object.assign(this.settings,JSON.parse(st));
      const lt=localStorage.getItem('fs_lifetime');
      if(lt)Object.assign(this.lifetime,JSON.parse(lt));
      const dr=localStorage.getItem('fs_dailyrun');
      if(dr)this.dailyRunBest=JSON.parse(dr);
      const ts=localStorage.getItem('fs_trail');
      if(ts)this.trailSkin=ts;
    }catch(e){}
    if(!this.unlockedChars.includes(0))this.unlockedChars=[0];
    Daily.ensureToday();
  },
  persist(){
    try{
      localStorage.setItem('fs_name',this.playerName);
      localStorage.setItem('fs_unlocked',JSON.stringify(this.unlockedChars));
      localStorage.setItem('fs_upgrades',JSON.stringify(this.upgrades));
      localStorage.setItem('fs_leaderboard',JSON.stringify(this.leaderboard));
      localStorage.setItem('fs_challenges',JSON.stringify(this.challengesWon));
      localStorage.setItem('fs_tutorial',this.tutorialDone?'1':'0');
      localStorage.setItem('fs_achievements',JSON.stringify(this.achievements));
      if(this.daily)localStorage.setItem('fs_daily',JSON.stringify(this.daily));
      localStorage.setItem('fs_settings',JSON.stringify(this.settings));
      localStorage.setItem('fs_lifetime',JSON.stringify(this.lifetime));
      localStorage.setItem('fs_dailyrun',JSON.stringify(this.dailyRunBest));
      localStorage.setItem('fs_trail',this.trailSkin);
    }catch(e){}
  },
  recordRunEnd(){
    const L=this.lifetime;
    L.runs++;L.deaths++;
    L.playTime+=G.runTime||0;
    L.totalCoinsEarned+=G.sessionCoins;
    if(G.maxCombo>L.bestCombo)L.bestCombo=G.maxCombo;
    L.obstaclesTotal+=G.stats.obstaclesPassed;
    this.persist();
  },
  recordRunSuccess(){
    const L=this.lifetime;
    L.runs++;
    L.playTime+=G.runTime||0;
    L.totalCoinsEarned+=G.sessionCoins;
    if(G.maxCombo>L.bestCombo)L.bestCombo=G.maxCombo;
    L.obstaclesTotal+=G.stats.obstaclesPassed;
    this.persist();
  },
  isCharUnlocked(i){return this.unlockedChars.includes(i);},
  unlockChar(i){if(!this.unlockedChars.includes(i))this.unlockedChars.push(i);},
  payCoins(n){if(G.totalCoins<n)return false;G.totalCoins-=n;try{localStorage.setItem('fs_coins',G.totalCoins);}catch(e){}return true;}
};

const SHOP_ITEMS=[
  {id:'ufo',     type:'char',charIdx:1,cost:80, icon:'🛸',name:'UFO',         desc:'Smooth hover control'},
  {id:'shuttle', type:'char',charIdx:2,cost:120,icon:'🚀',name:'SHUTTLE',     desc:'Extra thrust'},
  {id:'dragon',  type:'char',charIdx:3,cost:200,icon:'🐉',name:'DRAGON',      desc:'Maximum speed'},
  {id:'coins1',  type:'up',key:'coinBonus',level:1,cost:100,icon:'🪙',name:'Coins +20%', desc:'Higher coin value'},
  {id:'coins2',  type:'up',key:'coinBonus',level:2,cost:180,icon:'🪙',name:'Coins +40%', desc:'Requires level 1'},
  {id:'magnet',  type:'up',key:'magnetRange',level:1,cost:150,icon:'🧲',name:'Magnet XL',  desc:'Pickup range +50'},
  {id:'shield',  type:'up',key:'shieldStart',level:1,cost:250,icon:'🛡',name:'Launch shield',desc:'1 shield at takeoff'},
  {id:'trail_gold',type:'trail',key:'gold',cost:60,icon:'✨',name:'Gold trail',desc:'Golden engine glow'},
  {id:'trail_plasma',type:'trail',key:'plasma',cost:90,icon:'💜',name:'Plasma trail',desc:'Purple plasma wake'},
  {id:'trail_inferno',type:'trail',key:'inferno',cost:120,icon:'🔥',name:'Inferno trail',desc:'Blazing exhaust'},
];

const CHALLENGES=[
  {id:'classic', name:'CLASSIC', icon:'🚀', desc:'Standard endless mode', reward:0, classic:true},
  {id:'dailyrun',name:'DAILY RUN',icon:'📅',desc:'Same layout for everyone today',reward:35,dailyRun:true},
  {id:'survival',name:'60 SECONDS',icon:'⏱',desc:'Stay alive for 60 seconds', reward:40, timeLimit:60},
  {id:'coinrush',name:'COIN RUSH',icon:'🪙',desc:'Collect 25 coins in one run', reward:50, coinTarget:25},
  {id:'hardcore',name:'HARDCORE',icon:'💀',desc:'Tight gaps, no power-ups',reward:60,noPowerups:true,gapExtra:-45,speedMul:1.12},
];

let runRng=()=>Math.random();
function setRunSeed(seed){
  let t=seed>>>0;
  runRng=()=>{t+=0x6D2B79F5;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return((r^(r>>>14))>>>0)/4294967296;};
}
function dailyRunSeed(){const d=new Date().toISOString().slice(0,10);let h=0;for(let i=0;i<d.length;i++)h=(h*31+d.charCodeAt(i))|0;return h>>>0;}

const ZONES=[
  {id:0,name:'NEBULA',         minScore:0,   bg:'#07091c',body:'#1a2744',accent:'#00bcd4',edge:'#00e5ff',nebula:'rgba(0,188,212,0.06)',  star:'#ffffff',gapMod:0,  moveChance:0},
  {id:1,name:'ASTEROID BELT',  minScore:150,bg:'#140c18',body:'#2e1a22',accent:'#ff7043',edge:'#ffab40',nebula:'rgba(255,112,67,0.07)', star:'#ffe0b2',gapMod:-12,moveChance:0.22},
  {id:2,name:'IONOSPHERE',     minScore:350, bg:'#0a1028',body:'#1a2248',accent:'#7c4dff',edge:'#b388ff',nebula:'rgba(124,77,255,0.08)', star:'#e1bee7',gapMod:-22,moveChance:0.38},
  {id:3,name:'DEEP VOID',      minScore:600, bg:'#050810',body:'#1a0c1c',accent:'#ff1744',edge:'#ff5252',nebula:'rgba(255,23,68,0.06)',  star:'#ffcdd2',gapMod:-32,moveChance:0.52},
];

const DAILY_POOL=[
  {id:'obs',   label:'Pass 15 obstacles', target:15, track:'obstacles'},
  {id:'coins', label:'Collect 20 coins',    target:20, track:'sessionCoins'},
  {id:'combo', label:'Reach combo x3',    target:3,  track:'maxCombo'},
  {id:'zone',  label:'Enter Ionosphere',  target:1,  track:'zone', zoneId:2},
  {id:'score', label:'Score 100 points',  target:100,track:'score'},
];

const ACHIEVEMENTS=[
  {id:'first_flight', name:'First Flight',     desc:'Complete the tutorial', icon:'🚀', check:()=>Save.tutorialDone},
  {id:'combo3',       name:'Coin Streak',      desc:'Reach combo x3', icon:'🪙', check:()=>G.maxCombo>=3},
  {id:'combo5',       name:'Combo Master',     desc:'Reach combo x5', icon:'🔥', check:()=>G.maxCombo>=5},
  {id:'zone2',        name:'Deep Space',       desc:'Reach Asteroid Belt', icon:'☄', check:()=>Zones.idx>=1},
  {id:'zone3',        name:'Purple Haze',      desc:'Reach Ionosphere', icon:'🌌', check:()=>Zones.idx>=2},
  {id:'record',       name:'Record Breaker',   desc:'Set a new high score', icon:'⭐', check:()=>!!G.newRecordThisRun},
  {id:'rich',         name:'Treasure Hunter',  desc:'Hold 500 total coins', icon:'💰', check:()=>G.totalCoins>=500},
  {id:'challenge',    name:'Challenger',       desc:'Beat any challenge', icon:'⚡', check:()=>Object.keys(Save.challengesWon).length>0},
  {id:'survival',     name:'Survivor',         desc:'Beat 60 Seconds', icon:'⏱', check:()=>!!Save.challengesWon.survival},
  {id:'hardcore',     name:'Iron Pilot',       desc:'Beat Hardcore', icon:'💀', check:()=>!!Save.challengesWon.hardcore},
];

const Daily={
  todayKey(){return new Date().toISOString().slice(0,10);},
  ensureToday(){
    const key=this.todayKey();
    if(!Save.daily||Save.daily.date!==key){
      const picks=DAILY_POOL.slice().sort(()=>Math.random()-0.5).slice(0,3);
      Save.daily={date:key,missions:picks.map(p=>({...p,progress:0,done:false})),claimed:false,reward:35};
    }
  },
  onRunEnd(){
    if(!Save.daily)return;
    Save.daily.missions.forEach(m=>{
      if(m.done)return;
      if(m.track==='obstacles')m.progress=Math.min(m.target,G.stats.obstaclesPassed);
      if(m.track==='sessionCoins')m.progress=Math.min(m.target,G.sessionCoins);
      if(m.track==='maxCombo')m.progress=Math.min(m.target,G.maxCombo);
      if(m.track==='score')m.progress=Math.min(m.target,G.score);
      if(m.track==='zone')m.progress=Math.min(m.target,Zones.idx>=m.zoneId?1:0);
      if(m.progress>=m.target)m.done=true;
    });
    Save.persist();
  },
  allDone(){return Save.daily?.missions.every(m=>m.done);},
  claim(){
    if(!Save.daily||Save.daily.claimed||!this.allDone())return false;
    Save.daily.claimed=true;
    G.totalCoins+=Save.daily.reward;
    try{localStorage.setItem('fs_coins',G.totalCoins);}catch(e){}
    Save.persist();refreshMenuCoins();return true;
  }
};

const Achievements={
  scan(){
    ACHIEVEMENTS.forEach(a=>{
      if(Save.achievements.includes(a.id))return;
      try{if(a.check())this.unlock(a);}catch(e){}
    });
  },
  unlock(a){
    Save.achievements.push(a.id);
    Save.persist();
    showAchievementToast(a.icon+' '+a.name);
    Audio.recordFanfare();
  }
};

const Tutorial={
  steps:[
    {text:'Hold screen or SPACE to fly up', advance:'thrust'},
    {text:'Fly through the gap — don\'t hit the walls', advance:'obstacle'},
    {text:'Grab coins for combos and shop upgrades!', advance:'coin'},
  ],
  overlay:()=>document.getElementById('tutorial-overlay'),
  stepEl:()=>document.getElementById('tutorial-step'),
  textEl:()=>document.getElementById('tutorial-text'),
  active:false, step:0,
  shouldRun(){return !Save.tutorialDone&&(!G.challenge||G.challenge.classic);},
  start(){
    if(!this.shouldRun())return;
    this.active=true;this.step=0;
    G.tutorialGapBonus=40;
    this.show();
  },
  show(){
    const o=this.overlay();o.classList.remove('hidden');
    this.stepEl().textContent='STEP '+(this.step+1)+'/'+this.steps.length;
    this.textEl().textContent=this.steps[this.step].text;
  },
  advance(type){
    if(!this.active)return;
    if(this.steps[this.step].advance!==type)return;
    this.step++;
    if(this.step>=this.steps.length){this.finish();return;}
    this.show();
  },
  finish(){
    this.active=false;
    G.tutorialGapBonus=0;
    Save.tutorialDone=true;
    Save.persist();
    this.overlay().classList.add('hidden');
    Achievements.scan();
  }
};

const Boss={
  duration:14,
  laserWarning:null,
  laserActive:null,
  phase2Active:false,
  start(){
    const pal=Zones.palette;
    G.boss={timer:this.duration,spawnTimer:0,phase:0,_laserHit:false,hp:this.duration};
    this.phase2Active=false;
    const hudBoss=document.getElementById('hud-boss');
    hudBoss.classList.remove('hidden');
    hudBoss.textContent='⚠ BOSS — '+pal.name.toUpperCase();
    hudBoss.style.color=pal.edge;
    showScorePop('⚠ BOSS INCOMING',canvas.width*0.5,canvas.height*0.32,false);
    G.shake=14;
    this.laserWarning=null; this.laserActive=null;
    if(typeof Audio.zoneUp==='function')Audio.zoneUp();
  },
  update(dt){
    if(!G.boss)return;
    if(G.state!=='PLAYING')return;
    G.boss.timer-=dt;
    G.boss.spawnTimer-=dt;
    G.boss.phase+=dt;
    const bpct=Math.max(0,G.boss.timer/this.duration);
    // FASE 2: sotto il 40% della vita
    if(bpct<0.4&&!this.phase2Active){
      this.phase2Active=true;
      G.shake=10;
      showScorePop('⚠ PHASE 2!',canvas.width*0.5,canvas.height*0.3,false,true);
      spawnExplosion(canvas.width*0.5,canvas.height*0.5);
    }
    const rate=this.phase2Active?Math.max(0.3,0.65-Zones.idx*0.08):Math.max(0.45,0.85-Zones.idx*0.1);
    if(G.boss.spawnTimer<=0){G.boss.spawnTimer=rate;spawnBossPair();}
    // laser: fase 1 ogni ~4s zone avanzate, fase 2 ogni ~2.2s ovunque
    const laserChance=this.phase2Active?0.018:0.008;
    const laserZone=this.phase2Active?1:2;
    if(!this.laserWarning&&!this.laserActive&&G.boss.phase>3&&Zones.idx>=laserZone){
      if(Math.random()<laserChance){
        const warnTime=this.phase2Active?0.85:1.4;
        this.laserWarning={y:canvas.height*0.18+Math.random()*canvas.height*0.64,timer:warnTime};
      }
    }
    if(this.laserWarning){
      this.laserWarning.timer-=dt;
      if(this.laserWarning.timer<=0){
        this.laserActive={y:this.laserWarning.y,timer:0.55,w:this.phase2Active?24:18};
        this.laserWarning=null; G.shake=8;
      }
    }
    if(this.laserActive){
      this.laserActive.timer-=dt;
      if(!G.boss._laserHit&&Math.abs(P.hbY-this.laserActive.y)<this.laserActive.w+P.hbR){
        if(G.powerup&&G.powerup.id==='shield'){G.powerup=null;spawnFire(P.hbX,P.hbY,10,['#00e5ff','#fff']);Audio.shield();}
        else{G.boss._laserHit=true;setGameOver('⚡ Laser strike');}
      }
      if(this.laserActive.timer<=0)this.laserActive=null;
    }
    if(G.boss.timer<=0){
      G.boss=null; this.laserWarning=null; this.laserActive=null; this.phase2Active=false;
      document.getElementById('hud-boss').classList.add('hidden');
      G.score+=50;
      showScorePop('BOSS DEFEATED! +50',canvas.width*0.5,canvas.height*0.38,false,true);
      for(let i=0;i<3;i++)setTimeout(()=>{spawnExplosion(canvas.width*(0.3+Math.random()*0.4),canvas.height*(0.2+Math.random()*0.6));},i*180);
      Audio.recordFanfare(); G.shake=18;
    }
  },
  draw(){
    if(!G.boss)return;
    if(this.laserWarning){
      const pulse=0.4+0.4*Math.sin(Date.now()*0.012);
      const col=this.phase2Active?'#ff9800':'#ff1744';
      ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=pulse;ctx.lineWidth=this.phase2Active?4:3;ctx.setLineDash([14,8]);
      ctx.beginPath();ctx.moveTo(0,this.laserWarning.y);ctx.lineTo(canvas.width,this.laserWarning.y);ctx.stroke();
      ctx.setLineDash([]);
      // etichetta LASER
      ctx.globalAlpha=pulse*0.9;ctx.fillStyle=col;ctx.font='bold 11px monospace';ctx.textAlign='left';
      ctx.fillText('⚡ LASER',8,this.laserWarning.y-7);
      ctx.restore();
    }
    if(this.laserActive){
      const prog=this.laserActive.timer/0.55;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.fillStyle='#ff1744';ctx.globalAlpha=0.18*prog;
      ctx.fillRect(0,this.laserActive.y-this.laserActive.w*2.5,canvas.width,this.laserActive.w*5);
      const grad=ctx.createLinearGradient(0,0,canvas.width,0);
      grad.addColorStop(0,'rgba(255,23,68,0)');grad.addColorStop(0.1,'#ff1744');
      grad.addColorStop(0.5,'#fff');grad.addColorStop(0.9,'#ff1744');grad.addColorStop(1,'rgba(255,23,68,0)');
      ctx.fillStyle=grad;ctx.globalAlpha=0.85*prog;
      ctx.fillRect(0,this.laserActive.y-this.laserActive.w/2,canvas.width,this.laserActive.w);
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.globalAlpha=0.6*prog;
      ctx.beginPath();ctx.moveTo(0,this.laserActive.y);ctx.lineTo(canvas.width,this.laserActive.y);ctx.stroke();
      ctx.restore();
    }
    // barra vita boss segmentata
    const bpct=Math.max(0,G.boss.timer/this.duration);
    const bw=canvas.width*0.45,bx=(canvas.width-bw)/2,by=canvas.height-16;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bx-2,by-2,bw+4,11);
    const bcol=bpct>0.6?'#ff1744':bpct>0.35?'#ff9800':'#ffeb3b';
    // glow
    ctx.shadowColor=bcol;ctx.shadowBlur=8;
    ctx.fillStyle=bcol;ctx.fillRect(bx,by,bw*bpct,7);
    ctx.shadowBlur=0;
    // segmenti
    ctx.strokeStyle='rgba(0,0,0,0.4)';ctx.lineWidth=1;
    for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(bx+bw*i/5,by);ctx.lineTo(bx+bw*i/5,by+7);ctx.stroke();}
    // fase 2 indicator
    if(this.phase2Active){
      ctx.globalAlpha=0.7+0.3*Math.sin(Date.now()*0.008);
      ctx.fillStyle='#ff9800';ctx.font='bold 9px monospace';ctx.textAlign='center';
      ctx.fillText('⚠ PHASE 2',canvas.width/2,by-5);
    } else {
      ctx.globalAlpha=0.6;ctx.fillStyle='#fff';ctx.font='bold 9px monospace';ctx.textAlign='center';
      ctx.fillText('BOSS',canvas.width/2,by-5);
    }
    ctx.restore();
  }
};

function showAchievementToast(msg){
  const el=document.createElement('div');
  el.className='achievement-toast';
  el.textContent='★ '+msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}

function spawnBossPair(){
  const gap=Math.max(130,CFG.gapSize-50+(G.tutorialGapBonus||0));
  const min=CFG.minObstacleHeight,max=canvas.height-gap-min;
  const topH=Math.random()*(max-min)+min;
  const w=Math.round(CFG.obstacleWidth*0.9);
  const opts={variant:'moving',movePhase:Math.random()*Math.PI*2,moveAmp:48+Zones.idx*8,moveSpeed:3.2};
  obs.spawn(canvas.width,0,w,topH,false,opts);
  obs.spawn(canvas.width,topH+gap,w,canvas.height-topH-gap,true,opts);
}

let selectedChallengeId='classic';

// ═══════════════════════════════════════════════
//  TRANSIZIONI
// ═══════════════════════════════════════════════
const Transition = {
  overlay: null,
  init() { this.overlay = document.getElementById('fade-overlay'); },

  // Fade out → callback → fade in
  crossfade(callback) {
    this.overlay.classList.add('fade-in');
    setTimeout(() => {
      callback();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.overlay.classList.remove('fade-in');
        });
      });
    }, CFG.fadeTime);
  },

  showPanel(el) {
    el.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  },
  hidePanel(el) {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('hidden'), 400);
  }
};

// ═══════════════════════════════════════════════
//  AUDIO ENGINE (PRO VERSION)
// ═══════════════════════════════════════════════
const Audio = (() => {
  let ctx=null, muted=false, musicGain=null, musicNodes=[];
  let engineOsc=null, engineGain=null, engineFilter=null;
  let currentMusicVol = 0.05;

  const thrustSound = new window.Audio('spinta.mp3');
  thrustSound.volume = 0.4; // Regola il volume da 0.0 a 1.0

  function init(){ if(ctx)return; ctx=new(window.AudioContext||window.webkitAudioContext)(); }
  function resume(){ if(ctx&&ctx.state==='suspended')ctx.resume(); }

  // Calcola il panning spaziale da -1 (sinistra) a +1 (destra)
  function getPan(x) {
    if (x === undefined) return 0;
    return Math.max(-1, Math.min(1, (x / window.innerWidth) * 2 - 1));
  }

  // Tono base con inviluppo ADSR morbido e Panning 3D
  function tone(freq, type, duration, vol, startFreq, endFreq, delay=0, pan=0){
    if(!ctx||muted)return;
    const o=ctx.createOscillator(), g=ctx.createGain(), p=ctx.createStereoPanner();
    p.pan.value = pan;
    o.type=type; 
    o.frequency.setValueAtTime(startFreq||freq, ctx.currentTime+delay);
    if(endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime+delay+duration);
    
    // Inviluppo per rimuovere i "click" digitali e rendere il suono elegante
    g.gain.setValueAtTime(0, ctx.currentTime+delay);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime+delay+duration*0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+delay+duration);
    
    o.connect(g); g.connect(p); p.connect(ctx.destination);
    o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+duration);
  }

  // Rumore bianco per esplosioni e percussioni
  function noise(duration, vol, delay=0, filterFreq=800, filterType='lowpass', pan=0){
    if(!ctx||muted)return;
    const buf=ctx.createBuffer(1, ctx.sampleRate*duration, ctx.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource(), g=ctx.createGain(), f=ctx.createBiquadFilter(), p=ctx.createStereoPanner();
    src.buffer=buf; p.pan.value = pan;
    f.type=filterType; f.frequency.value=filterFreq;
    
    g.gain.setValueAtTime(vol, ctx.currentTime+delay); 
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+delay+duration);
    
    src.connect(f); f.connect(g); g.connect(p); p.connect(ctx.destination);
    src.start(ctx.currentTime+delay); src.stop(ctx.currentTime+delay+duration);
  }

  // Sidechain Ducking: abbassa la musica durante i suoni forti
  function duckMusic() {
    if(!musicGain || muted) return;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05); // Abbassa veloce
    musicGain.gain.linearRampToValueAtTime(currentMusicVol, ctx.currentTime + 1.5); // Alza lento
  }

  // Motore navicella
  function initEngine(){
    if(!ctx||muted||engineOsc)return;
    engineOsc=ctx.createOscillator(); engineFilter=ctx.createBiquadFilter(); engineGain=ctx.createGain();
    engineOsc.type='sawtooth'; engineFilter.type='lowpass';
    engineGain.gain.value=0;
    engineOsc.connect(engineFilter); engineFilter.connect(engineGain); engineGain.connect(ctx.destination);
    engineOsc.start();
  }
  function updateEngine(thrusting, speed, vy){
    if(!ctx||muted)return;
    if(!engineOsc)initEngine();
    if(!engineOsc)return;
    const speedNorm=Math.max(0,(speed-CFG.baseSpeed)/400);
    const baseFreq=85+speedNorm*55+(thrusting?25:0)+Math.max(0,-vy/CFG.maxFall*18);
    engineOsc.frequency.setTargetAtTime(baseFreq,ctx.currentTime,0.08);
    engineFilter.frequency.setTargetAtTime(thrusting?600:280,ctx.currentTime,0.1);
    engineGain.gain.setTargetAtTime(muted?0:(thrusting?0.025:0.012),ctx.currentTime,0.05);
  }
  function stopEngine(){
    if(engineOsc){try{engineOsc.stop();engineOsc.disconnect();}catch(e){} engineOsc=null;}
    if(engineGain){engineGain.disconnect();engineGain=null;}
  }

  // Colonne sonore procedurali con Batteria
  const ZONE_MUSIC=[
    {scale:[261.63,329.63,392,523.25,659.25,783.99],bpm:132,wave:'sine',vol:0.06},
    {scale:[220,261.63,293.66,349.23,440,523.25],bpm:148,wave:'triangle',vol:0.055},
    {scale:[185,220,246.94,311.13,370,415.3],bpm:165,wave:'square',vol:0.04},
    {scale:[146.83,174.61,185,220,246.94,277.18],bpm:180,wave:'sawtooth',vol:0.035},
  ];
  let currentZoneMusic=-1;

  function startMusic(zoneIdx){
    if(!ctx||muted)return;
    const zi=Math.min(zoneIdx||0,ZONE_MUSIC.length-1);
    if(musicGain&&zi===currentZoneMusic)return;
    stopMusic(); currentZoneMusic=zi;
    const zm=ZONE_MUSIC[zi];
    currentMusicVol = zm.vol;
    musicGain=ctx.createGain(); musicGain.gain.value=currentMusicVol; musicGain.connect(ctx.destination);
    
    let step=0; const interval=60/zm.bpm/2;

    function playNote(){
      if(!ctx||muted||!musicGain)return;
      
      // Batteria Procedurale
      if(step % 4 === 0) tone(150, 'sine', 0.15, 0.25, 150, 40, 0); // Kick (Cassa)
      if(step % 2 !== 0) noise(0.04, 0.05, 0, 4000, 'highpass'); // Hi-Hat (Charleston)

      // Musica Dinamica (se la combo è alta, aggiungi hi-hat veloci e un suono extra)
      if(G.coinCombo >= 3 && step % 1 === 0) {
        noise(0.02, 0.03, 0, 6000, 'highpass', (step%2===0?-0.5:0.5));
      }

      // Melodia
      const deg=step%zm.scale.length, oct=step%16<8?2:4;
      const o=ctx.createOscillator(), g=ctx.createGain(); o.type=zm.wave;
      o.frequency.value=zm.scale[deg]*oct;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime+0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+interval*0.75);
      
      o.connect(g); g.connect(musicGain); o.start(); o.stop(ctx.currentTime+interval*0.75);
      musicNodes.push(o); step++;
      
      const tid=setTimeout(playNote, interval*1000); musicNodes.push({stop:()=>clearTimeout(tid)});
    }
    playNote();
  }
  function stopMusic(){ musicNodes.forEach(n=>{try{n.stop&&n.stop();}catch(e){}}); musicNodes=[]; if(musicGain){musicGain.disconnect();musicGain=null;} }
  function toggleMute(){ muted=!muted; if(muted){stopMusic();if(engineGain)engineGain.gain.value=0;} else if(ctx)startMusic(); return muted; }

  return {
    init,resume,toggleMute,startMusic,stopMusic,updateEngine,stopEngine,
    // Suoni di gioco migliorati
    thrust() { 
      if (muted) return; // Se il gioco è muto, non suona
      thrustSound.currentTime = 0; // Fa ripartire il suono da zero se premi ripetutamente
      thrustSound.play().catch(e => {}); // Suona! (il catch previene errori del browser)
    },
    coin(x)       { tone(988, 'sine', 0.15, 0.1, 988, 1318, 0, getPan(x)); 
                    tone(1318, 'sine', 0.1, 0.05, 1318, 1975, 0.05, getPan(x)); }, // Accordo scintillante
    powerup(x)    { tone(440, 'triangle', 0.4, 0.1, 440, 880, 0, getPan(x)); },
    shield()      { tone(220, 'square', 0.4, 0.08, 440, 110); duckMusic(); },
    laser(x)      { tone(1200, 'sawtooth', 0.15, 0.04, 1200, 400, 0, getPan(x)); },
    explosion(x)  { noise(0.6, 0.4, 0, 800, 'lowpass', getPan(x)); 
                    tone(100, 'sawtooth', 0.5, 0.2, 100, 30, 0, getPan(x)); duckMusic(); }, // Più corposa
    score()       { tone(880, 'sine', 0.1, 0.03, 880, 1100); },
    zoneUp()      { [330,440,554,880].forEach((f,i)=>tone(f,'sine',0.2,0.06,f,f*1.05,i*0.12)); },
    combo()       { tone(1318, 'triangle', 0.15, 0.1, 1318, 1760); },
    recordFanfare(){ [523,659,784,1047].forEach((f,i)=>tone(f,'square',0.2,0.07,f,f,i*0.12)); },
    gameoverJingle(){ [440,370,310,220].forEach((f,i)=>tone(f,'triangle',0.25,0.08,f,f*0.85,i*0.2)); },
    // UI Sounds (Nuovi!)
    uiHover()     { tone(600, 'sine', 0.05, 0.015, 600, 600); },
    uiClick()     { tone(800, 'triangle', 0.08, 0.04, 800, 1200); },
    get muted(){ return muted; }
  };
})();

const Zones={
  idx:0,palette:ZONES[0],flash:0,
  forScore(score){
    let z=ZONES[0];
    for(const cand of ZONES) if(score>=cand.minScore) z=cand;
    return z;
  },
  update(score){
    const next=this.forScore(score);
    if(next.id!==this.idx){
      this.idx=next.id;this.palette=next;this.flash=0.55;
      G.timeScale=0.35;G.timeScaleTimer=0.35;
      Audio.zoneUp();
      if(!Audio.muted)setTimeout(()=>Audio.startMusic(next.id),400);
      if(navigator.vibrate)navigator.vibrate([25,15,25]);
      showScorePop('▶ '+next.name,canvas.width*0.5,canvas.height*0.38,false);
      if(!G.boss&&!Tutorial.active)Boss.start();
      showZoneBanner(next.name);
      Achievements.scan();
    }
  }
};

const menuStars=Array.from({length:80},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+0.5,spd:Math.random()*.12+0.03,a:Math.random()*.6+0.2}));
let menuStarT=0,gridOff=0;
function drawParallaxGrid(pal,speed,dt){
  gridOff=(gridOff+speed*dt*0.15)%60;
  ctx.strokeStyle=pal.accent;ctx.globalAlpha=0.07;ctx.lineWidth=1;
  for(let x=-gridOff;x<canvas.width+60;x+=60){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-gridOff*0.3,canvas.height);ctx.stroke();
  }
  for(let y=gridOff%40;y<canvas.height;y+=40){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function drawMenuBackground(t){
  const pal=ZONES[0];
  ctx.fillStyle='#050610';ctx.fillRect(0,0,canvas.width,canvas.height);
  drawNebulae(pal);
  menuStarT+=0.016;
  menuStars.forEach(s=>{
    s.x-=s.spd*0.35;if(s.x<0)s.x=1;
    const tw=0.7+0.3*Math.sin(menuStarT+s.x*20);
    ctx.globalAlpha=s.a*tw;ctx.fillStyle=s.x>0.7?'#00ffcc':'#fff';
    ctx.beginPath();ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  drawParallaxGrid(pal,CFG.baseSpeed*0.2,0.016);
}
function showZoneBanner(name){
  const el=document.getElementById('zone-banner');
  el.textContent=ZONE_FLAVOR[Zones.idx]||name;
  el.style.color=Zones.palette.accent;
  el.classList.add('show');
  clearTimeout(showZoneBanner._t);
  showZoneBanner._t=setTimeout(()=>el.classList.remove('show'),2800);
}

// ═══════════════════════════════════════════════
//  ASSETS
// ═══════════════════════════════════════════════
const Assets = {
  bg:new Image(),obstacle:new Image(),
  rocket:new Image(),ufo:new Image(),shuttle:new Image(),dragon:new Image(),
  loaded:0,total:6,ready:false,
  init(onReady){
    const bar=document.getElementById('loading-bar'),pct=document.getElementById('loading-pct');
    const check=()=>{this.loaded++;const p=Math.round(this.loaded/this.total*100);bar.style.width=p+'%';pct.textContent=p+'%';if(this.loaded===this.total){this.ready=true;setTimeout(onReady,300);}};
    const fail=(img)=>{console.warn('Asset mancante:',img.src);check();};
    [this.bg,this.obstacle,this.rocket,this.ufo,this.shuttle,this.dragon].forEach(img=>{img.onload=check;img.onerror=()=>fail(img);});
    this.bg.src='./assets/sfondo.png';this.obstacle.src='./assets/ostacolo.png';
    this.rocket.src='./assets/rocket.png';this.ufo.src='./assets/ufo.png';
    this.shuttle.src='./assets/shuttle.png';this.dragon.src='./assets/dragon.png';
  },
  draw(img,cx,x,y,w,h){if(img.complete&&img.naturalWidth>0){cx.drawImage(img,Math.floor(x),Math.floor(y),w,h);return true;}return false;}
};
let bgX=0;

// ═══════════════════════════════════════════════
//  PERSONAGGI
// ═══════════════════════════════════════════════
const CHARACTERS=[
  {
    id:'rocket',name:'ROCKET',trait:'Standard ship',unlockCost:0,accel:1.0,color:'#00bcd4',trailColor:'#00bcd4',
    img(){return Assets.rocket;},
    drawFallback(cx,x,y,w,h,t){
      cx.fillStyle='#00bcd4';cx.beginPath();cx.ellipse(x+w*.55,y+h*.5,w*.42,h*.32,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#e0f7fa';cx.beginPath();cx.moveTo(x+w*.97,y+h*.5);cx.lineTo(x+w*.55,y+h*.18);cx.lineTo(x+w*.55,y+h*.82);cx.closePath();cx.fill();
      cx.fillStyle='#ff7043';cx.beginPath();cx.moveTo(x+w*.14,y+h*.5);cx.lineTo(x+w*.38,y+h*.28);cx.lineTo(x+w*.38,y+h*.72);cx.closePath();cx.fill();
      cx.fillStyle='rgba(0,255,204,0.7)';cx.beginPath();cx.arc(x+w*.62,y+h*.5,h*.13,0,Math.PI*2);cx.fill();
      if(t){cx.fillStyle='#ff5722';cx.globalAlpha=.85;cx.beginPath();cx.moveTo(x+w*.14,y+h*.5);cx.lineTo(x-w*.18,y+h*.38);cx.lineTo(x-w*.18,y+h*.62);cx.closePath();cx.fill();cx.fillStyle='#ffeb3b';cx.globalAlpha=.7;cx.beginPath();cx.moveTo(x+w*.14,y+h*.5);cx.lineTo(x-w*.08,y+h*.44);cx.lineTo(x-w*.08,y+h*.56);cx.closePath();cx.fill();cx.globalAlpha=1;}
    },
    draw(cx,x,y,w,h,t){if(!Assets.draw(this.img(),cx,x,y,w,h))this.drawFallback(cx,x,y,w,h,t);}
  },
  {
    id:'ufo',name:'UFO',trait:'Hover stabilizer',unlockCost:80,accel:0.85,color:'#ce93d8',trailColor:'#e040fb',
    img(){return Assets.ufo;},
    drawFallback(cx,x,y,w,h,t){
      cx.fillStyle='rgba(206,147,216,0.5)';cx.beginPath();cx.ellipse(x+w*.5,y+h*.38,w*.28,h*.28,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#7b1fa2';cx.beginPath();cx.ellipse(x+w*.5,y+h*.58,w*.48,h*.2,0,0,Math.PI*2);cx.fill();
      cx.strokeStyle='#e040fb';cx.lineWidth=2;cx.beginPath();cx.ellipse(x+w*.5,y+h*.58,w*.48,h*.2,0,0,Math.PI*2);cx.stroke();
      [.28,.42,.58,.72].forEach((lxi,i)=>{cx.fillStyle=i%2===0?'#ffeb3b':'#00e5ff';cx.beginPath();cx.arc(x+w*lxi,y+h*.58,3,0,Math.PI*2);cx.fill();});
      if(t){const g=cx.createLinearGradient(x+w*.5,y+h*.72,x+w*.5,y+h*1.2);g.addColorStop(0,'rgba(224,64,251,0.6)');g.addColorStop(1,'rgba(224,64,251,0)');cx.fillStyle=g;cx.beginPath();cx.moveTo(x+w*.36,y+h*.72);cx.lineTo(x+w*.64,y+h*.72);cx.lineTo(x+w*.58,y+h*1.2);cx.lineTo(x+w*.42,y+h*1.2);cx.closePath();cx.fill();}
    },
    draw(cx,x,y,w,h,t){if(!Assets.draw(this.img(),cx,x,y,w,h))this.drawFallback(cx,x,y,w,h,t);}
  },
  {
    id:'shuttle',name:'SHUTTLE',trait:'Double-tap: DASH',unlockCost:120,accel:1.15,color:'#90a4ae',trailColor:'#80deea',
    img(){return Assets.shuttle;},
    drawFallback(cx,x,y,w,h,t){
      cx.fillStyle='#eceff1';cx.beginPath();cx.roundRect(x+w*.12,y+h*.25,w*.7,h*.5,8);cx.fill();
      cx.fillStyle='#78909c';cx.beginPath();cx.moveTo(x+w*.22,y+h*.75);cx.lineTo(x+w*.22,y+h*.5);cx.lineTo(x+w*.6,y+h*.5);cx.lineTo(x+w*.72,y+h*.75);cx.closePath();cx.fill();
      cx.fillStyle='#b0bec5';cx.beginPath();cx.moveTo(x+w*.82,y+h*.35);cx.lineTo(x+w*.97,y+h*.5);cx.lineTo(x+w*.82,y+h*.65);cx.closePath();cx.fill();
      [.48,.62,.74].forEach(fx=>{cx.fillStyle='rgba(0,188,212,0.6)';cx.beginPath();cx.arc(x+w*fx,y+h*.42,h*.1,0,Math.PI*2);cx.fill();});
      if(t){cx.fillStyle='#ff5722';cx.globalAlpha=.9;cx.beginPath();cx.ellipse(x+w*.12,y+h*.4,w*.06,h*.08,0,0,Math.PI*2);cx.fill();cx.beginPath();cx.ellipse(x+w*.12,y+h*.6,w*.06,h*.08,0,0,Math.PI*2);cx.fill();cx.fillStyle='#ffeb3b';cx.globalAlpha=.8;cx.beginPath();cx.ellipse(x+w*.12,y+h*.4,w*.03,h*.04,0,0,Math.PI*2);cx.fill();cx.beginPath();cx.ellipse(x+w*.12,y+h*.6,w*.03,h*.04,0,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
    },
    draw(cx,x,y,w,h,t){if(!Assets.draw(this.img(),cx,x,y,w,h))this.drawFallback(cx,x,y,w,h,t);}
  },
  {
    id:'dragon',name:'DRAGON',trait:'Near-miss: SLOW-MO',unlockCost:200,accel:1.3,color:'#ef9a9a',trailColor:'#ff5722',
    img(){return Assets.dragon;},
    drawFallback(cx,x,y,w,h,t){
      cx.strokeStyle='#c62828';cx.lineWidth=4;cx.lineCap='round';cx.beginPath();cx.moveTo(x+w*.18,y+h*.5);cx.quadraticCurveTo(x+w*.05,y+h*.3,x+w*.12,y+h*.15);cx.stroke();
      cx.fillStyle='#e53935';cx.beginPath();cx.ellipse(x+w*.52,y+h*.5,w*.38,h*.3,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#ef5350';cx.beginPath();cx.ellipse(x+w*.82,y+h*.5,w*.18,h*.22,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#ffeb3b';cx.beginPath();cx.arc(x+w*.88,y+h*.44,4,0,Math.PI*2);cx.fill();
      cx.fillStyle='#000';cx.beginPath();cx.arc(x+w*.89,y+h*.44,2,0,Math.PI*2);cx.fill();
      cx.fillStyle='rgba(239,154,154,0.7)';cx.beginPath();cx.moveTo(x+w*.5,y+h*.22);cx.lineTo(x+w*.7,y+0);cx.lineTo(x+w*.3,y+h*.28);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x+w*.5,y+h*.78);cx.lineTo(x+w*.7,y+h);cx.lineTo(x+w*.3,y+h*.72);cx.closePath();cx.fill();
      if(t){cx.fillStyle='#ff6d00';cx.globalAlpha=.9;cx.beginPath();cx.moveTo(x+w*.18,y+h*.5);cx.lineTo(x-w*.15,y+h*.4);cx.lineTo(x-w*.15,y+h*.6);cx.closePath();cx.fill();cx.fillStyle='#ffeb3b';cx.globalAlpha=.75;cx.beginPath();cx.moveTo(x+w*.18,y+h*.5);cx.lineTo(x-w*.05,y+h*.46);cx.lineTo(x-w*.05,y+h*.54);cx.closePath();cx.fill();cx.globalAlpha=1;}
    },
    draw(cx,x,y,w,h,t){if(!Assets.draw(this.img(),cx,x,y,w,h))this.drawFallback(cx,x,y,w,h,t);}
  }
];

// ═══════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
const loadingScreen=document.getElementById('loading-screen');
const uiMenu=document.getElementById('ui-menu');
const uiGameover=document.getElementById('ui-gameover');
const uiPause=document.getElementById('ui-pause');
const titleText=document.getElementById('title-text');
const hiScoreDisplay=document.getElementById('hi-score-display');
const coinTotalDisplay=document.getElementById('coin-total-display');
const startButton=document.getElementById('start-button');
const retryButton=document.getElementById('retry-button');
const menuButton=document.getElementById('menu-button');
const hud=document.getElementById('hud');
const hudScore=document.getElementById('hud-score');
const hudZone=document.getElementById('hud-zone');
const hudCombo=document.getElementById('hud-combo');
const hudCoins=document.getElementById('hud-coins');
const puWrap=document.getElementById('pu-wrap');
const puArc=document.getElementById('pu-arc');
const puEmoji=document.getElementById('pu-emoji');
const audioBtn=document.getElementById('audio-btn');
// gameover fields
const goScore=document.getElementById('go-score');
const goHiscore=document.getElementById('go-hiscore');
const goCoins=document.getElementById('go-coins');
const goObstacles=document.getElementById('go-obstacles');
const goSpeed=document.getElementById('go-speed');
const goPowerups=document.getElementById('go-powerups');
const goCombo=document.getElementById('go-combo');
const uiShop=document.getElementById('ui-shop');
const uiLeaderboard=document.getElementById('ui-leaderboard');
const uiChallenges=document.getElementById('ui-challenges');
const uiVictory=document.getElementById('ui-victory');
const shopList=document.getElementById('shop-list');
const shopCoins=document.getElementById('shop-coins');
const lbList=document.getElementById('lb-list');
const pilotNameInput=document.getElementById('pilot-name');
const challengeList=document.getElementById('challenge-list');
const hudChallenge=document.getElementById('hud-challenge');
const shopButton=document.getElementById('shop-button');
const lbButton=document.getElementById('lb-button');
const challengeButton=document.getElementById('challenge-button');
const uiDaily=document.getElementById('ui-daily');
const uiAchievements=document.getElementById('ui-achievements');
const dailyList=document.getElementById('daily-list');
const achList=document.getElementById('ach-list');
const menuDailyBadge=document.getElementById('menu-daily-badge');
const goNewRecord=document.getElementById('go-new-record');
const goRecordFill=document.getElementById('go-record-fill');
const goRecordPct=document.getElementById('go-record-pct');

function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener('resize',resize);resize();

// ═══════════════════════════════════════════════
//  STATO PERSISTENTE
// ═══════════════════════════════════════════════
let savedHS=0,savedCoins=0,selectedCharIdx=0;
try{
  savedHS=parseInt(localStorage.getItem('fs_hs')||'0',10)||0;
  savedCoins=parseInt(localStorage.getItem('fs_coins')||'0',10)||0;
  selectedCharIdx=parseInt(localStorage.getItem('fs_char')||'0',10)||0;
  if(selectedCharIdx<0||selectedCharIdx>=CHARACTERS.length)selectedCharIdx=0;
}catch(e){}
Save.load();
if(!Save.isCharUnlocked(selectedCharIdx))selectedCharIdx=0;

// ═══════════════════════════════════════════════
//  STELLE & SFONDO
// ═══════════════════════════════════════════════
const stars=Array.from({length:CFG.starCount},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.8+0.3,spd:Math.random()*0.18+0.04,a:Math.random()*0.7+0.3}));
function drawStars(speed,pal){
  stars.forEach(s=>{
    s.x-=s.spd*(speed/CFG.baseSpeed)*0.4/canvas.width;if(s.x<0)s.x=1;
    ctx.globalAlpha=s.a;ctx.fillStyle=pal.star;
    ctx.beginPath();ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;
}
const nebulaSpots=[{x:0.2,y:0.3,rx:0.18,ry:0.22},{x:0.72,y:0.58,rx:0.22,ry:0.16},{x:0.48,y:0.14,rx:0.15,ry:0.12}];
function drawNebulae(pal){
  nebulaSpots.forEach(n=>{
    const g=ctx.createRadialGradient(n.x*canvas.width,n.y*canvas.height,0,n.x*canvas.width,n.y*canvas.height,n.rx*canvas.width);
    g.addColorStop(0,pal.nebula);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(n.x*canvas.width,n.y*canvas.height,n.rx*canvas.width,n.ry*canvas.height,0,0,Math.PI*2);ctx.fill();
  });
}
function drawBackground(speed,dt){
  const pal=Zones.palette,bg=Assets.bg;
  const flashMul=Save.settings.reduceFlash?0.35:1;
  if(bg.complete&&bg.naturalWidth>0){
    ctx.drawImage(bg,Math.floor(bgX),0,canvas.width,canvas.height);
    ctx.drawImage(bg,Math.floor(bgX)+canvas.width,0,canvas.width,canvas.height);
    ctx.fillStyle=pal.bg;ctx.globalAlpha=0.48;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=1;
  }else{
    const g=ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0,pal.bg);g.addColorStop(1,'#020208');
    ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
    drawNebulae(pal);drawStars(speed,pal);
  }
  drawParallaxGrid(pal,speed,dt||0.016);
  if(Zones.flash>0){
    ctx.fillStyle=pal.accent;ctx.globalAlpha=Zones.flash*0.22*flashMul;
    ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=1;
  }
}
function vib(p){if(Save.settings.vibrate&&navigator.vibrate)navigator.vibrate(p);}

// ═══════════════════════════════════════════════
//  SCIA
// ═══════════════════════════════════════════════
const trail=[];let trailTimer=0;
function updateTrail(dt){trailTimer+=dt*1000;if(trailTimer>=CFG.trailSpacing){trailTimer=0;trail.push({x:P.hbX,y:P.hbY,age:0});if(trail.length>CFG.trailLength)trail.shift();}trail.forEach(t=>t.age+=dt);}
function drawTrail(){
  if(trail.length<2)return;
  const ch=CHARACTERS[G.activeChar];
  const col=TRAIL_SKINS[Save.trailSkin]||ch.trailColor;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=1;i<trail.length;i++){
    const t=trail[i],prog=i/trail.length;
    ctx.globalAlpha=prog*0.5;ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(t.x,t.y,prog*P.hbR*1.1,0,Math.PI*2);ctx.fill();
    if(Save.trailSkin!=='default'){ctx.globalAlpha=prog*0.25;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(t.x,t.y,prog*P.hbR*0.4,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════
//  ANIMAZIONE ENTRATA
// ═══════════════════════════════════════════════
const Entry={
  active:false,t:0,startX:0,targetX:0,startY:0,targetY:0,scale:1,sparkTimer:0,
  start(){
    this.active=true;this.t=0;this.sparkTimer=0;
    this.targetX=canvas.width*CFG.playerXFrac;
    this.startX=-CFG.playerW*2.5;
    this.targetY=canvas.height/2-CFG.playerH/2;
    this.startY=canvas.height*0.22;
    P.x=this.startX;P.y=this.startY;P.vy=0;this.scale=0.55;
  },
  update(dt){
    if(!this.active)return;
    this.t+=dt/CFG.entryDuration;
    const done=this.t>=1;
    if(done){this.t=1;this.active=false;}
    const c1=1.70158,c3=c1+1,ease=1+c3*Math.pow(this.t-1,3)+c1*Math.pow(this.t-1,2);
    const arc=Math.sin(this.t*Math.PI)*canvas.height*0.06;
    P.x=this.startX+(this.targetX-this.startX)*ease;
    P.y=this.startY+(this.targetY-this.startY)*ease-arc;
    this.scale=0.55+0.45*ease;
    this.sparkTimer+=dt;
    if(this.sparkTimer>0.04){this.sparkTimer=0;spawnFire(P.x+P.w*0.1,P.y+P.h*0.55,1,[CHARACTERS[G.activeChar].trailColor,'#fff']);}
    if(done){spawnFire(P.hbX,P.hbY,14,[CHARACTERS[G.activeChar].trailColor,'#00ffcc','#ffeb3b']);grantEntryShield();}
  }
};

// ═══════════════════════════════════════════════
//  SCORE POP
// ═══════════════════════════════════════════════
function showScorePop(text,x,y,isCoin,isCombo){
  const el=document.createElement('div');
  el.className='score-pop'+(isCoin?' coin':'')+(isCombo?' combo':'');
  el.textContent=text;el.style.left=(x-20)+'px';el.style.top=(y-10)+'px';
  document.body.appendChild(el);el.addEventListener('animationend',()=>el.remove());
}

// ═══════════════════════════════════════════════
//  POOLS
// ═══════════════════════════════════════════════
class ObstaclePool{
  constructor(n){
    this.pool=Array.from({length:n},()=>({
      active:false,x:0,y:0,w:0,h:0,passed:false,isScore:false,
      variant:'static',baseY:0,movePhase:0,moveAmp:0,moveSpeed:2,pairId:-1
    }));
  }
  spawn(x,y,w,h,isScore,opts={}){
    for(let o of this.pool){
      if(!o.active){
        Object.assign(o,{
          active:true,destroyed:false,x,y,w,h,passed:false,isScore,
          variant:opts.variant||'static',baseY:y,
          movePhase:opts.movePhase||0,moveAmp:opts.moveAmp||0,moveSpeed:opts.moveSpeed||2,
          pairId:opts.pairId||-1,gap:opts.gap||0
        });
        return;
      }
    }
  }
}
class CoinPool{constructor(n){this.pool=Array.from({length:n},()=>({active:false,x:0,y:0,r:0,collected:false,anim:0,type:'coin'}));}spawn(x,y,type='coin'){for(let c of this.pool){if(!c.active){Object.assign(c,{active:true,x,y,r:CFG.coinR,collected:false,anim:0,type});return;}}}}
class ParticlePool{
  constructor(n){this.pool=Array.from({length:n},()=>({active:false,x:0,y:0,vx:0,vy:0,life:0,maxLife:1,color:'#fff',r:3}));}
  spawn(x,y,vx,vy,color,life,r=3){for(let p of this.pool){if(!p.active){Object.assign(p,{active:true,x,y,vx,vy,color,life,maxLife:life,r});return;}}}
  update(dt){for(let p of this.pool){if(p.active){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;if(p.life<=0)p.active=false;}}}
  draw(){ctx.save();ctx.globalCompositeOperation='lighter';for(let p of this.pool){if(p.active){const a=Math.max(0,p.life/p.maxLife);ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(a*0.6+0.4),0,Math.PI*2);ctx.fill();}}ctx.restore();}
}
const parts=new ParticlePool(CFG.maxPart);
const obs=new ObstaclePool(CFG.maxObs);
const coins=new CoinPool(CFG.maxCoins);
class MeteorPool{
  constructor(n){this.pool=Array.from({length:n},()=>({active:false,x:0,y:0,vx:0,vy:0,r:8,rot:0}));this.timer=5;}
  spawn(){
    for(let m of this.pool){
      if(!m.active){
        m.active=true;m.x=canvas.width+30;m.y=60+runRng()*(canvas.height-120);
        m.vx=-(260+runRng()*220);m.vy=(runRng()-.5)*120;m.r=7+runRng()*8;m.rot=runRng()*Math.PI*2;
        return;
      }
    }
  }
  update(dt,spd){
    this.timer-=dt;
    if(this.timer<=0&&Zones.idx>=1){this.timer=3.5+runRng()*4;this.spawn();}
    for(let m of this.pool){
      if(!m.active)continue;
      m.x+=m.vx*dt;m.y+=m.vy*dt;m.rot+=dt*2.5;
      if(m.x<-60)m.active=false;
    }
  }
  draw(){
    ctx.save();
    for(let m of this.pool){
      if(!m.active)continue;
      const g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*2);
      g.addColorStop(0,'#fff');g.addColorStop(0.35,Zones.palette.accent);g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=Zones.palette.edge;ctx.globalAlpha=0.6;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.r*3,m.y-m.r*0.6);ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
}
const meteors=new MeteorPool(CFG.maxMeteors);

// ═══════════════════════════════════════════════
//  LASER (PROJECTILES)
// ═══════════════════════════════════════════════
class ProjectilePool {
  constructor(n) { this.pool = Array.from({length:n}, ()=>({active:false, x:0, y:0, vx:1000, w:32, h:6})); }
  spawn(x, y) {
    for(let p of this.pool) {
      if(!p.active) { p.active = true; p.x = x; p.y = y; return; }
    }
  }
  update(dt) {
    for(let p of this.pool) {
      if(!p.active) continue;
      p.x += p.vx * dt;
      if(p.x > canvas.width) p.active = false;
    }
  }
  draw() {
    ctx.save(); ctx.fillStyle = '#ff1744'; ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 12;
    for(let p of this.pool) {
      if(!p.active) continue;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#fff'; ctx.fillRect(p.x + p.w - 10, p.y + 1, 10, p.h - 2); // Punta bianca
      ctx.fillStyle = '#ff1744';
    }
    ctx.restore();
  }
}
const lasers = new ProjectilePool(30);
let laserFireTimer = 0;

// ═══════════════════════════════════════════════
//  POWERUP
// ═══════════════════════════════════════════════
const POWERUPS=[
  {id:'shield',label:'🛡 SHIELD', emoji:'🛡',color:'#00e5ff',duration:5},
  {id:'magnet',label:'🧲 MAGNET',emoji:'🧲',color:'#ffeb3b',duration:6},
  {id:'slow',  label:'⏳ SLOW',   emoji:'⏳',color:'#ce93d8',duration:5},
  {id:'laser', label:'⚡ LASER',  emoji:'⚡',color:'#ff1744',duration:5},
];
const CIRCUMFERENCE=2*Math.PI*19; // r=19 nel SVG

function updateHudPowerup(){
  if(G.powerup){
    puWrap.style.display='block';
    puEmoji.textContent=G.powerup.emoji;
    puArc.style.stroke=G.powerup.color;
    const pct=Math.max(0,G.powerup.timeLeft/G.powerupMaxDuration);
    puArc.style.strokeDashoffset=CIRCUMFERENCE*(1-pct);
  }else{
    puWrap.style.display='none';
  }
}

// ═══════════════════════════════════════════════
//  GIOCATORE
// ═══════════════════════════════════════════════
const P={
  x:0,y:0,vy:0,thrusting:false,tilt:0,
  dashCooldown:0,dashActive:0,nearMissTimer:0,
  get w(){return CFG.playerW;},get h(){return CFG.playerH;},
  get hbR(){return Math.min(CFG.playerW,CFG.playerH)*CFG.hitRadiusFactor*(this.dashActive>0?0.6:1);},
  get hbX(){return this.x+CFG.playerW*0.5;},
  get hbY(){return this.y+CFG.playerH*0.5;},
  init(){
    this.y=canvas.height/2-CFG.playerH/2;this.vy=0;this.x=canvas.width*CFG.playerXFrac;
    this.thrusting=false;this.tilt=0;this.dashCooldown=0;this.dashActive=0;this.nearMissTimer=0;
  },
  update(dt,accel){
    if(!Entry.active){
      // SHUTTLE: micro-dash orizzontale (tasto doppio / swipe destra)
      if(G.activeChar===2&&P.dashCooldown>0)P.dashCooldown-=dt;
      if(G.activeChar===2&&P.dashActive>0){P.dashActive-=dt;P.x+=320*dt;}
      // UFO: hover stabilizzato — ammortizza le oscillazioni verticali
      if(G.activeChar===1&&!this.thrusting){
        this.vy*=(1-dt*1.8);
      }
      if(this.thrusting)this.vy+=CFG.thrustPower*accel*dt;
      this.vy+=CFG.gravity*dt;
      if(this.vy>CFG.maxFall)this.vy=CFG.maxFall;
      if(this.vy<CFG.maxRise)this.vy=CFG.maxRise;
      this.y+=this.vy*dt;
      if(this.y>canvas.height-this.h){this.y=canvas.height-this.h;this.vy=0;}
      if(this.y<0){this.y=0;this.vy=0;}
      // tilt basato su vy
      const targetTilt=Math.max(-0.45,Math.min(0.45,this.vy/CFG.maxFall*0.45));
      this.tilt+=(targetTilt-this.tilt)*Math.min(1,dt*8);
      // near-miss check: se passiamo vicino a un ostacolo senza colpirlo
      if(P.nearMissTimer>0)P.nearMissTimer-=dt;
    }
  }
};

// Abilità passive personaggio attivate da input speciale
let doubleTapTimer=0,lastTapTime=0;
function tryCharAbility(){
  const now=performance.now();
  if(G.activeChar===2){// SHUTTLE: dash
    if(now-lastTapTime<280&&P.dashCooldown<=0){P.dashActive=0.18;P.dashCooldown=3.5;spawnFire(P.x,P.hbY,6,['#00e5ff','#fff']);Audio.shield();}
    lastTapTime=now;
  }
}

// ═══════════════════════════════════════════════
//  STATO DI GIOCO
// ═══════════════════════════════════════════════
const G={
  state:'MENU',score:0,highScore:savedHS,
  sessionCoins:0,totalCoins:savedCoins,
  speed:CFG.baseSpeed,spawnTimer:0,shake:0,
  activeChar:selectedCharIdx,powerup:null,
  flashTimer:0,flashColor:'#ffeb3b',
  powerupMaxDuration:0,
  coinCombo:0,coinComboTimer:0,maxCombo:0,
  challenge:null,challengeTime:0,challengeWon:false,
  boss:null,freezeTimer:0,timeScale:1,timeScaleTimer:0,tutorialGapBonus:0,deathReason:'',
  runTime:0,useSeededRng:false,
  stats:{ obstaclesPassed:0, powerupsUsed:0, maxSpeed:CFG.baseSpeed }
};

function getCoinValue(){
  const bonus=1+Save.upgrades.coinBonus*0.2;
  return Math.round(CFG.coinValue*bonus);
}
function getMagnetRange(){
  return CFG.magnetBaseRange+(Save.upgrades.magnetRange?50:0);
}
function isClassicMode(){return !G.challenge||G.challenge.classic;}
function submitLeaderboard(score){
  if(score<=0)return;
  const mode=G.challenge?G.challenge.name:'CLASSICA';
  Save.leaderboard.push({name:Save.playerName,score,mode,date:Date.now()});
  Save.leaderboard.sort((a,b)=>b.score-a.score);
  Save.leaderboard=Save.leaderboard.slice(0,5);
  Save.persist();
}
function refreshMenuCoins(){
  hiScoreDisplay.textContent=G.highScore;
  coinTotalDisplay.textContent=G.totalCoins;
}

// ═══════════════════════════════════════════════
//  REPLAY
// ═══════════════════════════════════════════════
const Replay={
  recording:[],
  lastReplay:[],
  lastScore:0,
  recTimer:0,
  recInterval:0.05, // 20fps recording
  isPlaying:false,
  playIdx:0,
  playTimer:0,
  ghost:{x:0,y:0,tilt:0,visible:false},
  startRecording(){this.recording=[];this.recTimer=0;},
  record(dt){
    this.recTimer+=dt;
    if(this.recTimer>=this.recInterval){
      this.recTimer=0;
      if(this.recording.length<2000){ // max ~100s
        this.recording.push({x:P.x,y:P.y,tilt:P.tilt,thrusting:P.thrusting});
      }
    }
  },
  saveRun(){
    if(this.recording.length>5){
      this.lastReplay=[...this.recording];
      this.lastScore=G.score;
    }
    this.recording=[];
  },
  startGhost(){
    if(!this.lastReplay.length)return;
    this.isPlaying=true;this.playIdx=0;this.playTimer=0;
    this.ghost.visible=true;
  },
  stopGhost(){this.isPlaying=false;this.ghost.visible=false;},
  updateGhost(dt){
    if(!this.isPlaying||!this.lastReplay.length)return;
    this.playTimer+=dt;
    while(this.playTimer>=this.recInterval&&this.playIdx<this.lastReplay.length){
      this.playTimer-=this.recInterval;
      const f=this.lastReplay[this.playIdx++];
      this.ghost.x=f.x;this.ghost.y=f.y;this.ghost.tilt=f.tilt;this.ghost.thrusting=f.thrusting;
    }
    if(this.playIdx>=this.lastReplay.length){this.isPlaying=false;this.ghost.visible=false;}
  },
  drawGhost(){
    if(!this.ghost.visible)return;
    ctx.save();ctx.globalAlpha=0.28;
    if(Math.abs(this.ghost.tilt)>0.01){
      const cx=this.ghost.x+P.w/2,cy=this.ghost.y+P.h/2;
      ctx.translate(cx,cy);ctx.rotate(this.ghost.tilt);ctx.translate(-cx,-cy);
    }
    CHARACTERS[G.activeChar].draw(ctx,this.ghost.x,this.ghost.y,P.w,P.h,this.ghost.thrusting);
    ctx.restore();
    // ghost label
    if(this.lastScore>0){
      ctx.save();ctx.globalAlpha=0.5;ctx.fillStyle='#00ffcc';ctx.font='9px monospace';ctx.textAlign='center';
      ctx.fillText('GHOST '+this.lastScore,this.ghost.x+P.w/2,this.ghost.y-5);
      ctx.restore();
    }
  }
};


const ZoneMechanics={
  windForce:0, windTarget:0, windTimer:0,
  fogAlpha:0, fogTarget:0,
  init(){this.windForce=0;this.windTarget=0;this.windTimer=0;this.fogAlpha=0;this.fogTarget=0;},
  update(dt){
    const z=Zones.idx;
    // ZONE 0 NEBULA: leggero vento
    // ZONE 2 IONOSPHERE: corrente verticale che cambia direzione
    if(z>=2){
      this.windTimer-=dt;
      if(this.windTimer<=0){
        this.windTarget=(Math.random()-0.5)*480;
        this.windTimer=2.5+Math.random()*2;
      }
      this.windForce+=(this.windTarget-this.windForce)*Math.min(1,dt*1.8);
      if(G.state==='PLAYING'&&!Entry.active){
        P.vy+=this.windForce*dt*0.35;
      }
    } else {
      this.windForce*=(1-dt*3);
    }
    // nebbia in zona 0 (solo estetica)
    if(z===0) this.fogTarget=0.08;
    else if(z===1) this.fogTarget=0.04;
    else this.fogTarget=0;
    this.fogAlpha+=(this.fogTarget-this.fogAlpha)*Math.min(1,dt*2);
  },
  drawWindIndicator(){
    if(Zones.idx<2||Math.abs(this.windForce)<30)return;
    const str=Math.min(1,Math.abs(this.windForce)/300);
    const dir=this.windForce>0?1:-1;
    const cx=canvas.width*0.5, cy=canvas.height*0.5;
    ctx.save();ctx.globalAlpha=str*0.22;
    ctx.strokeStyle=Zones.palette.accent;ctx.lineWidth=2;
    for(let i=0;i<5;i++){
      const x=canvas.width*0.12+i*canvas.width*0.18;
      const ay=dir>0?cy-60+i*14:cy+60-i*14;
      ctx.beginPath();ctx.moveTo(x,ay);ctx.lineTo(x,ay+dir*30);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,ay+dir*30);ctx.lineTo(x-8,ay+dir*16);ctx.lineTo(x+8,ay+dir*16);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  },
  drawFog(){
    if(this.fogAlpha<0.005)return;
    const g=ctx.createRadialGradient(P.hbX,P.hbY,60,P.hbX,P.hbY,canvas.width*0.7);
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(1,'rgba(5,6,20,'+this.fogAlpha.toFixed(3)+')');
    ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();
  }
};


function circleAABB(cx,cy,cr,rx,ry,rw,rh){const nearX=Math.max(rx,Math.min(cx,rx+rw)),nearY=Math.max(ry,Math.min(cy,ry+rh)),dx=cx-nearX,dy=cy-nearY;return dx*dx+dy*dy<cr*cr;}
function circleCircle(ax,ay,ar,bx,by,br){const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy<(ar+br)*(ar+br);}

// ═══════════════════════════════════════════════
//  PARTICELLE
// ═══════════════════════════════════════════════
function spawnFire(x,y,n,colors=['#ff5722','#ffeb3b','#00bcd4']){for(let i=0;i<n;i++)parts.spawn(x,y,(Math.random()-.5)*280,(Math.random()-.5)*280-100,colors[Math.floor(Math.random()*colors.length)],0.2+Math.random()*0.35,2.5);}
function spawnExplosion(x,y){const cols=['#ff5722','#ffeb3b','#ff4444','#fff','#00bcd4'];for(let i=0;i<CFG.explosionParticles;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*320;parts.spawn(x,y,Math.cos(a)*s,Math.sin(a)*s-50,cols[Math.floor(Math.random()*cols.length)],0.4+Math.random()*0.5,3);}}
function spawnCoinPop(x,y){for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*120;parts.spawn(x,y,Math.cos(a)*s,Math.sin(a)*s,'#ffd600',0.3+Math.random()*0.2,2);}}

// ═══════════════════════════════════════════════
//  DISEGNO OSTACOLO
// ═══════════════════════════════════════════════
function drawObstacle(o){
 if (o.destroyed) return; 

  const pal=Zones.palette;
  const img=Assets.obstacle,has=img.complete&&img.naturalWidth>0;
  const isTop=o.baseY===0,x=Math.floor(o.x);
  if(has){
    if(isTop){ctx.save();ctx.translate(x+o.w/2,o.h/2);ctx.scale(1,-1);ctx.drawImage(img,-o.w/2,-o.h/2,o.w,o.h+20);ctx.restore();}
    else{ctx.drawImage(img,x,Math.floor(o.y),o.w,canvas.height-o.y+20);}
    if(o.variant==='moving'){
      // glow sul bordo di contatto per ostacoli in movimento (senza mostrare hitbox)
      const edgeY=isTop?o.h:Math.floor(o.y);
      ctx.save();ctx.strokeStyle=pal.edge;ctx.lineWidth=2.5;ctx.globalAlpha=0.45+0.35*Math.sin(o.movePhase*2);
      ctx.shadowColor=pal.edge;ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(x,edgeY);ctx.lineTo(x+o.w,edgeY);ctx.stroke();
      ctx.restore();
    }
    return;
  }
  const bc=pal.body,ec=pal.accent,tip=pal.edge;
  const pulse=o.variant==='moving'?0.5+0.5*Math.sin(o.movePhase*2):1;
  ctx.save();
  if(isTop){
    const h=o.h;
    // gradient body instead of flat color
    const grd=ctx.createLinearGradient(x,0,x+o.w,0);
    grd.addColorStop(0,bc);grd.addColorStop(0.5,pal.nebula||bc);grd.addColorStop(1,bc);
    ctx.fillStyle=grd;ctx.fillRect(x,0,o.w,h);
    ctx.fillStyle=pal.nebula;for(let i=0;i<3;i++)ctx.fillRect(x+o.w*0.2+i*o.w*0.18,0,o.w*0.08,h);
    ctx.fillStyle=ec;ctx.fillRect(x,h-4,o.w,4);
    ctx.shadowColor=ec;ctx.shadowBlur=12*pulse;ctx.globalAlpha=0.4;ctx.fillRect(x,h-4,o.w,4);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    ctx.fillStyle=tip;
    ctx.beginPath();ctx.moveTo(x+o.w*0.3,h);ctx.lineTo(x+o.w*0.5,h+(o.variant==='wide'?24:18));ctx.lineTo(x+o.w*0.7,h);ctx.closePath();ctx.fill();
    if(o.variant==='moving'){
      ctx.strokeStyle=tip;ctx.lineWidth=1.5;ctx.globalAlpha=0.35+0.35*pulse;
      ctx.setLineDash([4,4]);ctx.strokeRect(x+2,2,o.w-4,h-8);ctx.setLineDash([]);
      // pulsing edge glow
      ctx.globalAlpha=0.25*pulse;ctx.fillStyle=tip;ctx.fillRect(x,h-8,o.w,8);
    }
  }else{
    const y=Math.floor(o.y),h=canvas.height-y+40;
    const grd=ctx.createLinearGradient(x,0,x+o.w,0);
    grd.addColorStop(0,bc);grd.addColorStop(0.5,pal.nebula||bc);grd.addColorStop(1,bc);
    ctx.fillStyle=grd;ctx.fillRect(x,y,o.w,h);
    ctx.fillStyle=pal.nebula;for(let i=0;i<3;i++)ctx.fillRect(x+o.w*0.2+i*o.w*0.18,y,o.w*0.08,h);
    ctx.fillStyle=ec;ctx.fillRect(x,y,o.w,4);
    ctx.shadowColor=ec;ctx.shadowBlur=12*pulse;ctx.globalAlpha=0.4;ctx.fillRect(x,y,o.w,4);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    ctx.fillStyle=tip;
    ctx.beginPath();ctx.moveTo(x+o.w*0.3,y);ctx.lineTo(x+o.w*0.5,y-(o.variant==='wide'?24:18));ctx.lineTo(x+o.w*0.7,y);ctx.closePath();ctx.fill();
    if(o.variant==='moving'){
      ctx.strokeStyle=tip;ctx.lineWidth=1.5;ctx.globalAlpha=0.35+0.35*pulse;
      ctx.setLineDash([4,4]);ctx.strokeRect(x+2,y+4,o.w-4,Math.min(40,h-8));ctx.setLineDash([]);
      ctx.globalAlpha=0.25*pulse;ctx.fillStyle=tip;ctx.fillRect(x,y,o.w,8);
    }
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════
//  DISEGNO MONETE
// ═══════════════════════════════════════════════
function drawCoin(c){
  ctx.save();
  if(c.type==='coin'){
    const p=Math.sin(c.anim*6)*0.12+1,r=c.r*p;
    const g=ctx.createRadialGradient(c.x-r*0.3,c.y-r*0.3,0,c.x,c.y,r);
    g.addColorStop(0,'#fff9c4');g.addColorStop(0.45,'#ffd600');g.addColorStop(1,'#ff8f00');
    ctx.shadowColor='#ffeb3b';ctx.shadowBlur=14;
    ctx.strokeStyle='rgba(255,235,59,0.5)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(c.x,c.y,r+3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.beginPath();ctx.arc(c.x-r*0.28,c.y-r*0.28,r*0.28,0,Math.PI*2);ctx.fill();
  }
  else{const pu=POWERUPS.find(p=>p.id===c.type)||POWERUPS[0],p=Math.sin(c.anim*4)*0.15+1;ctx.shadowColor=pu.color;ctx.shadowBlur=14;ctx.strokeStyle=pu.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(c.x,c.y,c.r*1.5*p,0,Math.PI*2);ctx.stroke();ctx.fillStyle=pu.color+'33';ctx.beginPath();ctx.arc(c.x,c.y,c.r*1.5*p,0,Math.PI*2);ctx.fill();ctx.font=`${c.r*1.8}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(pu.emoji,c.x,c.y+1);}
  ctx.restore();
}

// ═══════════════════════════════════════════════
//  SCUDO
// ═══════════════════════════════════════════════
let shieldAnim=0;
function drawShield(){shieldAnim+=0.06;const r=Math.min(CFG.playerW,CFG.playerH)*0.68+Math.sin(shieldAnim)*3;ctx.save();ctx.strokeStyle='#00e5ff';ctx.lineWidth=3;ctx.shadowColor='#00e5ff';ctx.shadowBlur=18;ctx.globalAlpha=0.7+Math.sin(shieldAnim*2)*0.15;ctx.beginPath();ctx.arc(P.hbX,P.hbY,r,0,Math.PI*2);ctx.stroke();ctx.restore();}

// ═══════════════════════════════════════════════
//  CHAR GRID
// ═══════════════════════════════════════════════
function buildCharGrid(){
  const grid=document.getElementById('char-grid');grid.innerHTML='';
  CHARACTERS.forEach((ch,i)=>{
    const unlocked=Save.isCharUnlocked(i);
    const card=document.createElement('div');
    card.className='char-card'+(i===selectedCharIdx?' selected':'')+(unlocked?'':' locked');
    card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',ch.name);
    const img=ch.img();
    if(img.complete&&img.naturalWidth>0){const im=document.createElement('img');im.src=img.src;im.className='char-canvas';card.appendChild(im);}
    else{const cv=document.createElement('canvas');cv.className='char-canvas';cv.width=70;cv.height=52;ch.drawFallback(cv.getContext('2d'),2,2,64,48,true);card.appendChild(cv);}
    const nm=document.createElement('div');nm.className='char-name';nm.textContent=ch.name;
    const tr=document.createElement('div');tr.className='char-trait';tr.textContent=unlocked?ch.trait:'Shop';
    card.appendChild(nm);card.appendChild(tr);
    if(!unlocked){const lk=document.createElement('div');lk.className='char-lock';lk.textContent='🔒 '+ch.unlockCost+' 🪙';card.appendChild(lk);}
    card.addEventListener('pointerdown',e=>{e.stopPropagation();if(unlocked)selectChar(i);else openShop();});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();if(unlocked)selectChar(i);});
    grid.appendChild(card);
  });
}
function selectChar(i){
  if(!Save.isCharUnlocked(i))return;
  selectedCharIdx=i;G.activeChar=i;try{localStorage.setItem('fs_char',i);}catch(e){}
  document.querySelectorAll('.char-card').forEach((c,ci)=>c.classList.toggle('selected',ci===i));
}

function isShopOwned(item){
  if(item.type==='char')return Save.isCharUnlocked(item.charIdx);
  if(item.type==='trail')return Save.trailSkin===item.key;
  return Save.upgrades[item.key]>=item.level;
}
function canBuyShopItem(item){
  if(isShopOwned(item))return false;
  if(item.type==='up'&&item.level>1&&Save.upgrades[item.key]<item.level-1)return false;
  return G.totalCoins>=item.cost;
}
function buyShopItem(item){
  if(!canBuyShopItem(item))return;
  if(!Save.payCoins(item.cost))return;
  if(item.type==='char')Save.unlockChar(item.charIdx);
  else if(item.type==='trail')Save.trailSkin=item.key;
  else Save.upgrades[item.key]=item.level;
  Save.persist();Audio.coin();buildShop();buildCharGrid();refreshMenuCoins();
  shopCoins.textContent=G.totalCoins;
}
function buildShop(){
  shopCoins.textContent=G.totalCoins;
  shopList.innerHTML='';
  SHOP_ITEMS.forEach(item=>{
    const owned=isShopOwned(item);
    const canBuy=canBuyShopItem(item);
    const row=document.createElement('div');
    row.className='ret-item'+(owned?' owned':'');
    row.innerHTML=`<div class="ret-item-icon">${item.icon}</div>
      <div class="ret-item-body"><div class="ret-item-name">${item.name}</div>
      <div class="ret-item-desc">${item.desc}</div></div>
      <div class="ret-item-price">${owned?'✓ OK':item.cost+' 🪙'}</div>`;
    if(!owned){
      const btn=document.createElement('button');
      btn.className='btn sm';btn.textContent='BUY';btn.disabled=!canBuy;
      btn.style.marginLeft='6px';btn.style.padding='6px 10px';btn.style.fontSize='.65rem';
      btn.addEventListener('pointerdown',e=>{e.stopPropagation();buyShopItem(item);});
      row.appendChild(btn);
    }
    shopList.appendChild(row);
  });
  bindUISounds();
}
function buildLeaderboard(){
  pilotNameInput.value=Save.playerName;
  lbList.innerHTML='';
  if(!Save.leaderboard.length){
    const empty=document.createElement('div');
    empty.className='ret-sub';empty.textContent='No scores yet — play a run!';
    lbList.appendChild(empty);return;
  }
  Save.leaderboard.forEach((e,i)=>{
    const row=document.createElement('div');
    row.className='lb-row'+(i===0?' top1':'');
    const d=new Date(e.date);
    row.innerHTML=`<span class="lb-rank">#${i+1}</span>
      <span class="lb-name">${e.name}</span>
      <span class="lb-score">${e.score}</span>
      <span class="lb-mode">${e.mode} · ${d.toLocaleDateString('en-GB')}</span>`;
    lbList.appendChild(row);
  });
}
function buildChallengeList(){
  challengeList.innerHTML='';
  CHALLENGES.forEach(ch=>{
    const won=!!Save.challengesWon[ch.id];
    const card=document.createElement('div');
    card.className='ret-item challenge-card'+(selectedChallengeId===ch.id?' selected-ch':'');
    card.innerHTML=`<div class="ret-item-icon">${ch.icon}</div>
      <div class="ret-item-body"><div class="ret-item-name">${ch.name}${won?' ★':''}</div>
      <div class="ret-item-desc">${ch.desc}</div>
      ${ch.reward?`<div class="challenge-reward">Reward: ${ch.reward} 🪙</div>`:''}
      </div>`;
    card.addEventListener('pointerdown',e=>{
      e.stopPropagation();selectedChallengeId=ch.id;
      document.querySelectorAll('.challenge-card').forEach(c=>c.classList.remove('selected-ch'));
      card.classList.add('selected-ch');
    });
    challengeList.appendChild(card);
  });
  bindUISounds();
}
function openShop(){Transition.hidePanel(uiMenu);buildShop();Transition.showPanel(uiShop);}
function openLeaderboard(){Transition.hidePanel(uiMenu);buildLeaderboard();pilotNameInput.value=Save.playerName;Transition.showPanel(uiLeaderboard);}
function openChallenges(){Transition.hidePanel(uiMenu);buildChallengeList();Transition.showPanel(uiChallenges);}
function updateMenuDailyBadge(){
  Daily.ensureToday();
  const d=Save.daily;
  if(!d){menuDailyBadge.classList.add('hidden');return;}
  const done=d.missions.filter(m=>m.done).length;
  const total=d.missions.length;
  if(d.claimed){menuDailyBadge.classList.add('hidden');return;}
  menuDailyBadge.classList.remove('hidden');
  menuDailyBadge.textContent=done===total?'📋 Daily ready to claim!':`📋 Daily ${done}/${total}`;
}
function buildDaily(){
  Daily.ensureToday();
  dailyList.innerHTML='';
  Save.daily.missions.forEach(m=>{
    const row=document.createElement('div');
    row.className='ret-item'+(m.done?' owned':'');
    row.innerHTML=`<div class="ret-item-icon">${m.done?'✓':'○'}</div>
      <div class="ret-item-body"><div class="ret-item-name">${m.label}</div>
      <div class="daily-progress"><span>${m.progress}</span> / ${m.target}</div></div>`;
    dailyList.appendChild(row);
  });
  const btn=document.getElementById('daily-claim');
  btn.disabled=!Daily.allDone()||Save.daily.claimed;
  btn.textContent=Save.daily.claimed?'CLAIMED':`CLAIM +${Save.daily.reward} 🪙`;
}
function buildAchievements(){
  achList.innerHTML='';
  ACHIEVEMENTS.forEach(a=>{
    const got=Save.achievements.includes(a.id);
    const row=document.createElement('div');
    row.className='ret-item'+(got?' owned':'');
    row.innerHTML=`<div class="ret-item-icon">${a.icon}</div>
      <div class="ret-item-body"><div class="ret-item-name">${a.name}</div>
      <div class="ret-item-desc">${a.desc}</div></div>
      <div class="ret-item-price">${got?'✓':'—'}</div>`;
    achList.appendChild(row);
  });
}
function openDaily(){Transition.hidePanel(uiMenu);buildDaily();Transition.showPanel(uiDaily);}
function openAchievements(){Transition.hidePanel(uiMenu);buildAchievements();Achievements.scan();buildAchievements();Transition.showPanel(uiAchievements);}
function buildSettings(){
  const list=document.getElementById('settings-list');
  list.innerHTML='';
  [
    {key:'easyMode',label:'Easy mode',desc:'Wider gaps between obstacles'},
    {key:'reduceFlash',label:'Reduce flashes',desc:'Less screen flash on events'},
    {key:'vibrate',label:'Vibration',desc:'Haptic feedback on mobile'},
  ].forEach(s=>{
    const row=document.createElement('div');row.className='setting-row';
    row.innerHTML=`<div><div class="setting-label">${s.label}</div><div class="setting-desc">${s.desc}</div></div>`;
    const btn=document.createElement('button');btn.className='toggle'+(Save.settings[s.key]?' on':'');
    btn.addEventListener('pointerdown',e=>{
      e.stopPropagation();Save.settings[s.key]=!Save.settings[s.key];
      btn.classList.toggle('on',Save.settings[s.key]);Save.persist();
    });
    row.appendChild(btn);list.appendChild(row);
  });
}
function buildStats(){
  const L=Save.lifetime,g=document.getElementById('stats-grid');
  const dk=Daily.todayKey();const drBest=Save.dailyRunBest[dk]||0;
  const achN=Save.achievements.length,achT=ACHIEVEMENTS.length;
  g.innerHTML=[
    ['Runs',L.runs],['Deaths',L.deaths],['Play time',Math.floor(L.playTime/60)+'m'],
    ['Coins earned',L.totalCoinsEarned],['Best combo',L.bestCombo],['Obstacles',L.obstaclesTotal],
    ['Daily run',drBest],['Trophies',achN+'/'+achT],
  ].map(([lbl,val])=>`<div class="stat-box"><div class="val">${val}</div><div class="lbl">${lbl}</div></div>`).join('');
}
function openSettings(){Transition.hidePanel(uiMenu);buildSettings();Transition.showPanel(document.getElementById('ui-settings'));}
function openStats(){Transition.hidePanel(uiMenu);buildStats();Transition.showPanel(document.getElementById('ui-stats'));}
function openCredits(){Transition.hidePanel(uiMenu);Transition.showPanel(document.getElementById('ui-credits'));}
function closeRetentionPanels(){
  Transition.hidePanel(uiShop);
  Transition.hidePanel(uiLeaderboard);
  Transition.hidePanel(uiChallenges);
  Transition.hidePanel(uiVictory);
  Transition.hidePanel(uiDaily);
  Transition.hidePanel(uiAchievements);
  Transition.hidePanel(document.getElementById('ui-settings'));
  Transition.hidePanel(document.getElementById('ui-stats'));
  Transition.hidePanel(document.getElementById('ui-credits'));
}
function grantEntryShield(){
  if(!Save.upgrades.shieldStart||G.challenge?.noPowerups)return;
  const pu=POWERUPS.find(p=>p.id==='shield');
  if(pu&&!G.powerup){G.powerup={...pu,timeLeft:pu.duration};G.powerupMaxDuration=pu.duration;}
}
function updateChallengeHud(){
  const ch=G.challenge;
  if(!ch||ch.classic){hudChallenge.classList.add('hidden');return;}
  hudChallenge.classList.remove('hidden');
  if(ch.timeLimit){
    const left=Math.max(0,ch.timeLimit-G.challengeTime);
    hudChallenge.textContent='⏱ '+Math.ceil(left)+'s';
  }else if(ch.coinTarget){
    hudChallenge.textContent='🪙 '+G.sessionCoins+'/'+ch.coinTarget;
  }else if(ch.noPowerups){
    hudChallenge.textContent='💀 HARDCORE';
  }
}

// ═══════════════════════════════════════════════
//  MOSTRA / NASCONDI SCHERMATE
// ═══════════════════════════════════════════════
function showMainMenu(){
  Transition.hidePanel(uiGameover);
  Transition.hidePanel(uiPause);
  closeRetentionPanels();
  refreshMenuCoins();
  titleText.textContent='NEON FLORA DASH';
  titleText.style.color='white';
  titleText.style.textShadow='0 0 20px #00ffcc,0 0 60px #00ffcc44';
  buildCharGrid();
  updateMenuDailyBadge();
  document.getElementById('settings-btn').classList.add('hidden');
  Transition.crossfade(()=>{
    Transition.showPanel(uiMenu);
  });
}

function showGameOver(){
  const isNewRecord=!!G.newRecordThisRun;
  // popola stats
  goScore.textContent=G.score;
  goHiscore.textContent=G.highScore;
  goCoins.textContent=G.sessionCoins;
  goObstacles.textContent=G.stats.obstaclesPassed;
  goSpeed.textContent=Math.round(G.stats.maxSpeed);
  goPowerups.textContent=G.stats.powerupsUsed;
  goCombo.textContent=G.maxCombo;
  // record badge
  if(isNewRecord){goNewRecord.classList.remove('hidden');Audio.recordFanfare();}
  else goNewRecord.classList.add('hidden');
  // barra progresso record
  const pct=G.highScore>0?Math.min(100,Math.round(G.score/G.highScore*100)):100;
  goRecordPct.textContent=pct+'%';
  goRecordFill.style.width='0%';
  // animazione barra dopo un frame
  setTimeout(()=>{goRecordFill.style.width=pct+'%';},60);
  submitLeaderboard(G.score);
  const dr=document.getElementById('go-death-reason');
  if(dr)dr.textContent=G.deathReason?('Cause: '+G.deathReason):'';
  Daily.onRunEnd();
  Achievements.scan();
  updateMenuDailyBadge();

  Transition.crossfade(()=>{
    hud.classList.add('hidden');
    Transition.showPanel(uiGameover);
  });
}

function showVictory(bonus){
  document.getElementById('victory-desc').textContent=
    'Challenge cleared: '+(G.challenge?.name||'');
  document.getElementById('victory-reward').textContent='+'+bonus;
  document.getElementById('victory-score').textContent=G.score;
  Transition.crossfade(()=>{
    hud.classList.add('hidden');
    Transition.showPanel(uiVictory);
  });
}

function setVictory(){
  G.state='VICTORY';P.thrusting=false;Audio.stopMusic();
  const ch=G.challenge;
  const bonus=ch?.reward||0;
  G.challengeWon=true;
  if(ch?.id)Save.challengesWon[ch.id]=true;
  G.totalCoins+=G.sessionCoins+bonus;
  try{localStorage.setItem('fs_coins',G.totalCoins);}catch(e){}
  Save.recordRunSuccess();
  if(G.challenge?.dailyRun){
    const dk=Daily.todayKey();
    if(G.score>(Save.dailyRunBest[dk]||0))Save.dailyRunBest[dk]=G.score;
  }
  Daily.onRunEnd();
  Achievements.scan();
  updateMenuDailyBadge();
  submitLeaderboard(G.score+bonus);
  Audio.recordFanfare();
  if(navigator.vibrate)navigator.vibrate([40,30,40,30,60]);
  setTimeout(()=>showVictory(bonus),600);
}

// ═══════════════════════════════════════════════
//  START / RESTART
// ═══════════════════════════════════════════════
function startGame(challengeId){
  Audio.init();Audio.resume();
  Transition.hidePanel(uiMenu);
  Transition.hidePanel(uiGameover);
  closeRetentionPanels();
  const cid=challengeId||selectedChallengeId||'classic';
  G.challenge=CHALLENGES.find(c=>c.id===cid)||CHALLENGES[0];
  G.challengeTime=0;G.challengeWon=false;
  G.score=0;
  G.speed=CFG.baseSpeed*(G.challenge.speedMul||1);
  G.spawnTimer=0;G.shake=0;
  G.sessionCoins=0;G.powerup=null;G.flashTimer=0;
  if(!Save.isCharUnlocked(selectedCharIdx))selectedCharIdx=0;
  G.activeChar=selectedCharIdx;
  G.coinCombo=0;G.coinComboTimer=0;G.maxCombo=0;
  G.stats.obstaclesPassed=0;G.stats.powerupsUsed=0;G.stats.maxSpeed=G.speed;
  Zones.idx=0;Zones.palette=ZONES[0];Zones.flash=0;
  G.boss=null;G.freezeTimer=0;G.timeScale=1;G.timeScaleTimer=0;
  G.tutorialGapBonus=0;G.deathReason='';G.runTime=0;
  ZoneMechanics.init();
  RunMissions.init();
  Replay.startRecording();
  Replay.startGhost();
  G.useSeededRng=!!G.challenge?.dailyRun;
  if(G.useSeededRng)setRunSeed(dailyRunSeed());else runRng=()=>Math.random();
  meteors.timer=5;
  document.getElementById('hud-boss').classList.add('hidden');
  document.getElementById('settings-btn').classList.remove('hidden');
  for(let o of obs.pool)o.active=false;
  for(let c of coins.pool)c.active=false;
  trail.length=0;
  P.init();Entry.start();
  Transition.crossfade(()=>{
    hud.classList.remove('hidden');
    updateChallengeHud();
    G.state='PLAYING';
    lastTime=performance.now();
    if(!Audio.muted)Audio.startMusic(Zones.idx||0);
    Tutorial.start();
  });
}

startButton.addEventListener('pointerdown',e=>{e.stopPropagation();selectedChallengeId='classic';startGame('classic');});
retryButton.addEventListener('pointerdown',e=>{e.stopPropagation();startGame(G.challenge?.id||selectedChallengeId);});
menuButton.addEventListener('pointerdown',e=>{e.stopPropagation();G.state='MENU';showMainMenu();});
shopButton.addEventListener('pointerdown',e=>{e.stopPropagation();openShop();});
lbButton.addEventListener('pointerdown',e=>{e.stopPropagation();openLeaderboard();});
challengeButton.addEventListener('pointerdown',e=>{e.stopPropagation();openChallenges();});
document.getElementById('daily-button').addEventListener('pointerdown',e=>{e.stopPropagation();openDaily();});
document.getElementById('ach-button').addEventListener('pointerdown',e=>{e.stopPropagation();openAchievements();});
document.getElementById('daily-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();updateMenuDailyBadge();Transition.showPanel(uiMenu);});
document.getElementById('ach-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('daily-claim').addEventListener('pointerdown',e=>{e.stopPropagation();if(Daily.claim()){buildDaily();refreshMenuCoins();updateMenuDailyBadge();Audio.coin();}});
document.getElementById('settings-menu-button').addEventListener('pointerdown',e=>{e.stopPropagation();openSettings();});
document.getElementById('stats-button').addEventListener('pointerdown',e=>{e.stopPropagation();openStats();});
document.getElementById('credits-button').addEventListener('pointerdown',e=>{e.stopPropagation();openCredits();});
document.getElementById('settings-back').addEventListener('pointerdown',e=>{
  e.stopPropagation();closeRetentionPanels();
  if(G.state==='PAUSED'){G.state='PLAYING';lastTime=performance.now();if(!Audio.muted)Audio.startMusic();}
  else Transition.showPanel(uiMenu);
});
document.getElementById('stats-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('credits-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('settings-btn').addEventListener('pointerdown',e=>{
  e.stopPropagation();Audio.init();
  if(G.state==='PLAYING'){G.state='PAUSED';P.thrusting=false;Audio.stopMusic();}
  buildSettings();Transition.showPanel(document.getElementById('ui-settings'));
});
document.getElementById('shop-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('lb-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('challenge-back').addEventListener('pointerdown',e=>{e.stopPropagation();closeRetentionPanels();Transition.showPanel(uiMenu);});
document.getElementById('challenge-start').addEventListener('pointerdown',e=>{e.stopPropagation();startGame(selectedChallengeId);});
document.getElementById('victory-retry').addEventListener('pointerdown',e=>{e.stopPropagation();startGame(G.challenge?.id||selectedChallengeId);});
document.getElementById('victory-menu').addEventListener('pointerdown',e=>{e.stopPropagation();G.state='MENU';showMainMenu();});
pilotNameInput.addEventListener('change',()=>{
  Save.playerName=(pilotNameInput.value.trim()||'PILOT').slice(0,12);
  Save.persist();
});
pilotNameInput.addEventListener('blur',()=>{
  Save.playerName=(pilotNameInput.value.trim()||'PILOT').slice(0,12);
  Save.persist();
});

// ═══════════════════════════════════════════════
//  AUDIO BTN
// ═══════════════════════════════════════════════
audioBtn.addEventListener('pointerdown',e=>{
  e.stopPropagation();Audio.init();
  const m=Audio.toggleMute();audioBtn.textContent=m?'🔇':'🔊';
  if(!m&&G.state==='PLAYING')Audio.startMusic();
});

// ═══════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════
function startThrust(){
  if(G.state==='PLAYING'&&!Entry.active){P.thrusting=true;Audio.init();Audio.resume();Audio.thrust();Tutorial.advance('thrust');}
  else if(G.state==='PAUSED'){
    G.state='PLAYING';lastTime=performance.now();
    Transition.hidePanel(uiPause);
    if(!Audio.muted)Audio.startMusic(Zones.idx||0);
  }
}
function stopThrust(){P.thrusting=false;}

const blockIds=['start-button','retry-button','menu-button','audio-btn','char-grid','settings-btn',
  'shop-button','lb-button','challenge-button','daily-button','ach-button','stats-button','settings-menu-button','credits-button',
  'shop-back','lb-back','challenge-back','daily-back','ach-back','settings-back','stats-back','credits-back','daily-claim',
  'challenge-start','victory-retry','victory-menu','shop-list','challenge-list','daily-list','ach-list','settings-list','pilot-name'];
window.addEventListener('pointerdown',e=>{
  const blocked=blockIds.some(id=>e.target.id===id||e.target.closest('#'+id));
  if(!blocked){e.preventDefault();startThrust();if(G.state==='PLAYING')tryCharAbility();}
});
window.addEventListener('pointerup',stopThrust);
window.addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();startThrust();}
  if(e.code==='Escape'&&G.state==='PLAYING'){
    G.state='PAUSED';P.thrusting=false;Audio.stopMusic();
    Transition.showPanel(uiPause);
  }
});
window.addEventListener('keyup',e=>{if(e.code==='Space')stopThrust();});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&G.state==='PLAYING'){
    G.state='PAUSED';P.thrusting=false;Audio.stopMusic();
    Transition.showPanel(uiPause);
  }
});

// ═══════════════════════════════════════════════
//  GAME OVER
// ═══════════════════════════════════════════════
function setGameOver(reason){
  G.deathReason=reason||'Hull breached';
  G.state='GAMEOVER';G.shake=CFG.shakeIntensity;G.freezeTimer=0.07;P.thrusting=false;
  Replay.saveRun();
  spawnExplosion(P.hbX,P.hbY);
  Audio.explosion(P.hbX);Audio.stopMusic();Audio.stopEngine();
  vib([80,40,120]);
  Save.recordRunEnd();
  if(G.challenge?.dailyRun){
    const dk=Daily.todayKey();
    if(G.score>(Save.dailyRunBest[dk]||0))Save.dailyRunBest[dk]=G.score;
    Save.persist();
  }
  const isNew=G.score>G.highScore;
  G.newRecordThisRun=isNew;
  if(isNew){G.highScore=G.score;try{localStorage.setItem('fs_hs',G.highScore);}catch(e){}}
  if(!G.challengeWon){
    G.totalCoins+=G.sessionCoins;
    try{localStorage.setItem('fs_coins',G.totalCoins);}catch(e){}
  }
  setTimeout(()=>{
    Audio.gameoverJingle();
    showGameOver();
  },CFG.gameoverDelay);
}

// ═══════════════════════════════════════════════
//  MISSIONI IN-RUN
// ═══════════════════════════════════════════════
const RunMissions={
  pool:[
    {id:'pass5',   label:'Pass 5 obstacles without coins', check:()=>G.stats.obstaclesPassed>=5&&G.sessionCoins===0, reward:'trail_burst', icon:'🏁'},
    {id:'combo4',  label:'Combo x4',  check:()=>G.coinCombo>=4,  reward:'coins+10', icon:'🔥'},
    {id:'nocrash8',label:'8 obstacles in a row', check:()=>G.stats.obstaclesPassed>=8, reward:'coins+15', icon:'💨'},
    {id:'speed',   label:'Reach max speed', check:()=>G.speed>=CFG.baseSpeed+120, reward:'coins+20', icon:'⚡'},
    {id:'zone2fast',label:'Reach Zone 2 quickly', check:()=>Zones.idx>=1&&G.runTime<35, reward:'coins+25', icon:'🚀'},
  ],
  done:[],
  init(){this.done=[];},
  check(){
    for(const m of this.pool){
      if(this.done.includes(m.id))continue;
      try{
        if(m.check()){
          this.done.push(m.id);
          this.grant(m);
        }
      }catch(e){}
    }
  },
  grant(m){
    if(m.reward==='coins+10'){G.sessionCoins+=10;showScorePop('MISSION +10🪙',canvas.width*.5,canvas.height*.35,true,true);}
    else if(m.reward==='coins+15'){G.sessionCoins+=15;showScorePop('MISSION +15🪙',canvas.width*.5,canvas.height*.35,true,true);}
    else if(m.reward==='coins+20'){G.sessionCoins+=20;showScorePop('MISSION +20🪙',canvas.width*.5,canvas.height*.35,true,true);}
    else if(m.reward==='coins+25'){G.sessionCoins+=25;showScorePop('MISSION +25🪙',canvas.width*.5,canvas.height*.35,true,true);}
    else if(m.reward==='trail_burst'){for(let i=0;i<20;i++)spawnFire(P.hbX+(Math.random()-.5)*80,P.hbY+(Math.random()-.5)*60,1,[CHARACTERS[G.activeChar].trailColor,'#ffeb3b','#fff']);}
    showAchievementToast(m.icon+' '+m.label);
    Audio.recordFanfare();
    G.shake=6;
  }
};


function pickObstacleVariant(zone){
  const r=runRng();
  if(r<zone.moveChance)return'moving';
  if(r<zone.moveChance+0.12)return'narrow';
  if(r<zone.moveChance+0.22)return'wide';
  return'static';
}

function spawnObstaclePair(){
  const zone=Zones.palette;
  const chGap=G.challenge?.gapExtra||0;
  const easy=Save.settings.easyMode?CFG.easyGapBonus:0;
  const gap=Math.max(140,CFG.gapSize+zone.gapMod+chGap+(G.tutorialGapBonus||0)+easy);
  const min=CFG.minObstacleHeight,max=canvas.height-gap-min;
  const topH=runRng()*(max-min)+min;
  let w=CFG.obstacleWidth;
  const variant=pickObstacleVariant(zone);
  if(variant==='narrow')w=Math.round(w*0.72);
  if(variant==='wide')w=Math.round(w*1.22);
  const movePhase=runRng()*Math.PI*2;
  const moveAmp=variant==='moving'?32+zone.id*14:0;
  const moveSpeed=2+zone.id*0.45;
  const opts={variant,movePhase,moveAmp,moveSpeed};
  const pairId=performance.now()|0;
  obs.spawn(canvas.width,0,w,topH,false,{...opts,pairId,gap});
  const botY=topH+gap;
  obs.spawn(canvas.width,botY,w,canvas.height-botY,true,{...opts,pairId,gap});
  spawnCoinsInGap(topH,botY,canvas.width);
}

function checkChallengeWin(){
  const ch=G.challenge;
  if(!ch||ch.classic||G.state!=='PLAYING')return;
  if(ch.timeLimit&&G.challengeTime>=ch.timeLimit){setVictory();return true;}
  if(ch.coinTarget&&G.sessionCoins>=ch.coinTarget){setVictory();return true;}
  return false;
}
function collectCoin(c){
  G.coinComboTimer=CFG.comboWindow;
  G.coinCombo=Math.min(G.coinCombo+1,CFG.comboMaxMult);
  if(G.coinCombo>G.maxCombo)G.maxCombo=G.coinCombo;
  const mult=Math.max(1,G.coinCombo);
  const value=getCoinValue()*mult;
  G.sessionCoins+=value;
  G.flashTimer=0.18;G.flashColor='#ffeb3b';
  if(mult>1)Audio.combo();else Audio.coin(c.x);
  if(mult>=3)G.shake=9;
  if(navigator.vibrate)navigator.vibrate(mult>2?[22,12,22]:18);
  const label='+'+value+(mult>1?' x'+mult:'');
  showScorePop(label,c.x,c.y,true,mult>1);
  Tutorial.advance('coin');
  Achievements.scan();
  updateChallengeHud();
  checkChallengeWin();
}

function updateHudMeta(){
  const pal=Zones.palette;
  hudZone.textContent='ZONE: '+pal.name;
  hudZone.style.color=pal.accent;
  hudZone.style.textShadow='0 0 8px '+pal.accent+'88';
  const spd=Math.round(G.speed);
  const hudSpd=document.getElementById('hud-speed');
  if(hudSpd){hudSpd.textContent='SPD: '+spd;hudSpd.classList.toggle('fast',spd>=CFG.baseSpeed+80);}
  // wind indicator
  const hudWind=document.getElementById('hud-wind');
  if(hudWind&&Zones.idx>=2){
    hudWind.classList.remove('hidden');
    const wf=ZoneMechanics.windForce;
    hudWind.textContent=(wf>30?'↓':wf<-30?'↑':'·')+' ION '+(Math.abs(wf)>150?'STRONG':'CURRENT');
  } else if(hudWind){hudWind.classList.add('hidden');}
  // ability indicator
  const hudAb=document.getElementById('hud-ability');
  if(hudAb){
    if(G.activeChar===2){
      if(P.dashCooldown>0)hudAb.textContent='DASH ⏳'+P.dashCooldown.toFixed(1)+'s';
      else hudAb.textContent='DASH READY [double-tap]';
      hudAb.classList.remove('hidden');
    } else if(G.activeChar===1){
      hudAb.textContent='UFO: HOVER STABILIZED';hudAb.classList.remove('hidden');
    } else if(G.activeChar===3){
      hudAb.textContent='DRAGON: REFLEX ACTIVE';hudAb.classList.remove('hidden');
    } else {hudAb.classList.add('hidden');}
  }
  if(G.coinCombo>1&&G.coinComboTimer>0){
    hudCombo.classList.remove('hidden');
    hudCombo.textContent='COMBO x'+G.coinCombo;
  }else hudCombo.classList.add('hidden');
}

function spawnCoinsInGap(gapTop,gapBot,obsX){
  if(Math.random()>CFG.coinSpawnChance)return;
  const midY=(gapTop+gapBot)/2,spacing=40,startX=obsX+CFG.obstacleWidth*1.1;
  const noPu=G.challenge?.noPowerups;
  if(!noPu&&Math.random()<CFG.powerupSpawnChance){const pu=POWERUPS[Math.floor(Math.random()*POWERUPS.length)];coins.spawn(startX+CFG.coinsPerGap*spacing/2,midY+(Math.random()-.5)*30,pu.id);}
  else{for(let i=0;i<CFG.coinsPerGap;i++)coins.spawn(startX+i*spacing,midY+Math.sin(i/CFG.coinsPerGap*Math.PI)*30,'coin');}
}

// ═══════════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════════
let lastTime=performance.now(),lastDt=0.016;
function loop(ts){const dt=Math.min((ts-lastTime)/1000,0.1);lastTime=ts;lastDt=dt;update(dt);draw();requestAnimationFrame(loop);}

function update(dt){
  if(G.freezeTimer>0){G.freezeTimer-=dt;parts.update(dt*0.3);return;}
  if(G.timeScaleTimer>0){
    G.timeScaleTimer-=dt;
    if(G.timeScaleTimer<=0)G.timeScale=1;
  }
  dt*=G.timeScale||1;
  parts.update(dt);
  for(let c of coins.pool){if(c.active&&!c.collected)c.anim+=dt;}
  if(G.shake>0)G.shake-=CFG.shakeDecay*dt;
  if(G.flashTimer>0)G.flashTimer-=dt;
  if(Zones.flash>0)Zones.flash-=dt*1.8;
  if(G.coinComboTimer>0)G.coinComboTimer-=dt;
  else if(G.coinCombo>0)G.coinCombo=0;
  if(G.state!=='PLAYING'){Boss.update(dt);return;}

  G.runTime+=dt;
  Entry.update(dt);
  if(!Entry.active)Replay.record(dt);
  ZoneMechanics.update(dt);
  const bg=Assets.bg;if(bg.complete&&bg.naturalWidth>0){bgX-=G.speed*0.25*dt;if(bgX<=-canvas.width)bgX=0;}
  const ch=CHARACTERS[G.activeChar];P.update(dt,ch.accel);
  if(!Entry.active)updateTrail(dt);
  if(G.powerup){G.powerup.timeLeft-=dt;if(G.powerup.timeLeft<=0)G.powerup=null;}
  if(G.speed>G.stats.maxSpeed)G.stats.maxSpeed=G.speed;

  // --- FUOCO LASER AUTOMATICO ---
  if (G.powerup && G.powerup.id === 'laser') {
    laserFireTimer -= dt;
    if (laserFireTimer <= 0) {
      laserFireTimer = 0.20; // Spara 5 volte al secondo
      lasers.spawn(P.hbX, P.hbY - 14); // Cannone superiore
      lasers.spawn(P.hbX, P.hbY + 14); // Cannone inferiore
      Audio.laser(P.hbX);
    }
  }
  lasers.update(dt);

  // --- COLLISIONI LASER VS NEMICI ---
  for (let l of lasers.pool) {
    if (!l.active) continue;
    // Laser vs Meteoriti
    for (let m of meteors.pool) {
      if (!m.active) continue;
      if (circleAABB(m.x, m.y, m.r, l.x, l.y, l.w, l.h)) {
        l.active = false; m.active = false;
        spawnExplosion(m.x, m.y); Audio.explosion(m.x);
        G.score += 15; showScorePop('BOOM +15', m.x, m.y, false, false);
        break;
      }
    }
    if (!l.active) continue;
    // Laser vs Ostacoli (Colonne)
    for (let o of obs.pool) {
      if (!o.active || o.destroyed) continue;
      if (l.x < o.x + o.w && l.x + l.w > o.x && l.y < o.y + o.h && l.y + l.h > o.y) {
        l.active = false; 
        o.destroyed = true; // Distrugge l'ostacolo! apre la strada!
        spawnExplosion(l.x + 20, l.y); Audio.explosion(l.x);
        G.score += 25; showScorePop('DESTROYED +25', l.x, l.y, false, true);
        G.shake = 5;
        break;
      }
    }
  }

  Zones.update(G.score);
  RunMissions.check();
  hudScore.textContent='SCORE: '+G.score;
  hudCoins.textContent='● '+G.sessionCoins;
  updateHudPowerup();
  updateHudMeta();
  updateChallengeHud();

  if(G.challenge?.timeLimit&&G.state==='PLAYING'){
    G.challengeTime+=dt;
    if(checkChallengeWin())return;
  }

  if(Entry.active)return;

  meteors.update(dt,G.speed);
  Boss.update(dt);
  if(!G.boss){
    const zoneRate=Math.max(0.95,CFG.spawnRate-Zones.idx*0.12);
    G.spawnTimer+=dt;
    if(G.spawnTimer>=zoneRate){
      G.spawnTimer=0;
      spawnObstaclePair();
    }
  }

  const hasMagnet=G.powerup?.id==='magnet';
  const effectSpeed=G.speed*(G.powerup?.id==='slow'?0.55:1);

  for(let c of coins.pool){
    if(!c.active||c.collected)continue;
    c.x-=effectSpeed*dt;
    if(hasMagnet){const dx=P.hbX-c.x,dy=P.hbY-c.y,dist=Math.sqrt(dx*dx+dy*dy);const mr=getMagnetRange();if(dist<mr){c.x+=dx*dt*5;c.y+=dy*dt*5;}}
    if(c.x+CFG.coinR*2<0){c.active=false;continue;}
    if(circleCircle(P.hbX,P.hbY,P.hbR,c.x,c.y,c.type==='coin'?CFG.coinR:CFG.coinR*1.5)){
      c.collected=true;c.active=false;spawnCoinPop(c.x,c.y);
      if(c.type==='coin')collectCoin(c);
      else{G.coinCombo=0;G.coinComboTimer=0;const pu=POWERUPS.find(p=>p.id===c.type);if(pu){G.powerup={...pu,timeLeft:pu.duration};G.powerupMaxDuration=pu.duration;G.flashTimer=0.3;G.flashColor=pu.color;Audio.powerup(c.x);G.stats.powerupsUsed++;}}
    }
  }

  const hbX=P.hbX,hbY=P.hbY,hbR=P.hbR,hasShield=G.powerup?.id==='shield';
  for(let m of meteors.pool){
    if(!m.active)continue;
    if(circleCircle(hbX,hbY,hbR,m.x,m.y,m.r)){
      if(hasShield){G.powerup=null;spawnFire(m.x,m.y,8,['#ffeb3b','#fff']);Audio.shield();vib([20,20]);}
      else{setGameOver('Meteor impact');return;}
    }
  }
  for(let o of obs.pool){
    if(!o.active || o.destroyed)continue;
    o.x-=effectSpeed*dt;
    if(o.moveAmp>0){
      o.movePhase+=o.moveSpeed*dt;
      const delta=Math.sin(o.movePhase)*o.moveAmp;
      if(o.isScore){
        o.y=o.baseY+delta;
      } else {
        if(o.gap>0){
          let botY=null;
          for(let p of obs.pool){if(p.active&&p.isScore&&p.pairId===o.pairId){botY=p.y;break;}}
          if(botY!==null) o.h=Math.max(40,botY-0);
        }
      }
    }
    // DRAGON: near-miss reflex slow-mo
    if(G.activeChar===3&&P.nearMissTimer<=0){
      const hbXn=P.hbX,hbYn=P.hbY;
      const nearX=Math.max(o.x,Math.min(hbXn,o.x+o.w));
      const nearY=Math.max(o.y,Math.min(hbYn,o.y+o.h));
      const dist=Math.sqrt((hbXn-nearX)**2+(hbYn-nearY)**2);
      if(dist<P.hbR+28&&dist>P.hbR){
        G.timeScale=0.28;G.timeScaleTimer=0.55;P.nearMissTimer=0.9;
        spawnFire(P.hbX,P.hbY,4,['#ef9a9a','#ffeb3b']);
        showScorePop('⚡ REFLEX!',P.hbX,P.hbY-24,false,true);
      }
    }
    if(circleAABB(hbX,hbY,hbR,o.x,o.y,o.w,o.h)){
      if(hasShield){G.powerup=null;G.shake=CFG.shakeIntensity*0.5;G.flashTimer=0.3;G.flashColor='#00e5ff';spawnFire(P.hbX,P.hbY,12,['#00e5ff','#00bcd4','#fff']);Audio.shield();if(navigator.vibrate)navigator.vibrate([30,20,30]);}
      else{
        if (o.destroyed) continue
        let reason;
        if(P.y<=2)reason='☝ Ceiling impact';
        else if(P.y>=canvas.height-P.h-2)reason='👇 Floor impact';
        else if(o.variant==='moving')reason='💥 Moving obstacle';
        else if(o.variant==='narrow')reason='💥 Narrow passage';
        else reason='💥 Obstacle impact';
        setGameOver(reason);return;
      }
    }
    if(o.isScore&&!o.passed&&o.x+o.w<P.x){
      o.passed=true;G.score+=CFG.scorePerObstacle;G.stats.obstaclesPassed++;
      Tutorial.advance('obstacle');
      Zones.update(G.score);
      if(G.score%CFG.speedIncreaseInterval===0)G.speed+=CFG.speedIncreaseAmount;
      Audio.score();showScorePop('+'+CFG.scorePerObstacle,P.x+P.w/2,P.y-10,false,false);
    }
    if(o.x+o.w<-20)o.active=false;
  }
  Replay.updateGhost(dt);
  if(G.state==='PLAYING'&&!Entry.active){
    Audio.updateEngine(P.thrusting,G.speed,P.vy);
  }
  if(P.thrusting)spawnFire(P.x+P.w*0.08,P.y+P.h*0.78,1);
}

// ═══════════════════════════════════════════════
//  DRAW
// ═══════════════════════════════════════════════
function draw(){
  if(G.state==='MENU'){drawMenuBackground(menuStarT);return;}
  ctx.save();
  if(G.shake>0)ctx.translate((Math.random()-.5)*G.shake,(Math.random()-.5)*G.shake);
  const spd=G.state==='PLAYING'||G.state==='GAMEOVER'?G.speed:CFG.baseSpeed*0.3;
  drawBackground(spd,lastDt);
  parts.draw();
  if(G.state==='PLAYING'||G.state==='PAUSED'||G.state==='GAMEOVER'||G.state==='VICTORY'){
    meteors.draw();
    lasers.draw();
    Boss.draw();
    for(let o of obs.pool)if(o.active)drawObstacle(o);
    for(let c of coins.pool)if(c.active)drawCoin(c);
    Replay.drawGhost();
    if(G.powerup?.id==='shield')drawShield();
    drawTrail();
    ZoneMechanics.drawWindIndicator();
    ZoneMechanics.drawFog();
    ctx.save();
    if(Entry.active){
      const cx=P.x+P.w/2,cy=P.y+P.h/2;
      ctx.translate(cx,cy);ctx.scale(Entry.scale,Entry.scale);ctx.translate(-cx,-cy);
      ctx.globalAlpha=0.85+Entry.t*0.15;
    } else if(Math.abs(P.tilt)>0.01){
      const cx=P.hbX,cy=P.hbY;
      ctx.translate(cx,cy);ctx.rotate(P.tilt);ctx.translate(-cx,-cy);
    }
    // SHUTTLE dash ghost trail
    if(G.activeChar===2&&P.dashActive>0){
      ctx.globalAlpha=0.35;
      CHARACTERS[G.activeChar].draw(ctx,P.x-28,P.y,P.w,P.h,false);
      CHARACTERS[G.activeChar].draw(ctx,P.x-56,P.y,P.w,P.h,false);
      ctx.globalAlpha=1;
    }
    CHARACTERS[G.activeChar].draw(ctx,P.x,P.y,P.w,P.h,P.thrusting||Entry.active);
    ctx.restore();
    if(G.flashTimer>0){
      ctx.globalAlpha=Save.settings.reduceFlash?0.12:0.22;
      ctx.fillStyle=G.flashColor;
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.globalAlpha=1;
    }
    drawDangerArrows();
  }
  ctx.restore();
}

function drawDangerArrows(){
  for(let o of obs.pool){
    if(!o.active||o.variant!=='moving')continue;
    const dist=o.x-(P.x+P.w);
    if(dist>0&&dist<150){
      const alpha=1-dist/150;
      const px=P.x+P.w+6;
      const ay=o.isScore?o.y+8:o.y+o.h-8;
      ctx.save();ctx.globalAlpha=alpha*0.85;
      ctx.fillStyle=Zones.palette.edge;
      ctx.shadowColor=Zones.palette.edge;ctx.shadowBlur=8;
      const sz=9+alpha*7;
      ctx.beginPath();
      if(o.isScore){ctx.moveTo(px,ay-sz);ctx.lineTo(px+sz*1.2,ay);ctx.lineTo(px,ay+sz);}
      else         {ctx.moveTo(px,ay+sz);ctx.lineTo(px+sz*1.2,ay);ctx.lineTo(px,ay-sz);}
      ctx.closePath();ctx.fill();
      ctx.restore();
    }
  }
}

//  UI AUDIO BINDINGS
// ═══════════════════════════════════════════════
function bindUISounds() {
  // Seleziona tutti i bottoni e le card dei personaggi
  const interactables = document.querySelectorAll('.btn, .char-card, .toggle, .challenge-card');
  
  interactables.forEach(el => {
    // Suono al passaggio del mouse/dito
    el.addEventListener('pointerenter', () => {
      if (G.state === 'MENU' || G.state === 'PAUSED' || G.state === 'GAMEOVER') {
        Audio.init(); Audio.uiHover();
      }
    });
    // Suono al click
    el.addEventListener('pointerdown', () => {
      Audio.init(); Audio.uiClick();
    });
  });
}
// Chiamalo subito per attivare gli eventi sui bottoni iniziali
document.addEventListener('DOMContentLoaded', bindUISounds);
// Sovrascriviamo la funzione buildShop ecc. per ricollegare i suoni ai bottoni dinamici
Transition.init();
Assets.init(()=>{
  loadingScreen.style.opacity='0';
  setTimeout(()=>{
    loadingScreen.classList.add('hidden');
    loadingScreen.style.opacity='1';
    G.state='MENU';
    Transition.showPanel(uiMenu);
  },500);
  requestAnimationFrame(loop);
});
