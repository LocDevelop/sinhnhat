(() => {
  'use strict';
  const $=s=>document.querySelector(s), config=window.BIRTHDAY_CONFIG;
  const panel=$('#music-player'),audio=$('#audio-player'),toggle=$('#music'),play=$('#play-track');
  const playlistEl=$('#playlist'),title=$('#track-title'),state=$('#track-state');
  const progress=$('#track-progress'),current=$('#current-time'),duration=$('#duration'),volume=$('#volume');
  let tracks=(config.songs||[]).map((song,i)=>({title:song.title||`Bài hát ${i+1}`,artist:song.artist||'Birthday playlist',src:song.src,owned:false})).filter(t=>t.src);
  let urls=[],index=-1,shuffle=false,repeat='all',ambient=null,ambientTimer=null,noteIndex=0,failedTracks=0;
  const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,659.25,1046.5,783.99,493.88,587.33,783.99,587.33];
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('birthday-music-settings')||'{}')}catch{return{}}})();
  audio.volume=Number.isFinite(saved.volume)?saved.volume:.72;volume.value=audio.volume;volume.style.setProperty('--progress',`${audio.volume*100}%`);shuffle=!!saved.shuffle;repeat=['all','one','off'].includes(saved.repeat)?saved.repeat:'all';
  function save(){try{localStorage.setItem('birthday-music-settings',JSON.stringify({volume:audio.volume,shuffle,repeat}))}catch{}}
  function format(seconds){if(!Number.isFinite(seconds))return'—:—';const m=Math.floor(seconds/60),s=Math.floor(seconds%60);return`${m}:${String(s).padStart(2,'0')}`;}
  function open(force){const show=force??panel.hidden;panel.hidden=!show;toggle.setAttribute('aria-expanded',String(show));toggle.title=show?'Đóng trình phát nhạc':'Mở trình phát nhạc';if(show)$('#close-player').focus({preventScroll:true});}
  toggle.addEventListener('click',()=>open());$('#close-player').addEventListener('click',()=>{open(false);toggle.focus()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)open(false)});
  function stopAmbient(){clearInterval(ambientTimer);ambientTimer=null;if(ambient){ambient.close().catch(()=>{});ambient=null;}}
  function ambientNote(){if(!ambient||ambient.state!=='running')return;const now=ambient.currentTime,osc=ambient.createOscillator(),gain=ambient.createGain();osc.type='sine';osc.frequency.value=melody[noteIndex++%melody.length];gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.055*audio.volume,now+.02);gain.gain.exponentialRampToValueAtTime(.001,now+1.7);osc.connect(gain);gain.connect(ambient.destination);osc.start(now);osc.stop(now+1.8);}
  async function startAmbient(){if(tracks.length)return;if(!ambient)ambient=new(window.AudioContext||window.webkitAudioContext)();await ambient.resume();if(!ambientTimer){ambientNote();ambientTimer=setInterval(ambientNote,620)};panel.classList.add('playing');play.textContent='❚❚';play.setAttribute('aria-label','Tạm dừng nhạc');state.textContent='Giai điệu ánh sao';title.textContent='Nhạc nền mặc định';}
  async function pauseAll(){audio.pause();if(ambient){await ambient.suspend().catch(()=>{});clearInterval(ambientTimer);ambientTimer=null}panel.classList.remove('playing');play.textContent='▶';play.setAttribute('aria-label','Phát nhạc');}
  function render(){
    playlistEl.replaceChildren();
    if(!tracks.length){const empty=document.createElement('p');empty.className='music-empty';empty.textContent='Chưa có bài riêng — đang dùng giai điệu ánh sao.';playlistEl.append(empty);}
    tracks.forEach((track,i)=>{const button=document.createElement('button');button.type='button';button.className='playlist-item'+(i===index?' active':'');button.setAttribute('role','listitem');button.setAttribute('aria-current',i===index?'true':'false');const number=document.createElement('span');number.className='playlist-index';number.textContent=i===index&&!audio.paused?'♫':String(i+1).padStart(2,'0');const copy=document.createElement('span');copy.className='playlist-copy';const strong=document.createElement('strong');strong.textContent=track.title;const small=document.createElement('small');small.textContent=track.artist;copy.append(strong,small);const len=document.createElement('span');len.className='playlist-duration';len.textContent=track.duration?format(track.duration):'—:—';button.append(number,copy,len);button.addEventListener('click',()=>load(i,true));playlistEl.append(button);});
    $('#shuffle').setAttribute('aria-pressed',String(shuffle));const labels={all:'Tất cả',one:'Một bài',off:'Tắt'};$('#repeat').dataset.mode=repeat;$('#repeat small').textContent=labels[repeat];
  }
  function setMeta(){const track=tracks[index];if(!track){state.textContent='Giai điệu ánh sao';title.textContent='Nhạc nền mặc định';return;}state.textContent=track.artist;title.textContent=track.title;render();}
  async function load(next,autoplay=false){if(!tracks.length){if(autoplay)await startAmbient().catch(()=>{});return;}stopAmbient();index=(next+tracks.length)%tracks.length;audio.src=tracks[index].src;audio.load();setMeta();if(autoplay){try{await audio.play()}catch{state.textContent='Chạm Phát để bắt đầu';}}}
  function next(manual=false){if(!tracks.length)return;if(shuffle&&tracks.length>1){let n=index;while(n===index)n=Math.floor(Math.random()*tracks.length);load(n,true);return;}if(index<tracks.length-1)load(index+1,true);else if(repeat==='all'||manual)load(0,true);else pauseAll();}
  function previous(){if(!tracks.length)return;if(audio.currentTime>4){audio.currentTime=0;return;}load(index<=0?tracks.length-1:index-1,true);}
  play.addEventListener('click',async()=>{if(tracks.length){if(index<0)await load(0,true);else if(audio.paused)await audio.play().catch(()=>{});else audio.pause();}else if(ambient&&ambient.state==='running')await pauseAll();else await startAmbient().catch(()=>{});});
  $('#next-track').addEventListener('click',()=>next(true));$('#previous-track').addEventListener('click',previous);
  $('#shuffle').addEventListener('click',e=>{shuffle=!shuffle;e.currentTarget.setAttribute('aria-pressed',String(shuffle));save();render();});
  $('#repeat').addEventListener('click',()=>{repeat=repeat==='all'?'one':repeat==='one'?'off':'all';save();render();});
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value);volume.style.setProperty('--progress',`${audio.volume*100}%`);save();});
  progress.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(progress.value)/1000;});
  audio.addEventListener('timeupdate',()=>{const ratio=audio.duration?audio.currentTime/audio.duration:0;progress.value=String(Math.round(ratio*1000));progress.style.setProperty('--progress',`${ratio*100}%`);current.textContent=format(audio.currentTime);});
  audio.addEventListener('loadedmetadata',()=>{duration.textContent=format(audio.duration);if(tracks[index])tracks[index].duration=audio.duration;render();});
  audio.addEventListener('play',()=>{failedTracks=0;panel.classList.add('playing');play.textContent='❚❚';play.setAttribute('aria-label','Tạm dừng nhạc');render();});
  audio.addEventListener('pause',()=>{panel.classList.remove('playing');play.textContent='▶';play.setAttribute('aria-label','Phát nhạc');render();});
  audio.addEventListener('ended',()=>{if(repeat==='one'){audio.currentTime=0;audio.play().catch(()=>{});}else next(false);});
  audio.addEventListener('error',()=>{failedTracks++;state.textContent='Không thể phát bài này';if(failedTracks>=tracks.length){pauseAll();state.textContent='Các tệp nhạc chưa sẵn sàng';return;}setTimeout(()=>next(false),900);});
  $('#songs').addEventListener('change',async e=>{const files=[...e.target.files].filter(f=>f.type.startsWith('audio/')||/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(f.name)).slice(0,30);if(!files.length)return;pauseAll();urls.forEach(URL.revokeObjectURL);urls=files.map(URL.createObjectURL);tracks=files.map((file,i)=>({title:file.name.replace(/\.[^.]+$/,''),artist:'Từ thiết bị của bạn',src:urls[i],owned:true}));index=-1;render();open(true);await load(0,true);});
  // The submit click is the user's gesture, so configured music may start as the gift opens.
  $('#unlock-form').addEventListener('submit',()=>{if($('#birthday').value.replace(/\D/g,'')!==config.birthday.replace(/\D/g,''))return;if(tracks.length)load(index<0?0:index,true);else startAmbient().catch(()=>{});});
  addEventListener('pagehide',e=>{if(!e.persisted)urls.forEach(URL.revokeObjectURL);});
  render();setMeta();
})();
