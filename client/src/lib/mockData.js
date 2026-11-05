// Mock product data for GitHub Pages deployment (no backend API)

export const mockProducts = [
  {
    id: 1,
    name: 'Heavyweight Tee',
    price: 350,
    category: 'shirts',
    colour: 'Black',
    image: '/grip-on-website/images/products/tee-black.jpg',
    description: 'Premium heavyweight cotton tee. Built to hold its shape wash after wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 2,
    name: 'Heavyweight Tee',
    price: 350,
    category: 'shirts',
    colour: 'Blue',
    image: '/grip-on-website/images/products/tee-blue.jpg',
    description: 'Premium heavyweight cotton tee. Built to hold its shape wash after wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 3,
    name: 'Heavyweight Tee',
    price: 350,
    category: 'shirts',
    colour: 'White',
    image: '/grip-on-website/images/products/tee-white.jpg',
    description: 'Premium heavyweight cotton tee. Built to hold its shape wash after wash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 4,
    name: 'Training Hoodie',
    price: 650,
    category: 'hoodies',
    colour: 'Black',
    image: '/grip-on-website/images/products/hoodie-black.jpg',
    description: 'Heavyweight hoodie for rest days. Comfortable, durable, and built to last.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 5,
    name: 'Training Hoodie',
    price: 650,
    category: 'hoodies',
    colour: 'Charcoal',
    image: '/grip-on-website/images/products/hoodie-charcoal.jpg',
    description: 'Heavyweight hoodie for rest days. Comfortable, durable, and built to last.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 6,
    name: 'Training Joggers',
    price: 550,
    category: 'pants',
    colour: 'Black',
    image: '/grip-on-website/images/products/joggers-black.jpg',
    description: 'Comfortable joggers for training and recovery. Tapered fit with pockets.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 7,
    name: 'Compression Tights',
    price: 450,
    category: 'tights',
    colour: 'Black',
    image: '/grip-on-website/images/products/tights-black.jpg',
    description: 'Performance compression tights for intense training sessions.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 8,
    name: 'Compression Tights',
    price: 450,
    category: 'tights',
    colour: 'Blue',
    image: '/grip-on-website/images/products/tights-blue.jpg',
    description: 'Performance compression tights for intense training sessions.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 9,
    name: 'Training Vest',
    price: 300,
    category: 'shirts',
    colour: 'Black',
    image: '/grip-on-website/images/products/vest-black.jpg',
    description: 'Lightweight training vest for high-intensity workouts.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 10,
    name: 'Training Vest',
    price: 300,
    category: 'shirts',
    colour: 'Pink',
    image: '/grip-on-website/images/products/vest-pink.jpg',
    description: 'Lightweight training vest for high-intensity workouts.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 11,
    name: 'Gym Bottle',
    price: 180,
    category: 'accessories',
    colour: 'Black',
    image: '/grip-on-website/images/products/bottle-black.jpg',
    description: 'Durable gym bottle. Keeps your drinks cold all session.',
    sizes: ['One Size'],
  },
  {
    id: 12,
    name: 'Gym Bottle',
    price: 180,
    category: 'accessories',
    colour: 'Pink',
    image: '/grip-on-website/images/products/bottle-pink.jpg',
    description: 'Durable gym bottle. Keeps your drinks cold all session.',
    sizes: ['One Size'],
  },
];

// Mock API functions
export function fetchProducts(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      if (params.category) {
        filtered = filtered.filter(p => p.category === params.category);
      }
      
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.colour.toLowerCase().includes(query)
        );
      }
      
      if (params.sort) {
        switch (params.sort) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        }
      }
      
      resolve(filtered);
    }, 300);
  });
}

export function fetchProduct(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 200);
  });
}

export function fetchCategories() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = [...new Set(mockProducts.map(p => p.category))];
      resolve(categories);
    }, 100);
  });
}

export function createOrder(body) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[MOCK ORDER]', body);
      resolve({ ok: true, message: 'Order received (demo mode)' });
    }, 500);
  });
}

export function submitContact(body) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[MOCK CONTACT]', body);
      resolve({ ok: true, message: 'Message received (demo mode)' });
    }, 500);
  });
}
