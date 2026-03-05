document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumber = "919920869482";

  let cart = [];

  // ────────────────────────────────────────────────
  // Cart Count – update both desktop & mobile badges
  // ────────────────────────────────────────────────
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Desktop
    const desktopBadge = document.getElementById('cart-count');
    if (desktopBadge) {
      desktopBadge.textContent = totalItems;
      desktopBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Mobile (if you have separate id for mobile cart badge)
    const mobileBadge = document.getElementById('cart-count-mobile');
    if (mobileBadge) {
      mobileBadge.textContent = totalItems;
      mobileBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

 // Mobile Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    // Optional: prevent body scroll when menu is open
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  
  // Close when clicking any link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
} else {
  console.error('Hamburger or mobile menu element not found');
}




  // ────────────────────────────────────────────────
  // Add to cart
  // ────────────────────────────────────────────────
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseInt(btn.dataset.price, 10);

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, title, price, quantity: 1 });
      }

      updateCartCount();
      alert(`${title} added to cart!`);
    });
  });

  // ────────────────────────────────────────────────
  // Render cart items in modal (with remove button)
  // ────────────────────────────────────────────────
  function renderCart() {
    const itemsList = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    const clearBtn = document.getElementById('clear-cart-btn');

    if (!itemsList || !totalEl || !clearBtn) return;

    itemsList.innerHTML = '';

    if (cart.length === 0) {
      itemsList.innerHTML = '<p style="text-align:center; color:#777; font-style:italic;">Your cart is empty.</p>';
      totalEl.textContent = '0';
      clearBtn.style.display = 'none';
      return;
    }

    let total = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '0.9rem 0';
      div.style.borderBottom = '1px solid #eee';

      div.innerHTML = `
        <div style="flex:1;">
          <strong>${item.title}</strong><br>
          ₹${item.price} × ${item.quantity} = ₹${itemTotal}
        </div>
        <button class="remove-item" data-id="${item.id}"
                style="background:#e74c3c; color:white; border:none; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer;">
          ×
        </button>
      `;

      itemsList.appendChild(div);
    });

    totalEl.textContent = total;
    clearBtn.style.display = 'block';
  }

  // ────────────────────────────────────────────────
  // Open cart modal
  // ────────────────────────────────────────────────
  const cartIcons = ['cart-icon', 'cart-icon-mobile']; // both ids

  cartIcons.forEach(id => {
    const icon = document.getElementById(id);
    if (icon) {
      icon.addEventListener('click', () => {
        renderCart();
        const modal = document.getElementById('cart-modal');
        if (modal) modal.style.display = 'flex';
      });
    }
  });

  // ────────────────────────────────────────────────
  // Remove single item (delegated listener)
  // ────────────────────────────────────────────────
  document.getElementById('cart-items-list')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      const id = e.target.dataset.id;
      cart = cart.filter(item => item.id !== id);
      updateCartCount();
      renderCart();
    }
  });

  // ────────────────────────────────────────────────
  // Clear all
  // ────────────────────────────────────────────────
  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    if (confirm('Clear entire cart?')) {
      cart = [];
      updateCartCount();
      renderCart();
    }
  });

  // ────────────────────────────────────────────────
  // Send via WhatsApp
  // ────────────────────────────────────────────────
  document.getElementById('send-whatsapp')?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const name = document.getElementById('customer-name')?.value.trim();
    const address = document.getElementById('customer-address')?.value.trim();

    if (!name || !address) {
      alert('Please enter your name and delivery address.');
      return;
    }

    let message = `Hello! I'd like to place an order:\n\n`;
    message += `Name: ${name}\nAddress: ${address}\n\nOrder:\n`;

    cart.forEach(item => {
      message += `• ${item.title} × ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\nTotal: ₹${total}\n\nPlease confirm availability and delivery charges. Thank you! 😊`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  });

  // Initial count
  updateCartCount();
});