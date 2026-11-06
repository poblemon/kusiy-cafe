let THREE; // se carga aparte: si falla (p. ej. abriendo con file://), el resto de la web sigue funcionando

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Loader, nav ---------- */
const hideLoader = () => $('#loader').classList.add('done');
if (document.readyState === 'complete') setTimeout(hideLoader, reduce ? 0 : 1500);
else addEventListener('load', () => setTimeout(hideLoader, reduce ? 0 : 1500));
setTimeout(hideLoader, 4000); // seguro: nunca se queda trabado
const nav = $('#nav'), toggle = $('#navToggle'), menu = $('#menu');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
$$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }));
addEventListener('keydown', e => { if (e.key === 'Escape') menu.classList.remove('open'); });

/* ---------- Reveal + contadores ---------- */
function countUp(el) {
  const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  if (reduce) { el.innerHTML = pre + to + suf; return; }
  const t0 = performance.now(), dur = 1400;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.innerHTML = pre + Math.round(to * e).toLocaleString('es-PE') + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.dataset.count !== undefined) countUp(en.target);
  io.unobserve(en.target);
}), { threshold: .2 });
$$('.reveal, [data-count]').forEach(el => io.observe(el));

/* ---------- Tilt 3D en tarjetas ---------- */
if (!reduce && matchMedia('(hover:hover)').matches) {
  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg');
      el.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5)) * 14 + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ---------- Granos de café flotantes (hero) ---------- */
(function beans() {
  const c = $('#beans'), ctx = c.getContext('2d');
  let w, h, dpr, list = [], mx = 0, my = 0, visible = true;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 14 : 28;
    list = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, s: 10 + Math.random() * 26,
      a: Math.random() * 6.28, v: .2 + Math.random() * .6, z: .3 + Math.random() * .9, r: (Math.random() - .5) * .01
    }));
  };
  function bean(b) {
    const x = b.x + mx * 40 * b.z, y = b.y + my * 40 * b.z;
    ctx.save(); ctx.translate(x, y); ctx.rotate(b.a); ctx.globalAlpha = .18 + b.z * .35;
    ctx.fillStyle = b.z > .9 ? '#E3A93B' : '#8a5230';
    ctx.beginPath(); ctx.ellipse(0, 0, b.s * .72, b.s, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#2B1810'; ctx.lineWidth = Math.max(2, b.s * .1); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -b.s * .85); ctx.quadraticCurveTo(b.s * .35, 0, 0, b.s * .85); ctx.stroke();
    ctx.restore();
  }
  function frame() {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      for (const b of list) {
        if (!reduce) { b.y += b.v * b.z; b.a += b.r; if (b.y - b.s > h) { b.y = -b.s; b.x = Math.random() * w; } }
        bean(b);
      }
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(c);
  frame();
})();

/* ---------- Carta ---------- */
const MENU = {
  'Café caliente': [
    ['Espresso', 'Doble shot de Villa Rica, intenso y dulce.', 6.5],
    ['Americano', 'Espresso largo, limpio y aromático.', 8.5],
    ['Cortado', 'Espresso con un toque de leche texturizada.', 9.5],
    ['Cappuccino', 'Espuma sedosa, equilibrio perfecto.', 10.5],
    ['Latte', 'Suave y cremoso, el favorito de la tarde.', 11],
    ['Mocha de cacao peruano', 'Espresso, leche y cacao nativo.', 12.5],
    ['Filtrado V60 · Villa Rica', 'Notas a panela y cítricos, preparado al momento.', 12]
  ],
  'Café frío': [
    ['Cold Brew', 'Infusionado en frío 16 h. Cero amargor.', 12.5],
    ['Iced Latte', 'Espresso, leche fría y hielo.', 11.5],
    ['Iced Vanilla Latte', 'El de Valeria. Pídelo con leche de avena (+S/ 2.00).', 12.5, 'Favorito'],
    ['Espresso Tonic Cítrico', 'Espresso, agua tónica y cáscara de naranja.', 12]
  ],
  'Snacks sin octógonos': [
    ['Sándwich ligero · masa madre', 'Pollo, palta y rúcula. Pan del día.', 10.5],
    ['Sándwich caprese', 'Tomate, queso fresco y albahaca.', 11.5],
    ['Wrap proteico', 'Pollo, quinua, hojas verdes y salsa de yogur.', 12.5],
    ['Mini-brownie de quinua', 'Endulzado de forma natural.', 5.5],
    ['Galleta de avena y plátano', 'Sin azúcar refinada añadida.', 6],
    ['Torta de zanahoria', 'Con nueces y glaseado ligero.', 8]
  ],
  'Combos': [
    ['Combo Pausa', 'Latte + galleta de avena y plátano.', 14.5, 'Desde S/ 14.50', 1],
    ['Combo Valeria', 'Iced Vanilla Latte + sándwich ligero.', 16, 'Más pedido', 1],
    ['Combo Cargando', 'Cold Brew + wrap proteico.', 17, '', 1]
  ],
  'Para llevar': [
    ['Café Kusiy 250 g', 'Villa Rica, molido o en grano. Tostado en Lima.', 28],
    ['Recarga con tu Termo Kusiy', 'Trae tu termo: S/ 1.50 menos.', -1.5, 'Descuento']
  ]
};
const fmt = n => (n < 0 ? '−' : '') + 'S/ ' + Math.abs(n).toFixed(2);
const MILK = new Set(['Cortado', 'Cappuccino', 'Latte', 'Mocha de cacao peruano', 'Iced Latte', 'Iced Vanilla Latte']); // admiten leche de avena (+S/ 2.00)
const tabs = $('#tabs'), grid = $('#menuGrid');
function renderMenu(cat) {
  grid.innerHTML = MENU[cat].map(([n, d, p, badge, combo], i) => `
    <article class="item ${combo ? 'item--combo' : ''}" style="--i:${i}" data-i="${i}">
      <div class="item__top"><h3>${n}</h3><span class="price">${fmt(p)}</span></div>
      ${badge ? `<span class="badge">${badge}</span>` : ''}
      <p>${d}</p>
      ${p > 0 ? `<div class="item__buy">${MILK.has(n) ? '<label class="oat"><input type="checkbox"> Avena +S/ 2.00</label>' : ''}<button class="add" type="button" aria-label="Agregar ${n} al pedido">Agregar</button></div>` : ''}
    </article>`).join('');
  grid.dataset.cat = cat;
  $$('.tab', tabs).forEach(t => { const on = t.dataset.cat === cat; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
}
Object.keys(MENU).forEach((cat, i) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.role = 'tab'; b.dataset.cat = cat; b.textContent = cat;
  b.addEventListener('click', () => renderMenu(cat));
  b.addEventListener('keydown', e => {
    const all = $$('.tab', tabs), k = all.indexOf(b);
    const to = e.key === 'ArrowRight' ? all[(k + 1) % all.length] : e.key === 'ArrowLeft' ? all[(k - 1 + all.length) % all.length] : null;
    if (to) { to.focus(); to.click(); }
  });
  tabs.append(b);
});
renderMenu('Café caliente');
grid.addEventListener('click', e => {
  const btn = e.target.closest('.add'); if (!btn) return;
  const card = btn.closest('.item'), [n, , p] = MENU[grid.dataset.cat][+card.dataset.i];
  const oat = !!card.querySelector('.oat input')?.checked;
  addToCart(n, p, oat);
});

/* ---------- Pedido: carrito → WhatsApp (recojo en local) ---------- */
// Número de WhatsApp del local, con código de país y sin "+" ni espacios (ej. '51999999999').
// Mientras esté vacío, WhatsApp deja al cliente elegir el contacto; ponlo antes de publicar.
const WHATSAPP = '51928089927';
const OAT = 2;
const cart = new Map();
const money = n => 'S/ ' + n.toFixed(2);
const cartTotal = () => [...cart.values()].reduce((s, l) => s + l.price * l.qty, 0);
const cartCount = () => [...cart.values()].reduce((s, l) => s + l.qty, 0);
const sheet = $('#sheet'), sheetMsg = $('#sheetMsg');
let toastT;
function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1800);
}
function addToCart(name, price, oat = false) {
  const key = name + (oat ? '|avena' : '');
  const l = cart.get(key) || { name: name + (oat ? ' (leche de avena)' : ''), price: price + (oat ? OAT : 0), qty: 0 };
  l.qty++; cart.set(key, l); renderCart(); toast(name + ' agregado al pedido');
}
function renderCart() {
  const n = cartCount();
  $('#cartBar').hidden = n === 0; document.body.classList.toggle('has-cart', n > 0);
  $('#cartCount').textContent = n + (n === 1 ? ' producto' : ' productos');
  $('#cartTotal').textContent = money(cartTotal());
  $('#sheetTotal').textContent = money(cartTotal());
  $('#cartList').innerHTML = [...cart.entries()].map(([k, l]) => `
    <li><span>${l.name}</span>
      <span class="qty"><button type="button" data-k="${k}" data-d="-1" aria-label="Quitar uno de ${l.name}">−</button><b>${l.qty}</b><button type="button" data-k="${k}" data-d="1" aria-label="Agregar uno más de ${l.name}">+</button></span>
      <span>${money(l.price * l.qty)}</span></li>`).join('');
  if (n === 0 && sheet.open) sheet.close();
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('button[data-k]'); if (!b) return;
  const l = cart.get(b.dataset.k); l.qty += +b.dataset.d;
  if (l.qty <= 0) cart.delete(b.dataset.k);
  sheetMsg.textContent = ''; renderCart();
  $(`#cartList button[data-k="${b.dataset.k}"][data-d="${b.dataset.d}"]`)?.focus();
});
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
function orderText() {
  const name = $('#custName').value.trim(), note = $('#note').value.trim();
  return ['Hola Kusiy, quiero hacer un pedido para recoger en el local:',
    ...[...cart.values()].map(l => `• ${l.qty}× ${l.name} — ${money(l.price * l.qty)}`),
    'Total: ' + money(cartTotal()),
    name && 'Nombre: ' + name,
    'Paso a recogerlo en: ' + $('#pickup').value + ' min',
    note && 'Nota: ' + note,
    '(Pedido desde la web)'].filter(Boolean).join('\n');
}
$('#cartOpen').addEventListener('click', () => { sheetMsg.textContent = ''; sheet.showModal(); });
$('#sheetClose').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
$('#clearCart').addEventListener('click', () => { cart.clear(); renderCart(); });
$('#sendWa').addEventListener('click', () => {
  if (!cart.size) return;
  window.open(waLink(orderText()), '_blank', 'noopener');
  sheetMsg.textContent = 'Se abrió WhatsApp: envía el mensaje para que Kusiy confirme tu pedido.';
});
$('#copyOrder').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(orderText()); sheetMsg.textContent = 'Pedido copiado. Pégalo en WhatsApp.'; }
  catch { sheetMsg.textContent = 'No pude copiar automáticamente: usa «Enviar pedido por WhatsApp».'; }
});
$('#b2bBtn').href = waLink('Hola Kusiy, quiero cotizar un Coffee Break para mi oficina/clínica/universidad.\nSomos ___ personas.\nFecha: ___\nHorario: ___');
renderCart();

/* ---------- Kusiy Club: sellos ---------- */
const stamps = $('#stamps');
for (let i = 1; i <= 7; i++) {
  const b = document.createElement('button');
  b.className = 'stamp'; b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', i === 7 ? 'Sello 7: café gratis' : 'Sello ' + i);
  b.textContent = i === 7 ? '☕' : '✺';
  b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'));
  stamps.append(b);
}

/* ---------- Valeria 3D ---------- */
const HOT = [
  { t: 'Lo que le gusta', d: 'Aroma a café peruano recién molido, música lo-fi/indie a volumen moderado e iluminación cálida. Que el barista la salude por su nombre.', p: [.62, 1.35, .15] },
  { t: 'Su pedido de siempre', d: 'Iced Vanilla Latte con leche de avena y un sándwich ligero sin octógonos. En Kusiy: Combo Valeria a S/ 16.00.', p: [1.05, .1, 1.15] },
  { t: 'Su dolor: batería y Wi-Fi', d: '76% de los encuestados sufre de “horas hueco” sin enchufe libre. Aquí: tomacorrientes dobles + USB-C en cada mesa y fibra de 1 Gbps.', p: [0, .4, .95] },
  { t: 'Cómo decide y paga', d: 'Lee reseñas y fotos en Google Maps antes de entrar, mira menús por QR y paga siempre con Yape o Apple Pay.', p: [-.95, -.2, 1.05] },
  { t: 'Su horario', d: 'Practicante de 8:30 a 2:30 p.m. y clases de 4:00 a 8:30 p.m. Entre 2:45 y 4:00 necesita su refugio productivo.', p: [0, .5, -.75] }
];

function initValeria() {
  const canvas = $('#valeria3d'), stage = $('#stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { $('#stageFallback').hidden = false; canvas.hidden = true; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 1.0, 6.4); camera.lookAt(0, .55, 0);

  scene.add(new THREE.HemisphereLight(0xfff1dc, 0xc88f5a, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(3, 5, 4); scene.add(sun);

  const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, ...o });
  const M = {
    skin: toon(0xe3a77c), hair: toon(0x2a1710), jacket: toon(0xd9552b), shirt: toon(0xf4e8d4),
    gold: toon(0xe3a93b), wood: toon(0x7a4a2a), dark: toon(0x1d1d1d), bag: toon(0x3f6b4a),
    cup: toon(0xf1dcb8, { transparent: true, opacity: .92 }), lid: toon(0xffffff, { transparent: true, opacity: .7 }),
    lap: toon(0xc9ccd1), phone: toon(0x742284), cheek: toon(0xf0907a), jeans: toon(0x34527a)
  };
  const mesh = (geo, mat, pos = [0, 0, 0], parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); (parent || root).add(m); return m; };
  const root = new THREE.Group(); scene.add(root);

  // suelo/sombra
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.1, 40), new THREE.MeshBasicMaterial({ color: 0x2b1810, transparent: true, opacity: .18 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.48; root.add(shadow);

  // cuerpo
  mesh(new THREE.CapsuleGeometry(.52, .6, 8, 20), M.jacket, [0, -.05, 0]);
  mesh(new THREE.CylinderGeometry(.17, .2, .22, 16), M.skin, [0, .78, 0]);
  mesh(new THREE.TorusGeometry(.2, .05, 8, 24), M.shirt, [0, .72, .02]).rotation.x = Math.PI / 2;
  // mochila
  mesh(new THREE.BoxGeometry(.95, 1.1, .38), M.bag, [0, .05, -.5]);
  mesh(new THREE.BoxGeometry(.6, .35, .1), toon(0x2f5339), [0, -.1, -.72]);
  [-.28, .28].forEach(x => mesh(new THREE.BoxGeometry(.1, .9, .06), M.dark, [x, .2, .26]));

  // cabeza
  const head = new THREE.Group(); head.position.set(0, 1.28, 0); root.add(head);
  mesh(new THREE.SphereGeometry(.52, 32, 32), M.skin, [0, 0, 0], head);
  const cap = mesh(new THREE.SphereGeometry(.56, 32, 24, 0, Math.PI * 2, 0, Math.PI * .56), M.hair, [0, .03, -.04], head); cap.rotation.x = -.25;
  mesh(new THREE.SphereGeometry(.5, 24, 24), M.hair, [0, -.15, -.2], head).scale.set(1, 1.15, .75);
  mesh(new THREE.SphereGeometry(.2, 20, 20), M.hair, [0, .62, -.12], head);
  // flequillo
  const fr = mesh(new THREE.SphereGeometry(.54, 24, 16, Math.PI * .1, Math.PI * .8, Math.PI * .22, Math.PI * .22), M.hair, [0, .05, .03], head); fr.rotation.x = .05;
  // ojos
  const eyes = [-.19, .19].map(x => { const e = mesh(new THREE.SphereGeometry(.065, 16, 16), M.dark, [x, .05, .47], head); e.scale.z = .6; mesh(new THREE.SphereGeometry(.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), [.02, .025, .05], e); return e; });
  [-.19, .19].forEach(x => { const b = mesh(new THREE.BoxGeometry(.16, .025, .03), M.hair, [x, .19, .48], head); b.rotation.z = x < 0 ? .12 : -.12; });
  [-.3, .3].forEach(x => { const c = mesh(new THREE.CircleGeometry(.075, 20), new THREE.MeshBasicMaterial({ color: 0xf0907a, transparent: true, opacity: .55 }), [x, -.08, .445], head); c.rotation.y = x * .9; });
  const smile = mesh(new THREE.TorusGeometry(.12, .02, 8, 20, Math.PI), toon(0x8e2f1f), [0, -.13, .5], head); smile.rotation.z = Math.PI;
  // audífonos
  const hp = mesh(new THREE.TorusGeometry(.58, .045, 10, 40, Math.PI), M.gold, [0, .02, 0], head); hp.rotation.y = Math.PI / 2; hp.rotation.z = Math.PI * .0;
  [-.57, .57].forEach(x => mesh(new THREE.CylinderGeometry(.17, .17, .12, 24), M.gold, [x, .0, 0], head).rotation.z = Math.PI / 2);

  // brazos
  const armR = new THREE.Group(); armR.position.set(-.62, .4, 0); root.add(armR);
  mesh(new THREE.CapsuleGeometry(.14, .55, 6, 12), M.jacket, [0, -.4, 0], armR);
  mesh(new THREE.SphereGeometry(.15, 16, 16), M.skin, [0, -.82, 0], armR);
  const armL = new THREE.Group(); armL.position.set(.62, .4, 0); root.add(armL);
  mesh(new THREE.CapsuleGeometry(.14, .55, 6, 12), M.jacket, [0, -.4, 0], armL);
  mesh(new THREE.SphereGeometry(.15, 16, 16), M.skin, [0, -.82, 0], armL);

  // mesa
  mesh(new THREE.BoxGeometry(3.6, .14, 1.5), M.wood, [0, -.45, 1.05]);
  [[-1.65, .5], [1.65, .5], [-1.65, 1.65], [1.65, 1.65]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.07, .07, 1.1, 10), M.dark, [x, -1.0, z]));
  // laptop (tapa hacia nosotros, con sticker de grano)
  const lap = new THREE.Group(); lap.position.set(0, -.37, .95); root.add(lap);
  mesh(new THREE.BoxGeometry(1.2, .05, .8), M.lap, [0, 0, 0], lap);
  const lid = new THREE.Group(); lid.position.set(0, .03, -.38); lap.add(lid); lid.rotation.x = .28;
  mesh(new THREE.BoxGeometry(1.2, .78, .04), M.lap, [0, .39, 0], lid);
  const st = mesh(new THREE.CircleGeometry(.14, 24), toon(0xd9552b), [0, .4, .025], lid); st.rotation.y = Math.PI; st.position.z = .025;
  const stk = mesh(new THREE.CircleGeometry(.14, 24), toon(0xd9552b), [0, .4, .025], lid); stk.rotation.y = Math.PI; stk.position.z = .025;
  // vaso iced latte
  const cupG = new THREE.Group(); cupG.position.set(1.05, -.38, 1.15); root.add(cupG);
  mesh(new THREE.CylinderGeometry(.2, .15, .5, 24), M.cup, [0, .25, 0], cupG);
  mesh(new THREE.CylinderGeometry(.19, .19, .16, 24), toon(0xb88a5c), [0, .1, 0], cupG);
  mesh(new THREE.SphereGeometry(.21, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.lid, [0, .5, 0], cupG);
  const straw = mesh(new THREE.CylinderGeometry(.018, .018, .5, 8), M.gold, [.04, .72, 0], cupG); straw.rotation.z = -.2;
  // celular Yape
  const ph = mesh(new THREE.BoxGeometry(.32, .03, .6), M.phone, [-.95, -.37, 1.05]); ph.rotation.y = .4;
  mesh(new THREE.BoxGeometry(.26, .005, .5), toon(0x00d4c8), [0, .018, 0], ph);

  // anclas de hotspots (en el grupo -> rotan con el personaje)
  const hs = $('#hotspots'), info = $('#hotInfo');
  const anchors = HOT.map((h, i) => {
    const a = new THREE.Object3D(); a.position.set(...h.p); root.add(a);
    const b = document.createElement('button');
    b.textContent = i + 1; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `Dato ${i + 1}: ${h.t}`);
    b.addEventListener('click', e => {
      e.stopPropagation();
      $$('button', hs).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
      info.innerHTML = `<h3></h3><p></p>`; $('h3', info).textContent = h.t; $('p', info).textContent = h.d;
    });
    b.addEventListener('pointerdown', e => e.stopPropagation());
    hs.append(b); return { a, b };
  });

  // interacción: arrastrar para girar, mirar al puntero
  let vel = 0, drag = false, lastX = 0, targetRot = .0, mouse = { x: 0, y: 0 }, hovering = false, calm = 1;
  stage.addEventListener('pointerenter', () => hovering = true);
  stage.addEventListener('pointerleave', () => hovering = false);
  stage.addEventListener('focusin', () => hovering = true);
  stage.addEventListener('focusout', () => hovering = false);
  stage.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointerup', () => drag = false);
  stage.addEventListener('pointercancel', () => drag = false);
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width - .5) * 2; mouse.y = ((e.clientY - r.top) / r.height - .5) * 2;
    if (drag) { vel = (e.clientX - lastX) * .012; targetRot += vel; lastX = e.clientX; }
  });
  stage.addEventListener('pointerleave', () => { mouse.x = mouse.y = 0; });
  stage.tabIndex = 0;
  stage.setAttribute('aria-label', 'Escena 3D de Valeria. Usa las flechas izquierda y derecha para girarla.');
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') targetRot -= .3; if (e.key === 'ArrowRight') targetRot += .3; });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < .95 ? 7.4 : 6.4; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  let visible = false, nextBlink = 2, blinkT = -1;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(stage);
  const tStart = performance.now(), v = new THREE.Vector3();
  function loop() {
    if (!visible) return;
    const t = (performance.now() - tStart) / 1000;
    if (!reduce) {
      calm += ((hovering ? 0 : 1) - calm) * .12;   // se detiene al acercar el puntero para poder tocar los puntos
      root.rotation.y += (targetRot + Math.sin(t * .6) * .18 * calm - root.rotation.y) * .08;
      root.position.y = Math.sin(t * 2) * .03 * calm;
      armR.rotation.z = -2.45 + Math.sin(t * 6) * .3;
      armL.rotation.set(-1.15 + Math.sin(t * 1.4) * .04, 0, -.12);
      head.rotation.y += (mouse.x * .55 - head.rotation.y) * .1;
      head.rotation.x += (mouse.y * .25 - head.rotation.x) * .1;
      straw.rotation.z = -.2 + Math.sin(t * 2) * .03;
      if (t > nextBlink && blinkT < 0) { blinkT = t; nextBlink = t + 2.5 + Math.random() * 2.5; }
      const bl = blinkT >= 0 ? Math.max(0, 1 - Math.abs((t - blinkT) / .08 - 1)) : 0;
      if (blinkT >= 0 && t - blinkT > .16) blinkT = -1;
      eyes.forEach(e => e.scale.y = 1 - bl * .9);
    } else {
      root.rotation.y += (targetRot - root.rotation.y) * .15;
      armR.rotation.z = -2.45; armL.rotation.set(-1.15, 0, -.12);
      head.rotation.y = 0;
    }
    anchors.forEach(({ a, b }) => {
      a.getWorldPosition(v); const front = v.z > -.2 || true; v.project(camera);
      b.style.left = ((v.x * .5 + .5) * stage.clientWidth) + 'px';
      b.style.top = ((-v.y * .5 + .5) * stage.clientHeight) + 'px';
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
}
/* ---------- Vitrina de cafés: swipe + 3D que gira ---------- */
const FLAT = Object.values(MENU).flat();
// Diseño de cada café: vaso, colores del líquido y fondo (c = degradado de la sección)
const DRINKS = [
  { n: 'Espresso', v: 'ceramic', o: { r: .55, h: .62, art: 'crema' }, lq: '#3a1c0d', c: ['#8a4a22', '#2B1810'], ing: ['Espresso doble', 'Caliente'] },
  { n: 'Americano', v: 'paper', o: {}, lq: '#2b1408', c: ['#3F6B4A', '#16241a'], ing: ['Espresso largo', 'Agua caliente', 'Vaso doble pared'] },
  { n: 'Cappuccino', v: 'ceramic', o: { r: .72, h: .8, art: 'rosetta' }, lq: '#8d5530', c: ['#B23C17', '#2B1810'], ing: ['Espresso', 'Leche texturizada', 'Espuma sedosa'] },
  { n: 'Latte', v: 'ceramic', o: { r: .76, h: .78, art: 'heart' }, lq: '#b98a5c', c: ['#c28a1f', '#2B1810'], ing: ['Espresso', 'Leche', 'Suave y cremoso'], tag: 'Favorito de la tarde' },
  { n: 'Mocha de cacao peruano', v: 'ceramic', o: { r: .74, h: .8, art: 'cocoa', whip: true }, lq: '#4a2410', c: ['#6b3a1f', '#1b0f09'], ing: ['Espresso', 'Leche', 'Cacao nativo'] },
  { n: 'Cold Brew', v: 'glass', o: { layers: [['#1a0d06', .96, 1]], ice: 7, straw: '#E3A93B' }, lq: '#1a0d06', c: ['#2f5a66', '#101d22'], ing: ['Infusión en frío 16 h', 'Hielo', 'Frío'] },
  { n: 'Iced Vanilla Latte', v: 'glass', o: { layers: [['#f2e4cc', .95, .34], ['#c9a273', .93, .34], ['#4a2a18', .95, .32]], ice: 6, straw: '#E3A93B' }, lq: '#c9a273', c: ['#EE7A4B', '#7d2910'], ing: ['Espresso', 'Leche', 'Vainilla', 'Frío'], tag: 'Favorito' },
  { n: 'Espresso Tonic Cítrico', v: 'glass', o: { layers: [['#e8d98a', .55, .62], ['#2b1408', .92, .38]], ice: 6, straw: '#EE7A4B', orange: true }, lq: '#e8d98a', c: ['#C97F12', '#3b2208'], ing: ['Espresso', 'Agua tónica', 'Cáscara de naranja', 'Frío'] }
];
DRINKS.forEach(d => { const it = FLAT.find(x => x[0] === d.n); d.d = it[1]; d.p = it[2]; d.milk = MILK.has(d.n); });

const show = (() => {
  const stage = $('#showStage'), section = $('#cafes');
  let idx = 0, view = null, dragging = false, sx = 0, dx = 0, t0 = 0;
  const dots = $('#showDots');
  DRINKS.forEach((d, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ver ' + d.n);
    b.addEventListener('click', () => go(i)); dots.append(b);
  });
  function setInfo() {
    const d = DRINKS[idx];
    section.style.setProperty('--c1', d.c[0]); section.style.setProperty('--c2', d.c[1]);
    $('#showName').textContent = d.n; $('#showDesc').textContent = d.d;
    $('#showPrice').textContent = fmt(d.p);
    const tag = $('#showTag'); tag.hidden = !d.tag; tag.textContent = d.tag || '';
    $('#showChips').innerHTML = d.ing.map(t => `<li>${t}</li>`).join('');
    $('#showOatWrap').hidden = !d.milk; $('#showOat').checked = false;
    $('#showAdd').setAttribute('aria-label', 'Agregar ' + d.n + ' al pedido');
    $('#showCount').textContent = (idx + 1) + ' de ' + DRINKS.length;
    $('#showPrev').disabled = idx === 0; $('#showNext').disabled = idx === DRINKS.length - 1;
    [...dots.children].forEach((b, i) => b.setAttribute('aria-current', i === idx));
    const f = $('#showFallback');
    if (!f.hidden) f.innerHTML = `<svg viewBox="0 0 200 220" role="img" aria-label="${d.n}"><path d="M30 40H170L156 190Q154 210 134 210H66Q46 210 44 190Z" fill="#F4E8D4"/><path d="M36 70H164L156 190Q154 210 134 210H66Q46 210 44 190Z" fill="${d.lq}"/><ellipse cx="100" cy="40" rx="70" ry="12" fill="#2B1810"/><ellipse cx="100" cy="40" rx="60" ry="8" fill="${d.lq}"/></svg>`;
  }
  function go(i) {
    idx = Math.max(0, Math.min(DRINKS.length - 1, i));
    setInfo(); view?.set(idx);
  }
  $('#showPrev').addEventListener('click', () => go(idx - 1));
  $('#showNext').addEventListener('click', () => go(idx + 1));
  $('#showAdd').addEventListener('click', () => { const d = DRINKS[idx]; addToCart(d.n, d.p, d.milk && $('#showOat').checked); });
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    dragging = true; sx = e.clientX; dx = 0; t0 = performance.now(); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return; dx = e.clientX - sx;
    if ((idx === 0 && dx > 0) || (idx === DRINKS.length - 1 && dx < 0)) dx *= .3; // resistencia en los extremos
    view?.drag(dx / stage.clientWidth);
  });
  const end = cancel => {
    if (!dragging) return; dragging = false;
    const v = dx / Math.max(1, performance.now() - t0);
    if (!cancel && (dx < -45 || v < -.4)) go(idx + 1);
    else if (!cancel && (dx > 45 || v > .4)) go(idx - 1);
    else go(idx);
  };
  stage.addEventListener('pointerup', () => end(false));
  stage.addEventListener('pointercancel', () => end(true));
  setInfo();
  return { get idx() { return idx; }, attach(v) { view = v; $('#showFallback').hidden = true; view.set(idx); }, fallback() { $('#showCanvas').hidden = true; $('#showFallback').hidden = false; setInfo(); } };
})();

async function initShowcase() {
  const stage = $('#showStage'), canvas = $('#showCanvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { show.fallback(); return; }
  try { await document.fonts.load('800 60px Fraunces'); } catch {}
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  const SP = 4.8;
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x7a4a2a, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.position.set(3, 6, 4); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xffd9a8, 1.2); rim.position.set(-4, 3, -3); scene.add(rim);

  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: 0, ...o });
  const lathe = (pts, m, seg = 64) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), m);
  const tex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  function art(kind) {
    return tex(256, 256, x => {
      x.translate(128, 128);
      const g = x.createRadialGradient(0, 0, 8, 0, 0, 128);
      if (kind === 'crema') { g.addColorStop(0, '#d49a5c'); g.addColorStop(.65, '#a8672f'); g.addColorStop(1, '#5a3018'); x.fillStyle = g; x.fillRect(-128, -128, 256, 256); x.strokeStyle = 'rgba(255,225,180,.3)'; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, 62, 0, 6.3); x.stroke(); return; }
      if (kind === 'cocoa') { g.addColorStop(0, '#5a2e16'); g.addColorStop(1, '#2e1608'); x.fillStyle = g; x.fillRect(-128, -128, 256, 256); return; }
      g.addColorStop(0, '#7a4424'); g.addColorStop(.7, '#8d5530'); g.addColorStop(1, '#ecd9bb'); x.fillStyle = g; x.fillRect(-128, -128, 256, 256);
      x.fillStyle = '#f7ead2';
      if (kind === 'heart') { x.beginPath(); x.moveTo(0, 78); x.bezierCurveTo(-100, 8, -62, -78, 0, -28); x.bezierCurveTo(62, -78, 100, 8, 0, 78); x.fill(); }
      else { for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(0, -62 + i * 26, 74 - i * 9, 17, 0, 0, 6.3); x.fill(); } x.strokeStyle = '#7a4424'; x.lineWidth = 5; x.beginPath(); x.moveTo(0, -80); x.lineTo(0, 84); x.stroke(); }
    });
  }
  const label = (bg, fg) => tex(512, 256, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '800 92px Fraunces, Georgia, serif'; x.fillText('Kusiy', w * .5, h * .46);
    x.font = '600 30px Outfit, sans-serif'; x.fillText('✺  la alegría de tomar café  ✺', w * .5, h * .78);
  });

  function ceramic({ r = .7, h = .75, art: a = 'crema', whip = false }) {
    const g = new THREE.Group(), cer = std(0xf6ede0, { roughness: .18, side: THREE.DoubleSide });
    const sc = lathe([[.01, 0], [r * 1.2, 0], [r * 1.55, .06], [r * 1.58, .09], [r * 1.5, .09], [r * 1.1, .035], [.01, .035]], cer); g.add(sc);
    const cup = new THREE.Group(); cup.position.y = .06; g.add(cup);
    cup.add(lathe([[.01, 0], [r * .55, 0], [r * .62, .05], [r * .95, h * .92], [r, h], [r - .05, h], [r * .9, h * .9], [r * .58, .14], [.01, .14]], cer));
    const rAt = y => lerp(r * .62, r * .95, (y - .05) / (h * .92 - .05));
    const y0 = h * .3, y1 = h * .42;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1) + .006, rAt(y0) + .006, y1 - y0, 56, 1, true), std(0xd9552b, { side: THREE.DoubleSide })); band.position.y = (y0 + y1) / 2; cup.add(band);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(h * .27, .045, 12, 28, Math.PI), cer); handle.rotation.z = -Math.PI / 2; handle.position.set(r * .9, h * .55, 0); cup.add(handle);
    const yL = h * .82, rin = lerp(r * .58, r * .9, (yL - .14) / (h * .9 - .14)) - .01;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(rin, 48), new THREE.MeshStandardMaterial({ map: art(a), roughness: .5 })); disc.rotation.x = -Math.PI / 2; disc.position.y = yL; cup.add(disc);
    if (whip) {
      [[rin * .78, .12, .2], [rin * .56, .2, .3], [rin * .34, .27, .4]].forEach(([rr, ry, yy]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(rr, 24, 16), std(0xfff8ec, { roughness: .7 })); s.scale.y = .55; s.position.y = yL + yy * .6; cup.add(s); });
      for (let i = 0; i < 9; i++) { const n = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, .03), std(0x3a1c0d)); const a2 = rnd() * 6.28, rr = rnd() * rin * .5; n.position.set(Math.cos(a2) * rr, yL + .32 + rnd() * .05, Math.sin(a2) * rr); n.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); cup.add(n); }
    }
    return g;
  }

  function glass({ layers, ice = 6, straw = '#E3A93B', orange = false }) {
    const g = new THREE.Group(), h = 1.55, r = .43, top = h * .82, base = .14;
    const gl = lathe([[.01, 0], [r * .9, 0], [r * .93, .03], [r, .1], [r + .005, h], [r - .035, h], [r - .03, base], [.01, base]], std(0xe6f3f3, { transparent: true, opacity: .12, roughness: .04, side: THREE.DoubleSide, depthWrite: false }));
    gl.renderOrder = 3; g.add(gl);
    let y = base; const total = top - base;
    layers.forEach(([c, o, f]) => {
      const lh = total * f, m = new THREE.Mesh(new THREE.CylinderGeometry(r - .036, r - .036, lh, 40), std(c, { transparent: true, opacity: o, roughness: .3, emissive: c, emissiveIntensity: .28 }));
      m.position.y = y + lh / 2; y += lh; g.add(m);
    });
    for (let i = 0; i < ice; i++) {
      const s = .2 + rnd() * .06, cube = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), std(0xffffff, { transparent: true, opacity: .4, roughness: .05, depthWrite: false }));
      const a2 = rnd() * 6.28, rr = rnd() * (r - .2);
      cube.position.set(Math.cos(a2) * rr, top - .2 + rnd() * .3, Math.sin(a2) * rr); cube.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); cube.renderOrder = 4; g.add(cube);
    }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, h * 1.25, 10), std(straw)); st.position.set(.1, h * .6, .05); st.rotation.z = -.14; g.add(st);
    if (orange) {
      const w = new THREE.Group(); w.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .035, 32), std(0xe8821e)));
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .04, 32), std(0xffb64d)); w.add(inner);
      w.position.set(r * .8, h - .02, 0); w.rotation.set(Math.PI / 2 * .0, 0, .9); w.rotation.x = 1.2; g.add(w);
    }
    return g;
  }

  function paper() {
    const g = new THREE.Group(), h = 1.4;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.52, .4, h, 56, 1, true), std(0xfaf3e6, { side: THREE.DoubleSide, roughness: .6 })); body.position.y = h / 2; g.add(body);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.4, 40), std(0xfaf3e6)); bottom.rotation.x = Math.PI / 2; bottom.position.y = .001; g.add(bottom);
    const t = label('#D9552B', '#F4E8D4'); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 1;
    const y0 = .38, y1 = .98, rA = y => lerp(.4, .52, y / h);
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(rA(y1) + .012, rA(y0) + .012, y1 - y0, 56, 1, true), new THREE.MeshStandardMaterial({ map: t, roughness: .7, side: THREE.DoubleSide })); sl.position.y = (y0 + y1) / 2; g.add(sl);
    const lid = std(0x2b1810, { roughness: .45 });
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(.56, .54, .1, 56), lid); l1.position.y = h + .02; g.add(l1);
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(.46, .54, .1, 56), lid); l2.position.y = h + .1; g.add(l2);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(.2, .05, .13), lid); tab.position.set(.3, h + .16, 0); g.add(tab);
    return g;
  }

  const BUILD = { ceramic, glass, paper };
  const SCALE = { ceramic: 1.15, glass: 1.3, paper: 1.2 };
  const items = DRINKS.map((d, i) => {
    const holder = new THREE.Group(), spin = new THREE.Group();
    spin.add(BUILD[d.v](d.o)); holder.add(spin); holder.scale.setScalar(SCALE[d.v]); holder.position.x = i * SP; scene.add(holder);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), new THREE.MeshBasicMaterial({ color: 0x1b0f09, transparent: true, opacity: .28 })); sh.rotation.x = -Math.PI / 2; sh.position.y = -.005; holder.add(sh);
    return { holder, spin, kick: 0 };
  });

  let cur = 0, target = 0, visible = false, last = performance.now();
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const z = w / h < 1 ? 6.2 : 5.9; camera.position.set(0, z * .6, z); camera.lookAt(0, .72, 0); camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  function loop(now) {
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    cur += (target - cur) * (1 - Math.exp(-dt * (reduce ? 60 : 9)));
    items.forEach((it, i) => {
      const x = i * SP + cur; it.holder.position.x = x;
      const near = Math.abs(x) < SP * 1.1; it.holder.visible = near;
      if (!near) return;
      if (!reduce) { it.kick *= Math.exp(-dt * 2.2); it.spin.rotation.y += dt * (.75 + it.kick); it.holder.position.y = Math.sin(now / 900 + i) * .03; }
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(loop); } }).observe(stage);
  if (reduce) items.forEach(it => it.spin.rotation.y = .6);

  show.attach({
    set(i) { target = -i * SP; if (items[i]) items[i].kick = 7; },
    drag(f) { target = -show.idx * SP + f * SP * .95; }
  });
}

import('./vendor/three.module.js')
  .then(m => { THREE = m; initValeria(); initShowcase(); })
  .catch(() => {
    const f = $('#stageFallback'), c = $('#valeria3d'); if (f) f.hidden = false; if (c) c.hidden = true;
    show.fallback();
  });

