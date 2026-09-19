const modal=document.querySelector('.quote-modal');
const form=document.querySelector('#quote-form');
const result=document.querySelector('.quote-result');
const resultContent=document.querySelector('#quote-result-content');

document.querySelectorAll('[data-open-quote]').forEach(btn=>btn.addEventListener('click',()=>{
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}));

document.querySelectorAll('[data-close-quote]').forEach(btn=>btn.addEventListener('click',closeQuote));
function closeQuote(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeQuote()});

form.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(form);
  const fields=['product','quantity','size','colour','finish','artwork','turnaround','notes'];
  resultContent.innerHTML='<div class="result-grid">'+fields.map(key=>{
    const label=key.charAt(0).toUpperCase()+key.slice(1);
    const value=(data.get(key)||'—').toString().replace(/[<>]/g,'');
    return '<div><span>'+label+'</span><strong>'+value+'</strong></div>'
  }).join('')+'</div>';
  form.hidden=true;
  result.hidden=false;
});

document.querySelector('[data-reset-quote]').addEventListener('click',()=>{
  result.hidden=true;
  form.hidden=false;
});

const filters=document.querySelectorAll('.filter');
const works=document.querySelectorAll('.work-card');
filters.forEach(btn=>btn.addEventListener('click',()=>{
  filters.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const f=btn.dataset.filter;
  works.forEach(card=>{
    card.style.display=(f==='All'||card.dataset.work===f)?'flex':'none';
  });
}));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const nav=document.querySelector('.nav');
const toggle=document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
}));
