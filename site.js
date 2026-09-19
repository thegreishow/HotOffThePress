document.querySelectorAll('[data-quote]').forEach(b=>b.addEventListener('click',()=>location.href='pricing.html#quote'));

const stage=document.querySelector('#portfolio-stage');
if(stage){
  let assets=[],view='featured',page=0,currentSet=[],lightboxIndex=0;
  const perPage=9;
  const featured=[0,1,4,5,8,9,12,16,22];
  const views={
    featured:{label:'CURATED SELECTION',pick:a=>a.filter((_,i)=>featured.includes(i))},
    recent:{label:'2022 COLLECTION',pick:a=>a.filter(x=>x.url.includes('/2022/'))},
    classic:{label:'2020 COLLECTION',pick:a=>a.filter(x=>x.url.includes('/2020/'))},
    all:{label:'FULL HOTP ARCHIVE',pick:a=>a}
  };
  const label=document.querySelector('#portfolio-view-label'),count=document.querySelector('#portfolio-count'),pages=document.querySelector('#portfolio-pages'),prev=document.querySelector('#portfolio-prev'),next=document.querySelector('#portfolio-next');
  const dialog=document.querySelector('#portfolio-lightbox'),lightImg=document.querySelector('#lightbox-image'),caption=document.querySelector('#lightbox-caption');
  const fallback=[...stage.querySelectorAll('img')].map((img,i)=>({url:img.currentSrc||img.src,sourceOrder:i+1}));
  function selected(){return views[view].pick(assets)}
  function tile(a,i){const year=a.url.includes('/2022/')?'2022':a.url.includes('/2020/')?'2020':'HOTP';return `<button class="portfolio-tile" type="button" data-index="${i}" style="--delay:${i*38}ms" aria-label="Open HOTP portfolio work ${a.sourceOrder}"><img src="${a.url}" alt="HOTP portfolio work ${a.sourceOrder}" loading="${i<4?'eager':'lazy'}" decoding="async"><span class="tile-shade"></span><span class="tile-meta"><span>HOTP · ${year}</span><b>VIEW ↗</b></span></button>`}
  function render(){
    const set=selected(),totalPages=Math.max(1,Math.ceil(set.length/perPage));page=Math.max(0,Math.min(page,totalPages-1));
    currentSet=set.slice(page*perPage,page*perPage+perPage);
    stage.classList.add('is-changing');
    requestAnimationFrame(()=>{stage.innerHTML=currentSet.map(tile).join('');stage.classList.remove('is-changing')});
    label.textContent=views[view].label;count.textContent=`${String(set.length).padStart(2,'0')} WORKS · ${String(page+1).padStart(2,'0')}/${String(totalPages).padStart(2,'0')}`;
    pages.innerHTML=Array.from({length:totalPages},(_,i)=>`<button type="button" data-page="${i}" class="${i===page?'active':''}" aria-label="Portfolio page ${i+1}">${String(i+1).padStart(2,'0')}</button>`).join('');
    prev.disabled=page===0;next.disabled=page===totalPages-1;
  }
  assets=fallback; render();
  fetch('data/portfolio.json?rev=3',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{if(Array.isArray(d.assets)&&d.assets.length){assets=d.assets;page=0;render()}}).catch(()=>{});
  const menu=document.querySelector('.portfolio-menu');
  menu?.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;page=0;menu.querySelectorAll('.portfolio-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});
  pages?.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;page=Number(b.dataset.page);render();stage.scrollIntoView({behavior:'smooth',block:'start'})});
  prev?.addEventListener('click',()=>{if(page>0){page--;render()}});
  next?.addEventListener('click',()=>{if((page+1)*perPage<selected().length){page++;render()}});
  function showLightbox(i){lightboxIndex=i;const a=currentSet[i];if(!a||!dialog)return;lightImg.src=a.url;caption.textContent=`HOTP PORTFOLIO · WORK ${String(a.sourceOrder).padStart(2,'0')}`;dialog.showModal()}
  stage.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)showLightbox(Number(b.dataset.index))});
  dialog?.querySelector('.lightbox-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog?.querySelector('.next')?.addEventListener('click',()=>showLightbox((lightboxIndex+1)%currentSet.length));
  dialog?.querySelector('.prev')?.addEventListener('click',()=>showLightbox((lightboxIndex-1+currentSet.length)%currentSet.length));
  document.addEventListener('keydown',e=>{if(!dialog?.open)return;if(e.key==='ArrowRight')showLightbox((lightboxIndex+1)%currentSet.length);if(e.key==='ArrowLeft')showLightbox((lightboxIndex-1+currentSet.length)%currentSet.length)});
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
