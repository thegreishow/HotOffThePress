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
 document.querySelector('.portfolio-menu')?.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;document.querySelectorAll('.portfolio-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false')});render()});
 let raf;stage.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(sync)},{passive:true});
 function move(dir){const card=stage.querySelector('.portfolio-slide');stage.scrollBy({left:dir*((card?.offsetWidth||420)+18),behavior:'smooth'})}
 prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
 let autoFrame=null,autoPaused=false,lastAutoTime=0,autoPosition=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const AUTO_SPEED=112;
 function autoLoop(now){
   if(!lastAutoTime){lastAutoTime=now;autoPosition=stage.scrollLeft}
   const dt=Math.min((now-lastAutoTime)/1000,.05);lastAutoTime=now;
   if(!autoPaused&&!reduced&&!dialog?.open&&stage.scrollWidth>stage.clientWidth){
     const max=stage.scrollWidth-stage.clientWidth;autoPosition+=AUTO_SPEED*dt;
     if(autoPosition>=max){autoPosition=0;stage.scrollLeft=0}else{stage.scrollLeft=autoPosition}
   }else{autoPosition=stage.scrollLeft}
   autoFrame=requestAnimationFrame(autoLoop);
 }
 function startAuto(){if(reduced||autoFrame)return;lastAutoTime=0;autoPosition=stage.scrollLeft;autoFrame=requestAnimationFrame(autoLoop)}
 function pauseAuto(){autoPaused=true}
 function resumeAuto(){autoPaused=false;autoPosition=stage.scrollLeft;lastAutoTime=performance.now();startAuto()}
 stage.addEventListener('pointerdown',pauseAuto);stage.addEventListener('touchstart',pauseAuto,{passive:true});stage.addEventListener('touchend',()=>setTimeout(resumeAuto,900),{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?pauseAuto():resumeAuto());startAuto();
 let down=false,x=0,left=0,dragDistance=0;stage.addEventListener('pointerdown',e=>{down=true;x=e.clientX;left=stage.scrollLeft;dragDistance=0;stage.setPointerCapture(e.pointerId);stage.classList.add('dragging')});stage.addEventListener('pointermove',e=>{if(down){dragDistance=Math.max(dragDistance,Math.abs(e.clientX-x));stage.scrollLeft=left-(e.clientX-x)}});['pointerup','pointercancel'].forEach(ev=>stage.addEventListener(ev,()=>{down=false;stage.classList.remove('dragging');setTimeout(resumeAuto,900)}));
 function showLightbox(i){lightboxIndex=i;const a=currentSet[i];if(!a||!dialog)return;lightImg.src=a.url;caption.textContent=`HOTP PORTFOLIO · WORK ${String(a.sourceOrder).padStart(2,'0')}`;dialog.showModal()}
 stage.addEventListener('click',e=>{if(dragDistance>8)return;const b=e.target.closest('[data-index]');if(b)showLightbox(Number(b.dataset.index))});
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

/* Shared navigation + service finder + pricing calculator rev 16 */
const siteMenuToggle=document.querySelector('.site-menu-toggle');
const closeSiteNav=()=>{const n=siteMenuToggle?.closest('.nav');n?.classList.remove('menu-open');siteMenuToggle?.setAttribute('aria-expanded','false');document.body.classList.remove('nav-lock')};
siteMenuToggle?.addEventListener('click',e=>{const n=e.currentTarget.closest('.nav');const open=n.classList.toggle('menu-open');e.currentTarget.setAttribute('aria-expanded',String(open));document.body.classList.toggle('nav-lock',open)});
document.querySelectorAll('.nav .links a').forEach(a=>a.addEventListener('click',closeSiteNav));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSiteNav()});
window.addEventListener('resize',()=>{if(window.innerWidth>900)closeSiteNav()});
const serviceData={print:['Printing & Copying','Business cards, flyers, programmes, invitations, stationery and everyday colour/B&W production.'],large:['Large Format','Posters, banners, vinyl, backlit, plans, mounting and large-format finishing.'],wear:['Heat Transfer','T-shirts, caps, mouse pads and transfer production.'],bind:['Binding','Spiral, wire and coil binding with related document finishing.'],finish:['Finishing','Cutting, numbering, stitch & fold, laminating, scoring, perfing and assembly.']};
document.querySelector('#service-selector')?.addEventListener('click',e=>{const b=e.target.closest('[data-service]');if(!b)return;document.querySelectorAll('.service-choice').forEach(x=>x.classList.toggle('active',x===b));const d=serviceData[b.dataset.service],r=document.querySelector('#service-tool-result');r.innerHTML='<small>RECOMMENDED PATH</small><strong>'+d[0]+'</strong><p>'+d[1]+'</p><div><a class="button black" href="pricing.html#calculator">Estimate cost →</a><a class="button" href="index.html#order">How to order →</a></div>'});
const calcProduct=document.querySelector('#calc-product'),calcFields=document.querySelector('#calc-fields'),calcTotal=document.querySelector('#calc-total'),calcNote=document.querySelector('#calc-note');
if(calcProduct){let pd;const money=n=>'J$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});const field=(label,html)=>'<label>'+label+html+'</label>';
fetch('./data/pricing.json?v=16').then(r=>r.json()).then(d=>{pd=d.deterministic;drawCalc()});
function drawCalc(){const p=calcProduct.value;let h='';if(p==='copyColour'||p==='copyBW')h=field('Size','<select id="c-size"><option value="letter">Letter 8.5×11</option><option value="legal">Legal 8.5×14</option><option value="tabloid">Tabloid 11×17</option></select>')+field('Quantity','<input id="c-qty" type="number" min="1" value="25">');if(p==='businessCards')h=field('Sides','<select id="c-side"><option value="singleSide">Single side</option><option value="backAndFront">Back & front</option></select>')+field('Quantity','<select id="c-cardqty">'+[10,50,100,200,250,300,400,500,1000].map(x=>'<option>'+x+'</option>').join('')+'</select>');if(p==='spiral'||p==='wire')h=field('Pages','<input id="c-pages" type="number" min="1" value="100">');if(p==='largeFormat')h=field('Material','<select id="c-material"><option value="posterPaper">Poster paper</option><option value="adhesiveVinyl">Adhesive vinyl</option><option value="vinylBanner">Vinyl banner</option><option value="canvas">Canvas</option><option value="backlit">Backlit</option></select>')+field('Width (ft)','<input id="c-width" type="number" min=".1" step=".1" value="3">')+field('Height (ft)','<input id="c-height" type="number" min=".1" step=".1" value="2">');if(p==='laminating')h=field('Size','<select id="c-lamsize"><option value="letter">Letter</option><option value="legal">Legal</option><option value="tabloid">Tabloid</option></select>')+field('Thickness','<select id="c-thick"><option value="m003">0.03mm</option><option value="m005">0.05mm</option><option value="m010">0.10mm</option></select>')+field('Quantity','<input id="c-qty" type="number" min="1" value="1">');calcFields.innerHTML=h;calcFields.querySelectorAll('input,select').forEach(x=>x.addEventListener('input',calculate));calculate()}
function calculate(){if(!pd)return;const p=calcProduct.value;let total=0,note='Published catalogue estimate.';if(p==='copyColour'||p==='copyBW'){const q=+document.querySelector('#c-qty').value,s=document.querySelector('#c-size').value,type=p==='copyColour'?'colour':'bw',tier=type==='colour'?(q<=24?'1-24':'25+'):(q<=1000?'1-1000':'1001+');total=pd.copying[type][s][tier]*q;note=money(pd.copying[type][s][tier])+' × '+q+' copies';}if(p==='businessCards'){const side=document.querySelector('#c-side').value,q=document.querySelector('#c-cardqty').value;total=pd.businessCards[side][q];note='Published glossy-card total; catalogue marks business-card table tax-inclusive.'}if(p==='spiral'||p==='wire'){const pages=+document.querySelector('#c-pages').value,tier=pages<=100?'1-100':pages<=250?'101-250':'251+',key=p==='spiral'?'spiral':'wireCoil';total=pd.binding[key][tier];note=tier+' page binding tier.'}if(p==='largeFormat'){const m=document.querySelector('#c-material').value,w=+document.querySelector('#c-width').value,h=+document.querySelector('#c-height').value,area=w*h,rate=pd.largeFormatPrintPerSqFt[m];total=area*rate;note=area.toFixed(2)+' sq.ft. × '+money(rate)+'/sq.ft.'}if(p==='laminating'){const s=document.querySelector('#c-lamsize').value,t=document.querySelector('#c-thick').value,q=+document.querySelector('#c-qty').value,rate=pd.laminatingPouches[s][t];total=rate*q;note=money(rate)+' × '+q+' pouches.'}calcTotal.textContent=money(total);calcNote.textContent=note+' Final cost subject to HOTP confirmation.'}calcProduct.addEventListener('change',drawCalc)}
