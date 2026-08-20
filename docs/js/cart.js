/* ==========================================================================
   Cart — persisted to localStorage, no backend required.
   Cart shape: [{ id, colour, size, qty }, ...]
   ========================================================================== */

const CART_KEY = "gripon_cart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(id, size = "M", qty = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id && item.size === size);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id, size, qty });
    }
    saveCart(cart);
}

function removeFromCart(id, size) {
    saveCart(getCart().filter(item => !(item.id === id && item.size === size)));
}

function updateQty(id, size, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
        item.qty = Math.max(1, qty);
        saveCart(cart);
    }
}

function cartTotal() {
    return getCart().reduce((sum, item) => {
        const product = findProduct(item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);
}

function cartItemCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = cartItemCount();
}