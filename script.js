let hotpData={business:null,services:null,portfolio:null,pricing:null};

const money=n=>new Intl.NumberFormat('en-JM',{style:'currency',currency:'JMD',maximumFractionDigits:2}).format(n);

async function loadHOTPData(){
  try{
    const [business,services,portfolio,pricing]=await Promise.all(
      ['business','services','portfolio','pricing'].map(name=>fetch(`data/${name}.json`).then(r=>{if(!r.ok)throw new Error(name);return r.json()}))
    );
    hotpData={business,services,portfolio,pricing};
    renderServices();
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
  const select=document.querySelector('#quote-product');if(!select||!hotpData.services)return;
  const names=[...new Set(hotpData.services.categories.flatMap(c=>c.items))];
  select.innerHTML=names.map(n=>`<option>${n}</option>`).join('')+'<option>Custom Job</option>';
  select.value='Business Cards';
}
function deterministicEstimate(data){
  const p=hotpData.pricing;if(!p)return null;
  const product=data.get('product'),qty=Number(data.get('quantity')||0),size=data.get('size'),colour=data.get('colour');
  if(product==='Business Cards'){
    const table=p.deterministic.businessCards.singleSide;
    if(Object.prototype.hasOwnProperty.call(table,String(qty)))return {amount:table[String(qty)],taxIncluded:true,rule:'Published single-side glossy-card total'};
    return {manual:true,reason:'Published business-card pricing is quantity-specific. Choose 10, 50, 100, 200, 250, 300, 400, 500 or 1000 for an exact published total.'};
  }
  if(product==='Spiral'){
    const table=p.deterministic.binding.spiral;
    return {amount:qty<=100?table['1-100']:qty<=250?table['101-250']:table['251+'],rule:'Published spiral binding rate'};
  }
  if(product==='Full Colour'||product==='Black & White'){
    const type=product==='Full Colour'?'colour':'bw';
    const paper=size==='A4'?'letter':size==='A3'?'tabloid':null;
    if(!paper)return {manual:true,reason:'Choose A4/Letter or A3/Tabloid for deterministic copy pricing.'};
    const table=p.deterministic.copying[type][paper];
    const key=type==='colour'?(qty<=24?'1-24':'25+'):(qty<=1000?'1-1000':'1001+');
    return {amount:table[key]*qty,unit:table[key],rule:'Published copy rate × quantity'};
  }
  const manual=p.manualQuote.find(x=>product.toLowerCase().includes(x.product.toLowerCase().split(' / ')[0].toLowerCase()));
  return {manual:true,reason:manual?.reason||'This product needs HOTP confirmation because the published catalogue does not provide a complete deterministic rule for the selected specifications.'};
}
function updateQuoteEstimate(){
  const box=document.querySelector('#quote-live-estimate');const form=document.querySelector('#quote-form');
  if(!box||!form||!hotpData.pricing)return;
  const est=deterministicEstimate(new FormData(form));
  if(est&&!est.manual){
    box.innerHTML=`<div><span>PUBLISHED ESTIMATE</span><strong>${money(est.amount)}${est.taxIncluded?' incl. tax':''}</strong></div><p>${est.rule}. Final production details still require HOTP confirmation.</p>`;
  }else{
    box.innerHTML=`<div><span>MANUAL QUOTE</span><strong>HOTP confirmation required</strong></div><p>${est?.reason||'Complete the job details for pricing guidance.'}</p>`;
  }
}

const modal=document.querySelector('.quote-modal');
const form=document.querySelector('#quote-form');
const result=document.querySelector('.quote-result');
const resultContent=document.querySelector('#quote-result-content');

document.querySelectorAll('[data-open-quote]').forEach(btn=>btn.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';updateQuoteEstimate()}));
document.querySelectorAll('[data-close-quote]').forEach(btn=>btn.addEventListener('click',closeQuote));
function closeQuote(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQuote()});
form.addEventListener('change',updateQuoteEstimate);form.addEventListener('input',e=>{if(e.target.name==='quantity')updateQuoteEstimate()});

form.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(form);const est=deterministicEstimate(data);
  const fields=['product','quantity','size','colour','finish','artwork','turnaround','notes'];
  resultContent.innerHTML='<div class="result-grid">'+fields.map(key=>{const label=key.charAt(0).toUpperCase()+key.slice(1);const value=(data.get(key)||'—').toString().replace(/[<>]/g,'');return '<div><span>'+label+'</span><strong>'+value+'</strong></div>'}).join('')+
    `<div><span>Pricing status</span><strong>${est&&!est.manual?money(est.amount):'Manual quote required'}</strong></div></div>`;
  form.hidden=true;result.hidden=false;
});
document.querySelector('[data-reset-quote]').addEventListener('click',()=>{result.hidden=true;form.hidden=false;updateQuoteEstimate()});

document.querySelector('.filter-bar').addEventListener('click',e=>{
  const btn=e.target.closest('.filter');if(!btn)return;
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const f=btn.dataset.filter;
  document.querySelectorAll('.work-card').forEach(card=>{card.style.display=(f==='All'||card.dataset.work===f||((f==='Digital Print')&&card.dataset.work==='Digital Format'))?'flex':'none'});
});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const nav=document.querySelector('.nav'),toggle=document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));

loadHOTPData();
