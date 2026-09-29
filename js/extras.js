/* extras.js — projects + case studies, hidden terminal, custom cursor, GitHub live feed, contact form */
(() => {
  'use strict';
  /* ===== EDIT THIS: your content ===== */
  const GITHUB_USER = 'TanishCreates';
  const WEB3FORMS_KEY = '5e1d1553-c02d-4d05-b209-f80215cd7785'; // free key from web3forms.com (sent to your email)
  const EMAIL = 'sainitanishsaini75@gmail.com';
  const PROJECTS = [
    { name: 'Fixit', status: 'BUILDING', tag: 'Local professionals platform',
      desc: 'Connects people with nearby skilled professionals and lets professionals find customers and each other.',
      stack: ['WEB', 'PLATFORM'], url: 'https://github.com/TanishCreates/FixIt', repo: 'FixIt',
      problem: 'Finding a trustworthy local professional is slow and mostly word of mouth.',
      approach: 'Prototyping a platform where people search nearby pros and pros get discovered and can hire each other. I lead the team.',
      learned: 'Add what broke and what you learned here.' },
    { name: 'Breach Monitor', status: 'PLANNED', tag: 'Personal data breach checker',
      desc: 'Checks whether an email appeared in a breach and explains in plain language what to do next.',
      stack: ['CYBERSECURITY', 'FREE APIs'], url: 'https://github.com/TanishCreates/DepCheck', repo: 'DepCheck',
      problem: 'People learn about breaches but do not know which steps actually matter.',
      approach: 'Email breach lookup with clear next-step guidance, built on free data sources only.',
      learned: 'Add what broke and what you learned here.' }
  ];
  const SKILLS = 'HTML / CSS / JS, Python, Streamlit, Three.js, GSAP, cybersecurity basics, Linux';

  const $ = (s, r = document) => r.querySelector(s);
  const el = (h) => { const t = document.createElement('div'); t.innerHTML = h.trim(); return t.firstChild; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));


  /* ===== Projects + case study modal ===== */
  const sec = $('.media-section');
  const cs = el('<div class="cs" role="dialog" aria-modal="true"><div class="cs-box"></div></div>');
  document.body.append(cs);
  function openCase(p) {
    const links = [p.url && `<a class="text-link" href="${esc(p.url)}" target="_blank" rel="noopener">LIVE DEMO →</a>`,
                   p.repo && `<a class="text-link" href="${esc(p.repo)}" target="_blank" rel="noopener">SOURCE →</a>`].filter(Boolean).join('');
    $('.cs-box', cs).innerHTML = `<button class="cs-x" id="csx">ESC ✕</button><p class="proj-top">${esc(p.status)} / ${esc(p.tag)}</p>
      <h2>${esc(p.name)}</h2><h4>PROBLEM</h4><p>${esc(p.problem)}</p><h4>APPROACH</h4><p>${esc(p.approach)}</p>
      <h4>WHAT I LEARNED</h4><p>${esc(p.learned)}</p><div class="cs-links">${links || '<small style="color:#666">links coming soon</small>'}</div>`;
    cs.classList.add('on'); $('#csx').focus(); $('#csx').onclick = closeCase;
  }
  function closeCase() { cs.classList.remove('on'); }
  cs.addEventListener('click', (e) => { if (e.target === cs) closeCase(); });
  if (sec) {
    sec.innerHTML = `<div class="section-head"><p class="eyebrow">03 / PROJECTS</p><span class="views">OPEN A FILE</span></div>
      <div class="proj-grid">${PROJECTS.map((p, i) => `<button class="proj" data-i="${i}"><div class="proj-top"><span>${esc(p.status)}</span><span>0${i + 1}</span></div>
      <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="proj-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
      <span class="proj-open">READ CASE STUDY →</span></button>`).join('')}</div>`;
    sec.addEventListener('click', (e) => { const b = e.target.closest('.proj'); if (b) openCase(PROJECTS[b.dataset.i]); });
  }

  /* ===== GitHub live feed ===== */
  let repos = null;
  const getRepos = () => repos ? Promise.resolve(repos) :
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=4`).then((r) => r.ok ? r.json() : []).then((d) => (repos = d)).catch(() => (repos = []));
  const ago = (d) => { const s = (Date.now() - new Date(d)) / 864e5; return s < 1 ? 'today' : s < 30 ? `${Math.floor(s)}d ago` : `${Math.floor(s / 30)}mo ago`; };
  const gs = $('.github-section');
  if (gs) getRepos().then((list) => {
    if (!list.length) return;
    gs.append(el(`<div class="gh-live">$ git log --recent<br>${list.map((r) => `<a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a> — pushed ${ago(r.pushed_at)}`).join('<br>')}</div>`));
  });

  /* ===== Contact form + resume ===== */
  const contact = $('#contact');
  if (contact) {
    contact.append(el('<a class="text-link resume" href="resume.pdf" download>DOWNLOAD RESUME ↓</a>'));
    const form = el(`<form class="cform"><input name="name" placeholder="name" required><input name="email" type="email" placeholder="email" required>
      <textarea name="message" rows="4" placeholder="what are we building?" required></textarea><button type="submit">SEND MESSAGE</button><div class="cform-msg"></div></form>`);
    contact.append(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const f = new FormData(form), msg = $('.cform-msg', form);
      if (WEB3FORMS_KEY === 'YOUR_ACCESS_KEY') {
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Hello from ' + f.get('name'))}&body=${encodeURIComponent(f.get('message') + '\n\n' + f.get('email'))}`; return;
      }
      f.append('access_key', WEB3FORMS_KEY); msg.textContent = 'sending...';
      try { const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: f }); const j = await r.json();
        msg.textContent = j.success ? 'sent. talk soon.' : 'failed — email me directly instead.'; if (j.success) form.reset();
      } catch (err) { msg.textContent = 'network error — email me directly instead.'; }
    });
  }

  /* ===== Hidden terminal (` or ~ , or the button) ===== */
  const tm = el(`<div class="tm" role="dialog" aria-label="terminal"><div class="tm-out"></div><div class="tm-row"><span>$</span><input autocomplete="off" spellcheck="false" aria-label="command"></div></div>`);
  const fab = el('<button class="tm-fab" aria-label="open terminal">›_</button>');
  document.body.append(tm, fab);
  const out = $('.tm-out', tm), inp = $('input', tm);
  const print = (h) => { out.insertAdjacentHTML('beforeend', h + '\n'); out.scrollTop = out.scrollHeight; };
  const toggle = (on) => { tm.classList.toggle('on', on); if (on) { inp.focus(); if (!out.textContent) print('<b>tanish_saini archive</b> — type <b>help</b>'); } };
  const cmds = {
    help: () => print('about  skills  projects  open &lt;name|1-3&gt;  github  contact  resume  clear  exit'),
    about: () => print('Tanish Saini — CSE student, developer & builder from India. Building Fixit.'),
    skills: () => print(esc(SKILLS)),
    projects: () => print(PROJECTS.map((p, i) => `${i + 1}. <b>${esc(p.name)}</b> [${esc(p.status)}] ${esc(p.tag)}`).join('\n')),
    open: (a) => { const q = a.toLowerCase(), p = PROJECTS[+q - 1] || PROJECTS.find((x) => x.name.toLowerCase().includes(q));
      if (!q || !p) return print('usage: open &lt;name|number&gt;'); toggle(false); openCase(p); },
    github: () => { print('fetching...'); getRepos().then((l) => print(l.length ? l.map((r) => `${esc(r.name)} — pushed ${ago(r.pushed_at)}`).join('\n') : 'no data (rate-limited?)')); },
    contact: () => { toggle(false); contact && contact.scrollIntoView({ behavior: 'smooth' }); },
    resume: () => { open('resume.pdf', '_blank'); print('opening resume.pdf'); },
    clear: () => (out.textContent = ''), exit: () => toggle(false),
    sudo: () => print('nice try. permission denied.'), whoami: () => print('tanish_saini'), ls: () => print('projects/  skills.txt  resume.pdf  secrets/ (permission denied)')
  };
  inp.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !inp.value.trim()) return;
    const line = inp.value.trim(); inp.value = ''; print('$ ' + esc(line));
    const [c, ...rest] = line.split(/\s+/); (cmds[c.toLowerCase()] || (() => print(`command not found: ${esc(c)} — try help`)))(rest.join(' '));
  });
  fab.addEventListener('click', () => toggle(!tm.classList.contains('on')));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { toggle(false); closeCase(); }
    else if ((e.key === '`' || e.key === '~') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); toggle(!tm.classList.contains('on')); }
  });
})();
