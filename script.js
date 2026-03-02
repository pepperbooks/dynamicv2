document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumber = "919999999999"; // ← CHANGE TO YOUR REAL NUMBER (with country code, no +)

  let cart = [];

  // Update cart count display
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
  }

  // Add to cart
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseInt(btn.dataset.price);

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

  // Open cart modal
  document.getElementById('cart-icon').addEventListener('click', () => {
    const modal = document.getElementById('cart-modal');
    const itemsList = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');

    itemsList.innerHTML = '';

    if (cart.length === 0) {
      itemsList.innerHTML = '<p style="text-align:center; color:#777;">Your cart is empty.</p>';
      totalEl.textContent = '0';
    } else {
      let total = 0;
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.style.marginBottom = '1rem';
        div.style.paddingBottom = '1rem';
        div.style.borderBottom = '1px solid #eee';
        div.innerHTML = `
          <strong>${item.title}</strong><br>
          ₹${item.price} × ${item.quantity} = ₹${itemTotal}
        `;
        itemsList.appendChild(div);
      });
      totalEl.textContent = total;
    }

    modal.style.display = 'flex';
  });


function renderCart() {
  const itemsList = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  const clearBtn = document.getElementById('clear-cart-btn');

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
      <button onclick="removeFromCart('${item.id}')" 
              style="background:#e74c3c; color:white; border:none; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer; line-height:1;">
        ×
      </button>
    `;

    itemsList.appendChild(div);
  });

  totalEl.textContent = total;
  clearBtn.style.display = 'block';
}

// Remove single item
window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartCount();
  renderCart();
};

// Clear all items
document.getElementById('clear-cart-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the entire cart?')) {
    cart = [];
    updateCartCount();
    renderCart();
  }
});

// Update your existing cart-icon click handler to call renderCart()
document.getElementById('cart-icon').addEventListener('click', () => {
  renderCart();
  document.getElementById('cart-modal').style.display = 'flex';
});


  // Send cart to WhatsApp
  document.getElementById('send-whatsapp').addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const name = document.getElementById('customer-name').value.trim();
    const address = document.getElementById('customer-address').value.trim();

    if (!name || !address) {
      alert('Please enter your name and delivery address.');
      return;
    }

    let message = `Hello! I'd like to place an order:\n\n`;
    message += `Name: ${name}\n`;
    message += `Address: ${address}\n\n`;
    message += `Order:\n`;

    cart.forEach(item => {
      message += `• ${item.title} × ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\nTotal: ₹${total}\n\nPlease confirm availability and delivery charges. Thank you! 😊`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');

    // Optional: clear cart after sending
    // cart = [];
    // updateCartCount();
    // document.getElementById('cart-modal').style.display = 'none';
  });
});