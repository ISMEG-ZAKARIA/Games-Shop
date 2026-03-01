(function() {
  const STORAGE_KEY = 'cart-items-v1';

  function formatMAD(amount) {
    try {
      return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(amount);
    } catch (_) {
      return amount.toFixed(2) + ' MAD';
    }
  }

  function readCart() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch { return {}; }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function cartCount(cart) {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal(cart) {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  function renderCart() {
    const cart = readCart();
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (countEl) countEl.textContent = String(cartCount(cart));
    if (itemsEl) {
      itemsEl.innerHTML = '';
      Object.values(cart).forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-qty">x${item.qty} · ${formatMAD(item.price)}</span>
          <button class="cart-remove" data-remove-id="${item.id}">Remove</button>
        `;
        itemsEl.appendChild(li);
      });
    }
    if (totalEl) totalEl.textContent = formatMAD(cartTotal(cart));
  }

  function renderCartPage() {
    const cart = readCart();
    const tableBody = document.getElementById('cart-table-body');
    const itemsCountEl = document.getElementById('summary-items');
    const totalEl = document.getElementById('summary-total');
    const badge = document.getElementById('cart-count');

    if (badge) badge.textContent = String(cartCount(cart));
    if (!tableBody) return; // Not on cart page

    tableBody.innerHTML = '';
    const items = Object.values(cart);
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div>
          <button class="cart-remove" data-remove-all-id="${item.id}" title="Remove">✕</button>
          <span class="cart-item-name">${item.name}</span>
        </div>
        <div>${formatMAD(item.price)}</div>
        <div>
          <div class="qty-control">
            <button class="qty-btn" data-dec-id="${item.id}">−</button>
            <span class="qty-value" id="qty-${item.id}">${item.qty}</span>
            <button class="qty-btn" data-inc-id="${item.id}">+</button>
          </div>
        </div>
        <div id="subtotal-${item.id}">${formatMAD(item.price * item.qty)}</div>
      `;
      tableBody.appendChild(row);
    });

    if (itemsCountEl) itemsCountEl.textContent = String(cartCount(cart));
    if (totalEl) totalEl.textContent = formatMAD(cartTotal(cart));
  }

  function addToCart({ id, name, price }) {
    const cart = readCart();
    if (!cart[id]) cart[id] = { id, name, price: Number(price) || 0, qty: 0 };
    cart[id].qty += 1;
    writeCart(cart);
    renderCart();
  }

  function removeFromCart(id) {
    const cart = readCart();
    if (!cart[id]) return;
    cart[id].qty -= 1;
    if (cart[id].qty <= 0) delete cart[id];
    writeCart(cart);
    renderCart();
  }

  function toggleDropdown() {
    const dd = document.getElementById('cart-dropdown');
    if (!dd) return;
    dd.hidden = !dd.hidden;
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    if (target.classList.contains('add-to-cart')) {
      e.preventDefault();
      const id = target.getAttribute('data-id');
      const name = target.getAttribute('data-name');
      const price = Number(target.getAttribute('data-price') || '0');
      if (id && name) addToCart({ id, name, price });
      return;
    }

    if (target.getAttribute('data-remove-id')) {
      e.preventDefault();
      removeFromCart(String(target.getAttribute('data-remove-id')));
      return;
    }

    const cartButton = target.closest('.cart-button');
    if (cartButton) {
      e.preventDefault();
      toggleDropdown();
      return;
    }

    const dropdown = document.getElementById('cart-dropdown');
    if (dropdown && !dropdown.hidden && !target.closest('#cart-dropdown')) {
      dropdown.hidden = true;
    }

    // Cart page handlers
    const incId = target.getAttribute('data-inc-id');
    if (incId) {
      e.preventDefault();
      const cart = readCart();
      if (cart[incId]) { cart[incId].qty += 1; writeCart(cart); renderCart(); renderCartPage(); }
      return;
    }
    const decId = target.getAttribute('data-dec-id');
    if (decId) {
      e.preventDefault();
      const cart = readCart();
      if (cart[decId]) {
        cart[decId].qty -= 1;
        if (cart[decId].qty <= 0) delete cart[decId];
        writeCart(cart); renderCart(); renderCartPage();
      }
      return;
    }
    const removeAllId = target.getAttribute('data-remove-all-id');
    if (removeAllId) {
      e.preventDefault();
      const cart = readCart();
      delete cart[removeAllId];
      writeCart(cart); renderCart(); renderCartPage();
      return;
    }

    if (target.id === 'empty-cart') {
      e.preventDefault();
      writeCart({});
      renderCart();
      renderCartPage();
      return;
    }

    if (target.id === 'order-now') {
      e.preventDefault();
      window.location.href = 'checkout.html';
      return;
    }
    if (target.id === 'checkout') {
      e.preventDefault();
      window.location.href = 'checkout.html';
      return;
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) renderCart();
  });

  document.addEventListener('DOMContentLoaded', () => { renderCart(); renderCartPage(); });
})();


