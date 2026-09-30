/**
 * Janki Framings - Core Application Controller
 * Handles Navigation, Filtering, Wholesale/Retail Toggling, Catalog & Cart
 * Indian Market Currency: INR (₹)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    pricingMode: 'retail', // 'retail' | 'wholesale'
    selectedCategory: 'all',
    selectedAudience: ['retail', 'wholesale', 'materials'],
    selectedMaterials: [],
    selectedFinishes: [],
    maxPrice: 6000,
    searchQuery: '',
    sortBy: 'featured',
    viewMode: 'grid',
    visibleCount: 12,
    cart: []
  };

  // DOM Elements Cache
  const elements = {
    wholesaleToggle: document.getElementById('wholesale-toggle'),
    optRetail: document.getElementById('opt-retail'),
    optWholesale: document.getElementById('opt-wholesale'),
    switchToWholesaleBtn: document.getElementById('switch-to-wholesale-btn'),
    footerToggleWholesale: document.getElementById('footer-toggle-wholesale'),
    modeExplainerPill: document.getElementById('pill-retail-view'),

    globalSearch: document.getElementById('global-search'),
    clearSearchBtn: document.getElementById('clear-search-btn'),

    categoriesGrid: document.getElementById('categories-grid'),
    bestsellersGrid: document.getElementById('bestsellers-grid'),
    bestsellerTabs: document.querySelectorAll('.bestseller-tab'),

    productsGrid: document.getElementById('products-grid'),
    productCountBadge: document.getElementById('product-count-badge'),
    catalogSubtitle: document.getElementById('catalog-subtitle'),
    emptyState: document.getElementById('empty-state'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    categoryFilterList: document.getElementById('category-filter-list'),
    materialFilterList: document.getElementById('material-filter-list'),
    finishFilterList: document.getElementById('finish-filter-list'),
    priceSlider: document.getElementById('price-range-slider'),
    currentPriceVal: document.getElementById('current-price-val'),
    priceModeIndicator: document.getElementById('price-mode-indicator'),

    sortSelect: document.getElementById('sort-select'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewListBtn: document.getElementById('view-list-btn'),
    tagsWrapper: document.getElementById('tags-wrapper'),
    paginationBar: document.getElementById('pagination-bar'),
    paginationInfo: document.getElementById('pagination-info'),
    loadMoreBtn: document.getElementById('load-more-btn'),

    // Cart / Drawer
    cartToggleBtn: document.getElementById('cart-drawer-toggle'),
    cartDrawerBackdrop: document.getElementById('cart-drawer-backdrop'),
    cartDrawerClose: document.getElementById('drawer-close-btn'),
    cartItemCount: document.getElementById('cart-item-count'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    drawerSubtotal: document.getElementById('drawer-subtotal'),
    drawerDiscountRow: document.getElementById('drawer-discount-row'),
    drawerDiscount: document.getElementById('drawer-discount'),
    drawerTotal: document.getElementById('drawer-total'),
    drawerPricingMode: document.getElementById('drawer-pricing-mode'),
    checkoutBtn: document.getElementById('checkout-btn'),
    downloadRfqBtn: document.getElementById('download-rfq-btn'),

    // Modals
    quickViewModal: document.getElementById('quick-view-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalProductDetails: document.getElementById('modal-product-details'),

    rfqModal: document.getElementById('rfq-modal'),
    rfqCloseBtn: document.getElementById('rfq-close-btn'),
    openRfqTopBtn: document.getElementById('open-rfq-top-btn'),
    heroRfqBtn: document.getElementById('hero-rfq-btn'),
    sidebarRfqBtn: document.getElementById('sidebar-rfq-btn'),
    openRfqBannerBtn: document.getElementById('open-rfq-banner-btn'),
    rfqForm: document.getElementById('rfq-form'),
    rfqSuccess: document.getElementById('rfq-success'),
    rfqSuccessClose: document.getElementById('rfq-success-close'),

    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    secondaryNav: document.getElementById('secondary-nav'),
    toastContainer: document.getElementById('toast-container')
  };

  // Helper for Indian Currency Formatting
  function formatINR(val) {
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  // =========================================================================
  // Initialization
  // =========================================================================
  function init() {
    setupCategoriesGrid();
    setupSidebarFilterOptions();
    renderBestsellers('all');
    renderCatalog();
    setupEventListeners();
  }

  // =========================================================================
  // Mode Switcher (Retail vs Wholesale)
  // =========================================================================
  function setPricingMode(mode) {
    state.pricingMode = mode;
    const isWholesale = mode === 'wholesale';

    elements.wholesaleToggle.checked = isWholesale;

    if (isWholesale) {
      elements.optRetail.classList.remove('active');
      elements.optWholesale.classList.add('active');
      elements.drawerPricingMode.textContent = 'Mode: Wholesale (B2B Bulk Rates)';
      elements.priceModeIndicator.textContent = '₹ Bulk';

      if (elements.modeExplainerPill) {
        elements.modeExplainerPill.innerHTML = `
          <div class="mode-pill-icon">📦</div>
          <div>
            <strong>Wholesale / B2B Retailer Mode Active</strong>
            <p>Master carton prices, bundle rates on moulding sticks, and bulk margins active. GST invoice and transport logistics available.</p>
          </div>
        `;
      }
      showToast('🏢 Wholesale B2B pricing activated (Carton & Bundle Rates)');
    } else {
      elements.optRetail.classList.add('active');
      elements.optWholesale.classList.remove('active');
      elements.drawerPricingMode.textContent = 'Mode: Retail (Single Pieces)';
      elements.priceModeIndicator.textContent = '₹ Retail';

      if (elements.modeExplainerPill) {
        elements.modeExplainerPill.innerHTML = `
          <div class="mode-pill-icon">🎨</div>
          <div>
            <strong>Retail & Custom Framing Active</strong>
            <p>Single piece pricing with custom sizing for pooja mandirs, wedding portraits, and corporate awards. No MOQ.</p>
          </div>
        `;
      }
      showToast('🎨 Retail single-piece pricing activated');
    }

    renderBestsellers(getCurrentBestsellerTab());
    renderCatalog();
    updateCartDisplay();
  }

  window.setMode = (mode) => setPricingMode(mode);

  // =========================================================================
  // Category Setup with Realistic Photos
  // =========================================================================
  function setupCategoriesGrid() {
    const displayCategories = CATEGORIES_DATA.filter(c => c.id !== 'all');

    elements.categoriesGrid.innerHTML = displayCategories.map(cat => {
      return `
        <div class="category-card" data-category="${cat.id}">
          <div class="category-img-wrap">
            <img src="${cat.photoUrl}" alt="${cat.name}" class="category-photo" loading="lazy" />
            <div class="category-img-overlay"></div>
            <div class="category-badge-chip ${cat.isPrimary ? 'primary-highlight' : ''}">
              <span>${cat.icon}</span>
              <span>${cat.isPrimary ? '★ Primary Speciality' : 'Collection'}</span>
            </div>
            <span class="category-count-tag">${cat.count} Items</span>
          </div>
          <div class="category-card-content">
            <div>
              <h3>${cat.name}</h3>
              <p>${cat.description}</p>
            </div>
            <div class="category-card-footer">
              <span>Explore Collection</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    elements.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-category');
        selectCategory(catId);
        const catalogSec = document.getElementById('catalog-section');
        if (catalogSec) {
          catalogSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function selectCategory(catId) {
    state.selectedCategory = catId;
    updateCategoryRadioButtons();
    renderCatalog();
  }

  window.filterByCategory = (catId) => {
    selectCategory(catId);
    const catalogSec = document.getElementById('catalog-section');
    if (catalogSec) {
      catalogSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.filterByAudience = (aud) => {
    state.selectedAudience = [aud];
    const audCheckboxes = document.querySelectorAll('input[name="targetAudience"]');
    audCheckboxes.forEach(cb => {
      cb.checked = (cb.value === aud);
    });
    renderCatalog();
    const catalogSec = document.getElementById('catalog-section');
    if (catalogSec) {
      catalogSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // =========================================================================
  // Sidebar Setup
  // =========================================================================
  function setupSidebarFilterOptions() {
    // 1. Categories
    elements.categoryFilterList.innerHTML = CATEGORIES_DATA.map(cat => {
      const isChecked = state.selectedCategory === cat.id ? 'checked' : '';
      return `
        <label class="filter-checkbox">
          <input type="radio" name="catRadio" value="${cat.id}" ${isChecked}>
          <span>${cat.name}</span>
          <span class="filter-count">(${cat.count})</span>
        </label>
      `;
    }).join('');

    elements.categoryFilterList.querySelectorAll('input[name="catRadio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.selectedCategory = e.target.value;
        renderCatalog();
      });
    });

    // 2. Materials
    const uniqueMaterials = [...new Set(PRODUCTS_DATA.map(p => p.material))];
    elements.materialFilterList.innerHTML = uniqueMaterials.map(mat => {
      const count = PRODUCTS_DATA.filter(p => p.material === mat).length;
      return `
        <label class="filter-checkbox">
          <input type="checkbox" name="materialFilter" value="${mat}">
          <span>${mat}</span>
          <span class="filter-count">(${count})</span>
        </label>
      `;
    }).join('');

    elements.materialFilterList.querySelectorAll('input[name="materialFilter"]').forEach(cb => {
      cb.addEventListener('change', () => {
        state.selectedMaterials = Array.from(
          elements.materialFilterList.querySelectorAll('input[name="materialFilter"]:checked')
        ).map(el => el.value);
        renderCatalog();
      });
    });

    // 3. Finishes / Colors
    const uniqueFinishes = [...new Set(PRODUCTS_DATA.map(p => p.finish))];
    elements.finishFilterList.innerHTML = uniqueFinishes.map(fin => {
      const count = PRODUCTS_DATA.filter(p => p.finish === fin).length;
      return `
        <label class="filter-checkbox">
          <input type="checkbox" name="finishFilter" value="${fin}">
          <span>${fin}</span>
          <span class="filter-count">(${count})</span>
        </label>
      `;
    }).join('');

    elements.finishFilterList.querySelectorAll('input[name="finishFilter"]').forEach(cb => {
      cb.addEventListener('change', () => {
        state.selectedFinishes = Array.from(
          elements.finishFilterList.querySelectorAll('input[name="finishFilter"]:checked')
        ).map(el => el.value);
        renderCatalog();
      });
    });
  }

  function updateCategoryRadioButtons() {
    const radios = elements.categoryFilterList.querySelectorAll('input[name="catRadio"]');
    radios.forEach(radio => {
      radio.checked = (radio.value === state.selectedCategory);
    });
  }

  // =========================================================================
  // Bestsellers / Most Sold Section
  // =========================================================================
  function renderBestsellers(filter) {
    let bestsellers = PRODUCTS_DATA.filter(p => p.isBestseller);

    if (filter !== 'all') {
      bestsellers = bestsellers.filter(p => p.bestsellerType === filter);
    }

    elements.bestsellersGrid.innerHTML = bestsellers.map(prod => createProductCardHTML(prod)).join('');
    attachProductCardEvents(elements.bestsellersGrid);
  }

  function getCurrentBestsellerTab() {
    const activeTab = document.querySelector('.bestseller-tab.active');
    return activeTab ? activeTab.getAttribute('data-filter') : 'all';
  }

  // =========================================================================
  // Main Product Catalog Filtering
  // =========================================================================
  function getFilteredProducts() {
    return PRODUCTS_DATA.filter(prod => {
      // Category filter
      if (state.selectedCategory !== 'all' && prod.category !== state.selectedCategory) {
        return false;
      }

      // Audience filter
      const matchesAudience = prod.audience.some(aud => state.selectedAudience.includes(aud));
      if (!matchesAudience) return false;

      // Material filter
      if (state.selectedMaterials.length > 0 && !state.selectedMaterials.includes(prod.material)) {
        return false;
      }

      // Finish filter
      if (state.selectedFinishes.length > 0 && !state.selectedFinishes.includes(prod.finish)) {
        return false;
      }

      // Price filter
      const currentPrice = state.pricingMode === 'wholesale' ? prod.priceWholesale : prod.priceRetail;
      if (currentPrice > state.maxPrice) {
        return false;
      }

      // Search query
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesSku = prod.sku.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesMaterial = prod.material.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesDesc && !matchesMaterial) {
          return false;
        }
      }

      return true;
    });
  }

  function sortProducts(products) {
    return [...products].sort((a, b) => {
      const priceA = state.pricingMode === 'wholesale' ? a.priceWholesale : a.priceRetail;
      const priceB = state.pricingMode === 'wholesale' ? b.priceWholesale : b.priceRetail;

      switch (state.sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'featured':
        default:
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.salesCount - a.salesCount;
      }
    });
  }

  function renderCatalog() {
    const filtered = getFilteredProducts();
    const sorted = sortProducts(filtered);

    elements.productCountBadge.textContent = `${sorted.length} Products Found`;
    elements.catalogSubtitle.textContent = `Showing frames for ${
      state.pricingMode === 'wholesale' ? 'Wholesale Retailers & Frame Workshops (B2B)' : 'Pooja Mandir, Wedding & Custom Framing'
    }`;

    renderActiveFilterTags();

    if (sorted.length === 0) {
      elements.productsGrid.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
      elements.paginationBar.classList.add('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    const visibleProducts = sorted.slice(0, state.visibleCount);
    elements.productsGrid.innerHTML = visibleProducts.map(prod => createProductCardHTML(prod)).join('');

    if (sorted.length <= state.visibleCount) {
      elements.paginationBar.classList.add('hidden');
    } else {
      elements.paginationBar.classList.remove('hidden');
      elements.paginationInfo.textContent = `Showing ${visibleProducts.length} of ${sorted.length} products`;
      elements.loadMoreBtn.textContent = `Load All ${sorted.length} Products`;
    }

    attachProductCardEvents(elements.productsGrid);
  }

  function renderActiveFilterTags() {
    const tags = [];

    if (state.selectedCategory !== 'all') {
      const catObj = CATEGORIES_DATA.find(c => c.id === state.selectedCategory);
      tags.push({ label: `Category: ${catObj ? catObj.name : state.selectedCategory}`, clear: () => selectCategory('all') });
    }

    if (state.searchQuery) {
      tags.push({ label: `Search: "${state.searchQuery}"`, clear: () => {
        state.searchQuery = '';
        elements.globalSearch.value = '';
        elements.clearSearchBtn.classList.add('hidden');
        renderCatalog();
      }});
    }

    state.selectedMaterials.forEach(mat => {
      tags.push({ label: `Material: ${mat}`, clear: () => {
        state.selectedMaterials = state.selectedMaterials.filter(m => m !== mat);
        const cb = elements.materialFilterList.querySelector(`input[value="${mat}"]`);
        if (cb) cb.checked = false;
        renderCatalog();
      }});
    });

    state.selectedFinishes.forEach(fin => {
      tags.push({ label: `Finish: ${fin}`, clear: () => {
        state.selectedFinishes = state.selectedFinishes.filter(f => f !== fin);
        const cb = elements.finishFilterList.querySelector(`input[value="${fin}"]`);
        if (cb) cb.checked = false;
        renderCatalog();
      }});
    });

    if (state.maxPrice < 6000) {
      tags.push({ label: `Max: ${formatINR(state.maxPrice)}`, clear: () => {
        state.maxPrice = 6000;
        elements.priceSlider.value = 6000;
        elements.currentPriceVal.textContent = 'Up to ₹6,000';
        renderCatalog();
      }});
    }

    if (tags.length === 0) {
      elements.tagsWrapper.innerHTML = '<span style="font-size: 0.75rem; color: #82949c;">All framing items displayed</span>';
    } else {
      elements.tagsWrapper.innerHTML = tags.map((t, idx) => `
        <span class="tag-pill">
          ${t.label}
          <button data-tag-idx="${idx}">&times;</button>
        </span>
      `).join('');

      elements.tagsWrapper.querySelectorAll('button').forEach((btn, idx) => {
        btn.addEventListener('click', () => tags[idx].clear());
      });
    }
  }

  // =========================================================================
  // Product Card HTML Builder with Realistic Photos & INR
  // =========================================================================
  function createProductCardHTML(prod) {
    const isWholesale = state.pricingMode === 'wholesale';
    const activePrice = isWholesale ? prod.priceWholesale : prod.priceRetail;
    const priceFormatted = formatINR(activePrice);

    let badgeHTML = '';
    if (prod.category === 'hindu-gods') {
      badgeHTML += `<span class="prod-badge god-frame">🕉️ Pooja Mandir</span>`;
    } else if (prod.category === 'wedding-marriage') {
      badgeHTML += `<span class="prod-badge marriage">💍 Wedding</span>`;
    } else if (prod.category === 'corporate-framing') {
      badgeHTML += `<span class="prod-badge corporate">🏢 Corporate</span>`;
    } else if (prod.category === 'bulk-retail-cartons') {
      badgeHTML += `<span class="prod-badge wholesale-pack">📦 Retail Carton</span>`;
    } else if (prod.category === 'mouldings' || prod.category === 'framing-materials') {
      badgeHTML += `<span class="prod-badge materials">🪵 Raw Material</span>`;
    }

    if (prod.isBestseller) {
      badgeHTML += `<span class="prod-badge bestseller">★ Bestseller</span>`;
    }

    let wholesaleNote = '';
    if (isWholesale) {
      wholesaleNote = `<span class="wholesale-tier-hint">${prod.wholesalePackInfo}</span>`;
    } else {
      wholesaleNote = `<span class="wholesale-tier-hint" style="color:#008f9c;">Single Unit • Bulk Discounts Available</span>`;
    }

    return `
      <article class="product-card" data-product-id="${prod.id}">
        <div class="product-card-media">
          <div class="product-badges">
            ${badgeHTML}
          </div>
          <img 
            src="${prod.photoUrl}" 
            alt="${prod.name}" 
            class="product-img" 
            loading="lazy" 
            onerror="this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'"
          />
          <div class="product-quick-view-overlay">
            <button class="btn-quick-view" data-action="quick-view" data-product-id="${prod.id}">
              View Specs
            </button>
          </div>
        </div>

        <div class="product-card-body">
          <div class="product-meta-row">
            <span class="product-sku">SKU: ${prod.sku}</span>
            <span class="product-stock" style="color: ${prod.inStock ? '#218350' : '#dc2626'}">
              ${prod.inStock ? '● In Stock' : 'Custom Order'}
            </span>
          </div>

          <h3 class="product-title" title="${prod.name}">${prod.name}</h3>
          <p class="product-dimensions">${prod.dimensions}</p>

          <div class="product-rating">
            <span>★★★★★</span>
            <span class="review-count">(${prod.reviewsCount})</span>
          </div>

          <div class="product-price-box">
            <span class="price-main">${priceFormatted}</span>
            <span class="price-label">${isWholesale ? 'ea (Wholesale B2B)' : 'ea (Retail)'}</span>
            ${wholesaleNote}
          </div>

          <div class="product-card-actions">
            <button class="btn btn-outline btn-card-add" data-action="quick-view" data-product-id="${prod.id}">
              Details
            </button>
            <button class="btn btn-primary btn-card-add" data-action="add-cart" data-product-id="${prod.id}">
              ${isWholesale ? '+ Add Carton / MOQ' : '+ Add to Order'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function attachProductCardEvents(container) {
    container.querySelectorAll('[data-action="quick-view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id');
        openQuickViewModal(id);
      });
    });

    container.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id');
        const prod = PRODUCTS_DATA.find(p => p.id === id);
        if (prod) {
          const qty = state.pricingMode === 'wholesale' ? (prod.moq || 1) : 1;
          addToCart(prod, qty);
        }
      });
    });
  }

  // =========================================================================
  // Quick View Modal
  // =========================================================================
  function openQuickViewModal(productId) {
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod) return;

    const isWholesale = state.pricingMode === 'wholesale';
    const moq = prod.moq || 1;
    const defaultQty = isWholesale ? moq : 1;

    let specsRows = '';
    for (const [key, value] of Object.entries(prod.specs)) {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      specsRows += `<tr><td>${formattedKey}</td><td>${value}</td></tr>`;
    }

    elements.modalProductDetails.innerHTML = `
      <div class="quick-view-grid">
        <div class="qv-media">
          <img src="${prod.photoUrl}" alt="${prod.name}" />
        </div>
        <div class="qv-details">
          <span class="qv-sku">SKU: ${prod.sku} • ${prod.dimensions}</span>
          <h2 class="qv-title">${prod.name}</h2>
          
          <div class="product-rating" style="margin-bottom: 0.5rem;">
            <span>★★★★★</span>
            <span class="review-count">${prod.rating} / 5.0 (${prod.reviewsCount} verified reviews)</span>
          </div>

          <p style="font-size: 0.875rem; color: #56676e; line-height: 1.5; margin-bottom: 0.75rem;">
            ${prod.description}
          </p>

          <div class="qv-pricing-table">
            <div class="qv-price-row">
              <span>Standard Retail Price:</span>
              <span><strong>${formatINR(prod.priceRetail)}</strong></span>
            </div>
            <div class="qv-price-row" style="color: var(--primary);">
              <span>Wholesale / B2B Rate:</span>
              <span class="qv-price-val" style="color: var(--primary);">${formatINR(prod.priceWholesale)}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--accent-gold-hover); font-weight: 700; margin-top: 0.25rem;">
              ${prod.wholesalePackInfo}
            </div>
          </div>

          <table class="qv-specs-table">
            <tbody>
              <tr><td>Material & Craft</td><td>${prod.material}</td></tr>
              <tr><td>Finish / Shade</td><td>${prod.finish}</td></tr>
              <tr><td>Warehouse Stock</td><td>${prod.stockCount} units available</td></tr>
              ${specsRows}
            </tbody>
          </table>

          <div class="qv-actions-row">
            <div class="qty-control">
              <button class="qty-btn" id="modal-qty-minus">-</button>
              <input type="number" class="qty-input" id="modal-qty-input" value="${defaultQty}" min="1">
              <button class="qty-btn" id="modal-qty-plus">+</button>
            </div>
            <button class="btn btn-primary" style="flex:1;" id="modal-add-cart-btn">
              Add to Order / Quote List
            </button>
          </div>
        </div>
      </div>
    `;

    const qtyInput = document.getElementById('modal-qty-input');
    document.getElementById('modal-qty-minus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    document.getElementById('modal-qty-plus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });

    document.getElementById('modal-add-cart-btn').addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || defaultQty;
      addToCart(prod, qty);
      closeQuickViewModal();
    });

    elements.quickViewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickViewModal() {
    elements.quickViewModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // =========================================================================
  // RFQ (Request for Quote) Modal
  // =========================================================================
  function openRfqModal() {
    elements.rfqModal.classList.remove('hidden');
    elements.rfqForm.classList.remove('hidden');
    elements.rfqSuccess.classList.add('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeRfqModal() {
    elements.rfqModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // =========================================================================
  // Cart & Order/Quote Drawer
  // =========================================================================
  function addToCart(product, quantity = 1) {
    const isWholesale = state.pricingMode === 'wholesale';
    const existingIndex = state.cart.findIndex(
      item => item.id === product.id && item.isWholesale === isWholesale
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        material: product.material,
        dimensions: product.dimensions,
        priceRetail: product.priceRetail,
        priceWholesale: product.priceWholesale,
        wholesalePackInfo: product.wholesalePackInfo,
        photoUrl: product.photoUrl,
        moq: product.moq || 1,
        isWholesale: isWholesale,
        quantity: quantity
      });
    }

    updateCartDisplay();
    showToast(`✓ Added ${quantity}× "${product.name}" to Order / Quote list`);
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartDisplay();
  }

  function updateCartQuantity(index, newQty) {
    if (newQty <= 0) {
      removeFromCart(index);
    } else {
      state.cart[index].quantity = newQty;
      updateCartDisplay();
    }
  }

  function updateCartDisplay() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartItemCount.textContent = totalItems;

    if (state.cart.length === 0) {
      elements.cartItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #82949c;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
          <p>Your Order & Quote list is empty.</p>
          <span style="font-size: 0.8125rem;">Browse Hindu God frames, wedding portraits, or bulk cartons to begin.</span>
        </div>
      `;
      elements.drawerSubtotal.textContent = '₹0';
      elements.drawerDiscount.textContent = '-₹0';
      elements.drawerTotal.textContent = '₹0';
      return;
    }

    let subtotal = 0;
    let wholesaleSavings = 0;

    elements.cartItemsContainer.innerHTML = state.cart.map((item, idx) => {
      const activePrice = item.isWholesale ? item.priceWholesale : item.priceRetail;
      const lineTotal = activePrice * item.quantity;
      subtotal += lineTotal;

      if (item.isWholesale) {
        wholesaleSavings += (item.priceRetail - item.priceWholesale) * item.quantity;
      }

      return `
        <div class="cart-item">
          <div class="cart-item-thumb">
            <img src="${item.photoUrl}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-sku">SKU: ${item.sku} • ${item.dimensions}</div>
            <div class="cart-item-price">
              ${formatINR(activePrice)} ea
              ${item.isWholesale ? '<span style="color:#d49b29; font-size:0.75rem; font-weight:700;">(Wholesale B2B)</span>' : ''}
            </div>
            <div class="cart-item-qty">
              <label style="font-size: 0.75rem; color:#56676e;">Qty:</label>
              <input type="number" min="1" value="${item.quantity}" data-cart-idx="${idx}" class="cart-qty-input">
              <button class="cart-item-remove" data-cart-idx="${idx}">Remove</button>
            </div>
          </div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--primary);">
            ${formatINR(lineTotal)}
          </div>
        </div>
      `;
    }).join('');

    elements.drawerSubtotal.textContent = formatINR(subtotal);
    if (wholesaleSavings > 0) {
      elements.drawerDiscountRow.classList.remove('hidden');
      elements.drawerDiscount.textContent = `-${formatINR(wholesaleSavings)} Bulk Savings`;
    } else {
      elements.drawerDiscountRow.classList.add('hidden');
    }
    elements.drawerTotal.textContent = formatINR(subtotal);

    elements.cartItemsContainer.querySelectorAll('.cart-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-cart-idx'));
        const val = parseInt(e.target.value) || 1;
        updateCartQuantity(idx, val);
      });
    });

    elements.cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-cart-idx'));
        removeFromCart(idx);
      });
    });
  }

  function toggleCartDrawer(open) {
    if (open) {
      elements.cartDrawerBackdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      elements.cartDrawerBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  // Export order specification sheet for Indian Framing Trade
  function exportOrderSpecSheet() {
    if (state.cart.length === 0) {
      showToast('⚠️ Your quote list is empty. Add frames first.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-IN');
    let text = `=========================================================\n`;
    text += ` JANKI FRAMINGS - ORDER / RFQ SPECIFICATION SHEET\n`;
    text += ` Wholesale Manufacturer & Custom Picture Framers\n`;
    text += ` Date Generated: ${dateStr}\n`;
    text += ` Pricing Mode: ${state.pricingMode.toUpperCase()}\n`;
    text += `=========================================================\n\n`;

    let total = 0;
    state.cart.forEach((item, i) => {
      const unitPrice = item.isWholesale ? item.priceWholesale : item.priceRetail;
      const lineTotal = unitPrice * item.quantity;
      total += lineTotal;

      text += `ITEM #${i + 1}: ${item.name}\n`;
      text += `  SKU: ${item.sku}\n`;
      text += `  Dimensions: ${item.dimensions}\n`;
      text += `  Material: ${item.material}\n`;
      text += `  Quantity: ${item.quantity}\n`;
      text += `  Unit Rate: ${formatINR(unitPrice)} (${item.isWholesale ? 'Wholesale B2B' : 'Retail'})\n`;
      text += `  Subtotal: ${formatINR(lineTotal)}\n`;
      text += `---------------------------------------------------------\n`;
    });

    text += `\nESTIMATED TOTAL: ${formatINR(total)}\n`;
    text += `\nNote: GST (18%) and transport freight extra as applicable.\n`;
    text += `Wholesale Desk: wholesale@jankiframings.com | WhatsApp: +91 98765 43210\n`;
    text += `Main Factory & Showroom: Janki Framing Works, Industrial Estate, India\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Janki_Framings_Spec_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('📄 Order specification sheet downloaded successfully!');
  }

  // Toast Notification Helper
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================
  function setupEventListeners() {
    // Wholesale Mode Switcher
    elements.wholesaleToggle.addEventListener('change', (e) => {
      setPricingMode(e.target.checked ? 'wholesale' : 'retail');
    });

    if (elements.switchToWholesaleBtn) {
      elements.switchToWholesaleBtn.addEventListener('click', () => {
        setPricingMode('wholesale');
        const catalogSec = document.getElementById('catalog-section');
        if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (elements.footerToggleWholesale) {
      elements.footerToggleWholesale.addEventListener('click', (e) => {
        e.preventDefault();
        setPricingMode(state.pricingMode === 'retail' ? 'wholesale' : 'retail');
      });
    }

    // Search bar
    elements.globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.searchQuery.length > 0) {
        elements.clearSearchBtn.classList.remove('hidden');
      } else {
        elements.clearSearchBtn.classList.add('hidden');
      }
      renderCatalog();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.globalSearch.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.classList.add('hidden');
      renderCatalog();
    });

    // Audience filter checkboxes
    document.querySelectorAll('input[name="targetAudience"]').forEach(cb => {
      cb.addEventListener('change', () => {
        state.selectedAudience = Array.from(
          document.querySelectorAll('input[name="targetAudience"]:checked')
        ).map(el => el.value);
        renderCatalog();
      });
    });

    // Price range slider
    elements.priceSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.maxPrice = val;
      elements.currentPriceVal.textContent = `Up to ${formatINR(val)}`;
      renderCatalog();
    });

    // Sort select
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderCatalog();
    });

    // View toggles (Grid vs List)
    elements.viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      elements.viewGridBtn.classList.add('active');
      elements.viewListBtn.classList.remove('active');
      elements.productsGrid.classList.remove('list-view');
    });

    elements.viewListBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      elements.viewListBtn.classList.add('active');
      elements.viewGridBtn.classList.remove('active');
      elements.productsGrid.classList.add('list-view');
    });

    // Load more pagination
    elements.loadMoreBtn.addEventListener('click', () => {
      state.visibleCount = PRODUCTS_DATA.length;
      renderCatalog();
    });

    // Reset filters
    const resetAllFilters = () => {
      state.selectedCategory = 'all';
      state.selectedAudience = ['retail', 'wholesale', 'materials'];
      state.selectedMaterials = [];
      state.selectedFinishes = [];
      state.maxPrice = 6000;
      state.searchQuery = '';
      elements.globalSearch.value = '';
      elements.clearSearchBtn.classList.add('hidden');
      elements.priceSlider.value = 6000;
      elements.currentPriceVal.textContent = 'Up to ₹6,000';

      document.querySelectorAll('input[name="materialFilter"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="finishFilter"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="targetAudience"]').forEach(cb => cb.checked = true);
      updateCategoryRadioButtons();

      renderCatalog();
      showToast('Filters reset to show all items');
    };

    elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    elements.emptyResetBtn.addEventListener('click', resetAllFilters);

    const viewAllCatsBtn = document.getElementById('view-all-cats-btn');
    if (viewAllCatsBtn) {
      viewAllCatsBtn.addEventListener('click', () => {
        selectCategory('all');
        const catSec = document.getElementById('catalog-section');
        if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Bestseller tab filters
    elements.bestsellerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.bestsellerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');
        renderBestsellers(filter);
      });
    });

    // Cart drawer toggles
    elements.cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    elements.cartDrawerClose.addEventListener('click', () => toggleCartDrawer(false));
    elements.cartDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.cartDrawerBackdrop) {
        toggleCartDrawer(false);
      }
    });

    elements.downloadRfqBtn.addEventListener('click', exportOrderSpecSheet);
    elements.checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('⚠️ Please add frames before requesting quote.');
        return;
      }
      toggleCartDrawer(false);
      openRfqModal();
    });

    // Modal Close
    elements.modalCloseBtn.addEventListener('click', closeQuickViewModal);
    elements.quickViewModal.addEventListener('click', (e) => {
      if (e.target === elements.quickViewModal) {
        closeQuickViewModal();
      }
    });

    // RFQ triggers & modal
    [elements.openRfqTopBtn, elements.heroRfqBtn, elements.sidebarRfqBtn, elements.openRfqBannerBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', openRfqModal);
    });

    document.querySelectorAll('.open-rfq-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openRfqModal();
      });
    });

    elements.rfqCloseBtn.addEventListener('click', closeRfqModal);
    elements.rfqModal.addEventListener('click', (e) => {
      if (e.target === elements.rfqModal) {
        closeRfqModal();
      }
    });

    elements.rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      elements.rfqForm.classList.add('hidden');
      elements.rfqSuccess.classList.remove('hidden');
    });

    elements.rfqSuccessClose.addEventListener('click', closeRfqModal);

    // Mobile Hamburger Menu
    elements.mobileMenuBtn.addEventListener('click', () => {
      elements.secondaryNav.classList.toggle('mobile-active');
    });

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeQuickViewModal();
        closeRfqModal();
        toggleCartDrawer(false);
      }
    });
  }

  init();
});
