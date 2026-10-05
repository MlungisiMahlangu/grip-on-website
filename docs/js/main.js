/* Shared behavior — runs on every page */

document.addEventListener("DOMContentLoaded", () => {
            // Mobile nav toggle
            const toggle = document.getElementById("navToggle");
            const links = document.getElementById("navLinks");
            if (toggle && links) {
                toggle.addEventListener("click", () => {
                    const open = links.classList.toggle("open");
                    toggle.setAttribute("aria-expanded", open);
                });
            }

            const cartLink = document.querySelector('.cart-link');
            if (cartLink) {
                const preview = document.createElement('div');
                preview.className = 'cart-preview';
                preview.id = 'cartPreview';
                document.querySelector('.nav-actions').style.position = 'relative';
                document.querySelector('.nav-actions').appendChild(preview);

                function renderCartPreview() {
                    const cart = getCart();
                    if (!cart.length) {
                        preview.innerHTML = `<div class="cart-preview-empty">Your cart is empty.</div>`;
                        return;
                    }
                    const rows = cart.slice(0, 4).map(item => {
                        const p = findProduct(item.id);
                        if (!p) return '';
                        return `<div class="cart-preview-row">
        <span>${p.name} (${item.size}) x${item.qty}</span>
        <span class="price">R${p.price * item.qty}</span>
      </div>`;
                    }).join('');
                    preview.innerHTML = `
      ${rows}
      ${cart.length > 4 ? `<div class="cart-preview-more">+${cart.length - 4} more</div>` : ''}
      <div class="cart-preview-total"><span>Total</span><span class="price">R${cartTotal()}</span></div>
      <a href="cart.html" class="btn btn-primary" style="width:100%; justify-content:center;">View cart</a>
    `;
  }

  cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderCartPreview();
    preview.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!preview.contains(e.target) && e.target !== cartLink) preview.classList.remove('open');
  });
}

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            showToast('Thanks for subscribing!');
            newsletterForm.reset();
        });
    }

    updateCartCount();
});

function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}