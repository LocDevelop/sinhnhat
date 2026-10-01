(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const config = window.BIRTHDAY_CONFIG;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e=>{reduced=e.matches;sparks=[];schedule();});
  const canvas = $('#universe'), ctx = canvas.getContext('2d');
  let w=innerWidth,h=innerHeight,dpr=1,opened=false,shape='heart',angle=0,dragging=false,lastX=0,rotation=0,frame=0,raf=0;
  let particles=[],stars=[],sparks=[],lastTime=0;
  const N = innerWidth < 650 ? 2100 : 3700;
  const rand=(a,b)=>a+Math.random()*(b-a);
  $('#birthday-title').textContent=config.name;
  document.title=`Gửi ${config.name} · Happy Birthday`;
  const [dd,mm,yyyy]=config.birthday.split('/');
  $('.birthday-heading .eyebrow').textContent=`${dd} THÁNG ${mm} · YOUR DAY, YOUR UNIVERSE`;
  $('footer span').textContent=`FOR ${config.name}, WITH LOVE`;
  $('footer span:last-child').textContent=`✧ ${dd}.${mm}.${yyyy}`;
  $('.edition').textContent=`MADE FOR YOU · ${dd}.${mm}`;

  function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:w<650?140:260},()=>({x:Math.random()*w,y:Math.random()*h,r:rand(.3,1.2),phase:rand(0,7)}));}
  function heart(){const t=rand(0,Math.PI*2),r=Math.sqrt(Math.random());return {x:16*Math.pow(Math.sin(t),3)*r,y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*r,z:rand(-3,3)*Math.sin(Math.PI*r),hue:rand(322,351)};}
  function cake(i){let x,y,z,hue;const t=rand(0,Math.PI*2);if(i<N*.04){x=rand(-.38,.38);z=rand(-.38,.38);y=rand(-20,-15);hue=rand(35,60);}else if(i<N*.09){x=rand(-.5,.5);z=rand(-.5,.5);y=rand(-15,-9);hue=rand(330,360);}else{const upper=i%2===0,radius=upper?9:14,bottom=upper?-1:8,top=upper?-9:0;const rim=Math.random()<.25;const r=rim?radius*Math.sqrt(Math.random()):radius;x=Math.cos(t)*r;z=Math.sin(t)*r;y=rim?top:rand(top,bottom);hue=upper?rand(300,335):rand(327,352);}return{x,y,z,hue};}
  function targets(){particles.forEach((p,i)=>{const t=shape==='heart'?heart():cake(i);p.tx=t.x;p.ty=t.y;p.tz=t.z;p.hue=t.hue;});}
  particles=Array.from({length:N},()=>({x:rand(-60,60),y:rand(-45,45),z:rand(-40,40),r:rand(.45,1.25),phase:rand(0,7)}));targets();resize();
  function burst(x=w/2,y=h*.5,count=100){if(reduced)return;for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),v=rand(1,6);sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,hue:rand(310,365)});}sparks=sparks.slice(-700);}
  function draw(now){raf=0;if(document.hidden)return;const dt=Math.min((now-lastTime)/16.67||1,3);lastTime=now;frame+=dt;ctx.clearRect(0,0,w,h);ctx.fillStyle='#090610';ctx.fillRect(0,0,w,h);const glow=ctx.createRadialGradient(w*.5,h*.44,0,w*.5,h*.44,w*.55);glow.addColorStop(0,opened?'#25102b':'#201025');glow.addColorStop(.6,'#100a19');glow.addColorStop(1,'#090610');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    stars.forEach(s=>{ctx.globalAlpha=.25+(Math.sin(frame*.014+s.phase)+1)*.27;ctx.fillStyle='#efc9df';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();});ctx.globalAlpha=1;
    if(opened){const rect=$('.scene-space').getBoundingClientRect();const cy=rect.top+rect.height*.43,cx=w*.5,scale=Math.min(w*.017,9);if(!dragging&&!reduced)angle+=.0025*dt;const a=Math.sin(angle)*.32+rotation,ca=Math.cos(a),sa=Math.sin(a),pulse=(window.BirthdayScene.motion?.scale||1)*(shape==='heart'?1+Math.sin(frame*.045)*.025:1);
      ctx.globalCompositeOperation='lighter';
      if(rect.bottom>0&&rect.top<h)particles.forEach(p=>{if(window.BirthdayScene.motion?.phase==='burst'&&!reduced){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const f=Math.pow(.965,dt);p.vx*=f;p.vy*=f;p.vz*=f;}else{const speed=reduced?1:1-Math.pow(.947,dt);p.x+=(p.tx-p.x)*speed;p.y+=(p.ty-p.y)*speed;p.z+=(p.tz-p.z)*speed;}const xx=p.x*ca+p.z*sa,zz=-p.x*sa+p.z*ca;const perspective=70/(70-Math.max(-45,Math.min(zz,35)));const x=cx+xx*scale*perspective*pulse,y=cy+p.y*scale*perspective*pulse;const flicker=.55+.45*Math.sin(frame*.04+p.phase);ctx.globalAlpha=.45+flicker*.5;ctx.fillStyle=`hsl(${p.hue} 90% ${70+flicker*20}%)`;ctx.beginPath();ctx.arc(x,y,p.r*perspective*(w<650?.85:1),0,7);ctx.fill();});
      ctx.globalAlpha=.35;for(let i=0;i<160;i++){const t=i*.24+frame*.003,rr=scale*(15+(i%5)*1.1);ctx.fillStyle=i%3?'#df8ebd':'#fff0db';ctx.beginPath();ctx.arc(cx+Math.cos(t)*rr,cy+scale*20+Math.sin(t)*rr*.18,.7,0,7);ctx.fill();}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    sparks=sparks.filter(s=>s.life>0);sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=.025*dt;s.life-=.014*dt;ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=`hsl(${s.hue} 100% 80%)`;ctx.beginPath();ctx.arc(s.x,s.y,1.8,0,7);ctx.fill();});ctx.globalAlpha=1;
    if(!reduced||(window.BirthdayScene.motion&&window.BirthdayScene.motion.phase!=='idle'))raf=requestAnimationFrame(draw);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(draw);}
  window.BirthdayScene={motion:null,redraw:schedule,explode(strength){
    particles.forEach(p=>{const t=rand(0,Math.PI*2),v=rand(.28,1.2)*strength;p.vx=Math.cos(t)*v+p.tx*.03;p.vy=Math.sin(t)*v+p.ty*.03;p.vz=rand(-.4,.4)*strength;});
    const r=$('.scene-space').getBoundingClientRect();burst(w/2,r.top+r.height*.43,innerWidth<650?140:240);schedule();
  }};
  addEventListener('resize',()=>{resize();schedule();});addEventListener('scroll',()=>{if(reduced)schedule();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{lastTime=performance.now();schedule();}});schedule();

  const dateInput=$('#birthday');dateInput.addEventListener('input',()=>{const digits=dateInput.value.replace(/\D/g,'').slice(0,8);dateInput.value=digits.length>4?`${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`:digits.length>2?`${digits.slice(0,2)}/${digits.slice(2)}`:digits;$('#error').textContent='';dateInput.removeAttribute('aria-invalid');});
  $('#show-date').addEventListener('click',e=>{const visible=dateInput.type==='password';dateInput.type=visible?'text':'password';e.currentTarget.textContent=visible?'Ẩn':'Hiện';e.currentTarget.setAttribute('aria-pressed',String(visible));e.currentTarget.setAttribute('aria-label',visible?'Ẩn ngày sinh':'Hiện ngày sinh');});
  $('#unlock-form').addEventListener('submit',e=>{e.preventDefault();if(dateInput.value.replace(/\D/g,'')!==config.birthday.replace(/\D/g,'')){$('#error').textContent='Chưa đúng rồi. Thử lại ngày sinh của bạn nhé ♡';dateInput.setAttribute('aria-invalid','true');$('#unlock-form').classList.remove('shake');void $('#unlock-form').offsetWidth;$('#unlock-form').classList.add('shake');dateInput.focus();return;}$('#unlock-form button[type=submit]').disabled=true;$('#gate').classList.add('exit');setTimeout(()=>{$('#gate').hidden=true;$('#celebration').hidden=false;opened=true;document.dispatchEvent(new Event('birthday-open'));scrollTo(0,0);$('#birthday-title').setAttribute('tabindex','-1');$('#birthday-title').focus({preventScroll:true});burst(w/2,h*.5,180);schedule();},reduced?0:700);});
  document.querySelectorAll('[data-shape]').forEach(button=>button.addEventListener('click',()=>{shape=button.dataset.shape;targets();document.querySelectorAll('[data-shape]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});$('#scene-label').textContent=shape==='heart'?'Một trái tim, ngàn điều muốn nói.':'Thêm một ngọn nến, thêm một ước mơ.';schedule();}));
  const scene=$('#particle-touch');scene.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;dragging=true;lastX=e.clientX;});scene.addEventListener('pointermove',e=>{if(dragging){rotation+=(e.clientX-lastX)*.009;lastX=e.clientX;schedule();}});['pointerup','pointercancel','lostpointercapture'].forEach(type=>scene.addEventListener(type,()=>dragging=false));
  const dialog=$('#wish-dialog');$('#wish-button').addEventListener('click',()=>dialog.showModal());$('#close-wish').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  $('#replay').addEventListener('click',()=>{opened=false;$('#celebration').hidden=true;$('#gate').hidden=false;$('#gate').classList.remove('exit');$('#unlock-form button[type=submit]').disabled=false;dateInput.value='';dateInput.type='password';$('#show-date').textContent='Hiện';$('#show-date').setAttribute('aria-pressed','false');$('#show-date').setAttribute('aria-label','Hiện ngày sinh');scrollTo(0,0);dateInput.focus();schedule();});

  let photoUrls=[];function renderPhotos(urls){
    const track=$('#photo-track');track.replaceChildren();$('#photo-window').hidden=!urls.length;
    urls.forEach((url,i)=>{const fig=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=url;img.alt='Kỷ niệm '+(i+1);img.loading='lazy';img.addEventListener('error',()=>{fig.hidden=true;$('#photo-status').textContent='Có ảnh chưa tải được. Bạn kiểm tra lại tệp hoặc đường dẫn ảnh nhé.';});cap.textContent=['a moment to remember ♡','little things, big feelings','you make life beautiful','forever in my heart'][i%4];fig.append(img,cap);track.append(fig);});
    document.dispatchEvent(new CustomEvent('birthday-photos',{detail:urls}));
  }
  $('#photos').addEventListener('change',e=>{const files=[...e.target.files];const valid=files.filter(f=>['image/jpeg','image/png','image/webp','image/gif'].includes(f.type)&&f.size<=15*1024*1024).slice(0,16);if(!valid.length){$('#photo-status').textContent='Hãy chọn ảnh JPG, PNG, WebP hoặc GIF, tối đa 15 MB mỗi ảnh.';return;}photoUrls.forEach(URL.revokeObjectURL);photoUrls=valid.map(f=>URL.createObjectURL(f));renderPhotos(photoUrls);$('#photo-status').textContent=`Đã thêm ${valid.length} ảnh.${files.length>valid.length?' Một số ảnh đã bỏ qua (tối đa 16 ảnh, 15 MB/ảnh).':''}`;});renderPhotos(config.photos||[]);addEventListener('pagehide',e=>{if(!e.persisted)photoUrls.forEach(URL.revokeObjectURL);});

  let audio=null,musicOn=false,musicTimer=null,noteIndex=0;
  const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,659.25,1046.5,783.99,493.88,587.33,783.99,587.33];
  function note(){if(!musicOn||document.hidden)return;const time=audio.currentTime;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=melody[noteIndex++%melody.length];gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.075,time+.02);gain.gain.exponentialRampToValueAtTime(.001,time+1.7);osc.connect(gain);gain.connect(audio.destination);osc.start(time);osc.stop(time+1.8);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
  $('#music').addEventListener('click',async()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(musicOn){musicOn=false;clearInterval(musicTimer);await audio.suspend();}else{await audio.resume();musicOn=true;note();musicTimer=setInterval(note,620);}$('#music').setAttribute('aria-pressed',String(musicOn));$('#music span').textContent=musicOn?'Tắt nhạc':'Bật nhạc';$('#music').title=musicOn?'Tắt nhạc':'Bật nhạc';}catch{$('#music span').textContent='Không có âm thanh';}});
})();
