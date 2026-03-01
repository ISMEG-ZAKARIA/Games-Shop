(function() {
  const STORAGE_KEY = 'cart-items-v1';
  let currentStep = 1;

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

  function cartTotal(cart) {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  function renderOrderSummary() {
    const cart = readCart();
    const itemsEl = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    
    if (itemsEl) {
      itemsEl.innerHTML = '';
      Object.values(cart).forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
          <span>${item.name} x${item.qty}</span>
          <span>${formatMAD(item.price * item.qty)}</span>
        `;
        itemsEl.appendChild(div);
      });
    }
    
    if (totalEl) totalEl.textContent = formatMAD(cartTotal(cart));
  }

  function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show current step
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
      step.classList.add('active');
      currentStep = stepNumber;
    }
  }

  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#ff4444';
        isValid = false;
      } else {
        input.style.borderColor = '';
      }
    });
    
    return isValid;
  }

  function setupFormHandlers() {
    // Personal Information form
    const personalForm = document.getElementById('personal-form');
    if (personalForm) {
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm('personal-form')) {
          showStep(2);
        }
      });
    }

    // Address form
    const addressForm = document.getElementById('address-form');
    if (addressForm) {
      addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm('address-form')) {
          showStep(3);
        }
      });
    }

    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm('payment-form')) {
          // Complete order
          alert('Order completed successfully!');
          // Clear cart
          localStorage.removeItem(STORAGE_KEY);
          // Redirect to home
          window.location.href = 'index.html';
        }
      });
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('card-details');
    
    paymentMethods.forEach(method => {
      method.addEventListener('change', () => {
        if (method.value === 'visa' || method.value === 'mastercard') {
          cardDetails.style.display = 'block';
        } else {
          cardDetails.style.display = 'none';
        }
      });
    });
  }

  function setupInputFormatting() {
    // Card number formatting
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
      cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
      });
    }

    // Expiry date formatting
    const expiry = document.getElementById('expiry');
    if (expiry) {
      expiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
      });
    }

    // CVV formatting
    const cvv = document.getElementById('cvv');
    if (cvv) {
      cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
      });
    }
  }

  // Initialize checkout page
  document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();
    setupFormHandlers();
    setupInputFormatting();
    showStep(1);
  });
})();
