// Product data — migrated from docs/js/products.js
// Colour inconsistencies fixed:
//   id 7:  "PEACH" → "Charcoal" (image is hoodie-charcoal.jpg)
//   id 11: "RED"   → "Black"   (image is bottle-black.jpg)
//   id 12: "WHITE" → "Pink"    (image is bottle-pink.jpg)

const products = [
  { id: 1, name: "Grip Tshirt", category: "shirts", colour: "Black", price: 350, image: "/images/products/tee-black.jpg", tag: "new" },
  { id: 2, name: "Grip Tshirt", category: "shirts", colour: "White", price: 350, image: "/images/products/tee-white.jpg" },
  { id: 3, name: "Grip Tshirt", category: "shirts", colour: "Blue", price: 350, image: "/images/products/tee-blue.jpg" },
  { id: 4, name: "Lift Stringer", category: "vests", colour: "Black", price: 300, image: "/images/products/vest-black.jpg" },
  { id: 5, name: "Lift Stringer", category: "vests", colour: "Pink", price: 300, image: "/images/products/vest-pink.jpg" },
  { id: 6, name: "Rest Day Hoodie", category: "hoodies", colour: "Black", price: 650, image: "/images/products/hoodie-black.jpg", tag: "low-stock" },
  { id: 7, name: "Rest Day Hoodie", category: "hoodies", colour: "Charcoal", price: 650, image: "/images/products/hoodie-charcoal.jpg" },
  { id: 8, name: "Grip Joggers", category: "pants", colour: "Black", price: 500, image: "/images/products/joggers-black.jpg" },
  { id: 9, name: "Compression Tights", category: "tights", colour: "Black", price: 380, image: "/images/products/tights-black.jpg" },
  { id: 10, name: "Compression Tights", category: "tights", colour: "Blue", price: 380, image: "/images/products/tights-blue.jpg" },
  { id: 11, name: "Grip Bottle 1L", category: "accessories", colour: "Black", price: 130, image: "/images/products/bottle-black.jpg" },
  { id: 12, name: "Grip Bottle 1L", category: "accessories", colour: "Pink", price: 130, image: "/images/products/bottle-pink.jpg" },
];

export default products;
