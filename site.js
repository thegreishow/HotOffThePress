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
  const fallbackAssets=[...stage.querySelectorAll('img')].map((img,i)=>({url:img.src,sourceOrder:i+1}));
  assets=fallbackAssets;
  fetch('./data/portfolio.json?v=20260919').then(r=>{if(!r.ok)throw new Error('portfolio data');return r.json()}).then(d=>{if(d.assets?.length){assets=d.assets;render()}}).catch(()=>{render()});
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

document.querySelector('.price-category-menu')?.addEventListener('click',e=>{const b=e.target.closest('[data-price-category]');if(!b)return;const id=b.dataset.priceCategory;document.querySelectorAll('.price-category').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.price-detail').forEach(x=>x.classList.toggle('active',x.dataset.pricePanel===id));});

const rateResults=document.querySelector('#rate-results');
if(rateResults){
 const chips=document.querySelector('#rate-chips'),search=document.querySelector('#rate-search');let rows=[],filter='All';
 const labels={copying:'Copying',scanning:'Scanning',paperPerSheet:'Paper & Stock',artworkDesign:'Design',laminatingPouches:'Laminating',binding:'Binding',finishing:'Finishing',largeFormatPrintPerSqFt:'Large Format',largeFormatLaminatingPerSqFt:'Large Format',largeFormatBW:'Large Format',largeFormatScanning:'Large Format',mountingPerSqFt:'Mounting',heatTransfers:'Heat Transfer',transfers:'Heat Transfer',largeFormatTransferPerSqFt:'Heat Transfer',opaqueTransfer:'Heat Transfer',businessCards:'Business Cards',retractableBannerKit:'Specialty',pressKits:'Specialty',carbonatedReceiptBooks:'Specialty',laminatedProducts:'Specialty',burning:'Specialty',accessories:'Specialty',easels:'Specialty'};
 const nice=s=>String(s).replace(/([A-Z])/g,' $1').replace(/_/g,' ').replace(/^./,m=>m.toUpperCase()).replace(/Bw\b/g,'B&W').replace(/Mm(\d+)/g,'$1mm');
 const money=v=>'J$'+Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
 function flatten(obj,cat,path=[]){Object.entries(obj||{}).forEach(([k,v])=>{if(typeof v==='number')rows.push({category:cat,name:[...path,k].map(nice).join(' · '),price:money(v)});else if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,cat,[...path,k])})}
 function renderRates(){const q=search.value.trim().toLowerCase();let set=rows.filter(r=>(filter==='All'||r.category===filter)&&(!q||(`${r.category} ${r.name}`).toLowerCase().includes(q)));const shown=set.slice(0,24);rateResults.innerHTML=shown.length?shown.map((r,i)=>`<article class="rate-card" style="animation-delay:${i*18}ms"><small>${r.category.toUpperCase()}</small><strong>${r.name}</strong><b>${r.price}</b></article>`).join('')+(set.length>24?`<div class="rate-more">${set.length-24} more matching published rates — refine the search to narrow the list.</div>`:''):`<div class="rate-empty">No published rate matches that search. Custom work can still be quoted by HOTP.</div>`;}
 fetch('./data/pricing.json?v=20260919').then(r=>r.json()).then(d=>{const root=d.pricing||d.prices||d;Object.entries(root).forEach(([k,v])=>{if(labels[k])flatten(v,labels[k])});const cats=['All',...new Set(rows.map(r=>r.category))];chips.innerHTML=cats.map((x,i)=>`<button class="rate-chip${i===0?' active':''}" type="button" data-rate-filter="${x}">${x}</button>`).join('');renderRates()}).catch(()=>rateResults.innerHTML='<div class="rate-empty">Published catalogue data is temporarily unavailable. Use the official PDF below.</div>');
 chips.addEventListener('click',e=>{const b=e.target.closest('[data-rate-filter]');if(!b)return;filter=b.dataset.rateFilter;chips.querySelectorAll('.rate-chip').forEach(x=>x.classList.toggle('active',x===b));renderRates()});search.addEventListener('input',renderRates);
}
