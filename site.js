document.querySelectorAll('[data-quote]').forEach(b=>b.addEventListener('click',()=>location.href='pricing.html#quote'));

const stage=document.querySelector('#portfolio-stage');
if(stage){
 let assets=[],view='all',currentSet=[],lightboxIndex=0;
 const featured=[0,1,4,5,8,9,12,16,22];
 const views={featured:{label:'CURATED SELECTION',pick:a=>a.filter((_,i)=>featured.includes(i))},recent:{label:'2022 COLLECTION',pick:a=>a.filter(x=>x.url.includes('/2022/'))},classic:{label:'2020 COLLECTION',pick:a=>a.filter(x=>x.url.includes('/2020/'))},all:{label:'FULL HOTP ARCHIVE',pick:a=>a}};
 const label=document.querySelector('#portfolio-view-label'),count=document.querySelector('#portfolio-count'),cur=document.querySelector('#carousel-current'),total=document.querySelector('#carousel-total'),bar=document.querySelector('#carousel-progress-bar');
 const prev=document.querySelector('#carousel-prev'),next=document.querySelector('#carousel-next'),dialog=document.querySelector('#portfolio-lightbox'),lightImg=document.querySelector('#lightbox-image'),caption=document.querySelector('#lightbox-caption');
 const fallback=[...stage.querySelectorAll('img')].map((img,i)=>({url:img.currentSrc||img.src,sourceOrder:i+1}));
 function selected(){return views[view].pick(assets)}
 function slide(a,i){const year=a.url.includes('/2022/')?'2022':a.url.includes('/2020/')?'2020':'HOTP';return `<button class="portfolio-slide${i===0?' is-active':''}" type="button" data-index="${i}" aria-label="Open HOTP portfolio work ${a.sourceOrder}"><span class="slide-number">${String(i+1).padStart(2,'0')}</span><img src="${a.url}" alt="HOTP portfolio work ${a.sourceOrder}" loading="${i<3?'eager':'lazy'}" decoding="async"><span class="slide-overlay"><small>HOTP · ${year}</small><strong>VIEW WORK ↗</strong></span></button>`}
 function sync(){
   const cards=[...stage.querySelectorAll('.portfolio-slide')]; if(!cards.length)return;
   const center=stage.scrollLeft+stage.clientWidth*.5;
   let active=0,best=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft+card.offsetWidth*.5-center);if(d<best){best=d;active=i}});
   cards.forEach((c,i)=>c.classList.toggle('is-active',i===active));cur.textContent=String(active+1).padStart(2,'0');total.textContent=String(cards.length).padStart(2,'0');bar.style.transform=`scaleX(${(active+1)/cards.length})`;
 }
 function render(){
   currentSet=selected(); stage.innerHTML=currentSet.map(slide).join('');stage.scrollLeft=0;
   label.textContent=views[view].label;count.textContent=`${String(currentSet.length).padStart(2,'0')} WORKS`;total.textContent=String(currentSet.length).padStart(2,'0');sync();
 }
 assets=fallback;render();
 fetch('data/portfolio.json?rev=4',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(d.assets?.length){assets=d.assets;render()}}).catch(()=>{});
 document.querySelector('.portfolio-menu')?.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;startAuto();document.querySelectorAll('.portfolio-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});
 let raf;stage.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(sync)},{passive:true});
 function move(dir){const card=stage.querySelector('.portfolio-slide');stage.scrollBy({left:dir*((card?.offsetWidth||420)+18),behavior:'smooth'})}
 prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
 let autoTimer=null,autoPaused=false;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function autoStep(){if(autoPaused||reduced||dialog?.open)return;const cards=[...stage.querySelectorAll('.portfolio-slide')];if(cards.length<2)return;const max=stage.scrollWidth-stage.clientWidth;if(stage.scrollLeft>=max-12)stage.scrollTo({left:0,behavior:'smooth'});else move(1)}
 function startAuto(){if(reduced)return;clearInterval(autoTimer);autoTimer=setInterval(autoStep,5200)}
 function pauseAuto(){autoPaused=true}
 function resumeAuto(){autoPaused=false;startAuto()}
 stage.addEventListener('mouseenter',pauseAuto);stage.addEventListener('mouseleave',resumeAuto);stage.addEventListener('focusin',pauseAuto);stage.addEventListener('focusout',resumeAuto);stage.addEventListener('touchstart',pauseAuto,{passive:true});stage.addEventListener('touchend',()=>setTimeout(resumeAuto,1800),{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?pauseAuto():resumeAuto());startAuto();
 let down=false,x=0,left=0;stage.addEventListener('pointerdown',e=>{down=true;x=e.clientX;left=stage.scrollLeft;stage.setPointerCapture(e.pointerId);stage.classList.add('dragging')});stage.addEventListener('pointermove',e=>{if(down)stage.scrollLeft=left-(e.clientX-x)});['pointerup','pointercancel'].forEach(ev=>stage.addEventListener(ev,()=>{down=false;stage.classList.remove('dragging')}));
 function showLightbox(i){lightboxIndex=i;const a=currentSet[i];if(!a||!dialog)return;lightImg.src=a.url;caption.textContent=`HOTP PORTFOLIO · WORK ${String(a.sourceOrder).padStart(2,'0')}`;dialog.showModal()}
 stage.addEventListener('click',e=>{if(Math.abs(stage.scrollLeft-left)>8)return;const b=e.target.closest('[data-index]');if(b)showLightbox(Number(b.dataset.index))});
 dialog?.querySelector('.lightbox-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog?.querySelector('.next')?.addEventListener('click',()=>showLightbox((lightboxIndex+1)%currentSet.length));dialog?.querySelector('.prev')?.addEventListener('click',()=>showLightbox((lightboxIndex-1+currentSet.length)%currentSet.length));document.addEventListener('keydown',e=>{if(!dialog?.open)return;if(e.key==='ArrowRight')showLightbox((lightboxIndex+1)%currentSet.length);if(e.key==='ArrowLeft')showLightbox((lightboxIndex-1+currentSet.length)%currentSet.length)});
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
