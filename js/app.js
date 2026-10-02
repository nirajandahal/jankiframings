/**
 * Janki Framings - Core Application Controller
 * Handles Navigation, Filtering, Wholesale/Retail Toggling, Catalog & Multi-Page PDP/Cart
 * Indian Market Currency: INR (₹)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load saved pricing mode & cart from localStorage
  const savedMode = localStorage.getItem('janki_pricing_mode') || 'retail';
  let savedCart = [];
  try {
    const rawCart = localStorage.getItem('janki_cart');
    if (rawCart) savedCart = JSON.parse(rawCart);
  } catch (e) {
    savedCart = [];
  }

  // Application State
  const state = {
    pricingMode: savedMode, // 'retail' | 'wholesale'
    selectedCategory: 'all',
    selectedAudience: ['retail', 'wholesale', 'materials'],
    selectedMaterials: [],
    selectedFinishes: [],
    maxPrice: 6000,
    searchQuery: '',
    sortBy: 'featured',
    viewMode: 'grid',
    visibleCount: 12,
    cart: savedCart,
    // PDP specific state
    pdpCurrentProduct: null,
    pdpSelectedSize: '',
    pdpSelectedFinish: '',
    pdpQuantity: 1,
    pdpSizeMultiplier: 1.0
  };

  // Helper for Indian Currency Formatting
  function formatINR(val) {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  }

  // Save Cart to LocalStorage
  function saveCartToStorage() {
    try {
      localStorage.setItem('janki_cart', JSON.stringify(state.cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }

  // Save Mode to LocalStorage
  function saveModeToStorage(mode) {
    try {
      localStorage.setItem('janki_pricing_mode', mode);
    } catch (e) {
      console.warn('Could not save mode to localStorage', e);
    }
  }

  // DOM Elements Cache (with safe references)
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

    // Mobile Filter Drawer
    openMobileFilterBtn: document.getElementById('open-mobile-filter-btn'),
    closeMobileFilterBtn: document.getElementById('close-mobile-filter-btn'),
    mobileFilterBackdrop: document.getElementById('mobile-filter-drawer-backdrop'),
    applyMobileFilterBtn: document.getElementById('apply-mobile-filter-btn'),
    mobileResetFiltersBtn: document.getElementById('mobile-reset-filters-btn'),
    mobileCategoryList: document.getElementById('mobile-category-list'),
    mobileMaterialList: document.getElementById('mobile-material-list'),
    mobileFinishList: document.getElementById('mobile-finish-list'),
    mobilePriceSlider: document.getElementById('mobile-price-slider'),
    mobilePriceVal: document.getElementById('mobile-price-val'),

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
    toastContainer: document.getElementById('toast-container'),

    // PDP Elements
    pdpTitle: document.getElementById('pdp-title'),
    pdpCategoryLink: document.getElementById('pdp-category-link'),
    pdpBreadcrumbTitle: document.getElementById('pdp-breadcrumb-title'),
    pdpCategoryBadge: document.getElementById('pdp-category-badge'),
    pdpFloatingBadge: document.getElementById('pdp-floating-badge'),
    pdpSku: document.getElementById('pdp-sku'),
    pdpStockStatus: document.getElementById('pdp-stock-status'),
    pdpRatingText: document.getElementById('pdp-rating-text'),
    pdpDesc: document.getElementById('pdp-desc'),
    pdpMainImageWrap: document.getElementById('pdp-main-image-wrap'),
    pdpMainImg: document.getElementById('pdp-main-img'),
    pdpThumbsRow: document.getElementById('pdp-thumbs-row'),
    pdpMainPrice: document.getElementById('pdp-main-price'),
    pdpMrpPrice: document.getElementById('pdp-mrp-price'),
    pdpSavingsPill: document.getElementById('pdp-savings-pill'),
    pdpModeText: document.getElementById('pdp-mode-text'),
    pdpModeToggle: document.getElementById('pdp-mode-toggle'),
    tierPrice1: document.getElementById('tier-price-1'),
    tierPrice2: document.getElementById('tier-price-2'),
    tierPrice3: document.getElementById('tier-price-3'),
    tierRow1: document.getElementById('tier-row-1'),
    tierRow2: document.getElementById('tier-row-2'),
    tierRow3: document.getElementById('tier-row-3'),
    pdpSizesContainer: document.getElementById('pdp-sizes-container'),
    selectedSizeLabel: document.getElementById('selected-size-label'),
    pdpFinishesContainer: document.getElementById('pdp-finishes-container'),
    selectedFinishLabel: document.getElementById('selected-finish-label'),
    pdpQtyInput: document.getElementById('pdp-qty-input'),
    qtyMinusBtn: document.getElementById('qty-minus-btn'),
    qtyPlusBtn: document.getElementById('qty-plus-btn'),
    pdpLiveTotal: document.getElementById('pdp-live-total'),
    pdpTierUnlockedMsg: document.getElementById('pdp-tier-unlocked-msg'),
    pdpAddToCartBtn: document.getElementById('pdp-add-to-cart-btn'),
    pdpWhatsappBtn: document.getElementById('pdp-whatsapp-btn'),
    pdpRfqBtn: document.getElementById('pdp-rfq-btn'),
    pdpSpecsGrid: document.getElementById('pdp-specs-grid'),
    pdpRelatedGrid: document.getElementById('pdp-related-grid'),
    pdpStickyBar: document.getElementById('pdp-sticky-bar'),
    stickyBarPrice: document.getElementById('sticky-bar-price'),
    stickyBarMode: document.getElementById('sticky-bar-mode'),
    stickyWhatsappBtn: document.getElementById('sticky-whatsapp-btn'),
    stickyAddBtn: document.getElementById('sticky-add-btn')
  };

  // =========================================================================
  // Master Initialization
  // =========================================================================
  function init() {
    // 1. Initialize UI with saved pricing mode
    applyPricingModeUI(state.pricingMode, false);

    // 2. Initialize Cart UI
    updateCartDisplay();

    // 3. Page specific setups
    if (elements.pdpTitle) {
      // We are on product-detail.html
      initProductDetailPage();
    } else {
      // We are on index.html or products.html or categories.html
      if (elements.productsGrid) {
        parseURLParamsAndFilter();
      }
      if (elements.categoriesGrid) {
        setupCategoriesGrid();
      }
      if (elements.categoryFilterList) {
        setupSidebarFilterOptions();
      }
      if (elements.bestsellersGrid) {
        renderBestsellers('all');
      }
      if (elements.productsGrid) {
        updateCategoryRadioButtons();
        renderCatalog();
      }
    }

    setupEventListeners();
  }

  // =========================================================================
  // Mode Switcher (Retail vs Wholesale)
  // =========================================================================
  function setPricingMode(mode, showNotification = true) {
    state.pricingMode = mode;
    saveModeToStorage(mode);
    applyPricingModeUI(mode, showNotification);

    // If on Catalog, re-render
    if (elements.productsGrid && !elements.pdpTitle) {
      renderCatalog();
    }

    // If on PDP, update prices
    if (elements.pdpTitle && state.pdpCurrentProduct) {
      updatePDPPricingAndTiers();
    }

    // If on Home Bestsellers, re-render
    if (elements.bestsellersGrid) {
      renderBestsellers(getCurrentBestsellerTab());
    }

    updateCartDisplay();
  }

  function applyPricingModeUI(mode, showNotification = true) {
    const isWholesale = mode === 'wholesale';

    if (elements.wholesaleToggle) {
      elements.wholesaleToggle.checked = isWholesale;
    }

    if (elements.optRetail && elements.optWholesale) {
      if (isWholesale) {
        elements.optRetail.classList.remove('active');
        elements.optWholesale.classList.add('active');
      } else {
        elements.optRetail.classList.add('active');
        elements.optWholesale.classList.remove('active');
      }
    }

    if (elements.drawerPricingMode) {
      elements.drawerPricingMode.textContent = isWholesale 
        ? 'Mode: Wholesale (B2B Bulk Rates)' 
        : 'Mode: Retail (Single Pieces)';
    }

    if (elements.priceModeIndicator) {
      elements.priceModeIndicator.textContent = isWholesale ? '₹ Bulk' : '₹ Retail';
    }

    if (elements.modeExplainerPill) {
      if (isWholesale) {
        elements.modeExplainerPill.innerHTML = `
          <div class="mode-pill-icon">📦</div>
          <div>
            <strong>Wholesale / B2B Retailer Mode Active</strong>
            <p>Master carton prices, bundle rates on moulding sticks, and bulk margins active. GST invoice and transport logistics available.</p>
          </div>
        `;
      } else {
        elements.modeExplainerPill.innerHTML = `
          <div class="mode-pill-icon">🎨</div>
          <div>
            <strong>Retail & Custom Framing Active</strong>
            <p>Single piece pricing with custom sizing for pooja mandirs, wedding portraits, and corporate awards. No MOQ.</p>
          </div>
        `;
      }
    }

    if (showNotification) {
      if (isWholesale) {
        showToast('🏢 Wholesale B2B pricing activated (Carton & Bundle Rates)');
      } else {
        showToast('🎨 Retail single-piece pricing activated');
      }
    }
  }

  window.setMode = (mode) => setPricingMode(mode);

  // =========================================================================
  // URL Query Parameters Handling (products.html)
  // =========================================================================
  function parseURLParamsAndFilter() {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const searchParam = params.get('search');
    const audienceParam = params.get('audience');
    const sortParam = params.get('sort');

    if (catParam) {
      state.selectedCategory = catParam;
      const catObj = CATEGORIES_DATA.find(c => c.id === catParam);
      if (catObj) {
        // Update header banner if on products.html
        const heroTitle = document.getElementById('catalog-hero-title');
        const heroDesc = document.getElementById('catalog-hero-desc');
        const heroBadge = document.getElementById('catalog-page-badge');
        const breadcrumbCat = document.getElementById('breadcrumb-category-name');

        if (heroTitle) heroTitle.innerHTML = `${catObj.name} <span>Collection</span>`;
        if (heroDesc) heroDesc.textContent = catObj.description;
        if (heroBadge) heroBadge.innerHTML = `<span>${catObj.icon}</span> ${catObj.tag || 'Specialty'}`;
        if (breadcrumbCat) breadcrumbCat.textContent = catObj.name;
      }
    }

    if (searchParam) {
      state.searchQuery = searchParam;
      if (elements.globalSearch) {
        elements.globalSearch.value = searchParam;
      }
      if (elements.clearSearchBtn) {
        elements.clearSearchBtn.classList.remove('hidden');
      }
    }

    if (audienceParam) {
      state.selectedAudience = [audienceParam];
      document.querySelectorAll('input[name="targetAudience"]').forEach(cb => {
        cb.checked = (cb.value === audienceParam);
      });
    }

    if (sortParam) {
      const normalizedSort = (sortParam === 'bestselling') ? 'bestseller' : sortParam;
      state.sortBy = normalizedSort;
      if (elements.sortSelect) {
        elements.sortSelect.value = normalizedSort;
      }
    }
  }

  // =========================================================================
  // Category Setup (Home Page Preview)
  // =========================================================================
  function setupCategoriesGrid() {
    if (!elements.categoriesGrid) return;
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
        if (window.location.pathname.includes('products.html')) {
          selectCategory(catId);
        } else {
          window.location.href = `products.html?category=${catId}`;
        }
      });
    });
  }

  // =========================================================================
  // Sidebar Filter Options (Catalog Page)
  // =========================================================================
  function setupSidebarFilterOptions() {
    if (!elements.categoryFilterList) return;

    // Categories list
    elements.categoryFilterList.innerHTML = CATEGORIES_DATA.map(cat => `
      <label class="radio-label">
        <input 
          type="radio" 
          name="catalogCategory" 
          value="${cat.id}" 
          ${state.selectedCategory === cat.id ? 'checked' : ''}
        />
        <span>${cat.icon} ${cat.name}</span>
        <span class="count">${cat.count}</span>
      </label>
    `).join('');

    if (elements.mobileCategoryList) {
      elements.mobileCategoryList.innerHTML = elements.categoryFilterList.innerHTML;
      elements.mobileCategoryList.querySelectorAll('input[name="catalogCategory"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          selectCategory(e.target.value);
        });
      });
    }

    elements.categoryFilterList.querySelectorAll('input[name="catalogCategory"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectCategory(e.target.value);
      });
    });

    // Unique Materials
    const materials = Array.from(new Set(PRODUCTS_DATA.map(p => p.material))).filter(Boolean);
    if (elements.materialFilterList) {
      elements.materialFilterList.innerHTML = materials.map(mat => `
        <label class="checkbox-label">
          <input type="checkbox" name="materialFilter" value="${mat}" />
          <span>${mat}</span>
        </label>
      `).join('');

      elements.materialFilterList.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          state.selectedMaterials = Array.from(
            elements.materialFilterList.querySelectorAll('input:checked')
          ).map(el => el.value);
          renderCatalog();
        });
      });

      if (elements.mobileMaterialList) {
        elements.mobileMaterialList.innerHTML = elements.materialFilterList.innerHTML;
        elements.mobileMaterialList.querySelectorAll('input').forEach(cb => {
          cb.addEventListener('change', () => {
            state.selectedMaterials = Array.from(
              elements.mobileMaterialList.querySelectorAll('input:checked')
            ).map(el => el.value);
            renderCatalog();
          });
        });
      }
    }

    // Unique Finishes
    const finishes = Array.from(new Set(PRODUCTS_DATA.map(p => p.finish))).filter(Boolean);
    if (elements.finishFilterList) {
      elements.finishFilterList.innerHTML = finishes.map(fin => `
        <label class="checkbox-label">
          <input type="checkbox" name="finishFilter" value="${fin}" />
          <span>${fin}</span>
        </label>
      `).join('');

      elements.finishFilterList.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          state.selectedFinishes = Array.from(
            elements.finishFilterList.querySelectorAll('input:checked')
          ).map(el => el.value);
          renderCatalog();
        });
      });

      if (elements.mobileFinishList) {
        elements.mobileFinishList.innerHTML = elements.finishFilterList.innerHTML;
        elements.mobileFinishList.querySelectorAll('input').forEach(cb => {
          cb.addEventListener('change', () => {
            state.selectedFinishes = Array.from(
              elements.mobileFinishList.querySelectorAll('input:checked')
            ).map(el => el.value);
            renderCatalog();
          });
        });
      }
    }
  }

  function selectCategory(catId) {
    state.selectedCategory = catId;
    updateCategoryRadioButtons();
    renderCatalog();

    const catObj = CATEGORIES_DATA.find(c => c.id === catId);
    if (catObj) {
      const heroTitle = document.getElementById('catalog-hero-title');
      const heroDesc = document.getElementById('catalog-hero-desc');
      const breadcrumbCat = document.getElementById('breadcrumb-category-name');

      if (heroTitle) {
        heroTitle.innerHTML = catId === 'all' 
          ? `All Framing Products & <span>Workshop Supplies</span>` 
          : `${catObj.name} <span>Collection</span>`;
      }
      if (heroDesc) heroDesc.textContent = catObj.description;
      if (breadcrumbCat) breadcrumbCat.textContent = catObj.name;
    }
  }

  window.filterByCategory = (catId) => {
    selectCategory(catId);
    const catalogSec = document.getElementById('catalog-section');
    if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
  };

  window.filterByAudience = (aud) => {
    state.selectedAudience = [aud];
    document.querySelectorAll('input[name="targetAudience"]').forEach(cb => {
      cb.checked = (cb.value === aud);
    });
    renderCatalog();
    const catalogSec = document.getElementById('catalog-section');
    if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
  };

  function updateCategoryRadioButtons() {
    document.querySelectorAll('input[name="catalogCategory"]').forEach(r => {
      const isSelected = (r.value === state.selectedCategory);
      r.checked = isSelected;
      const parentLabel = r.closest('label');
      if (parentLabel) {
        if (isSelected) {
          parentLabel.classList.add('active');
        } else {
          parentLabel.classList.remove('active');
        }
      }
    });
  }

  // =========================================================================
  // Bestsellers Carousel / Grid (Home Page)
  // =========================================================================
  function getCurrentBestsellerTab() {
    const active = document.querySelector('.bestseller-tab.active');
    return active ? active.getAttribute('data-filter') : 'all';
  }

  function renderBestsellers(filterType) {
    if (!elements.bestsellersGrid) return;

    let items = PRODUCTS_DATA.filter(p => p.isBestseller);

    if (filterType !== 'all') {
      items = items.filter(p => p.bestsellerType === filterType);
    }

    items = items.slice(0, 4);

    elements.bestsellersGrid.innerHTML = items.map(prod => createProductCardHTML(prod)).join('');
    attachProductCardEvents(elements.bestsellersGrid);
  }

  // =========================================================================
  // Product Catalog Filtering & Rendering
  // =========================================================================
  function renderCatalog() {
    if (!elements.productsGrid) return;

    const filtered = PRODUCTS_DATA.filter(prod => {
      if (state.selectedCategory !== 'all' && prod.category !== state.selectedCategory) {
        return false;
      }

      const matchesAudience = prod.audience.some(aud => state.selectedAudience.includes(aud));
      if (!matchesAudience) return false;

      const activePrice = state.pricingMode === 'wholesale' ? prod.priceWholesale : prod.priceRetail;
      if (activePrice > state.maxPrice) return false;

      if (state.selectedMaterials.length > 0 && !state.selectedMaterials.includes(prod.material)) {
        return false;
      }

      if (state.selectedFinishes.length > 0 && !state.selectedFinishes.includes(prod.finish)) {
        return false;
      }

      if (state.searchQuery.trim().length > 0) {
        const query = state.searchQuery.toLowerCase();
        const inName = prod.name.toLowerCase().includes(query);
        const inSku = prod.sku.toLowerCase().includes(query);
        const inDesc = prod.description.toLowerCase().includes(query);
        const inCategory = prod.category.toLowerCase().includes(query);
        if (!inName && !inSku && !inDesc && !inCategory) return false;
      }

      return true;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      const priceA = state.pricingMode === 'wholesale' ? a.priceWholesale : a.priceRetail;
      const priceB = state.pricingMode === 'wholesale' ? b.priceWholesale : b.priceRetail;

      switch (state.sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'rating': return b.rating - a.rating;
        case 'bestseller': return (b.salesCount || 0) - (a.salesCount || 0);
        case 'featured':
        default:
          if (a.category === 'hindu-gods' && b.category !== 'hindu-gods') return -1;
          if (b.category === 'hindu-gods' && a.category !== 'hindu-gods') return 1;
          return 0;
      }
    });

    if (elements.productCountBadge) {
      elements.productCountBadge.textContent = `${sorted.length} Products Found`;
    }
    const mobileCount = document.getElementById('mobile-filter-count');
    if (mobileCount) {
      mobileCount.textContent = `${sorted.length}`;
    }

    if (elements.catalogSubtitle) {
      const activeCat = CATEGORIES_DATA.find(c => c.id === state.selectedCategory);
      const catName = activeCat ? activeCat.name : 'All Framing';
      elements.catalogSubtitle.textContent = `Browsing ${catName} (${state.pricingMode === 'wholesale' ? 'B2B Wholesale Carton Pricing' : 'Retail Single Frame Pricing'})`;
    }

    renderActiveFilterTags();

    if (sorted.length === 0) {
      elements.productsGrid.innerHTML = '';
      if (elements.emptyState) elements.emptyState.classList.remove('hidden');
      if (elements.paginationBar) elements.paginationBar.classList.add('hidden');
      return;
    }

    if (elements.emptyState) elements.emptyState.classList.add('hidden');
    if (elements.paginationBar) elements.paginationBar.classList.remove('hidden');

    const visibleProducts = sorted.slice(0, state.visibleCount);
    elements.productsGrid.innerHTML = visibleProducts.map(p => createProductCardHTML(p)).join('');

    if (elements.paginationInfo && elements.loadMoreBtn) {
      if (visibleProducts.length >= sorted.length) {
        elements.paginationInfo.textContent = `Showing all ${sorted.length} products`;
        elements.loadMoreBtn.classList.add('hidden');
      } else {
        elements.paginationInfo.textContent = `Showing ${visibleProducts.length} of ${sorted.length} products`;
        elements.loadMoreBtn.classList.remove('hidden');
        elements.loadMoreBtn.textContent = `Load All ${sorted.length} Products`;
      }
    }

    attachProductCardEvents(elements.productsGrid);
  }

  function renderActiveFilterTags() {
    if (!elements.tagsWrapper) return;
    const tags = [];

    if (state.selectedCategory !== 'all') {
      const catObj = CATEGORIES_DATA.find(c => c.id === state.selectedCategory);
      tags.push({ label: `Category: ${catObj ? catObj.name : state.selectedCategory}`, clear: () => selectCategory('all') });
    }

    if (state.searchQuery) {
      tags.push({ label: `Search: "${state.searchQuery}"`, clear: () => {
        state.searchQuery = '';
        if (elements.globalSearch) elements.globalSearch.value = '';
        if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
        renderCatalog();
      }});
    }

    state.selectedMaterials.forEach(mat => {
      tags.push({ label: `Material: ${mat}`, clear: () => {
        state.selectedMaterials = state.selectedMaterials.filter(m => m !== mat);
        if (elements.materialFilterList) {
          const cb = elements.materialFilterList.querySelector(`input[value="${mat}"]`);
          if (cb) cb.checked = false;
        }
        renderCatalog();
      }});
    });

    state.selectedFinishes.forEach(fin => {
      tags.push({ label: `Finish: ${fin}`, clear: () => {
        state.selectedFinishes = state.selectedFinishes.filter(f => f !== fin);
        if (elements.finishFilterList) {
          const cb = elements.finishFilterList.querySelector(`input[value="${fin}"]`);
          if (cb) cb.checked = false;
        }
        renderCatalog();
      }});
    });

    if (state.maxPrice < 6000) {
      tags.push({ label: `Max: ${formatINR(state.maxPrice)}`, clear: () => {
        state.maxPrice = 6000;
        if (elements.priceSlider) elements.priceSlider.value = 6000;
        if (elements.currentPriceVal) elements.currentPriceVal.textContent = 'Up to ₹6,000';
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
  // Product Card HTML Builder with Realistic Indian Photos & Links
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
      badgeHTML += `<span class="prod-badge materials">🪵 Workshop Material</span>`;
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
          <a href="product-detail.html?id=${prod.id}" class="product-img-link" aria-label="View ${prod.name}">
            <img 
              src="${prod.photoUrl}" 
              alt="${prod.name}" 
              class="product-img" 
              loading="lazy" 
              onerror="this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'"
            />
          </a>
          <div class="product-quick-view-overlay">
            <button class="btn-quick-view" data-action="quick-view" data-product-id="${prod.id}" aria-label="Quick specs preview">
              Quick Specs
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

          <h3 class="product-title" title="${prod.name}">
            <a href="product-detail.html?id=${prod.id}">${prod.name}</a>
          </h3>
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
            <a href="product-detail.html?id=${prod.id}" class="btn btn-outline btn-card-add">
              Details &rarr;
            </a>
            <button class="btn btn-primary btn-card-add" data-action="add-cart" data-product-id="${prod.id}">
              ${isWholesale ? '+ Add Carton' : '+ Add to Order'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function attachProductCardEvents(container) {
    if (!container) return;

    // Quick View Modal
    container.querySelectorAll('[data-action="quick-view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id');
        openQuickViewModal(id);
      });
    });

    // Add to Cart
    container.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id');
        const prod = PRODUCTS_DATA.find(p => p.id === id);
        if (prod) {
          const qty = state.pricingMode === 'wholesale' ? (prod.moq || 6) : 1;
          addToCart(prod, qty);
        }
      });
    });
  }

  // =========================================================================
  // Product Detail Page (PDP) Dynamic Controller
  // =========================================================================
  function initProductDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'god-001';
    const product = getProductById(productId);

    state.pdpCurrentProduct = product;
    state.pdpSelectedSize = product.availableSizes ? product.availableSizes[0] : product.dimensions;
    state.pdpSelectedFinish = product.finish || 'Antique Temple Gold';
    state.pdpQuantity = 1;
    state.pdpSizeMultiplier = 1.0;

    // 1. Page Title & Meta
    document.title = `${product.name} | Janki Framings`;
    if (elements.pdpTitle) elements.pdpTitle.textContent = product.name;
    if (elements.pdpBreadcrumbTitle) elements.pdpBreadcrumbTitle.textContent = product.name;
    if (elements.pdpDesc) elements.pdpDesc.textContent = product.description;
    if (elements.pdpSku) elements.pdpSku.textContent = `SKU: ${product.sku}`;
    if (elements.pdpStockStatus) {
      elements.pdpStockStatus.textContent = product.inStock 
        ? `● In Stock (${product.stockCount || 150} Ready in Factory)` 
        : 'Made to Order (2-3 Days)';
    }
    if (elements.pdpRatingText) {
      elements.pdpRatingText.textContent = `${product.rating} (${product.reviewsCount} Verified Indian Reviews)`;
    }

    // Category links & badge
    const cat = getCategoryById(product.category);
    if (elements.pdpCategoryLink) {
      elements.pdpCategoryLink.textContent = cat ? cat.name : 'Category';
      elements.pdpCategoryLink.href = `products.html?category=${product.category}`;
    }
    if (elements.pdpCategoryBadge) {
      elements.pdpCategoryBadge.textContent = cat ? cat.name : 'Framing';
    }
    if (elements.pdpFloatingBadge) {
      elements.pdpFloatingBadge.textContent = product.category === 'hindu-gods' 
        ? '🕉️ 24K Gold Foil Pooja Frame' 
        : (cat ? cat.name : 'Artisan Frame');
    }

    // 2. Multi-Angle Gallery Photos (Guaranteed 3-4 images)
    let photos = (product.galleryPhotos && product.galleryPhotos.length > 0) 
      ? [...product.galleryPhotos] 
      : [product.photoUrl];

    if (photos.length === 1) {
      if (product.category === 'hindu-gods') {
        photos.push(
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
        );
      } else if (product.category === 'wedding-marriage') {
        photos.push(
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
        );
      } else if (product.category === 'corporate-framing') {
        photos.push(
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'
        );
      } else {
        photos.push(
          'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80'
        );
      }
    }

    if (elements.pdpMainImg) {
      elements.pdpMainImg.src = photos[0];
      elements.pdpMainImg.alt = product.name;
    }

    if (elements.pdpThumbsRow) {
      elements.pdpThumbsRow.innerHTML = photos.map((imgUrl, idx) => `
        <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-img-url="${imgUrl}" aria-label="View photo angle ${idx+1}">
          <img src="${imgUrl}" alt="Thumbnail ${idx+1}" />
        </button>
      `).join('');

      elements.pdpThumbsRow.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.pdpThumbsRow.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const newUrl = btn.getAttribute('data-img-url');
          if (elements.pdpMainImg) elements.pdpMainImg.src = newUrl;
        });
      });
    }

    // Interactive Zoom Hover on main image
    if (elements.pdpMainImageWrap && elements.pdpMainImg) {
      elements.pdpMainImageWrap.addEventListener('mouseenter', () => {
        elements.pdpMainImg.style.transition = 'transform 0.08s ease-out';
      });
      elements.pdpMainImageWrap.addEventListener('mousemove', (e) => {
        const rect = elements.pdpMainImageWrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        elements.pdpMainImg.style.transformOrigin = `${x}% ${y}%`;
        elements.pdpMainImg.style.transform = 'scale(1.75)';
      });
      elements.pdpMainImageWrap.addEventListener('mouseleave', () => {
        elements.pdpMainImg.style.transition = 'transform 0.3s ease';
        elements.pdpMainImg.style.transformOrigin = 'center center';
        elements.pdpMainImg.style.transform = 'scale(1)';
      });
    }

    // 3. Sizes with Price Multipliers
    if (elements.pdpSizesContainer) {
      const sizes = product.availableSizes || [product.dimensions];
      state.pdpSelectedSize = sizes[0];
      state.pdpSizeMultiplier = 1.0;

      elements.pdpSizesContainer.innerHTML = sizes.map((sz, idx) => {
        const mult = idx === 0 ? 1.0 : (idx === 1 ? 1.25 : 1.55);
        return `
          <button type="button" class="pdp-option-pill ${idx === 0 ? 'active' : ''}" data-size="${sz}" data-multiplier="${mult}">
            ${sz}
          </button>
        `;
      }).join('');

      elements.pdpSizesContainer.querySelectorAll('.pdp-option-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.pdpSizesContainer.querySelectorAll('.pdp-option-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.pdpSelectedSize = btn.getAttribute('data-size');
          state.pdpSizeMultiplier = parseFloat(btn.getAttribute('data-multiplier')) || 1.0;
          if (elements.selectedSizeLabel) elements.selectedSizeLabel.textContent = state.pdpSelectedSize;
          updatePDPPricingAndTiers();
        });
      });

      if (elements.selectedSizeLabel) elements.selectedSizeLabel.textContent = state.pdpSelectedSize;
    }

    // 4. Finishes with Dynamic Options
    if (elements.pdpFinishesContainer) {
      const defaultFinishes = ['Temple Antique Gold', 'Warm Teak Wood', 'Matte Black', 'Royal Gold & Velvet', 'Glossy Rosewood'];
      let availableFinishes = [...defaultFinishes];
      if (product.finish && !availableFinishes.includes(product.finish)) {
        availableFinishes.unshift(product.finish);
      }
      state.pdpSelectedFinish = product.finish || availableFinishes[0];

      elements.pdpFinishesContainer.innerHTML = availableFinishes.slice(0, 4).map(f => `
        <button type="button" class="pdp-option-pill ${f === state.pdpSelectedFinish ? 'active' : ''}" data-finish="${f}">
          ${f}
        </button>
      `).join('');

      elements.pdpFinishesContainer.querySelectorAll('.pdp-option-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.pdpFinishesContainer.querySelectorAll('.pdp-option-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.pdpSelectedFinish = btn.getAttribute('data-finish');
          if (elements.selectedFinishLabel) elements.selectedFinishLabel.textContent = state.pdpSelectedFinish;
          updateWhatsAppInquiryLink();
        });
      });

      if (elements.selectedFinishLabel) elements.selectedFinishLabel.textContent = state.pdpSelectedFinish;
    }

    // 5. Quantity Controls
    if (elements.qtyMinusBtn && elements.qtyPlusBtn && elements.pdpQtyInput) {
      elements.qtyMinusBtn.addEventListener('click', () => {
        let val = parseInt(elements.pdpQtyInput.value) || 1;
        if (val > 1) {
          val--;
          elements.pdpQtyInput.value = val;
          state.pdpQuantity = val;
          updatePDPPricingAndTiers();
        }
      });

      elements.qtyPlusBtn.addEventListener('click', () => {
        let val = parseInt(elements.pdpQtyInput.value) || 1;
        val++;
        elements.pdpQtyInput.value = val;
        state.pdpQuantity = val;
        updatePDPPricingAndTiers();
      });

      elements.pdpQtyInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 1;
        if (val < 1) val = 1;
        state.pdpQuantity = val;
        updatePDPPricingAndTiers();
      });
    }

    // 6. Interactive Wholesale Tier Rows (Clickable to change Qty)
    if (elements.tierRow1) {
      elements.tierRow1.style.cursor = 'pointer';
      elements.tierRow1.title = 'Click to select Single Retail Piece (1 pc)';
      elements.tierRow1.addEventListener('click', () => {
        state.pdpQuantity = 1;
        if (elements.pdpQtyInput) elements.pdpQtyInput.value = 1;
        updatePDPPricingAndTiers();
      });
    }
    if (elements.tierRow2) {
      elements.tierRow2.style.cursor = 'pointer';
      elements.tierRow2.title = 'Click to select Studio Bulk Tier (6 pcs)';
      elements.tierRow2.addEventListener('click', () => {
        state.pdpQuantity = 6;
        if (elements.pdpQtyInput) elements.pdpQtyInput.value = 6;
        updatePDPPricingAndTiers();
      });
    }
    if (elements.tierRow3) {
      elements.tierRow3.style.cursor = 'pointer';
      elements.tierRow3.title = 'Click to select Factory Master Carton (24 pcs)';
      elements.tierRow3.addEventListener('click', () => {
        state.pdpQuantity = 24;
        if (elements.pdpQtyInput) elements.pdpQtyInput.value = 24;
        updatePDPPricingAndTiers();
      });
    }

    // 7. Inline Mode Toggle on PDP
    if (elements.pdpModeToggle) {
      elements.pdpModeToggle.addEventListener('click', () => {
        const nextMode = state.pricingMode === 'retail' ? 'wholesale' : 'retail';
        setPricingMode(nextMode);
      });
    }

    // 8. Add to Order Button on PDP
    if (elements.pdpAddToCartBtn) {
      elements.pdpAddToCartBtn.addEventListener('click', () => {
        addToCart(product, state.pdpQuantity, state.pdpSelectedSize, state.pdpSelectedFinish);
      });
    }

    // 9. Sticky Mobile Bar
    if (elements.stickyAddBtn) {
      elements.stickyAddBtn.addEventListener('click', () => {
        addToCart(product, state.pdpQuantity, state.pdpSelectedSize, state.pdpSelectedFinish);
      });
    }

    // 10. RFQ Button on PDP
    if (elements.pdpRfqBtn) {
      elements.pdpRfqBtn.addEventListener('click', openRfqModal);
    }

    // 11. Specifications Table
    if (elements.pdpSpecsGrid) {
      const specsObj = {
        'Core Frame Material': product.material,
        'Moulding Finish': product.finish,
        'Selected Dimension': state.pdpSelectedSize,
        'Glass Specification': '2.0mm Crystal Clear Float Glass (Sealed)',
        'Backing Board': 'MDF Hardboard with Moisture-Proof Paper Lamination',
        'Hanging Fixtures': 'Heavy-Gauge Zinc D-Rings with High-Tensile Steel Wire',
        'SKU Serial Number': product.sku,
        'Master Carton Packaging': product.wholesalePackInfo || 'Carton of 12 pcs with Corner Cushions'
      };

      if (product.specs) {
        Object.assign(specsObj, product.specs);
      }

      elements.pdpSpecsGrid.innerHTML = Object.entries(specsObj).map(([key, val]) => `
        <div class="pdp-spec-row">
          <span class="pdp-spec-label">${key}</span>
          <span class="pdp-spec-val">${val}</span>
        </div>
      `).join('');
    }

    // 12. Adapt Tab 2 Content to Category
    const tabMandirBtn = document.querySelector('.pdp-tab-btn[data-tab="mandir"]');
    const tabMandirPanel = document.getElementById('tab-panel-mandir');
    if (tabMandirBtn && tabMandirPanel) {
      if (product.category === 'hindu-gods') {
        tabMandirBtn.textContent = 'Mandir Vastu & Divine Care';
        tabMandirPanel.innerHTML = `
          <div style="max-width: 800px; color: #2e3e44; line-height: 1.7;">
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.75rem; color: #131c20;">
              Traditional Mandir Vastu & Placement Guidelines
            </h3>
            <p style="margin-bottom: 1rem;">
              For Hindu Gods' Pooja frames (${product.name}), Vastu Shastra recommends hanging on the <strong>East or North-East wall</strong> of your home or pooja room. Maintain a height where the deity's feet are positioned at eye level or above during worship.
            </p>
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: #008f9c;">
              Gold Foil & Glass Cleaning Tips:
            </h4>
            <ul style="list-style: disc; margin-left: 1.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
              <li>The 24K gold foil artwork is sealed behind airtight 2mm glass; wipe the outer glass with a soft dry microfiber cloth.</li>
              <li>Avoid spraying chemical glass cleaners or water directly into frame corner joints.</li>
              <li>Keep brass oil lamps and agarbatti smoke at least 1 foot away to prevent soot deposition on teakwood mouldings.</li>
            </ul>
          </div>
        `;
      } else if (product.category === 'wedding-marriage') {
        tabMandirBtn.textContent = 'Bridal Display & Canvas Care';
        tabMandirPanel.innerHTML = `
          <div style="max-width: 800px; color: #2e3e44; line-height: 1.7;">
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.75rem; color: #131c20;">
              Wedding Portrait Display & Archival Preservation
            </h3>
            <p style="margin-bottom: 1rem;">
              Crafted specifically for bridal couples and heirloom portraiture. Hang away from direct midday sunlight to ensure pigment ink vibrancy for 50+ years.
            </p>
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: #008f9c;">
              Maintenance Guidelines:
            </h4>
            <ul style="list-style: disc; margin-left: 1.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
              <li>Dust regularly with an ostrich feather duster or soft dry brush over ornate filigree crevices.</li>
              <li>Maintain normal indoor room humidity to protect acid-free matboards.</li>
            </ul>
          </div>
        `;
      } else if (product.category === 'corporate-framing') {
        tabMandirBtn.textContent = 'Corporate Wall Mounting';
        tabMandirPanel.innerHTML = `
          <div style="max-width: 800px; color: #2e3e44; line-height: 1.7;">
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.75rem; color: #131c20;">
              Executive Wall Mounting & Degree Framing Standards
            </h3>
            <p style="margin-bottom: 1rem;">
              Designed for professional offices, chambers, clinics, and corporate boardrooms. Features dual portrait or landscape hanging brackets for laser alignment on drywall or masonry.
            </p>
          </div>
        `;
      } else {
        tabMandirBtn.textContent = 'Workshop Usage & Packaging';
        tabMandirPanel.innerHTML = `
          <div style="max-width: 800px; color: #2e3e44; line-height: 1.7;">
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.75rem; color: #131c20;">
              Workshop Assembly & Reseller Specifications
            </h3>
            <p style="margin-bottom: 1rem;">
              Engineered for framing shops and commercial framing workshops. Fully compatible with mitre saws, pneumatic underpinning guns, and manual point drivers.
            </p>
          </div>
        `;
      }
    }

    // 13. PDP Tabs Navigation
    document.querySelectorAll('.pdp-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pdp-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const tabKey = btn.getAttribute('data-tab');
        document.querySelectorAll('.pdp-tab-content').forEach(panel => panel.classList.add('hidden'));
        const activePanel = document.getElementById(`tab-panel-${tabKey}`);
        if (activePanel) activePanel.classList.remove('hidden');
      });
    });

    // 14. Related Products
    if (elements.pdpRelatedGrid) {
      const related = getRelatedProducts(product.id, 4);
      elements.pdpRelatedGrid.innerHTML = related.map(p => createProductCardHTML(p)).join('');
      attachProductCardEvents(elements.pdpRelatedGrid);
    }

    updatePDPPricingAndTiers();
  }

  function updatePDPPricingAndTiers() {
    if (!state.pdpCurrentProduct) return;
    const p = state.pdpCurrentProduct;
    const qty = state.pdpQuantity;

    const mult = state.pdpSizeMultiplier || 1.0;
    const retailPrice = Math.round(p.priceRetail * mult);
    const wholesalePrice = Math.round(p.priceWholesale * mult);

    // Calculate tier prices
    const tier1UnitPrice = retailPrice;
    const tier2UnitPrice = Math.round(retailPrice * 0.80); // 20% studio discount
    const tier3UnitPrice = wholesalePrice; // Factory wholesale rate

    if (elements.tierPrice1) elements.tierPrice1.textContent = `${formatINR(tier1UnitPrice)} / pc`;
    if (elements.tierPrice2) elements.tierPrice2.textContent = `${formatINR(tier2UnitPrice)} / pc`;
    if (elements.tierPrice3) elements.tierPrice3.textContent = `${formatINR(tier3UnitPrice)} / pc`;

    // Determine active tier based on qty or active mode
    let effectiveUnitPrice = tier1UnitPrice;
    let activeTier = 1;

    if (state.pricingMode === 'wholesale' || qty >= 24) {
      effectiveUnitPrice = tier3UnitPrice;
      activeTier = 3;
    } else if (qty >= 6) {
      effectiveUnitPrice = tier2UnitPrice;
      activeTier = 2;
    }

    // Update active tier row styling
    [elements.tierRow1, elements.tierRow2, elements.tierRow3].forEach(row => {
      if (row) row.classList.remove('active-tier');
    });

    if (activeTier === 1 && elements.tierRow1) elements.tierRow1.classList.add('active-tier');
    if (activeTier === 2 && elements.tierRow2) elements.tierRow2.classList.add('active-tier');
    if (activeTier === 3 && elements.tierRow3) elements.tierRow3.classList.add('active-tier');

    // Update Main Price Display
    if (elements.pdpMainPrice) {
      elements.pdpMainPrice.textContent = formatINR(effectiveUnitPrice);
    }
    if (elements.pdpMrpPrice) {
      const mrp = Math.round(retailPrice * 1.3);
      elements.pdpMrpPrice.textContent = formatINR(mrp);
    }

    // Savings Pill
    if (elements.pdpSavingsPill) {
      const mrp = Math.round(retailPrice * 1.3);
      const savingsPerUnit = mrp - effectiveUnitPrice;
      const pct = Math.round((savingsPerUnit / mrp) * 100);
      elements.pdpSavingsPill.textContent = `Save ${formatINR(savingsPerUnit)} (${pct}% Off MRP)`;
    }

    // Mode text
    if (elements.pdpModeText) {
      if (activeTier === 3) {
        elements.pdpModeText.innerHTML = `Active Tier: <strong>Factory Wholesale Carton (${formatINR(effectiveUnitPrice)}/pc)</strong>`;
      } else if (activeTier === 2) {
        elements.pdpModeText.innerHTML = `Active Tier: <strong>Studio Bulk Pack (20% Off)</strong>`;
      } else {
        elements.pdpModeText.innerHTML = `Pricing Mode: <strong>Individual Retail Piece</strong>`;
      }
    }

    // Live Subtotal
    const subtotal = effectiveUnitPrice * qty;
    if (elements.pdpLiveTotal) {
      elements.pdpLiveTotal.textContent = formatINR(subtotal);
    }

    // Tip message
    if (elements.pdpTierUnlockedMsg) {
      if (qty < 6 && state.pricingMode !== 'wholesale') {
        const diff = 6 - qty;
        elements.pdpTierUnlockedMsg.innerHTML = `💡 Tip: Order <strong>${diff} more ${diff === 1 ? 'piece' : 'pieces'}</strong> to unlock Studio Bulk Tier at ${formatINR(tier2UnitPrice)}/pc!`;
      } else if (qty >= 6 && qty < 24 && state.pricingMode !== 'wholesale') {
        const diff = 24 - qty;
        elements.pdpTierUnlockedMsg.innerHTML = `🎉 Studio Discount Applied! Add <strong>${diff} more</strong> for Master Factory Carton rate (${formatINR(tier3UnitPrice)}/pc).`;
      } else {
        elements.pdpTierUnlockedMsg.innerHTML = `🏆 Maximum Wholesale Factory Rate Unlocked (${formatINR(tier3UnitPrice)}/pc)!`;
      }
    }

    // Update Sticky Bar
    if (elements.stickyBarPrice) {
      elements.stickyBarPrice.textContent = formatINR(effectiveUnitPrice);
    }
    if (elements.stickyBarMode) {
      elements.stickyBarMode.textContent = activeTier === 3 ? 'Wholesale Carton Rate' : 'Retail Price';
    }

    updateWhatsAppInquiryLink();
  }

  function updateWhatsAppInquiryLink() {
    if (!state.pdpCurrentProduct) return;
    const p = state.pdpCurrentProduct;
    const qty = state.pdpQuantity;
    const size = state.pdpSelectedSize;
    const finish = state.pdpSelectedFinish;

    const mult = state.pdpSizeMultiplier || 1.0;
    const baseRetail = Math.round(p.priceRetail * mult);
    const baseWholesale = Math.round(p.priceWholesale * mult);

    const price = (state.pricingMode === 'wholesale' || qty >= 24)
      ? baseWholesale
      : (qty >= 6 ? Math.round(baseRetail * 0.8) : baseRetail);
    const subtotal = price * qty;

    const message = `Namaste Janki Framings, I am interested in inquiring about:%0A*Product:* ${p.name}%0A*SKU:* ${p.sku}%0A*Size:* ${size}%0A*Frame Finish:* ${finish}%0A*Quantity:* ${qty} pcs%0A*Estimated Rate:* ${formatINR(price)}/pc (Total: ${formatINR(subtotal)})%0A%0APlease confirm ready factory stock, transit packaging details, and dispatch timeframe to my location.`;

    const whatsappUrl = `https://wa.me/919876543210?text=${message}`;

    if (elements.pdpWhatsappBtn) {
      elements.pdpWhatsappBtn.href = whatsappUrl;
    }
    if (elements.stickyWhatsappBtn) {
      elements.stickyWhatsappBtn.href = whatsappUrl;
    }
  }

  // =========================================================================
  // Quick View Modal
  // =========================================================================
  function openQuickViewModal(productId) {
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod || !elements.quickViewModal) return;

    const isWholesale = state.pricingMode === 'wholesale';
    const activePrice = isWholesale ? prod.priceWholesale : prod.priceRetail;

    elements.modalProductDetails.innerHTML = `
      <div class="quick-view-grid">
        <div class="quick-view-media">
          <img src="${prod.photoUrl}" alt="${prod.name}" />
        </div>
        <div class="quick-view-info">
          <span class="badge-pill teal">${prod.category.toUpperCase()}</span>
          <h3>${prod.name}</h3>
          <p class="product-sku">SKU: ${prod.sku}</p>
          <div class="product-price-box" style="margin: 1rem 0;">
            <span class="price-main">${formatINR(activePrice)}</span>
            <span class="price-label">${isWholesale ? 'ea (B2B Bulk)' : 'ea (Retail)'}</span>
            <div class="wholesale-tier-hint" style="margin-top: 0.5rem;">${prod.wholesalePackInfo}</div>
          </div>
          <p class="quick-view-desc">${prod.description}</p>
          <div class="quick-view-specs">
            <div><strong>Dimensions:</strong> ${prod.dimensions}</div>
            <div><strong>Material:</strong> ${prod.material}</div>
            <div><strong>Finish:</strong> ${prod.finish}</div>
            <div><strong>In Stock:</strong> ${prod.inStock ? 'Ready for Dispatch' : 'Custom Assembly'}</div>
          </div>
          <div class="quick-view-actions">
            <a href="product-detail.html?id=${prod.id}" class="btn btn-outline" style="flex: 1; text-align: center;">
              Full Details & Zoom &rarr;
            </a>
            <button class="btn btn-primary" id="modal-add-cart-btn" style="flex: 1;">
              + Add to Order
            </button>
          </div>
        </div>
      </div>
    `;

    const addBtn = elements.modalProductDetails.querySelector('#modal-add-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addToCart(prod, isWholesale ? (prod.moq || 6) : 1);
        closeQuickViewModal();
      });
    }

    elements.quickViewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickViewModal() {
    if (!elements.quickViewModal) return;
    elements.quickViewModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // =========================================================================
  // Cart / Order Quote Slide-Over Drawer
  // =========================================================================
  function toggleCartDrawer(open) {
    if (!elements.cartDrawerBackdrop) return;
    if (open) {
      elements.cartDrawerBackdrop.classList.remove('hidden');
      elements.cartDrawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCartDisplay();
    } else {
      elements.cartDrawerBackdrop.classList.remove('active');
      elements.cartDrawerBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function addToCart(prod, qty = 1, size = null, finish = null) {
    const chosenSize = size || (prod.availableSizes ? prod.availableSizes[0] : prod.dimensions);
    const chosenFinish = finish || prod.finish;

    const existingIndex = state.cart.findIndex(item => 
      item.id === prod.id && item.size === chosenSize && item.finish === chosenFinish
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += qty;
    } else {
      state.cart.push({
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        priceRetail: prod.priceRetail,
        priceWholesale: prod.priceWholesale,
        photoUrl: prod.photoUrl,
        size: chosenSize,
        finish: chosenFinish,
        wholesalePackInfo: prod.wholesalePackInfo,
        quantity: qty
      });
    }

    saveCartToStorage();
    updateCartDisplay();
    showToast(`🛒 Added "${prod.name}" to Order List`);
    toggleCartDrawer(true);
  }

  function updateCartItemQty(index, change) {
    if (!state.cart[index]) return;
    state.cart[index].quantity += change;
    if (state.cart[index].quantity <= 0) {
      removeFromCart(index);
      return;
    }
    saveCartToStorage();
    updateCartDisplay();
  }

  function removeFromCart(index) {
    if (!state.cart[index]) return;
    const removed = state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartDisplay();
    showToast(`Removed item from order`);
  }

  function updateCartDisplay() {
    const isWholesale = state.pricingMode === 'wholesale';
    let totalItems = 0;
    let subtotal = 0;
    let totalSavings = 0;

    state.cart.forEach(item => {
      totalItems += item.quantity;
      const unitPrice = (isWholesale || item.quantity >= 24) 
        ? item.priceWholesale 
        : (item.quantity >= 6 ? Math.round(item.priceRetail * 0.8) : item.priceRetail);

      subtotal += unitPrice * item.quantity;

      const fullRetail = item.priceRetail * item.quantity;
      if (fullRetail > (unitPrice * item.quantity)) {
        totalSavings += (fullRetail - (unitPrice * item.quantity));
      }
    });

    if (elements.cartItemCount) {
      elements.cartItemCount.textContent = totalItems;
      elements.cartItemCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (elements.drawerSubtotal) elements.drawerSubtotal.textContent = formatINR(subtotal + totalSavings);
    if (elements.drawerDiscount) elements.drawerDiscount.textContent = `-${formatINR(totalSavings)}`;
    if (elements.drawerTotal) elements.drawerTotal.textContent = formatINR(subtotal);

    if (elements.drawerDiscountRow) {
      elements.drawerDiscountRow.style.display = totalSavings > 0 ? 'flex' : 'none';
    }

    // Render Items in Drawer
    if (!elements.cartItemsContainer) return;

    if (state.cart.length === 0) {
      elements.cartItemsContainer.innerHTML = `
        <div class="empty-cart-drawer">
          <div class="empty-cart-icon">🪟</div>
          <h4>Your order list is empty</h4>
          <p>Browse our Hindu God frames, wedding portraits, or bulk cartons and add items for instant quotation.</p>
          <a href="products.html" class="btn btn-outline btn-sm" onclick="document.getElementById('cart-drawer-backdrop').classList.remove('active')">
            Browse All Framing Collections
          </a>
        </div>
      `;
      return;
    }

    elements.cartItemsContainer.innerHTML = state.cart.map((item, idx) => {
      const unitPrice = (isWholesale || item.quantity >= 24) 
        ? item.priceWholesale 
        : (item.quantity >= 6 ? Math.round(item.priceRetail * 0.8) : item.priceRetail);

      return `
        <div class="cart-item">
          <img src="${item.photoUrl}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-meta">
              <span>${item.size}</span> • <span>${item.finish}</span>
            </div>
            <div class="cart-item-price-row">
              <span class="cart-item-price">${formatINR(unitPrice * item.quantity)}</span>
              <span class="cart-item-rate">(${formatINR(unitPrice)}/ea)</span>
            </div>
            <div class="cart-item-controls">
              <div class="qty-counter">
                <button type="button" class="qty-btn" data-action="minus" data-idx="${idx}">&minus;</button>
                <input type="number" class="qty-input" value="${item.quantity}" readonly />
                <button type="button" class="qty-btn" data-action="plus" data-idx="${idx}">+</button>
              </div>
              <button class="cart-remove-btn" data-action="remove" data-idx="${idx}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach cart control listeners
    elements.cartItemsContainer.querySelectorAll('[data-action="minus"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        updateCartItemQty(idx, -1);
      });
    });

    elements.cartItemsContainer.querySelectorAll('[data-action="plus"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        updateCartItemQty(idx, 1);
      });
    });

    elements.cartItemsContainer.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        removeFromCart(idx);
      });
    });
  }

  function exportOrderSpecSheet() {
    if (state.cart.length === 0) {
      showToast('⚠️ Your order list is empty.');
      return;
    }

    const isWholesale = state.pricingMode === 'wholesale';
    let text = `====================================================\n`;
    text += `   JANKI FRAMINGS - BULK ORDER / RFQ SPECIFICATION  \n`;
    text += `   Artisan Pooja Frames, Wedding & Corporate Supply \n`;
    text += `   WhatsApp Desk: +91 98765 43210 | India           \n`;
    text += `====================================================\n`;
    text += `Order Mode: ${isWholesale ? 'WHOLESALE B2B (Carton Tiers)' : 'RETAIL ORDER'}\n`;
    text += `Generated On: ${new Date().toLocaleString('en-IN')}\n\n`;
    text += `ITEMS IN ORDER:\n`;
    text += `----------------------------------------------------\n`;

    let total = 0;
    state.cart.forEach((item, idx) => {
      const unitPrice = (isWholesale || item.quantity >= 24) 
        ? item.priceWholesale 
        : (item.quantity >= 6 ? Math.round(item.priceRetail * 0.8) : item.priceRetail);
      const lineTotal = unitPrice * item.quantity;
      total += lineTotal;

      text += `${idx + 1}. ${item.name}\n`;
      text += `   SKU: ${item.sku}\n`;
      text += `   Size / Dimensions: ${item.size}\n`;
      text += `   Finish: ${item.finish}\n`;
      text += `   Quantity: ${item.quantity} units\n`;
      text += `   Rate: ${formatINR(unitPrice)} ea | Subtotal: ${formatINR(lineTotal)}\n\n`;
    });

    text += `----------------------------------------------------\n`;
    text += `ESTIMATED TOTAL (Excl. Freight/GST): ${formatINR(total)}\n`;
    text += `====================================================\n`;
    text += `NEXT STEPS:\n`;
    text += `Please send this spec sheet directly to WhatsApp: +91 98765 43210\n`;
    text += `or email to: wholesale@jankiframings.com with your GST & delivery pincode.\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Janki-Framings-Order-Quote-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('📄 Order specification sheet downloaded successfully');
  }

  // =========================================================================
  // RFQ Dealership Modal
  // =========================================================================
  function openRfqModal() {
    if (!elements.rfqModal) return;
    elements.rfqModal.classList.remove('hidden');
    if (elements.rfqForm) elements.rfqForm.classList.remove('hidden');
    if (elements.rfqSuccess) elements.rfqSuccess.classList.add('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeRfqModal() {
    if (!elements.rfqModal) return;
    elements.rfqModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(msg) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${msg}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // Global Event Listeners
  // =========================================================================
  function setupEventListeners() {
    // Wholesale Mode Switcher
    if (elements.wholesaleToggle) {
      elements.wholesaleToggle.addEventListener('change', (e) => {
        setPricingMode(e.target.checked ? 'wholesale' : 'retail');
      });
    }

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
    if (elements.globalSearch) {
      elements.globalSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (elements.clearSearchBtn) {
          if (state.searchQuery.length > 0) {
            elements.clearSearchBtn.classList.remove('hidden');
          } else {
            elements.clearSearchBtn.classList.add('hidden');
          }
        }
        if (elements.productsGrid && !elements.pdpTitle) {
          renderCatalog();
        }
      });
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener('click', () => {
        if (elements.globalSearch) elements.globalSearch.value = '';
        state.searchQuery = '';
        elements.clearSearchBtn.classList.add('hidden');
        if (elements.productsGrid && !elements.pdpTitle) {
          renderCatalog();
        }
      });
    }

    // Audience filter checkboxes
    document.querySelectorAll('input[name="targetAudience"]').forEach(cb => {
      cb.addEventListener('change', () => {
        state.selectedAudience = Array.from(
          document.querySelectorAll('input[name="targetAudience"]:checked')
        ).map(el => el.value);
        if (elements.productsGrid && !elements.pdpTitle) renderCatalog();
      });
    });

    // Price range slider
    if (elements.priceSlider) {
      elements.priceSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.maxPrice = val;
        if (elements.currentPriceVal) elements.currentPriceVal.textContent = `Up to ${formatINR(val)}`;
        renderCatalog();
      });
    }

    // Mobile Price Slider
    if (elements.mobilePriceSlider) {
      elements.mobilePriceSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.maxPrice = val;
        if (elements.mobilePriceVal) elements.mobilePriceVal.textContent = `Up to ${formatINR(val)}`;
        if (elements.currentPriceVal) elements.currentPriceVal.textContent = `Up to ${formatINR(val)}`;
        if (elements.priceSlider) elements.priceSlider.value = val;
        renderCatalog();
      });
    }

    // Mobile Filter Drawer Toggle
    if (elements.openMobileFilterBtn && elements.mobileFilterBackdrop) {
      elements.openMobileFilterBtn.addEventListener('click', () => {
        elements.mobileFilterBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (elements.closeMobileFilterBtn && elements.mobileFilterBackdrop) {
      elements.closeMobileFilterBtn.addEventListener('click', () => {
        elements.mobileFilterBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (elements.applyMobileFilterBtn && elements.mobileFilterBackdrop) {
      elements.applyMobileFilterBtn.addEventListener('click', () => {
        elements.mobileFilterBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        renderCatalog();
      });
    }

    if (elements.mobileFilterBackdrop) {
      elements.mobileFilterBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.mobileFilterBackdrop) {
          elements.mobileFilterBackdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Sort select
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderCatalog();
      });
    }

    // View toggles (Grid vs List)
    if (elements.viewGridBtn && elements.viewListBtn && elements.productsGrid) {
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
    }

    // Load more pagination
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        state.visibleCount = PRODUCTS_DATA.length;
        renderCatalog();
      });
    }

    // Reset filters
    const resetAllFilters = () => {
      state.selectedCategory = 'all';
      state.selectedAudience = ['retail', 'wholesale', 'materials'];
      state.selectedMaterials = [];
      state.selectedFinishes = [];
      state.maxPrice = 6000;
      state.searchQuery = '';
      if (elements.globalSearch) elements.globalSearch.value = '';
      if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
      if (elements.priceSlider) elements.priceSlider.value = 6000;
      if (elements.mobilePriceSlider) elements.mobilePriceSlider.value = 6000;
      if (elements.currentPriceVal) elements.currentPriceVal.textContent = 'Up to ₹6,000';
      if (elements.mobilePriceVal) elements.mobilePriceVal.textContent = 'Up to ₹6,000';

      document.querySelectorAll('input[name="materialFilter"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="finishFilter"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="targetAudience"]').forEach(cb => cb.checked = true);
      updateCategoryRadioButtons();

      renderCatalog();
      showToast('Filters reset to show all items');
    };

    if (elements.resetFiltersBtn) elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    if (elements.emptyResetBtn) elements.emptyResetBtn.addEventListener('click', resetAllFilters);
    if (elements.mobileResetFiltersBtn) elements.mobileResetFiltersBtn.addEventListener('click', resetAllFilters);

    // Bestseller tab filters (Home Page)
    if (elements.bestsellerTabs) {
      elements.bestsellerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          elements.bestsellerTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const filter = tab.getAttribute('data-filter');
          renderBestsellers(filter);
        });
      });
    }

    // Cart drawer toggles
    if (elements.cartToggleBtn) elements.cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    if (elements.cartDrawerClose) elements.cartDrawerClose.addEventListener('click', () => toggleCartDrawer(false));
    if (elements.cartDrawerBackdrop) {
      elements.cartDrawerBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.cartDrawerBackdrop) {
          toggleCartDrawer(false);
        }
      });
    }

    if (elements.downloadRfqBtn) elements.downloadRfqBtn.addEventListener('click', exportOrderSpecSheet);

    if (elements.checkoutBtn) {
      elements.checkoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          showToast('⚠️ Please add frames before requesting quote.');
          return;
        }

        // WhatsApp Checkout direct link
        let message = `Namaste Janki Framings, I would like to place an order/inquiry:%0A`;
        state.cart.forEach((it, idx) => {
          message += `%0A${idx+1}. *${it.name}*%0A   - SKU: ${it.sku}%0A   - Size: ${it.size}%0A   - Finish: ${it.finish}%0A   - Quantity: ${it.quantity} pcs`;
        });
        message += `%0A%0APlease share final commercial invoice with GST, transport freight options, and delivery timeline.`;

        window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
        toggleCartDrawer(false);
      });
    }

    // Modal Close
    if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeQuickViewModal);
    if (elements.quickViewModal) {
      elements.quickViewModal.addEventListener('click', (e) => {
        if (e.target === elements.quickViewModal) closeQuickViewModal();
      });
    }

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

    if (elements.rfqCloseBtn) elements.rfqCloseBtn.addEventListener('click', closeRfqModal);
    if (elements.rfqModal) {
      elements.rfqModal.addEventListener('click', (e) => {
        if (e.target === elements.rfqModal) closeRfqModal();
      });
    }

    if (elements.rfqForm) {
      elements.rfqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        elements.rfqForm.classList.add('hidden');
        if (elements.rfqSuccess) elements.rfqSuccess.classList.remove('hidden');
      });
    }

    if (elements.rfqSuccessClose) elements.rfqSuccessClose.addEventListener('click', closeRfqModal);

    // Mobile Hamburger Menu
    if (elements.mobileMenuBtn && elements.secondaryNav) {
      elements.mobileMenuBtn.addEventListener('click', () => {
        elements.secondaryNav.classList.toggle('mobile-active');
      });
    }

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeQuickViewModal();
        closeRfqModal();
        toggleCartDrawer(false);
        if (elements.mobileFilterBackdrop) {
          elements.mobileFilterBackdrop.classList.remove('active');
        }
      }
    });
  }

  init();
});
