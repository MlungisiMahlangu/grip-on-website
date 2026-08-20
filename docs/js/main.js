/* Shared behavior — runs on every page */

document.addEventListener("DOMContentLoaded", () => {
            // Mobile nav toggle
            const waFooterLink = document.getElementById('waFooterLink');
            if (waFooterLink) waFooterLink.href = `https://wa.me/${BRAND_WHATSAPP}`;
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
    const waBtn = document.createElement('a');
    waBtn.href = `https://wa.me/${BRAND_WHATSAPP}`;
    waBtn.target = "_blank";
    waBtn.className = "floating-whatsapp";
    waBtn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    waBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.16h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.05a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.02.76.8-2.94-.2-.31a8.13 8.13 0 1 1 6.86 3.8Zm4.44-6.1c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z"/>
    </svg>`;
    document.body.appendChild(waBtn);

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