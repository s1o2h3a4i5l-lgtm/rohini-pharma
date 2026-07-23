// Rohini Pharma eCommerce App JavaScript Controller

// 1. Local Database of Products (using downloaded site data)
const PRODUCTS = [
    {
        id: "kamagra-gold-100-mg",
        title: "KAMAGRA GOLD 100 MG",
        category: "Erectile Dysfunction",
        price: 150.00,
        originalPrice: 215.00,
        image: "downloaded_site/images/kamagra-gold-100-mg.jpg",
        rating: 4.8,
        reviewsCount: 12,
        composition: "Sildenafil 100mg",
        packing: "One Box Contains 1 x 4 Tablets.",
        description: "Kamagra Tablet contains the active ingredient sildenafil citrate, which belongs to the PDE-5 Vasodilators family. It is commonly used for treating erectile dysfunction under expert guidance.",
        featured: true,
        bestSeller: true,
        topRated: true
    },
    {
        id: "super-kamagra-oral-jelly",
        title: "SUPER KAMAGRA ORAL JELLY",
        category: "Erectile Dysfunction",
        price: 200.00,
        originalPrice: 285.00,
        image: "downloaded_site/images/super-kamagra-oral-jelly-500x500-1.webp",
        rating: 4.7,
        reviewsCount: 8,
        composition: "Sildenafil 100mg + Dapoxetine 60mg",
        packing: "One Pack Contains 7 Sachets.",
        description: "Super Kamagra Oral Jelly combines Sildenafil and Dapoxetine in a quick-absorbing gel form. It helps treat both erectile dysfunction and premature ejaculation simultaneously.",
        featured: true,
        bestSeller: true,
        topRated: false
    },
    {
        id: "janumet-50mg-500mg",
        title: "Janumet 50mg/500mg Tablet",
        category: "Diabetes",
        price: 320.00,
        originalPrice: 410.00,
        image: "downloaded_site/images/81KHz41APjL._UF10001000_QL80_.jpg",
        rating: 4.9,
        reviewsCount: 34,
        composition: "Sitagliptin 50mg + Metformin 500mg",
        packing: "One Strip contains 15 Tablets.",
        description: "Janumet is a combination prescription medicine containing sitagliptin and metformin. It helps control blood sugar levels in adults with type 2 diabetes mellitus.",
        featured: true,
        bestSeller: true,
        topRated: true
    },
    {
        id: "trilawil-capsule",
        title: "Trilawil Capsule",
        category: "Hepatitis",
        price: 19999.00,
        originalPrice: 25000.00,
        image: "downloaded_site/images/whatsapp-image-2023-04-18-at-19-26-06.png",
        rating: 4.9,
        reviewsCount: 5,
        composition: "Tenofovir Alafenamide + Ledipasvir + Sofosbuvir",
        packing: "One Bottle Contains 28 Capsules.",
        description: "Trilawil is a premium antiviral combination formulation used under specialist direction for the treatment of chronic hepatitis viral infections.",
        featured: true,
        bestSeller: true,
        topRated: true
    }
];

// 2. Global State Variables
let cart = JSON.parse(localStorage.getItem('rohinipharma_cart')) || [];
let activeView = 'home'; // 'home' or 'product'
let activeProductId = null;
let currentHeroIndex = 0;
let currentTestimonialIndex = 0;
let currentTheme = localStorage.getItem('rohinipharma_theme') || 'light';

// 3. Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProducts();
    initCart();
    setupRouting();
    setupEventListeners();
    startHeroSlider();
    startTestimonialSlider();
    updateCartCount();
});

// Theme (Dark Mode) Setup
function initTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
    } else {
        document.body.classList.remove('dark');
        document.getElementById('theme-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        currentTheme = 'light';
    } else {
        document.body.classList.add('dark');
        currentTheme = 'dark';
    }
    localStorage.setItem('rohinipharma_theme', currentTheme);
    initTheme();
    showToast('Theme updated successfully!', 'success');
}

// Render Products Grid on Home View
function renderProducts() {
    const dealsGrid = document.getElementById('deals-grid');
    const bestSellersGrid = document.getElementById('bestsellers-grid');
    
    if (!dealsGrid || !bestSellersGrid) return;
    
    // Clear existing
    dealsGrid.innerHTML = '';
    bestSellersGrid.innerHTML = '';

    PRODUCTS.forEach(product => {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        
        const cardHTML = `
            <div class="product-card" data-id="${product.id}" data-category="${product.category.toLowerCase()}">
                <span class="badge badge-sale product-card-badge">-${discountPercent}% OFF</span>
                <div class="product-card-actions">
                    <button class="card-action-btn action-wishlist" title="Add to Wishlist">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                    <button class="card-action-btn action-quickview" data-id="${product.id}" title="Quick View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                </div>
                <div class="product-img-wrapper" onclick="navigateToProduct('${product.id}')" style="cursor: pointer;">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-details">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title" onclick="navigateToProduct('${product.id}')" style="cursor: pointer;">${product.title}</h3>
                    <div class="product-rating">
                        ${renderStars(product.rating)}
                        <span>(${product.reviewsCount})</span>
                    </div>
                    <div class="product-footer">
                        <div>
                            <span class="product-price">₹${product.price.toFixed(2)}</span>
                            <span class="product-price-strike">₹${product.originalPrice.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}" style="padding: 10px 16px; font-size: 0.85rem; border-radius: var(--border-radius-sm);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (product.featured) {
            dealsGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
        if (product.bestSeller) {
            bestSellersGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
    });
}

function renderStars(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
        } else if (i === fullStars + 1 && hasHalf) {
            starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2z"/></svg>`;
        } else {
            starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
        }
    }
    return starsHTML;
}

// 4. Hero Carousel Logic
function startHeroSlider() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    if (slides.length === 0) return;

    setInterval(() => {
        currentHeroIndex = (currentHeroIndex + 1) % slides.length;
        updateHeroSlider(slides, indicators);
    }, 5500);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentHeroIndex = index;
            updateHeroSlider(slides, indicators);
        });
    });
}

function updateHeroSlider(slides, indicators) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[currentHeroIndex].classList.add('active');
    indicators[currentHeroIndex].classList.add('active');
}

// 5. Testimonials Slider Logic
function startTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length === 0) return;

    setInterval(() => {
        slides[currentTestimonialIndex].classList.remove('active');
        currentTestimonialIndex = (currentTestimonialIndex + 1) % slides.length;
        slides[currentTestimonialIndex].classList.add('active');
    }, 4500);
}

// 6. Navigation and Routing (SPA state manager)
function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function handleRoute() {
    const hash = window.location.hash || '#home';
    const homeView = document.getElementById('home-view');
    const productView = document.getElementById('product-view');
    
    // Close sidebar drawers on route change
    toggleCartDrawer(false);
    toggleMobileNav(false);

    if (hash.startsWith('#product/')) {
        const productId = hash.split('#product/')[1];
        activeProductId = productId;
        renderProductDetailPage(productId);
        
        homeView.classList.remove('active');
        productView.classList.add('active');
        window.scrollTo(0, 0);
        
        // Update nav links active states
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    } else {
        // Home view
        productView.classList.remove('active');
        homeView.classList.add('active');
        activeProductId = null;
        
        document.querySelectorAll('.nav-links a').forEach(a => {
            if (a.getAttribute('href') === '#home') a.classList.add('active');
            else a.classList.remove('active');
        });
    }
}

function navigateToProduct(id) {
    window.location.hash = `#product/${id}`;
}

// Render Single Product Detail Page Content
function renderProductDetailPage(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        window.location.hash = '#home';
        return;
    }

    // Set page title
    document.title = `${product.title} - Rohini Pharma`;

    // Render breadcrumbs
    document.getElementById('breadcrumb-product-name').textContent = product.title;

    // Render basic details
    document.getElementById('detail-product-img').src = product.image;
    document.getElementById('detail-product-img').alt = product.title;
    document.getElementById('detail-product-title').textContent = product.title;
    document.getElementById('detail-product-price').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('detail-product-price-strike').textContent = `₹${product.originalPrice.toFixed(2)}`;
    document.getElementById('detail-product-rating-stars').innerHTML = renderStars(product.rating);
    document.getElementById('detail-product-rating-count').textContent = `(${product.reviewsCount} customer reviews)`;
    
    // Set meta values
    document.getElementById('meta-composition').textContent = product.composition;
    document.getElementById('meta-packing').textContent = product.packing;
    document.getElementById('meta-category').textContent = product.category;

    // Reset detail quantity input
    document.getElementById('detail-qty').value = 1;
    document.getElementById('detail-qty-add-btn').setAttribute('data-id', product.id);

    // Set Description inside Tab
    document.getElementById('tab-description-content').innerHTML = `
        <h4 style="margin-bottom:15px; font-size:1.2rem;">Product Description & Specifications</h4>
        <p style="margin-bottom:20px; color:var(--text-secondary);">${product.description}</p>
        <div style="background-color:var(--bg-tertiary); padding:20px; border-radius:var(--border-radius-sm);">
            <p style="margin-bottom:8px;"><strong>Active Ingredient:</strong> ${product.composition}</p>
            <p style="margin-bottom:8px;"><strong>Packaging Format:</strong> ${product.packing}</p>
            <p style="margin-bottom:8px;"><strong>Standard Category:</strong> ${product.category}</p>
            <p style="margin-bottom:0; color:var(--danger); font-size:0.85rem;"><strong>Important Safety Advice:</strong> All prescription medications should be taken under appropriate supervision of a certified medical practitioner.</p>
        </div>
    `;

    // Render Related Products
    renderRelatedProducts(product);
}

function renderRelatedProducts(currProduct) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const related = PRODUCTS.filter(p => p.category === currProduct.category && p.id !== currProduct.id).slice(0, 4);
    
    if (related.length === 0) {
        // Fallback to general featured items
        PRODUCTS.filter(p => p.id !== currProduct.id).slice(0, 4).forEach(p => appendCard(p));
    } else {
        related.forEach(p => appendCard(p));
    }

    function appendCard(product) {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        grid.insertAdjacentHTML('beforeend', `
            <div class="product-card" data-id="${product.id}">
                <span class="badge badge-sale product-card-badge">-${discountPercent}%</span>
                <div class="product-img-wrapper" onclick="navigateToProduct('${product.id}')" style="cursor: pointer;">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-details">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title" onclick="navigateToProduct('${product.id}')" style="cursor: pointer;">${product.title}</h3>
                    <div class="product-footer">
                        <span class="product-price">₹${product.price.toFixed(2)}</span>
                        <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}" style="padding: 10px 16px; font-size: 0.85rem; border-radius: var(--border-radius-sm);">Add</button>
                    </div>
                </div>
            </div>
        `);
    }
}

// 7. Shopping Cart Logic
function initCart() {
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-subtotal');
    
    if (!cartContainer || !totalEl) return;
    
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p>Your shopping cart is empty.</p>
            </div>
        `;
        totalEl.textContent = '₹0.00';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        const itemHTML = `
            <div class="cart-item" data-id="${product.id}">
                <div class="cart-item-img">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${product.title}</h4>
                    <p class="cart-item-price">₹${product.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <span class="quantity-btn qty-minus" data-id="${product.id}">-</span>
                            <input class="quantity-input" type="text" value="${item.quantity}" readonly>
                            <span class="quantity-btn qty-plus" data-id="${product.id}">+</span>
                        </div>
                        <span class="cart-item-remove" data-id="${product.id}" title="Remove item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </span>
                    </div>
                </div>
            </div>
        `;
        cartContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    totalEl.textContent = `₹${subtotal.toFixed(2)}`;
}

function addToCart(productId, quantity = 1) {
    const existingIndex = cart.findIndex(item => item.productId === productId);
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    
    saveCart();
    renderCart();
    updateCartCount();
    showToast(`Added ${product.title} to cart!`, 'success');
}

function updateCartQty(productId, delta) {
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return;

    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart();
    renderCart();
    updateCartCount();
}

function removeFromCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    renderCart();
    updateCartCount();
    showToast(`Removed ${product.title} from cart.`, 'error');
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
        b.textContent = count;
        if (count > 0) b.style.display = 'flex';
        else b.style.display = 'none';
    });
}

function saveCart() {
    localStorage.setItem('rohinipharma_cart', JSON.stringify(cart));
}

// 8. Search Engine Implementation (Live filters)
function handleSearch(query) {
    const queryClean = query.trim().toLowerCase();
    const homeView = document.getElementById('home-view');
    
    // Switch to Home View if not already there, so user can see filter results
    if (activeView !== 'home') {
        window.location.hash = '#home';
    }

    const cards = document.querySelectorAll('#home-view .product-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const category = card.getAttribute('data-category');
        
        if (title.includes(queryClean) || category.includes(queryClean)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle scroll to products grid if search is executed
    if (queryClean.length > 2) {
        const gridHeader = document.querySelector('#deals-section');
        if (gridHeader) gridHeader.scrollIntoView({ behavior: 'smooth' });
    }
}

// 9. Quick View Modal Operations
function openQuickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modalBody = document.getElementById('modal-content-area');
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    
    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="product-gallery-main" style="height:350px;">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-detail-info" style="justify-content:center;">
                <span class="product-category">${product.category}</span>
                <h2 class="product-detail-title" style="font-size:1.85rem; margin-bottom:10px;">${product.title}</h2>
                <div class="product-rating" style="margin-bottom:15px;">
                    ${renderStars(product.rating)}
                    <span>(${product.reviewsCount} reviews)</span>
                </div>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:20px;">${product.description}</p>
                <div style="background-color:var(--bg-tertiary); padding:12px; border-radius:var(--border-radius-sm); margin-bottom:20px; font-size:0.85rem;">
                    <p><strong>Composition:</strong> ${product.composition}</p>
                    <p><strong>Packing:</strong> ${product.packing}</p>
                </div>
                <div class="product-detail-price-box" style="padding:12px 20px; margin-bottom:20px;">
                    <span class="product-detail-price" style="font-size:1.75rem;">₹${product.price.toFixed(2)}</span>
                    <span class="badge badge-sale">-${discountPercent}%</span>
                </div>
                <div style="display:flex; gap:16px;">
                    <button class="btn btn-primary modal-add-cart-btn" data-id="${product.id}" style="flex:1;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Add to Cart
                    </button>
                    <button class="btn btn-outline" onclick="navigateToProduct('${product.id}'); toggleQuickView(false);" style="padding:12px;">More Info</button>
                </div>
            </div>
        </div>
    `;

    toggleQuickView(true);
}

function toggleQuickView(isOpen) {
    const modalBackdrop = document.getElementById('quickview-modal');
    if (isOpen) {
        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        modalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// 10. Drawer Toggles (Cart & Mobile Navigation)
function toggleCartDrawer(isOpen) {
    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    const drawer = document.getElementById('cart-drawer');
    
    if (isOpen) {
        drawerBackdrop.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        drawerBackdrop.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function toggleMobileNav(isOpen) {
    const sidebarBackdrop = document.getElementById('mobilenav-backdrop');
    const sidebar = document.getElementById('mobilenav-drawer');
    
    if (isOpen) {
        sidebarBackdrop.classList.add('open');
        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        sidebarBackdrop.classList.remove('open');
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Toast Notifications System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Animate out
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// 11. Event Listeners Coordinator
function setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Sidebar Nav Toggle (Mobile)
    document.getElementById('mobile-menu-btn').addEventListener('click', () => toggleMobileNav(true));
    document.getElementById('mobilenav-close-btn').addEventListener('click', () => toggleMobileNav(false));
    document.getElementById('mobilenav-backdrop').addEventListener('click', () => toggleMobileNav(false));

    // Cart Drawer Toggle
    document.getElementById('cart-btn').addEventListener('click', () => toggleCartDrawer(true));
    document.getElementById('cart-drawer-close').addEventListener('click', () => toggleCartDrawer(false));
    document.getElementById('cart-drawer-backdrop').addEventListener('click', () => toggleCartDrawer(false));

    // Header Search Inputs
    const headerSearch = document.getElementById('header-search');
    headerSearch.addEventListener('keyup', (e) => {
        handleSearch(e.target.value);
    });

    // Home / Shop Quick Category clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.getAttribute('data-category');
            handleSearch(cat);
        });
    });

    // Document-level clicks (delegation for dynamically rendered components)
    document.addEventListener('click', (e) => {
        // Quick View triggers
        const qvBtn = e.target.closest('.action-quickview');
        if (qvBtn) {
            const pid = qvBtn.getAttribute('data-id');
            openQuickView(pid);
            return;
        }

        // Add to Cart buttons
        const addCartBtn = e.target.closest('.add-to-cart-btn');
        if (addCartBtn) {
            const pid = addCartBtn.getAttribute('data-id');
            addToCart(pid, 1);
            return;
        }

        // Modal Add to Cart
        const modalAddCartBtn = e.target.closest('.modal-add-cart-btn');
        if (modalAddCartBtn) {
            const pid = modalAddCartBtn.getAttribute('data-id');
            addToCart(pid, 1);
            toggleQuickView(false);
            return;
        }

        // Cart Drawer quantity controls
        const qtyPlusBtn = e.target.closest('.qty-plus');
        if (qtyPlusBtn) {
            const pid = qtyPlusBtn.getAttribute('data-id');
            updateCartQty(pid, 1);
            return;
        }

        const qtyMinusBtn = e.target.closest('.qty-minus');
        if (qtyMinusBtn) {
            const pid = qtyMinusBtn.getAttribute('data-id');
            updateCartQty(pid, -1);
            return;
        }

        // Cart Remove Button
        const removeCartBtn = e.target.closest('.cart-item-remove');
        if (removeCartBtn) {
            const pid = removeCartBtn.getAttribute('data-id');
            removeFromCart(pid);
            return;
        }
    });

    // Close Modal Backdrop Click
    document.getElementById('quickview-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('quickview-modal')) {
            toggleQuickView(false);
        }
    });
    document.getElementById('modal-close-btn').addEventListener('click', () => toggleQuickView(false));

    // Product Detail Page Tabs switcher
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Product Detail Page Quantity Incrementor
    const qtyInput = document.getElementById('detail-qty');
    if (qtyInput) {
        document.getElementById('detail-qty-minus').addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
        document.getElementById('detail-qty-plus').addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            qtyInput.value = val + 1;
        });
    }

    // Product Detail Add to Cart Action
    const detailAddBtn = document.getElementById('detail-qty-add-btn');
    if (detailAddBtn) {
        detailAddBtn.addEventListener('click', () => {
            const pid = detailAddBtn.getAttribute('data-id');
            const qty = parseInt(qtyInput.value) || 1;
            addToCart(pid, qty);
        });
    }

    // Product Detail Buy Now Action
    const detailBuyBtn = document.getElementById('detail-buy-btn');
    if (detailBuyBtn) {
        detailBuyBtn.addEventListener('click', () => {
            const pid = detailAddBtn.getAttribute('data-id');
            const qty = parseInt(qtyInput.value) || 1;
            addToCart(pid, qty);
            toggleCartDrawer(true);
        });
    }

    // Checkout button simulation
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!', 'error');
                return;
            }
            showToast('Order submitted successfully! We will contact you soon.', 'success');
            cart = [];
            saveCart();
            renderCart();
            updateCartCount();
            toggleCartDrawer(false);
        });
    }

    // Medication Request Form Validation & Simulation
    const requestForm = document.getElementById('medication-request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const medicine = document.getElementById('form-medicine').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !phone || !medicine) {
                showToast('Please fill out all required fields.', 'error');
                return;
            }

            // Simulating API success
            showToast('Medication inquiry submitted successfully! A pharmacist will verify shortly.', 'success');
            requestForm.reset();
        });
    }

    // Review Form Simulation
    const reviewForm = document.getElementById('product-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value.trim();
            const email = document.getElementById('review-email').value.trim();
            const text = document.getElementById('review-text').value.trim();

            if (!name || !email || !text) {
                showToast('Please fill out all review fields.', 'error');
                return;
            }

            // Append review to list
            const reviewList = document.getElementById('reviews-list-container');
            const placeholderText = document.getElementById('no-reviews-placeholder');
            if (placeholderText) placeholderText.style.display = 'none';

            const newReview = `
                <div class="review-item" style="animation: fadeInUp 0.5s ease;">
                    <div class="review-header">
                        <span class="review-author">${name}</span>
                        <span class="review-date">Just Now</span>
                    </div>
                    <div class="product-rating" style="margin-bottom:8px;">
                        ${renderStars(5)}
                    </div>
                    <p class="review-text">${text}</p>
                </div>
            `;
            reviewList.insertAdjacentHTML('afterbegin', newReview);

            showToast('Review submitted successfully!', 'success');
            reviewForm.reset();
        });
    }
}
