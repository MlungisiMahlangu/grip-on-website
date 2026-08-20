const products = [
    { id: 1, name: "Grip Tshirt", category: "shirts", colour: "Black", price: 350, image: "images/products/tee-black.jpg", tag: "new" },
    { id: 2, name: "Grip Tshirt", category: "shirts", colour: "White", price: 350, image: "images/products/tee-white.jpg" },
    { id: 3, name: "Grip Tshirt", category: "shirts", colour: "Blue", price: 350, image: "images/products/tee-blue.jpg" },
    { id: 4, name: "Lift Stringer", category: "vests", colour: "Black", price: 300, image: "images/products/vest-black.jpg" },
    { id: 5, name: "Lift Stringer", category: "vests", colour: "Pink", price: 300, image: "images/products/vest-pink.jpg" },
    { id: 6, name: "Rest Day Hoodie", category: "hoodies", colour: "Black", price: 650, image: "images/products/hoodie-black.jpg", tag: "low-stock" },
    { id: 7, name: "Rest Day Hoodie", category: "hoodies", colour: "PEACH", price: 650, image: "images/products/hoodie-charcoal.jpg" },
    { id: 8, name: "Grip Joggers", category: "pants", colour: "Black", price: 500, image: "images/products/joggers-black.jpg" },
    { id: 9, name: "Compression Tights", category: "tights", colour: "Black", price: 380, image: "images/products/tights-black.jpg" },
    { id: 10, name: "Compression Tights", category: "tights", colour: "Blue", price: 380, image: "images/products/tights-blue.jpg" },
    { id: 11, name: "Grip Bottle 1L", category: "accessories", colour: "RED", price: 130, image: "images/products/bottle-black.jpg" },
    { id: 12, name: "Grip Bottle 1L", category: "accessories", colour: "WHITE", price: 130, image: "images/products/bottle-pink.jpg" },
];


function findProduct(id) {
    return products.find(p => p.id === Number(id));
}

// Shared card markup used on home (featured) and shop (full grid).
// Falls back to a placeholder block if the image file isn't there yet.
function renderProductCard(p) {
    const badge = p.tag ?
        `<span class="product-badge product-badge-${p.tag}">${p.tag === 'new' ? 'New' : 'Low stock'}</span>` :
        '';

    return `
    <a class="product-card" href="product.html?id=${p.id}">
      <div class="product-card-media">
        ${badge}
        <img src="${p.image}" alt="${p.name} — ${p.colour}"
             onerror="this.replaceWith(Object.assign(document.createElement('div'), {
               className: 'placeholder-media',
               innerHTML: '<svg viewBox=\\'0 0 24 24\\' fill=\\'none\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'/><path d=\\'M3 16l5-5 4 4 5-6 4 5\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'/></svg><span>${p.colour} — image pending</span>'
             }))">
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${p.category} · ${p.colour}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-price price">R${p.price}</div>
      </div>
    </a>`;
}