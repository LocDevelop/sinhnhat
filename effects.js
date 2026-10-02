/* Particle interaction, romantic atmosphere, balloon photos, and the wish journey. */
(() => {
  const $=s=>document.querySelector(s), clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const rand=(a,b)=>a+Math.random()*(b-a), ease=n=>1-Math.pow(1-clamp(n),3);
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const overlay=document.createElement('canvas');overlay.id='love-atmosphere';overlay.setAttribute('aria-hidden','true');document.body.prepend(overlay);
  const bg=overlay.getContext('2d'), wc=$('#wish-canvas').getContext('2d');
  const touch=$('#particle-touch'),journey=$('#wish-journey'),sky=$('#balloon-sky');
  const motion=new window.ChargeMotion();
  let w=innerWidth,h=innerHeight,dpr=1,reduced=preference.matches,time=0,last=0,raf=0,hearts=[],wish=null;
  let pointerId=null,keyHeld=null,photoList=[],paused=false,hidden=false;
  const api=window.BirthdayScene;
  api.motion=motion;

  function heart(t){return{x:16*Math.pow(Math.sin(t),3),y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))};}
  function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);[overlay,$('#wish-canvas')].forEach(c=>{c.width=w*dpr;c.height=h*dpr;});bg.setTransform(dpr,0,0,dpr,0,0);wc.setTransform(dpr,0,0,dpr,0,0);hearts=Array.from({length:w<650?10:18},()=>({x:Math.random()*w,y:Math.random()*h,size:rand(4,12),speed:rand(7,18),phase:rand(0,7)}));}
  function glow(ctx,x,y,r,color,alpha=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
  function star(ctx,x,y,r,color='#ffe7f4'){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.24,y-r*.24);ctx.lineTo(x+r,y);ctx.lineTo(x+r*.24,y+r*.24);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.24,y+r*.24);ctx.lineTo(x-r,y);ctx.lineTo(x-r*.24,y-r*.24);ctx.closePath();ctx.fill();}
  function draw(now){
    raf=0;if(document.hidden)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;if(!reduced)time+=dt;
    bg.clearRect(0,0,w,h);
    glow(bg,w*(.2+Math.sin(time*.09)*.14),h*.45,Math.max(w*.5,300),'#ae3b71',.07);
    glow(bg,w*(.75+Math.sin(time*.065)*.13),h*.65,Math.max(w*.4,250),'#7f46ba',.075);
    hearts.forEach(p=>{if(!reduced)p.y-=p.speed*dt;if(p.y< -30)p.y=h+30;bg.save();bg.translate(p.x+Math.sin(time*.3+p.phase)*24,p.y);bg.rotate(Math.sin(time*.22+p.phase)*.2);bg.globalAlpha=.08+(Math.sin(time+p.phase)+1)*.025;bg.strokeStyle='#f6abc9';bg.lineWidth=.8;bg.beginPath();for(let i=0;i<=30;i++){const q=heart(i/30*Math.PI*2);i?bg.lineTo(q.x*p.size/16,q.y*p.size/16):bg.moveTo(q.x*p.size/16,q.y*p.size/16);}bg.stroke();bg.restore();});
    const previous=motion.phase;motion.step(dt,reduced);
    if(previous!==motion.phase){$('#charge-status').textContent=motion.phase==='recovering'?'Ánh sáng đang tụ lại.':motion.phase==='idle'?'Đã hồi phục. Bạn có thể giữ lần nữa.':'';api.redraw();}
    $('#charge-fill').style.transform=`scaleX(${motion.phase==='holding'?motion.charge:0})`;
    touch.setAttribute('aria-busy',String(motion.phase==='burst'||motion.phase==='recovering'));
    if(wish)drawWish(dt);
    if(!reduced||motion.phase!=='idle')schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(draw);}
  function cancel(){motion.release(true);pointerId=null;keyHeld=null;touch.classList.remove('holding');api.redraw();schedule();}
  function start(){if(!motion.press())return false;touch.classList.add('holding');$('#charge-status').textContent='Đang gom yêu thương. Thả để bung ánh sáng.';api.redraw();schedule();return true;}
  function release(){touch.classList.remove('holding');if(!motion.release())return;api.explode(.55+motion.charge*.85);$('#charge-status').textContent='Yêu thương bung thành ngàn ánh sáng.';api.redraw();schedule();}
  touch.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||pointerId!==null||!start())return;pointerId=e.pointerId;touch.setPointerCapture(pointerId);});
  touch.addEventListener('pointerup',e=>{if(pointerId!==e.pointerId)return;pointerId=null;release();});
  ['pointercancel','lostpointercapture'].forEach(type=>touch.addEventListener(type,()=>{if(pointerId!==null)cancel();}));
  touch.addEventListener('keydown',e=>{if(![' ','Enter'].includes(e.key))return;e.preventDefault();if(!e.repeat&&keyHeld===null&&start())keyHeld=e.key;});
  touch.addEventListener('keyup',e=>{if(e.key===keyHeld){e.preventDefault();keyHeld=null;release();}});touch.addEventListener('blur',cancel);
  addEventListener('blur',cancel);addEventListener('resize',()=>{resize();schedule();});
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('page-hidden',document.hidden);if(document.hidden){cancel();cancelAnimationFrame(raf);raf=0;}else{last=performance.now();schedule();}});
  document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{cancel();motion.reset();}));
  $('#wish-button').addEventListener('click',cancel);
  $('#replay').addEventListener('click',()=>{cancel();motion.reset();if(wish)endWish();document.body.classList.remove('is-open');});
  document.addEventListener('birthday-open',()=>document.body.classList.add('is-open'));

  const stages=[['Gom những điều dịu dàng…','Một điều ước nhỏ, cả bầu trời lắng nghe.'],['Điều ước đang bay lên.','Mang theo tất cả những yêu thương dành cho em.'],['Bầu trời đã giữ điều ước của em.','Mong những điều tốt đẹp sẽ đến với '+window.BIRTHDAY_CONFIG.name+' ♡']];
  function stage(n){if(!wish||wish.stage===n)return;wish.stage=n;$('#wish-line').textContent=stages[n][0];$('#wish-detail').textContent=stages[n][1];$('#skip-journey').textContent=n===2?'Mang yêu thương trở về ♡':'Bỏ qua ✕';}
  $('#send-wish').addEventListener('click',()=>{if(wish)return;$('#wish-dialog').close();cancel();wish={t:reduced?6:0,stage:-1,dust:Array.from({length:w<650?90:150},()=>({a:rand(0,7),r:rand(20,250),seed:Math.random()}))};journey.showModal();document.body.classList.add('wishing');stage(reduced?2:0);schedule();});
  function endWish(){wish=null;wc.clearRect(0,0,w,h);document.body.classList.remove('wishing');if(journey.open)journey.close();$('#wish-button').focus({preventScroll:true});}
  $('#skip-journey').addEventListener('click',endWish);journey.addEventListener('cancel',e=>{e.preventDefault();endWish();});journey.addEventListener('close',()=>{if(wish)endWish();});
  function drawWish(dt){
    if(!reduced)wish.t+=dt;const t=wish.t,cx=w/2,cy=h*.38,size=Math.min(w*.023,h*.017,12);wc.clearRect(0,0,w,h);glow(wc,cx,cy,Math.max(w*.6,300),'#47203b',.45);
    if(t<1.5){stage(0);const p=ease(t/1.5);wish.dust.forEach(d=>{const a=d.a+t*2,r=d.r*(1-p)+8;star(wc,cx+Math.cos(a)*r,h*.64+Math.sin(a)*r*.5,1+d.seed*2);});glow(wc,cx,h*.64,30+p*30,'#f7a9d4',.3+p*.35);star(wc,cx,h*.64,8+p*8);}
    else if(t<3.8){stage(1);const p=clamp((t-1.5)/2.3);for(let i=0;i<70;i++){const q=Math.max(0,p-i*.004),x=cx+Math.sin(q*Math.PI*2)*w*.13*(1-q),y=h*.64-(h*.64-cy)*ease(q);wc.globalAlpha=(1-i/70)*.65;star(wc,x+Math.sin(i*8)*i*.12,y+Math.cos(i*9)*i*.12,1.5+(1-i/70)*2);}wc.globalAlpha=1;const x=cx+Math.sin(p*Math.PI*2)*w*.13*(1-p),y=h*.64-(h*.64-cy)*ease(p);glow(wc,x,y,60,'#efafd1',.5);star(wc,x,y,13);}
    else{stage(2);const p=reduced?1:clamp((t-3.8)/1.8),points=Array.from({length:36},(_,i)=>{const q=heart(i/36*Math.PI*2);return{x:cx+q.x*size,y:cy+q.y*size};});wc.strokeStyle='#efacc6';wc.lineWidth=1;wc.globalAlpha=.45;wc.beginPath();const count=Math.max(1,Math.floor(p*37));for(let i=0;i<count;i++){const a=points[i%36];i?wc.lineTo(a.x,a.y):wc.moveTo(a.x,a.y);}wc.stroke();wc.globalAlpha=1;points.slice(0,Math.min(count,36)).forEach((a,i)=>{glow(wc,a.x,a.y,12,'#f5b4ce',.26);star(wc,a.x,a.y,2+(Math.sin(t*2+i)+1)*1.4);});wish.dust.forEach(d=>{const a=d.a+t*.12,r=d.r*(.8+p);wc.globalAlpha=.15+Math.sin(d.a+t)*.12;star(wc,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,1+d.seed*2);});wc.globalAlpha=1;const progress=clamp((t-3.8)/3);if(!reduced){wc.globalAlpha=(1-progress)*.35;wc.strokeStyle='#ffdce9';wc.beginPath();wc.ellipse(cx,cy,30+progress*w*.6,20+progress*h*.4,0,0,7);wc.stroke();wc.globalAlpha=1;}}
    if(t>10&&!reduced)endWish();
  }

  function buildBalloons(urls){
    photoList=[...urls];sky.replaceChildren();$('#memory-actions').hidden=!urls.length;
    if(!urls.length||reduced)return;
    const count=Math.min(urls.length,w<650?2:4),lanes=w<650?[0,1]:[0,1,.07,.93];
    for(let i=0;i<count;i++){
      const flight=document.createElement('div'),sway=document.createElement('div'),cluster=document.createElement('div');flight.className='memory-flight';flight.style.setProperty('--lane',lanes[i]);flight.style.setProperty('--duration',`${26+i*3}s`);flight.style.setProperty('--delay',`${-i*8-4}s`);flight.style.setProperty('--hue',String([338,284,16,315][i]));sway.className='memory-sway';cluster.className='balloon-cluster';
      for(let b=0;b<3;b++){const balloon=document.createElement('span');balloon.className='balloon balloon-'+b;cluster.append(balloon);}const strings=document.createElement('span');strings.className='balloon-strings';cluster.append(strings);
      let index=i;const fig=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=urls[index];img.alt='';img.decoding='async';caption.textContent='a little memory ♡';fig.append(img,caption);sway.append(cluster,fig);flight.append(sway);sky.append(flight);
      img.addEventListener('error',()=>{flight.style.opacity='0';});img.addEventListener('load',()=>{flight.style.removeProperty('opacity');});
      flight.addEventListener('animationiteration',e=>{if(e.animationName!=='memory-flight')return;index=(index+count)%photoList.length;img.src=photoList[index];});
    }updatePhotos();
  }
  function updatePhotos(){sky.classList.toggle('paused',paused);sky.classList.toggle('concealed',hidden);$('#pause-photos').setAttribute('aria-pressed',String(paused));$('#pause-photos').textContent=paused?'▷ Tiếp tục bóng bay':'Ⅱ Tạm dừng bóng bay';$('#hide-photos').setAttribute('aria-pressed',String(hidden));$('#hide-photos').textContent=hidden?'Hiện bóng bay':'Ẩn bóng bay';}
  $('#pause-photos').addEventListener('click',()=>{paused=!paused;updatePhotos();});$('#hide-photos').addEventListener('click',()=>{hidden=!hidden;updatePhotos();});
  document.addEventListener('birthday-photos',e=>buildBalloons(e.detail));buildBalloons(window.BIRTHDAY_CONFIG.photos||[]);
  let mobile=w<650;addEventListener('resize',()=>{if(mobile!==(w<650)){mobile=w<650;buildBalloons(photoList);}});
  preference.addEventListener('change',e=>{reduced=e.matches;cancel();if(wish){wish.t=6;wish.stage=-1;}buildBalloons(photoList);schedule();});
  resize();schedule();
})();
