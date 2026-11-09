/*!
 * GeoDetec – Soluções Geoespaciais e Ambientais · script do site
 * Autor e proprietário do código: Eduardo Silva Pinzetta
 * Engenheiro Ambiental e Sanitarista · Desenvolvedor Master (full-stack)
 * © 2026 GeoDetec / Eduardo Silva Pinzetta. Todos os direitos reservados.
 * Uso, cópia ou redistribuição sem autorização por escrito são proibidos (ver LICENSE).
 *
 * JavaScript puro, sem dependências:
 * menu · render dos JSON · filtros · lightbox · antes/depois · FAQ · contato/WhatsApp
 */
(() => {
  'use strict';

  const doc = document.documentElement;
  const BASE = doc.dataset.base || '';               // "" na raiz, "../" nas páginas de /servicos/
  const ICONES = BASE + 'assets/img/icons.svg';
  const IMG = BASE + 'assets/img/projetos/';
  const pasta = img => `${BASE}assets/img/${img.pasta || 'projetos'}/`;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduzMov = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (t = '') => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icone = (nome, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="${ICONES}#i-${nome}"/></svg>`;
  const vazio = v => !v || /^\[\[.*\]\]$/.test(String(v).trim());

  const cache = {};
  const json = nome => (cache[nome] ||= fetch(`${BASE}data/${nome}.json`, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(nome); return r.json(); }));

  /* ---------- Marcadores [[...]] bem visíveis ---------- */
  function marcarPendencias(raiz = document.body) {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: n => /\[\[[^\]]+\]\]/.test(n.nodeValue) && !n.parentElement.closest('script,style,mark.ph,option,textarea')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nos = []; while (w.nextNode()) nos.push(w.currentNode);
    nos.forEach(n => {
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\[\[[^\]]+\]\])/).forEach(parte => {
        if (!parte) return;
        if (/^\[\[.*\]\]$/.test(parte)) {
          const m = document.createElement('mark'); m.className = 'ph'; m.textContent = parte;
          m.title = 'Conteúdo pendente: preencher antes de publicar'; frag.append(m);
        } else frag.append(parte);
      });
      n.replaceWith(frag);
    });
  }

  /* ---------- Header e menu ---------- */
  const topo = $('#topo');
  const onScroll = () => topo && topo.classList.toggle('rolou', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const burger = $('.burger'), menu = $('#menu-movel');
  if (burger && menu) {
    menu.hidden = false; menu.inert = true;
    const alternar = abrir => {
      doc.classList.toggle('menu-aberto', abrir);
      document.body.classList.toggle('menu-aberto', abrir);
      burger.setAttribute('aria-expanded', abrir);
      burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      menu.inert = !abrir;
      if (abrir) $('a', menu)?.focus();
    };
    burger.addEventListener('click', () => alternar(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) alternar(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { alternar(false); burger.focus(); } });
    matchMedia('(min-width:1024px)').addEventListener('change', e => e.matches && alternar(false));
  }

  /* WhatsApp flutuante só aparece depois que os botões do topo saem da tela */
  const waF = $('.wa-flut'), heroBtns = $('.hero .botoes');
  if (waF && heroBtns && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => waF.classList.toggle('oculto', en.isIntersecting)).observe(heroBtns);
  }

  /* ---------- Animação de entrada ---------- */
  function revelar() {
    const els = $$('.rv:not(.in)');
    if (reduzMov || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- <picture> responsivo para imagens de projeto ---------- */
  // Regra de tamanhos (igual à de tools/): 480 sempre; 960 se a original for maior que 480; 1600 se tiver 1600 ou mais
  const larguras = l => [480, ...(l > 480 ? [960] : []), ...(l >= 1600 ? [1600] : [])];
  function picture(img, { sizes = '(min-width:1200px) 380px, (min-width:768px) 46vw, 92vw', lazy = true, cls = '' } = {}) {
    const ws = larguras(img.largura), dir = pasta(img);
    const set = ext => ws.map(w => `${dir}${img.arquivo}-${w}.${ext} ${Math.min(w, img.largura)}w`).join(', ');
    const meio = ws.includes(960) ? 960 : 480;
    return `<picture><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
      `<img ${cls ? `class="${cls}"` : ''} src="${dir}${img.arquivo}-${meio}.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="${img.largura}" height="${img.altura}" alt="${esc(img.alt)}" ${lazy ? 'loading="lazy"' : ''} decoding="async"></picture>`;
  }
  const maiorImagem = img => { const ws = larguras(img.largura); return `${pasta(img)}${img.arquivo}-${ws[ws.length - 1]}.webp`; };

  /* ---------- Serviços ---------- */
  async function servicos() {
    const alvo = $('#lista-servicos'), sel = $('#f-serv');
    if (!alvo && !sel) return;
    const d = await json('servicos');
    if (alvo) {
      const tabs = $('#tabs-serv');
      const cont = id => d.servicos.filter(s => s.grupo === id).length;
      const grupoHTML = g => {
        const itens = d.servicos.filter(s => s.grupo === g.id);
        if (!itens.length) return '';
        return `<div class="grupo rv"><div class="grupo-cab"><h3>${esc(g.titulo)}</h3><p>${esc(g.resumo)}</p></div>
          <ul class="grade-serv" style="--cols:${itens.length <= 4 ? itens.length : (itens.length % 4 === 0 || itens.length % 4 === 3 ? 4 : 3)}">${itens.map(s => `<li><article class="card-serv">
            <span class="ci">${icone(s.icone)}</span>
            <div><h4><a href="${BASE}servicos/${s.slug}.html">${esc(s.titulo)}</a></h4><p>${esc(s.resumo)}</p>
            <span class="mais" aria-hidden="true">Ver detalhes ${icone('seta')}</span></div>
          </article></li>`).join('')}</ul></div>`;
      };
      const mostrar = (id, rolar) => {
        const lista = id === 'todos' ? d.grupos : d.grupos.filter(g => g.id === id);
        alvo.innerHTML = lista.map(grupoHTML).join('');
        $$('.grupo', alvo).forEach(g => { g.classList.add('in'); if (!reduzMov) g.classList.add('entrando'); });
        if (tabs) $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t.dataset.tab === id));
        marcarPendencias(alvo);
        if (rolar && tabs) { const t = $(`.tab[data-tab="${id}"]`, tabs); t && t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduzMov ? 'auto' : 'smooth' }); }
      };
      if (tabs) {
        tabs.innerHTML = d.grupos.map(g => `<button type="button" class="tab" role="tab" data-tab="${g.id}" aria-controls="lista-servicos">${esc(g.curto || g.titulo)} <small>${cont(g.id)}</small></button>`).join('') +
          `<button type="button" class="tab" role="tab" data-tab="todos" aria-controls="lista-servicos">Todos <small>${d.servicos.length}</small></button>`;
        tabs.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) mostrar(t.dataset.tab, true); });
        document.addEventListener('click', e => { const a = e.target.closest('[data-tab]:not(.tab)'); if (a) mostrar(a.dataset.tab, true); });
        mostrar(d.grupos[0].id);
      } else mostrar('todos');
    }
    if (sel) {
      d.servicos.forEach(s => sel.add(new Option(s.titulo_curto || s.titulo, s.titulo)));
      sel.add(new Option('Parceria técnica', 'Parceria técnica'));
      sel.add(new Option('Outro', 'Outro'));
    }
    // Faixa de fauna (home)
    const fauna = d.servicos.find(s => s.slug === 'estudos-de-fauna');
    if (fauna) {
      const g = $('#fauna-grupos'), df = $('#fauna-difs'), ft = $('#fauna-fotos');
      if (g) g.innerHTML = (fauna.grupos_fauna || []).map(x => `<li>${esc(x)}</li>`).join('');
      if (df) df.innerHTML = (fauna.diferenciais || []).map(x => `<li><span class="ci ci--p">${icone(x.icone)}</span>${esc(x.texto)}</li>`).join('');
      if (ft) ft.innerHTML = fotos((fauna.fotos || []).slice(0, 3));
    }
  }
  // Fotos de serviço: se "arquivo" estiver vazio, mostra moldura de espera
  function fotos(lista = []) {
    const img = f => {
      const a = BASE + esc(f.arquivo), m = /-960\.jpg$/.test(f.arquivo);
      const tag = `<img src="${a}" alt="${esc(f.alt || f.legenda)}" loading="lazy" decoding="async">`;
      return m ? `<picture><source type="image/webp" srcset="${a.replace(/-960\.jpg$/, '-480.webp')} 480w, ${a.replace(/\.jpg$/, '.webp')} 960w" sizes="(min-width:1024px) 300px, 46vw">${tag}</picture>` : tag;
    };
    return lista.map(f => `<figure>${f.arquivo
      ? `${img(f)}${f.legenda ? `<figcaption>${esc(f.legenda)}</figcaption>` : ''}`
      : `<div class="foto-vazia">${icone('camera')}<span>${esc(f.legenda || '[[FOTO]]')}</span></div>`}</figure>`).join('');
  }

  /* ---------- Projetos: filtros + cards ---------- */
  let PROJETOS = [], CREDITO = '';
  async function projetos() {
    const grade = $('#grade-proj'), filtros = $('#filtros');
    const d = await json('projetos');
    PROJETOS = d.projetos || []; CREDITO = d.credito_satelite || '';
    if (!grade || !filtros) return;
    const cont = c => PROJETOS.filter(p => !c || p.categoria === c).length;
    const cats = ['', ...d.categorias];
    filtros.innerHTML = cats.map(c => `<button type="button" class="filtro" data-cat="${esc(c)}" aria-pressed="${!c}">${c ? esc(c) : 'Todos'}${cont(c) ? ` <small>${cont(c)}</small>` : ''}</button>`).join('');
    const render = cat => {
      const lista = PROJETOS.filter(p => !cat || p.categoria === cat);
      grade.classList.toggle('unico', lista.length === 1);
      grade.innerHTML = lista.length ? lista.map(p => {
        const capa = p.imagens[0];
        return `<li><article class="card-proj">
          <button type="button" class="capa" data-lb-proj="${esc(p.id)}" data-lb-idx="0" aria-label="Ver ${p.imagens.length} imagens: ${esc(p.titulo)}">
            ${picture(capa)}<span class="qtd">${icone('ampliar')}${p.imagens.length}</span></button>
          <div class="corpo"><span class="tag">${esc(p.categoria)}</span><h3>${esc(p.titulo)}</h3>
            ${p.periodo ? `<p class="periodo">${esc(p.periodo)}</p>` : ''}<p>${esc(p.descricao)}</p>
            ${p.servico ? `<a class="link-seta" href="${BASE}servicos/${esc(p.servico)}.html">Sobre o serviço ${icone('seta')}</a>` : ''}
            ${p.imagens.some(i => i.satelite) ? `<p class="credito">${esc(CREDITO)}</p>` : ''}</div>
        </article></li>`;
      }).join('') : `<li class="vazio">Novos projetos desta categoria serão publicados em breve.</li>`;
    };
    filtros.addEventListener('click', e => {
      const b = e.target.closest('.filtro'); if (!b) return;
      $$('.filtro', filtros).forEach(x => x.setAttribute('aria-pressed', x === b));
      render(b.dataset.cat);
    });
    render('');
  }

  /* ---------- Lightbox (com deslizar no celular) ---------- */
  const lb = $('#lightbox');
  let lbLista = [], lbI = 0, lbOrigem = null;
  function lbMostrar(i, dir = 0) {
    if (!lbLista.length) return;
    lbI = (i + lbLista.length) % lbLista.length;
    const im = lbLista[lbI], el = $('#lb-img');
    const trocar = () => {
      el.src = maiorImagem(im); el.alt = im.alt || '';
      el.style.transform = dir ? `translateX(${dir * 40}px)` : ''; el.style.opacity = dir ? 0 : 1;
      requestAnimationFrame(() => { el.style.transform = ''; el.style.opacity = 1; });
    };
    if (dir && !reduzMov) { el.style.opacity = 0; el.style.transform = `translateX(${-dir * 40}px)`; setTimeout(trocar, 160); } else trocar();
    $('#lb-cont').textContent = `${lbI + 1} / ${lbLista.length}`;
    $('#lb-leg').textContent = im.legenda || '';
    $('#lb-cores').innerHTML = (im.legenda_mapa || []).map(([c, t]) => `<li><i style="background:${esc(c)}"></i>${esc(t)}</li>`).join('');
    $('#lb-cred').textContent = im.satelite ? CREDITO : '';
    const multi = lbLista.length > 1;
    $$('.lb-ant,.lb-prox', lb).forEach(b => b.hidden = !multi);
    // pré-carrega a próxima
    if (multi) { const n = new Image(); n.src = maiorImagem(lbLista[(lbI + 1) % lbLista.length]); }
  }
  async function lbAbrir(projId, idx, origem) {
    if (!lb) return;
    if (!PROJETOS.length) await projetos().catch(() => {});
    const p = PROJETOS.find(x => x.id === projId); if (!p) return;
    lbLista = p.imagens; lbOrigem = origem;
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.body.classList.add('lb-aberto');
    lbMostrar(+idx || 0);
    $('[data-lb="fechar"]', lb).focus();
  }
  function lbFechar() {
    if (!lb) return;
    if (lb.open && typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  }
  if (lb) {
    lb.addEventListener('close', () => { document.body.classList.remove('lb-aberto'); lbOrigem?.focus(); });
    lb.addEventListener('click', e => {
      const a = e.target.closest('[data-lb]')?.dataset.lb;
      if (a === 'fechar') lbFechar(); else if (a === 'ant') lbMostrar(lbI - 1, -1); else if (a === 'prox') lbMostrar(lbI + 1, 1);
      else if (e.target === lb || e.target.id === 'lb-palco') lbFechar();
    });
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') lbMostrar(lbI - 1, -1);
      if (e.key === 'ArrowRight') lbMostrar(lbI + 1, 1);
    });
    // gesto de deslizar
    const palco = $('#lb-palco'); let x0 = null, y0 = 0, t0 = 0;
    palco.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); } });
    palco.addEventListener('pointermove', e => {
      if (x0 === null) return; const dx = e.clientX - x0;
      if (Math.abs(dx) > Math.abs(e.clientY - y0)) $('#lb-img').style.transform = `translateX(${dx * .6}px)`;
    });
    const fim = e => {
      if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0, rapido = Date.now() - t0 < 600; x0 = null;
      $('#lb-img').style.transform = '';
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) lbMostrar(lbI + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (dy > 90 && rapido && Math.abs(dy) > Math.abs(dx)) lbFechar();
    };
    palco.addEventListener('pointerup', fim); palco.addEventListener('pointercancel', () => { x0 = null; $('#lb-img').style.transform = ''; });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lb-proj]'); if (!b) return;
    e.preventDefault(); lbAbrir(b.dataset.lbProj, b.dataset.lbIdx, b);
  });

  /* ---------- Antes e depois ---------- */
  const comp = $('#comparador');
  if (comp) {
    const rng = $('input[type=range]', comp);
    const pos = v => { v = Math.max(0, Math.min(100, v)); comp.style.setProperty('--pos', v + '%'); rng.value = Math.round(v); rng.setAttribute('aria-valuetext', `${Math.round(v)}% do ano anterior visível`); };
    const deX = x => { const r = comp.getBoundingClientRect(); pos((x - r.left) / r.width * 100); };
    let arrastando = false, ini = null;
    comp.addEventListener('pointerdown', e => {
      arrastando = true; ini = { x: e.clientX, y: e.clientY, decidido: e.pointerType === 'mouse' };
      if (ini.decidido) { comp.setPointerCapture(e.pointerId); deX(e.clientX); }
    });
    comp.addEventListener('pointermove', e => {
      if (!arrastando) return;
      if (!ini.decidido) { // no toque, decide entre arrastar o controle ou rolar a página
        const dx = Math.abs(e.clientX - ini.x), dy = Math.abs(e.clientY - ini.y);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { arrastando = false; return; }
        ini.decidido = true; comp.setPointerCapture(e.pointerId);
      }
      deX(e.clientX);
    });
    const parar = e => { if (arrastando && ini && !ini.decidido && e.type === 'pointerup') deX(e.clientX); arrastando = false; };
    comp.addEventListener('pointerup', parar); comp.addEventListener('pointercancel', parar);
    rng.addEventListener('input', () => pos(+rng.value));
    pos(50);
    // troca do ano anterior
    $$('.anos button').forEach(b => b.addEventListener('click', () => {
      const ano = b.dataset.ano, arq = `serie_historica_${ano}`;
      $$('.anos button').forEach(x => x.setAttribute('aria-pressed', x === b));
      $('#src-antes').srcset = `${IMG}${arq}-480.webp 480w, ${IMG}${arq}-960.webp 960w`;
      const im = $('#img-antes');
      im.srcset = `${IMG}${arq}-480.jpg 480w, ${IMG}${arq}-960.jpg 960w`; im.src = `${IMG}${arq}-960.jpg`;
      im.alt = `O mesmo imóvel em ${ano}, para comparação.`;
      $('#rot-antes').textContent = ano; $('#ano-antes').textContent = ano;
    }));
  }

  /* ---------- Equipe ---------- */
  async function equipe() {
    const ga = $('#grade-areas'); if (!ga) return;
    const d = await json('equipe');
    ga.innerHTML = d.areas.map(a => `<li class="rv"><div class="area vidro"><span class="ci">${icone(a.icone)}</span>
      <div><h3>${esc(a.nome)}</h3><span class="cons">${esc(a.conselho)}</span><p>${esc(a.descricao)}</p></div></div></li>`).join('');
    const gp = $('#grade-pessoas'), pessoas = (d.pessoas || []).filter(p => p.nome);
    if (gp && pessoas.length) {
      gp.hidden = false;
      gp.innerHTML = pessoas.map(p => `<li class="pessoa vidro">${p.foto ? `<img src="${BASE}${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" width="64" height="64" loading="lazy">` : `<span class="mono" aria-hidden="true">${esc(p.nome.split(' ').map(x => x[0]).slice(0, 2).join(''))}</span>`}
        <div><h3>${esc(p.nome)}</h3><p>${esc([p.formacao, p.registro].filter(Boolean).join(' · '))}</p>${p.funcao ? `<p>${esc(p.funcao)}</p>` : ''}</div></li>`).join('');
    }
  }

  /* ---------- FAQ (acordeão nativo <details>) ---------- */
  async function faq() {
    const alvo = $('#lista-faq'); if (!alvo) return;
    const d = await json('faq');
    alvo.innerHTML = d.map((f, i) => `<details class="rv"><summary>${esc(f.pergunta)}${icone('chevron')}</summary><div class="resp"><p>${esc(f.resposta)}</p></div></details>`).join('');
    // fecha os outros ao abrir um
    $$('details', alvo).forEach(dt => dt.addEventListener('toggle', () => { if (dt.open) $$('details', alvo).forEach(o => o !== dt && (o.open = false)); }));
    // dados estruturados FAQPage
    const s = document.createElement('script'); s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: d.map(f => ({ '@type': 'Question', name: f.pergunta, acceptedAnswer: { '@type': 'Answer', text: f.resposta } })) });
    document.head.append(s);
  }

  /* ---------- Contato: tudo leva ao WhatsApp do Breno ---------- */
  let CT = null;
  const MSGS = {
    orcamento: c => c.mensagem_padrao,
    itr: () => 'Olá, Breno! Recebi um Termo de Intimação do ITR e preciso de um laudo técnico. Podemos conversar?',
    parceria: () => 'Olá, Breno! Sou profissional da área e tenho interesse em parceria técnica com a GeoDetec.',
    servico: (c, el) => `Olá, Breno! Vim pelo site da GeoDetec e gostaria de um orçamento de: ${el.dataset.servico}.`
  };
  function linkWa(c, texto) {
    const t = encodeURIComponent(texto || '');
    const pronto = (c.link_whatsapp || '').trim();
    if (pronto) {
      // link pronto do tipo wa.me/55... aceita texto; links curtos (wa.me/message/...) não
      if (/wa\.me\/\d+|api\.whatsapp\.com\/send/.test(pronto) && texto) return pronto + (pronto.includes('?') ? '&' : '?') + 'text=' + t;
      return pronto;
    }
    const num = String(c.whatsapp || '').replace(/[^\d]/g, '') || c.whatsapp;
    return `https://wa.me/${num}?text=${t}`;
  }
  async function contato() {
    try { CT = await json('contato'); } catch { return; }
    $$('[data-wa]').forEach(a => {
      const tipo = a.dataset.wa, msg = (MSGS[tipo] || MSGS.orcamento)(CT, a);
      a.href = linkWa(CT, msg); a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-ct]').forEach(el => {
      const k = el.dataset.ct, v = CT[k]; if (v === undefined) return;
      if (k === 'email') { el.textContent = v; if (!vazio(v)) el.href = `mailto:${v}`; else el.removeAttribute('href'); }
      else if (k === 'instagram') { const u = String(v).replace(/^@/, ''); el.textContent = vazio(v) ? v : '@' + u; if (!vazio(v)) el.href = `https://www.instagram.com/${u}/`; else el.removeAttribute('href'); }
      else el.textContent = v;
    });
    const btnV = $('#salvar-contato');
    if (btnV) btnV.addEventListener('click', () => {
      const tel = String(CT.whatsapp || '').replace(/[^\d]/g, '');
      const linhas = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${CT.responsavel} – GeoDetec`, `N:${CT.responsavel.split(' ').slice(-1)[0]};${CT.responsavel.split(' ')[0]};;;`,
        'ORG:GeoDetec – Soluções Geoespaciais e Ambientais', `TITLE:${CT.funcao}`];
      if (tel) linhas.push(`TEL;TYPE=CELL:+${tel}`);
      if (!vazio(CT.email)) linhas.push(`EMAIL:${CT.email}`);
      if (!vazio(CT.instagram)) linhas.push(`URL:https://www.instagram.com/${String(CT.instagram).replace(/^@/, '')}/`);
      linhas.push(`URL:${location.origin}${location.pathname.replace(/[^/]*$/, '')}`, 'END:VCARD');
      const url = URL.createObjectURL(new Blob([linhas.join('\r\n')], { type: 'text/vcard;charset=utf-8' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'Breno-GeoDetec.vcf' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }
  const form = $('#form-contato');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = form.elements; let ok = true;
    [['nome', 'e-nome', 'Informe seu nome.'], ['municipio', 'e-mun', 'Informe o município do imóvel ou da obra.']].forEach(([n, id, msg]) => {
      const vaz = !f[n].value.trim(); f[n].setAttribute('aria-invalid', vaz); $('#' + id).textContent = vaz ? msg : '';
      if (vaz && ok) { f[n].focus(); ok = false; }
    });
    if (!ok) return;
    if (!CT) await contato();
    const txt = [`Olá, Breno! Vim pelo site da GeoDetec.`, `Nome: ${f.nome.value.trim()}`, `Município: ${f.municipio.value.trim()}`,
      f.servico.value && `Serviço: ${f.servico.value}`, f.mensagem.value.trim() && `Mensagem: ${f.mensagem.value.trim()}`].filter(Boolean).join('\n');
    window.open(linkWa(CT || {}, txt), '_blank', 'noopener');
  });

  /* ---------- Início ---------- */
  const tarefas = [servicos(), projetos(), equipe(), faq(), contato()].map(p => p.catch(err => console.warn('[GeoDetec] não carregou:', err.message)));
  Promise.all(tarefas).then(() => { marcarPendencias(); revelar(); });
  revelar();
})();
