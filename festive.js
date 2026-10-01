(() => {
  'use strict';
  const $=s=>document.querySelector(s),rand=(a,b)=>a+Math.random()*(b-a);
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=preference.matches,active=false,lively=true,w=innerWidth,h=innerHeight,raf=0,last=0,time=0,pieces=[],ambient=[],meteors=[],nextMeteor=7,lastBurst=-10;
  const back=document.createElement('canvas'),front=document.createElement('canvas');
  back.id='festive-background';front.id='festive-confetti';[back,front].forEach(c=>c.setAttribute('aria-hidden','true'));document.body.prepend(back);document.body.append(front);
  const bg=back.getContext('2d'),fg=front.getContext('2d'),colors=['#ffc9e1','#ffd391','#cfadff','#fff0c8','#f986bb','#a6dded'];
  const heading=$('#birthday-title'),name=window.BIRTHDAY_CONFIG.name;
  heading.setAttribute('aria-label',name);heading.replaceChildren();
  [...name].forEach((letter,i)=>{const span=document.createElement('span');span.className='name-letter'+(letter===' '?' name-space':'');span.style.setProperty('--letter',i);span.textContent=letter===' '?'\u00a0':letter;span.setAttribute('aria-hidden','true');heading.append(span);});
  function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);[back,front].forEach(c=>{c.width=w*dpr;c.height=h*dpr;});bg.setTransform(dpr,0,0,dpr,0,0);fg.setTransform(dpr,0,0,dpr,0,0);ambient=Array.from({length:w<650?18:32},()=>({x:rand(0,w),y:rand(0,h),vy:rand(12,28),phase:rand(0,7),r:rand(1.8,3.8),color:colors[Math.floor(rand(0,colors.length))]}));schedule();}
  function gradient(x,y,r,color,alpha){const g=bg.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');bg.globalAlpha=alpha;bg.fillStyle=g;bg.fillRect(x-r,y-r,r*2,r*2);bg.globalAlpha=1;}
  function burst(){if(!active)return;if(time-lastBurst<1.2)return;lastBurst=time;$('#party-status').textContent='Chúc mừng sinh nhật '+name+'!';if(reduced)return;const count=w<650?140:230;for(let side=0;side<2;side++){for(let i=0;i<count/2;i++){const angle=side===0?rand(-1.45,-.55):rand(-2.6,-1.7),v=rand(300,720);pieces.push({x:side===0?w*.08:w*.92,y:h*.78,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,r:rand(3,6),spin:rand(-5,5),angle:rand(0,7),life:rand(3.4,5.2),maxLife:5.2,color:colors[i%colors.length],kind:i%6});}}pieces=pieces.slice(-420);schedule();}
  function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(draw);}
  function draw(now){raf=0;if(document.hidden)return;const dt=Math.min((now-last)/1000||.016,.04);last=now;if(!reduced)time+=dt;bg.clearRect(0,0,w,h);fg.clearRect(0,0,w,h);if(!active)return;
    const quiet=!lively||reduced;
    gradient(w*(.24+Math.sin(time*.12)*.12),h*.25,Math.max(280,w*.42),'#bb3b80',quiet?.045:.13);
    gradient(w*(.8+Math.cos(time*.09)*.09),h*.52,Math.max(260,w*.35),'#7147b0',quiet?.04:.105);
    gradient(w*.5,h*.1,Math.min(w*.32,390),'#c68e53',quiet?.035:.075);
    if(!quiet){ambient.forEach(p=>{p.y+=p.vy*dt;if(p.y>h+10)p.y=-10;const x=p.x+Math.sin(time*.5+p.phase)*18;bg.save();bg.translate(x,p.y);bg.rotate(time*.6+p.phase);bg.globalAlpha=.22;bg.fillStyle=p.color;bg.fillRect(-p.r,-p.r*.4,p.r*2,p.r*.8);bg.restore();});
      if(time>nextMeteor){nextMeteor=time+rand(8,14);meteors.push({x:rand(w*.2,w*.85),y:rand(0,h*.2),age:0});}
      meteors=meteors.filter(m=>m.age<1.5);meteors.forEach(m=>{m.age+=dt;const x=m.x-m.age*130,y=m.y+m.age*80;bg.globalAlpha=Math.sin(m.age/1.5*Math.PI)*.4;const trail=bg.createLinearGradient(x,y,x+85,y-50);trail.addColorStop(0,'#ffe1b7');trail.addColorStop(1,'transparent');bg.strokeStyle=trail;bg.lineWidth=1.1;bg.beginPath();bg.moveTo(x,y);bg.lineTo(x+85,y-50);bg.stroke();});bg.globalAlpha=1;
    }
    if(!reduced&&!document.body.classList.contains('wishing')){pieces=pieces.filter(p=>p.life>0&&p.y<h+30);pieces.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=250*dt;p.vx*=Math.exp(-dt*.38);p.angle+=p.spin*dt;fg.save();fg.translate(p.x+Math.sin(p.life*5)*5,p.y);fg.rotate(p.angle);fg.globalAlpha=Math.min(1,p.life*.65);fg.fillStyle=p.color;if(p.kind===0){fg.beginPath();for(let n=0;n<8;n++){const a=n*Math.PI/4,r=n%2?p.r*.35:p.r;fg.lineTo(Math.cos(a)*r,Math.sin(a)*r);}fg.closePath();fg.fill();}else if(p.kind===1){fg.beginPath();fg.arc(0,0,p.r*.5,0,7);fg.fill();}else fg.fillRect(-p.r,-p.r*.35,p.r*2,Math.max(1,p.r*.7*Math.cos(p.angle)));fg.restore();});}
    if(!reduced)schedule();
  }
  $('#party-burst').addEventListener('click',burst);
  $('#party-mood').addEventListener('click',()=>{lively=!lively;document.body.classList.toggle('party-quiet',!lively);$('#party-mood').setAttribute('aria-pressed',String(lively));$('#party-mood').textContent=lively?'Không khí: Sôi động':'Không khí: Êm dịu';if(!lively){meteors=[];pieces=[];}schedule();});
  document.addEventListener('birthday-open',()=>{active=true;lastBurst=-10;burst();schedule();});
  $('#replay').addEventListener('click',()=>{active=false;pieces=[];meteors=[];bg.clearRect(0,0,w,h);fg.clearRect(0,0,w,h);});
  addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();schedule();}});
  preference.addEventListener('change',e=>{reduced=e.matches;pieces=[];meteors=[];schedule();});resize();
})();
