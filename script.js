document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumber = "919920869482";

  // ────────────────────────────────────────────────
  // Cart state
  // ────────────────────────────────────────────────
  let cart = [];

  // ────────────────────────────────────────────────
  // Cart count badge (desktop + mobile)
  // ────────────────────────────────────────────────
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Desktop badge
    const desktopBadge = document.getElementById('cart-count');
    if (desktopBadge) {
      desktopBadge.textContent = totalItems;
      desktopBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Mobile badge (if you have separate element)
    const mobileBadge = document.getElementById('cart-count-mobile');
    if (mobileBadge) {
      mobileBadge.textContent = totalItems;
      mobileBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  // ────────────────────────────────────────────────
  // Mobile hamburger menu toggle
  // ────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking any link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  } else {
    console.warn('Hamburger or mobile menu element not found');
  }

  // ────────────────────────────────────────────────
  // Add item to cart
  // ────────────────────────────────────────────────
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseInt(btn.dataset.price, 10);

      if (!id || !title || isNaN(price)) {
        console.warn('Invalid book data:', btn.dataset);
        return;
      }

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
  // Render cart modal content
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

    let subtotalAfterDiscount = 0;

    cart.forEach(item => {
      const original = item.price * item.quantity;
      const discount = original * 0.10;
      const afterDiscount = original - discount;
      subtotalAfterDiscount += afterDiscount;

      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '0.9rem 0';
      div.style.borderBottom = '1px solid #eee';

      div.innerHTML = `
        <div style="flex:1;">
          <strong>${item.title}</strong><br>
          ₹${item.price} × ${item.quantity} = ₹${original}<br>
          <small style="color:#27ae60;">
            10% discount: -₹${Math.round(discount)} → ₹${Math.round(afterDiscount)}
          </small>
        </div>
        <button class="remove-item" data-id="${item.id}"
                style="background:#e74c3c; color:white; border:none; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer;">
          ×
        </button>
      `;

      itemsList.appendChild(div);
    });

    const finalTotal = Math.round(subtotalAfterDiscount + 99);

    totalEl.innerHTML = `
      Subtotal (after 10% discount): ₹${Math.round(subtotalAfterDiscount)}<br>
      <small>Delivery charges: ₹99</small><br>
      <strong style="font-size:1.3rem;">Total to pay: ₹${finalTotal}</strong>
    `;

    clearBtn.style.display = 'block';
  }

  // ────────────────────────────────────────────────
  // Open cart modal
  // ────────────────────────────────────────────────
  const cartIcons = ['cart-icon', 'cart-icon-mobile'];

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
// Razorpay Payment – attached to blue button
// ────────────────────────────────────────────────
const payButton = document.getElementById('pay-with-razorpay');

if (payButton) {
  payButton.addEventListener('click', async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const name = document.getElementById('customer-name')?.value.trim();
    const contact = document.getElementById('contact-number')?.value.trim();
    const address = document.getElementById('customer-address')?.value.trim();

    if (!name || !contact || !address) {
      alert('Please fill in your name, 10-digit contact number, and delivery address.');
      return;
    }

    if (!/^\d{10}$/.test(contact)) {
      alert('Please enter a valid 10-digit mobile number (only digits, no spaces or +91).');
      return;
    }

    // Calculate final amount
    let subtotal = 0;
    cart.forEach(item => {
      const orig = item.price * item.quantity;
      subtotal += orig * 0.9; // 10% discount
    });
    const finalAmount = Math.round(subtotal + 99);

    try {
      const res = await fetch('https://project-h8asg.vercel.app/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          receipt: `order_${Date.now()}`
        })
      });

      const data = await res.json();

      if (!res.ok || !data.orderId) {
        throw new Error(data.error || 'Failed to create Razorpay order');
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Pepper Books',
        description: 'Book Order Payment',
        order_id: data.orderId,
        prefill: {
          name: name,
          contact: contact,
        },
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          cart = [];
          updateCartCount();
          document.getElementById('cart-modal').style.display = 'none';
          alert('Thank you! Your order is confirmed and will be dispatched soon.');
        },
        theme: {
          color: '#0e84ff'
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      alert('Payment failed: ' + (err.message || 'Unknown error'));
    }
  });
} else {
  console.warn('Pay button not found – check id="pay-with-razorpay"');
}

  // ────────────────────────────────────────────────
  // Remove single item
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
  // Clear entire cart
  // ────────────────────────────────────────────────
  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    if (confirm('Clear entire cart?')) {
      cart = [];
      updateCartCount();
      renderCart();
    }
  });

  // ────────────────────────────────────────────────
  // Send order via WhatsApp
  // ────────────────────────────────────────────────
  document.getElementById('send-whatsapp')?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const name = document.getElementById('customer-name')?.value.trim();
    const contactnumber = document.getElementById('contact-number')?.value.trim();
    const address = document.getElementById('customer-address')?.value.trim();

    if (!name || !contactnumber || !address) {
      alert('Please fill in your name, 10-digit contact number, and delivery address.');
      return;
    }

    if (!/^\d{10}$/.test(contactnumber)) {
      alert('Please enter a valid 10-digit mobile number (no spaces, no +91).');
      return;
    }

    let message = `Hello! I'd like to place an order:\n\n`;
    message += `Name: ${name}\n`;
    message += `Contact Number: ${contactnumber}\n`;
    message += `Address: ${address}\n\n`;
    message += `Order (after 10% discount):\n`;

    let subtotalAfterDiscount = 0;

    cart.forEach(item => {
      const original = item.price * item.quantity;
      const discount = original * 0.10;
      const afterDiscount = original - discount;
      subtotalAfterDiscount += afterDiscount;

      message += `• ${item.title} × ${item.quantity}\n`;
      message += `  Original: ₹${original} → After 10% off: ₹${Math.round(afterDiscount)}\n`;
    });

    const finalTotal = subtotalAfterDiscount + 99;

    message += `\nSubtotal (after discount): ₹${Math.round(subtotalAfterDiscount)}`;
    message += `\nDelivery charges: ₹99`;
    message += `\nTotal to pay: ₹${Math.round(finalTotal)}`;
    message += `\n\nPlease confirm your order and payment details so we can dispatch your order soon. Thank you! 😊`;
    message += `\nWe will share dispatch & tracking details on your contact number: ${contactnumber} once payment is received.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  });

  // Initial count update
  updateCartCount();
});
