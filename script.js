let hotpData={business:null,services:null,portfolio:null,pricing:null};

const money=n=>new Intl.NumberFormat('en-JM',{style:'currency',currency:'JMD',maximumFractionDigits:2}).format(n);

async function loadHOTPData(){
  try{
    const [business,services,portfolio,pricing]=await Promise.all(
      ['business','services','portfolio','pricing'].map(name=>fetch(`data/${name}.json`).then(r=>{if(!r.ok)throw new Error(name);return r.json()}))
    );
    hotpData={business,services,portfolio,pricing};
    renderServices();
    renderProductExplorer();
    renderPortfolio();
    renderPricingSnapshot();
    hydrateQuoteProducts();
    updateQuoteEstimate();
  }catch(err){
    console.warn('Structured HOTP data unavailable; retaining server-rendered fallback content.',err);
  }
}

function serviceSummary(category){
  const items=category.items;
  return items.slice(0,6).join(', ')+(items.length>6?` + ${items.length-6} more`:'');
}
function renderServices(){
  const grid=document.querySelector('#service-grid');
  if(!grid||!hotpData.services)return;
  grid.innerHTML=hotpData.services.categories.map((c,i)=>`
    <article class="service-card reveal visible" data-category="${c.name}">
      <div class="service-visual custom-visual"><span class="plus">${String(i+1).padStart(2,'0')}</span></div>
      <div class="service-meta"><span>REAL SERVICE CATEGORY</span><h3>${c.name}</h3><p>${serviceSummary(c)}</p><small class="service-note">${c.items.length} listed services/products</small></div>
    </article>`).join('');
}
const quoteProductMap={
  'Business Cards':'Business Cards','Full Colour':'Full Colour Copying','Black & White':'Black & White Copying',
  'Scanning':'Scanning','Press Kits':'Press Kits','Architectural Plans':'Custom Job','T-Shirts':'Heat Transfers',
  'Caps':'Heat Transfers','Mouse Pads':'Heat Transfers','Coil':'Wire & Coil Binding','Spiral':'Spiral Binding',
  'Wire':'Wire & Coil Binding','Posters':'Large Format Printing','Banners':'Large Format Printing',
  'Vinyl':'Large Format Printing','Adhesive Vinyl (Die Cut)':'Large Format Printing','Backlit':'Large Format Printing',
  'Laminating':'Large Format Laminating','Mounting':'Mounting'
};
function openQuoteFor(product){
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  const select=document.querySelector('#quote-product'),mapped=quoteProductMap[product]||'Custom Job';
  if(select&&[...select.options].some(o=>o.value===mapped)){select.value=mapped;renderDynamicQuoteFields()}
}
function renderProductExplorer(){
  const services=hotpData.services?.categories||[],quick=document.querySelector('#quick-products'),results=document.querySelector('#service-search-results'),search=document.querySelector('#service-search'),count=document.querySelector('#explorer-count');
  if(!quick||!results||!search)return;
  const items=services.flatMap(c=>c.items.map(name=>({name,category:c.name})));
  const featured=['Business Cards','Full Colour','Black & White','Posters','Banners','T-Shirts','Spiral','Scanning'];
  quick.innerHTML=featured.filter(n=>items.some(i=>i.name===n)).map(n=>`<button type="button" data-product="${n}">${n}<span>↗</span></button>`).join('');
  count.textContent=`${items.length} services & products`;
  const paint=q=>{
    const term=q.trim().toLowerCase();if(!term){results.hidden=true;results.innerHTML='';return}
    const matches=items.filter(i=>(i.name+' '+i.category).toLowerCase().includes(term)).slice(0,12);
    results.hidden=false;results.innerHTML=matches.length?matches.map(i=>`<button type="button" data-product="${i.name}"><span><strong>${i.name}</strong><small>${i.category}</small></span><b>Configure →</b></button>`).join(''):'<div class="no-results"><strong>No exact match.</strong><span>Start a custom quote and tell HOTP what you need.</span><button type="button" data-product="Custom Job">Custom quote →</button></div>';
  };
  search.addEventListener('input',e=>paint(e.target.value));
  [quick,results].forEach(el=>el.addEventListener('click',e=>{const btn=e.target.closest('[data-product]');if(btn)openQuoteFor(btn.dataset.product)}));
}
function renderPortfolio(){
  const grid=document.querySelector('#portfolio-grid');
  if(!grid||!hotpData.portfolio)return;
  grid.innerHTML=hotpData.portfolio.assets.map(a=>`
    <article class="work-card reveal visible" data-work="${a.category}">
      <div class="real-work-image"><img src="${a.url}" alt="${a.title} produced by Hot Off The Press" loading="lazy"></div>
      <div class="work-caption"><strong>${a.title}</strong><span>${a.category}</span></div>
    </article>`).join('');
}
function renderPricingSnapshot(){
  const box=document.querySelector('#pricing-snapshot');
  const p=hotpData.pricing;if(!box||!p)return;
  box.innerHTML=`
    <div class="price-ui-head"><span>PUBLISHED RATE SNAPSHOT</span><span>EFFECTIVE ${p.effectiveDate}</span></div>
    <div class="price-row"><span>Colour Copy · Letter · 1–24</span><strong>${money(p.deterministic.copying.colour.letter['1-24'])} ea.</strong></div>
    <div class="price-row"><span>B&W Copy · Letter · 1–1000</span><strong>${money(p.deterministic.copying.bw.letter['1-1000'])} ea.</strong></div>
    <div class="price-row"><span>Business Cards · 100 · single side</span><strong>${money(p.deterministic.businessCards.singleSide['100'])} incl. tax</strong></div>
    <div class="price-row"><span>Business Cards · 500 · single side</span><strong>${money(p.deterministic.businessCards.singleSide['500'])} incl. tax</strong></div>
    <div class="price-row"><span>Spiral Binding · 1–100 pages</span><strong>${money(p.deterministic.binding.spiral['1-100'])}</strong></div>
    <div class="price-row"><span>Retractable Banner Kit · 33×82</span><strong>${money(p.deterministic.retractableBannerKit.kit)}</strong></div>
    <div class="price-row"><span>Press Kit · 13×19 · single side · 25+</span><strong>${money(p.deterministic.pressKits.singleSide13x19['25+'])} ea.</strong></div>
    <div class="price-total"><span>CATALOGUE STATUS</span><strong>Published prices · confirmation required</strong></div>`;
}
function hydrateQuoteProducts(){
  const select=document.querySelector('#quote-product');if(!select)return;
  const products=['Business Cards','Full Colour Copying','Black & White Copying','Scanning','Spiral Binding','Wire & Coil Binding','3 Hole Punch','Press Kits','Retractable Banner Kit','Large Format Printing','Large Format Laminating','Large Format B&W','Large Format Scanning','Mounting','Heat Transfers','Carbonated Receipt Books','Programmes','Laminated Bookmarkers','Laminated Prayer Cards','Artwork / Designing','Custom Job'];
  select.innerHTML=products.map(n=>`<option>${n}</option>`).join('');
  select.value='Business Cards';renderDynamicQuoteFields();
}
const options=(name,label,vals)=>`<label><span>${label}</span><select name="${name}">${vals.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
const input=(name,label,type='number',extra='')=>`<label><span>${label}</span><input name="${name}" type="${type}" ${extra}></label>`;
function renderDynamicQuoteFields(){
  const product=document.querySelector('#quote-product')?.value,wrap=document.querySelector('#dynamic-quote-fields');if(!wrap)return;
  let html='';
  if(product==='Business Cards') html=options('sides','Sides',[['single','Single side'],['bf','Back & front']])+options('stock','Stock',[['glossy','Glossy card (published table)'],['other','Other stock — manual quote']]);
  else if(product.includes('Copying')) html=options('paperSize','Paper size',[['letter','Letter 8½×11'],['legal','Legal 8½×14'],['tabloid','Tabloid 11×17']]);
  else if(product==='Scanning') html=options('scanMode','Scan type',[['colour','Colour'],['bw','B&W']])+options('paperSize','Size',[['upTo5x7','Up to 5×7'],['letter','8.5×11'],['tabloid','11×17']]);
  else if(product.includes('Binding')||product==='3 Hole Punch') html=input('pages','Pages','number','value="100" min="1"');
  else if(product==='Press Kits') html=options('pressType','Press kit',[['blank','Blank'],['single','13×19 single side'],['bf','13×19 back & front']]);
  else if(product==='Retractable Banner Kit') html=options('bannerType','Item',[['kit','33×82 banner kit'],['replacementBanner','Replacement banner']]);
  else if(product==='Large Format Printing') html=options('material','Material',Object.keys(hotpData.pricing.deterministic.largeFormatPrintPerSqFt).map(k=>[k,k.replace(/([A-Z])/g,' $1')]))+input('width','Width (ft)','number','step="0.01" min="0"')+input('height','Height (ft)','number','step="0.01" min="0"');
  else if(product==='Large Format Laminating') html=options('laminateType','Laminate',[['singleSide','Single side'],['encapsulated','B & F encapsulated']])+options('thickness','Thickness',[['mm3','3mm'],['mm5','5mm'],['mm10','10mm']])+input('width','Width (ft)','number','step="0.01" min="0"')+input('height','Height (ft)','number','step="0.01" min="0"');
  else if(product==='Mounting') html=options('substrate','Substrate',Object.keys(hotpData.pricing.deterministic.mountingPerSqFt).map(k=>[k,k.replace(/([A-Z])/g,' $1')]))+input('width','Width (ft)','number','step="0.01" min="0"')+input('height','Height (ft)','number','step="0.01" min="0"');
  else if(product==='Carbonated Receipt Books') html=options('copies','Book type',[['duplicate','Duplicate'],['triplicate','Triplicate']])+options('pages','Number of pages',[50,100,200,250,500,750,1000,1500,2000,2500,5000].map(n=>[String(n),String(n)]));
  else if(product==='Programmes') html=options('programmeMode','Print',[['colour','Colour cover/back + B&W inside'],['bw','B&W cover/back + B&W inside']])+options('pages','Pages',[4,8,12,16,20].map(n=>[String(n),n+' pages']))+options('programmeQty','Quantity',[50,100,150,200,250,300,400,500,600,800,1000].map(n=>[String(n),String(n)]));
  else if(product==='Laminated Bookmarkers') html=options('sides','Sides',[['singleSide','Single side'],['backFront','Back & front']]);
  else if(product==='Laminated Prayer Cards') html=options('sides','Sides',[['singleSide','Single side'],['backFront','Back & front']]);
  else if(product==='Artwork / Designing') html=input('hours','Estimated design hours','number','step="0.25" min="0.25" value="1"');
  wrap.innerHTML=html;renderQuoteAddons(product);updateProductNote(product);updateQuoteEstimate();
}
function band(q,cut,key1,key2){return q<=cut?key1:key2}
function deterministicEstimate(data){
  const p=hotpData.pricing?.deterministic;if(!p)return null;
  const product=data.get('product'),qty=Number(data.get('quantity')||0),manual=reason=>({manual:true,reason}),result=(amount,rule,extra={})=>({amount,rule,...extra});
  if(product==='Business Cards'){
    if(data.get('stock')!=='glossy')return manual('The published business-card matrix applies only to glossy card; other stock requires HOTP confirmation.');
    const table=data.get('sides')==='bf'?p.businessCards.backAndFront:p.businessCards.singleSide;
    return table[String(qty)]?result(table[String(qty)],'Published glossy-card total',{taxIncluded:true}):manual('Exact published quantities are 10, 50, 100, 200, 250, 300, 400, 500 and 1000 cards.');
  }
  if(product==='Full Colour Copying'||product==='Black & White Copying'){
    const type=product.startsWith('Full')?'colour':'bw',size=data.get('paperSize'),table=p.copying[type]?.[size];if(!table)return manual('Select a published paper size.');
    const key=type==='colour'?band(qty,24,'1-24','25+'):band(qty,1000,'1-1000','1001+');return result(table[key]*qty,'Published per-copy rate × quantity',{unit:table[key]});
  }
  if(product==='Scanning'){const v=p.scanning[data.get('scanMode')]?.[data.get('paperSize')];return v?result(v*qty,'Published scanning rate × quantity'):manual('This scan configuration requires confirmation.')}
  if(product==='Spiral Binding'||product==='Wire & Coil Binding'){const pages=Number(data.get('pages')),table=product.startsWith('Spiral')?p.binding.spiral:p.binding.wireCoil,key=pages<=100?'1-100':pages<=250?'101-250':'251+';return result(table[key]*qty,'Published binding rate × quantity')}
  if(product==='3 Hole Punch'){const pages=Number(data.get('pages')),key=pages<=100?'1-100':pages<=250?'100-250':'250+';return result(p.binding.threeHolePunch[key]*qty,'Published punch rate × quantity')}
  if(product==='Press Kits'){const t=p.pressKits[data.get('pressType')==='single'?'singleSide13x19':data.get('pressType')==='bf'?'backFront13x19':'blank'],key=qty<=24?'1-24':'25+';return result(t[key]*qty,'Published press-kit rate × quantity')}
  if(product==='Retractable Banner Kit')return result(p.retractableBannerKit[data.get('bannerType')],'Published fixed price');
  if(['Large Format Printing','Large Format Laminating','Mounting'].includes(product)){const area=Number(data.get('width'))*Number(data.get('height'));if(!area)return manual('Width and height are required for per-square-foot pricing.');let rate;if(product==='Large Format Printing')rate=p.largeFormatPrintPerSqFt[data.get('material')];if(product==='Large Format Laminating')rate=p.largeFormatLaminatingPerSqFt[data.get('laminateType')]?.[data.get('thickness')];if(product==='Mounting')rate=p.mountingPerSqFt[data.get('substrate')];return result(rate*area*qty,`Published ${money(rate)}/sq ft × ${area.toFixed(2)} sq ft × quantity`)}
  if(product==='Carbonated Receipt Books'){const v=p.carbonatedReceiptBooks[data.get('copies')]?.[data.get('pages')];return v?result(v,'Published receipt-book matrix; extras excluded'):manual('Choose a published page count.')}
  if(product==='Programmes'){const v=p.programmes[data.get('programmeMode')]?.[data.get('pages')]?.[data.get('programmeQty')];return v?result(v,'Published programme matrix; add-ons excluded'):manual('Choose a published programme combination.')}
  if(product==='Laminated Bookmarkers'){const t=p.laminatedProducts.bookmarkers[data.get('sides')],key=qty<100?'50-99':qty<250?'100-249':'250+';return qty<50?manual('Published laminated bookmarker minimum is 50.'):result(t[key]*qty,'Published laminated bookmarker rate × quantity')}
  if(product==='Laminated Prayer Cards'){const t=p.laminatedProducts.prayerCards[data.get('sides')];return qty<6?manual('Published prayer-card minimum is 6 per letter-size sheet.'):result(t['6+']*qty,'Published laminated prayer-card rate × quantity')}
  if(product==='Artwork / Designing'){const h=Number(data.get('hours')),amount=Math.max(p.artworkDesign.minimum,p.artworkDesign.hourly*h);return result(amount,'Published J$6,000/hour with J$2,000 minimum')}
  return manual('The catalogue does not provide a complete deterministic rule for this selection. HOTP should confirm the job manually.');
}
function updateProductNote(product){
  const el=document.querySelector('#product-pricing-note');if(!el)return;
  const exact=['Business Cards','Full Colour Copying','Black & White Copying','Scanning','Spiral Binding','Wire & Coil Binding','3 Hole Punch','Press Kits','Retractable Banner Kit','Large Format Printing','Large Format Laminating','Mounting','Carbonated Receipt Books','Programmes','Laminated Bookmarkers','Laminated Prayer Cards','Artwork / Designing'];
  el.textContent=exact.includes(product)?'Published catalogue pricing is available for supported configurations.':'This product requires HOTP confirmation for final pricing.';
}
function renderQuoteAddons(product){
  const wrap=document.querySelector('#quote-addons');if(!wrap)return;
  let rows=[];
  if(product==='Programmes')rows=[['premiumPaper','Premium paper'],['staple','Straddle fold & staple']];
  if(product==='Large Format Laminating')rows=[['coldLaminate','Cold laminate (1.5× published rate)']];
  if(product==='Heat Transfers')rows=[['press','Include pressing']];
  wrap.innerHTML=rows.length?'<span class="addon-title">OPTIONAL ADD-ONS</span>'+rows.map(([n,l])=>`<label class="check-option"><input type="checkbox" name="${n}"><span>${l}</span></label>`).join(''):'';
}
function estimateWithAddons(data){
  const base=deterministicEstimate(data);if(!base||base.manual)return base;
  const p=hotpData.pricing.deterministic,items=[{label:base.rule,amount:base.amount}],qty=Number(data.get('quantity')||0);
  let total=base.amount;
  if(data.get('product')==='Programmes'){
    const q=Number(data.get('programmeQty')||0),pages=Number(data.get('pages')||0);
    if(data.get('premiumPaper')==='on'&&p.programmes.premiumPaperAddPerProgramme[pages]){const a=p.programmes.premiumPaperAddPerProgramme[pages]*q;items.push({label:'Premium paper',amount:a});total+=a}
    if(data.get('staple')==='on'){const a=p.programmes.straddleFoldStapleAddPerProgramme*q;items.push({label:'Straddle fold & staple',amount:a});total+=a}
  }
  if(data.get('product')==='Large Format Laminating'&&data.get('coldLaminate')==='on'){const extra=base.amount*.5;items.push({label:'Cold laminate surcharge',amount:extra});total+=extra}
  return {...base,amount:total,items};
}
function renderBreakdown(est){
  const box=document.querySelector('#quote-breakdown');if(!box)return;
  if(!est||est.manual||!est.items||est.items.length<2){box.hidden=true;box.innerHTML='';return}
  box.hidden=false;box.innerHTML='<span>PRICE BREAKDOWN</span>'+est.items.map(i=>`<div><em>${i.label}</em><strong>${money(i.amount)}</strong></div>`).join('')+`<div class="breakdown-total"><em>Published estimate</em><strong>${money(est.amount)}</strong></div>`;
}
function updateQuoteEstimate(){
  const box=document.querySelector('#quote-live-estimate'),form=document.querySelector('#quote-form');if(!box||!form||!hotpData.pricing)return;
  const est=estimateWithAddons(new FormData(form));
  renderBreakdown(est);
  box.innerHTML=est&&!est.manual?`<div><span>PUBLISHED ESTIMATE</span><strong>${money(est.amount)}${est.taxIncluded?' incl. tax':''}</strong></div><p>${est.rule}. Final specifications and current pricing still require HOTP confirmation.</p>`:`<div><span>MANUAL QUOTE</span><strong>HOTP confirmation required</strong></div><p>${est?.reason||'Complete the job details for pricing guidance.'}</p>`;
}

const modal=document.querySelector('.quote-modal');
const form=document.querySelector('#quote-form');
const result=document.querySelector('.quote-result');
const resultContent=document.querySelector('#quote-result-content');

document.querySelectorAll('[data-open-quote]').forEach(btn=>btn.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';updateQuoteEstimate()}));
document.querySelector('.capability-ribbon')?.addEventListener('click',e=>{const btn=e.target.closest('[data-product]');if(btn)openQuoteFor(btn.dataset.product)});
document.querySelectorAll('[data-close-quote]').forEach(btn=>btn.addEventListener('click',closeQuote));
function closeQuote(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQuote()});
form?.addEventListener('change',e=>{if(e.target.name==='product')renderDynamicQuoteFields();else updateQuoteEstimate()});form?.addEventListener('input',e=>{if(e.target.name==='quantity')updateQuoteEstimate()});

form?.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(form);const est=estimateWithAddons(data);
  const fields=['product','quantity','paperSize','sides','stock','scanMode','pages','pressType','bannerType','material','width','height','laminateType','thickness','substrate','copies','programmeMode','programmeQty','hours','premiumPaper','staple','coldLaminate','press','artwork','turnaround','notes'].filter(k=>data.has(k));
  resultContent.innerHTML='<div class="result-grid">'+fields.map(key=>{const label=key.charAt(0).toUpperCase()+key.slice(1);const value=(data.get(key)||'—').toString().replace(/[<>]/g,'');return '<div><span>'+label+'</span><strong>'+value+'</strong></div>'}).join('')+
    `<div><span>Pricing status</span><strong>${est&&!est.manual?money(est.amount):'Manual quote required'}</strong></div></div>`;
  form.hidden=true;result.hidden=false;
  document.querySelector('.quote-progress')?.classList.add('complete');
  const summaryText=fields.map(key=>key+': '+(data.get(key)||'—')).join('\\n')+'\\nPricing: '+(est&&!est.manual?money(est.amount):'Manual quote required');
  result.dataset.summary=summaryText;
  const mail=document.querySelector('#email-quote-summary');if(mail)mail.href='mailto:hotp@hotpjamaica.com?subject='+encodeURIComponent('Print Job Request — '+data.get('product'))+'&body='+encodeURIComponent(summaryText);
});
document.querySelector('[data-reset-quote]')?.addEventListener('click',()=>{result.hidden=true;form.hidden=false;document.querySelector('.quote-progress')?.classList.remove('complete');updateQuoteEstimate()});
document.querySelector('#copy-quote-summary')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(result.dataset.summary||'');const old=e.currentTarget.textContent;e.currentTarget.textContent='Copied';setTimeout(()=>e.currentTarget.textContent=old,1400)}catch{e.currentTarget.textContent='Copy unavailable'}});

document.querySelector('.filter-bar')?.addEventListener('click',e=>{
  const btn=e.target.closest('.filter');if(!btn)return;
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const f=btn.dataset.filter;
  document.querySelectorAll('.work-card').forEach(card=>{card.style.display=(f==='All'||card.dataset.work===f||((f==='Digital Print')&&card.dataset.work==='Digital Format'))?'flex':'none'});
});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const nav=document.querySelector('.nav'),toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=nav?.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));

loadHOTPData();
