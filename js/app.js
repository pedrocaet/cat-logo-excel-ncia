// ── INIT ──────────────────────────────────────
function init() {
  renderSidebarNav();
  renderCatTiles();
}

// ── SIDEBAR NAV ───────────────────────────────
function renderSidebarNav() {
  const catCounts = {};
  PRODUCTS.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });

  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '<div class="nav-label">Categorias</div>';

  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const count = catCounts[key] || 0;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.cat = key;
    item.onclick = () => showCategory(key);
    item.innerHTML = `
      <span class="nav-icon">${cat.icon}</span>
      <span>${cat.label}</span>
      <span class="nav-count">${count}</span>
    `;
    nav.appendChild(item);
  });
}

function setActiveNav(cat) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
}

// ── HOME VIEW ─────────────────────────────────
function showHome() {
  currentCategory = null;
  document.getElementById('viewHome').style.display = '';
  document.getElementById('viewCategory').style.display = 'none';
  setActiveNav(null);
  if (window.innerWidth <= 900) closeSidebar();
  window.scrollTo(0, 0);
}

function renderCatTiles() {
  const catCounts = {};
  PRODUCTS.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });

  const container = document.getElementById('catTiles');
  container.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const count = catCounts[key] || 0;
    const tile = document.createElement('div');
    tile.className = 'cat-tile';
    tile.onclick = () => showCategory(key);
    tile.innerHTML = `
      <div class="cat-tile-icon">${cat.icon}</div>
      <div class="cat-tile-name">${cat.label}</div>
      <div class="cat-tile-count">${count} peças</div>
    `;
    container.appendChild(tile);
  });
}

// ── CATEGORY VIEW ─────────────────────────────
function showCategory(catKey) {
  currentCategory = catKey;
  const cat = CATEGORIES[catKey];
  const products = PRODUCTS.filter(p => p.category === catKey);

  document.getElementById('viewHome').style.display = 'none';
  document.getElementById('viewCategory').style.display = '';
  setActiveNav(catKey);
  if (window.innerWidth <= 900) closeSidebar();

  // Header
  document.getElementById('catHeader').innerHTML = `
    <span class="cat-header-icon">${cat.icon}</span>
    <div class="cat-header-info">
      <h2>${cat.label}</h2>
      <p>${cat.desc}</p>
    </div>
    <span class="cat-header-count">${products.length} peças</span>
  `;

  // Grid
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (p.esgotado ? ' esgotado' : '');
    card.onclick = () => openProduct(p.id);

    let imgHTML;
    if (p.image) {
      imgHTML = `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML=placeholderHTML('${cat.icon}')">`;
    } else {
      imgHTML = placeholderHTML(cat.icon);
    }

    card.innerHTML = `
      <div class="product-img">
        ${imgHTML}
        ${p.esgotado ? '<div class="esgotado-badge">Esgotado</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-ref">Ref. ${p.ref}</div>
        ${p.sizes ? `<div class="product-sizes">Tamanhos: ${p.sizes}</div>` : ''}
        ${p.price ? `<div class="product-price">R$ ${p.price}</div>` : `<div class="product-price-tbd">Consultar preço</div>`}
      </div>
      ${!p.esgotado ? `<button class="btn-add" onclick="event.stopPropagation(); quickAdd('${p.id}')">Adicionar ao pedido</button>` : ''}
    `;
    grid.appendChild(card);
  });

  window.scrollTo(0, 0);
}

function placeholderHTML(icon) {
  return `<div class="product-img-placeholder"><div class="ph-icon">${icon}</div><div>Sem imagem</div></div>`;
}

// ── PRODUCT MODAL ─────────────────────────────
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const cat = CATEGORIES[p.category] || {};

  document.getElementById('modalImg').innerHTML = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;opacity:.3">${cat.icon||'👙'}</div>`;

  const sizes = p.sizes ? p.sizes.split('/').filter(Boolean) : [];
  selectedSize = sizes.length === 1 ? sizes[0] : null;

  let sizesHTML = '';
  if (sizes.length > 0) {
    sizesHTML = `
      <div>
        <div class="size-label">Tamanho</div>
        <div class="size-buttons" id="sizeBtns">
          ${sizes.map(s => `<button class="size-btn${selectedSize===s?' selected':''}" onclick="selectSize('${s}')">${s}</button>`).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-cat">${cat.label || p.category}</div>
    <div class="modal-name">${p.name}</div>
    <div class="modal-ref">Ref. ${p.ref}</div>
    <hr class="modal-divider">
    ${p.price ? `<div class="modal-price">R$ ${p.price}</div>` : `<div class="modal-price-tbd">Preço sob consulta — confirme via WhatsApp</div>`}
    ${sizesHTML}
    <button class="modal-add-btn" id="modalAddBtn" onclick="addToCartFromModal('${id}')" ${p.esgotado ? 'disabled' : ''}>
      ${p.esgotado ? 'Esgotado' : 'Adicionar ao pedido'}
    </button>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectSize(s) {
  selectedSize = s;
  document.querySelectorAll('#sizeBtns .size-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === s);
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ── CART ──────────────────────────────────────
function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const sizes = p.sizes ? p.sizes.split('/').filter(Boolean) : [];
  if (sizes.length > 1) {
    openProduct(id);
    return;
  }
  addToCart(p, sizes[0] || '');
}

function addToCartFromModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const sizes = p.sizes ? p.sizes.split('/').filter(Boolean) : [];
  if (sizes.length > 1 && !selectedSize) {
    showToast('Selecione um tamanho!');
    return;
  }
  addToCart(p, selectedSize || sizes[0] || '');
  closeModal();
}

function addToCart(product, size) {
  const cartId = `${product.id}_${size}`;
  const existing = cart.find(x => x.cartId === cartId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      cartId,
      id: product.id,
      name: product.name,
      ref: product.ref,
      category: product.category,
      size,
      qty: 1,
      image: product.image,
      price: product.price
    });
  }
  updateCartUI();
  showToast(`"${product.name}" adicionado ao pedido!`);
}

function removeFromCart(cartId) {
  cart = cart.filter(x => x.cartId !== cartId);
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s, x) => s + x.qty, 0);
  const fab = document.getElementById('cartFabCount');
  fab.textContent = total;
  fab.style.display = total > 0 ? 'flex' : 'none';

  const countEl = document.getElementById('cartItemCount');
  countEl.textContent = `${total} ${total === 1 ? 'item' : 'itens'}`;

  const btn = document.getElementById('whatsappBtn');
  btn.disabled = total === 0;

  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div>Seu pedido está vazio</div>
        <div style="font-size:12px;opacity:.7">Adicione peças do catálogo</div>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => {
    const catInfo = CATEGORIES[item.category] || {};
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;opacity:.4">${catInfo.icon||'👙'}</div>`;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${imgHTML}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Ref. ${item.ref}${item.size ? ' · Tam: ' + item.size : ''} · Qtd: ${item.qty}</div>
          ${item.price ? `<div style="font-size:12px;color:var(--wine);margin-top:3px">R$ ${item.price}</div>` : ''}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.cartId}')" aria-label="Remover">×</button>
      </div>
    `;
  }).join('');
}

function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

// ── WHATSAPP CHECKOUT ─────────────────────────
function checkoutWhatsApp() {
  if (cart.length === 0) return;
  const lines = cart.map((item, i) => {
    let line = `${i+1}. ${item.name} (Ref. ${item.ref})`;
    if (item.size) line += ` — Tam: ${item.size}`;
    if (item.qty > 1) line += ` — Qtd: ${item.qty}`;
    if (item.price) line += ` — R$ ${item.price}`;
    return line;
  });

  const msg = `Olá! Gostaria de fazer um pedido da Excelência Lingerie:\n\n${lines.join('\n')}\n\nAguardo confirmação de disponibilidade e valor total. Obrigada! 😊`;
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── SIDEBAR MOBILE ────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

// ── TOAST ─────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── START ─────────────────────────────────────
init();
