document.querySelectorAll('[data-quote]').forEach(b=>b.addEventListener('click',()=>location.href='pricing.html#quote'));

const stage=document.querySelector('#portfolio-stage');
if(stage){
  let assets=[],view='featured',page=0,currentVisible=[],lightboxIndex=0;
  const perPage=12;
  const views={
    featured:{label:'FEATURED SELECTION',pick:a=>a.filter((_,i)=>[0,1,4,5,8,9,12,16,17,22,27,37].includes(i))},
    recent:{label:'RECENT ARCHIVE · 2022',pick:a=>a.filter(x=>x.url.includes('/2022/'))},
    classic:{label:'EARLIER ARCHIVE · 2020',pick:a=>a.filter(x=>x.url.includes('/2020/'))},
    all:{label:'ALL ORIGINAL WORK',pick:a=>a}
  };
  const label=document.querySelector('#portfolio-view-label'),count=document.querySelector('#portfolio-count'),pages=document.querySelector('#portfolio-pages'),prev=document.querySelector('#portfolio-prev'),next=document.querySelector('#portfolio-next');
  const dialog=document.querySelector('#portfolio-lightbox'),lightImg=document.querySelector('#lightbox-image'),caption=document.querySelector('#lightbox-caption');
  function selected(){return views[view].pick(assets)}
  function render(){
    const set=selected(),totalPages=Math.max(1,Math.ceil(set.length/perPage));page=Math.min(page,totalPages-1);
    currentVisible=set.slice(page*perPage,page*perPage+perPage);
    stage.innerHTML=currentVisible.map((a,i)=>`<button class="portfolio-tile" type="button" data-index="${i}" style="--delay:${i*35}ms"><img src="${a.url}" alt="HOTP portfolio work ${a.sourceOrder}" loading="lazy"><span class="tile-meta"><span>HOTP ARCHIVE · ${a.url.includes('/2022/')?'2022':'2020'}</span><b>↗</b></span></button>`).join('');
    label.textContent=views[view].label;count.textContent=`${set.length} WORK${set.length===1?'':'S'}`;
    pages.innerHTML=Array.from({length:totalPages},(_,i)=>`<button type="button" data-page="${i}" class="${i===page?'active':''}" aria-label="Portfolio page ${i+1}">${String(i+1).padStart(2,'0')}</button>`).join('');
    prev.disabled=page===0;next.disabled=page===totalPages-1;
  }
  fetch('data/portfolio.json').then(r=>r.json()).then(d=>{assets=d.assets||[];render()}).catch(()=>{stage.innerHTML='<p>Portfolio temporarily unavailable.</p>'});
  document.querySelector('.portfolio-menu').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;page=0;document.querySelectorAll('.portfolio-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});
  pages.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){page=+b.dataset.page;render();stage.scrollIntoView({behavior:'smooth',block:'start'})}});
  prev.addEventListener('click',()=>{if(page){page--;render()}});
  next.addEventListener('click',()=>{if((page+1)*perPage<selected().length){page++;render()}});
  function showLightbox(i){lightboxIndex=i;const a=currentVisible[i];if(!a)return;lightImg.src=a.url;caption.textContent=`HOTP PORTFOLIO · WORK ${String(a.sourceOrder).padStart(2,'0')}`;dialog.showModal()}
  stage.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)showLightbox(+b.dataset.index)});
  dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.querySelector('.next').addEventListener('click',()=>showLightbox((lightboxIndex+1)%currentVisible.length));
  dialog.querySelector('.prev').addEventListener('click',()=>showLightbox((lightboxIndex-1+currentVisible.length)%currentVisible.length));
  document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowRight')dialog.querySelector('.next').click();if(e.key==='ArrowLeft')dialog.querySelector('.prev').click()});
}
