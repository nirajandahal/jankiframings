# Janki Framings — Premium Framing Shop & Wholesale Supply

**Brand Color:** `#008f9c` (Artisan Peacock Teal) & `#d49b29` (Indian Temple Gold)  
**Shop Name:** Janki Framings  
**Target Market:** Indian Retail Customers, Pooja Mandirs, Wedding Photographers, Corporate Institutions & Wholesale Retailers  

---

## 📁 Location & Access

The project files are located in:
- **Path on Disk:** `C:\xampp\htdocs\antigravity\jankiframings\`
- **Localhost URL (with XAMPP Apache started):** [http://localhost/antigravity/jankiframings/](http://localhost/antigravity/jankiframings/)
- **Direct File Open:** Double-click [index.html](file:///C:/xampp/htdocs/antigravity/jankiframings/index.html) to open in any web browser without needing a server running.

---

## 🌐 Complete Page Architecture

1. **Home Page (`index.html`)**
   - Brand announcement bar with WhatsApp hotline (`+91 98765 43210`).
   - Artisan hero banner with value props, trust badges, and quick stats.
   - Shop by Framing Category visual showcase linking to `categories.html` & `products.html`.
   - Most Sold / Bestsellers dynamic tabs (Hindu Gods, Wedding, Corporate, Cartons, Mouldings).
   - Factory Direct vs Workshop dual-service B2B highlight.
   - Live Order / Quote Drawer with `.TXT` spec sheet generator.
   - Bulk Dealership RFQ modal.

2. **Dedicated Category Directory (`categories.html`)**
   - Full visual directory of all 7 framing collections with realistic Indian photography.
   - Detailed cards highlighting starting price (₹), item count, and popular deity/product tag pills.
   - Direct category deep-links to filtered views in `products.html?category=[id]`.
   - B2B perks breakdown: Master Carton savings, 5-layer honeycomb transit crating, and 18% GST tax invoices.

3. **Dedicated Product Catalog & Listing (`products.html`)**
   - URL query parameter reading (`?category=...`, `?search=...`, `?audience=...`, `?sort=...`) with seamless shareable links.
   - Dynamic page banner updating title and description according to active category.
   - Desktop sidebar filters with category radios, audience checkboxes, core material, frame finish, and price range slider (`₹60 - ₹6,000`).
   - **Mobile Filter Drawer:** Slide-over drawer on screens `<= 1024px` with quick filter apply/reset so mobile shoppers don't have to scroll past tall desktop sidebars.
   - Active filter badges with one-click clear buttons.
   - Dual view modes: Grid view & List view.
   - Product cards linking to `product-detail.html?id=[id]`.

4. **Dedicated Product Detail Page (`product-detail.html`)**
   - Dynamic PDP powered by query parameter `?id=[productId]`.
   - Interactive image gallery with hover zoom effect and multi-angle thumbnail preview.
   - Dynamic pricing switching between Retail MRP and Wholesale Carton rates.
   - **Interactive Wholesale Tier Calculator:**
     - Tier 1 (1 - 5 pcs): Retail Rate
     - Tier 2 (6 - 23 pcs): Studio Bulk Tier (20% Off)
     - Tier 3 (24+ pcs): Factory Master Carton Tier (35-45% Off)
     - Live subtotal and next-tier savings unlock hints.
   - Interactive size & finish variant pill selectors.
   - **Instant WhatsApp Inquiry Generator:** Pre-fills product name, SKU, selected size, finish, quantity, and calculated subtotal into a ready-to-send WhatsApp message.
   - Technical specifications grid (timber type, glass spec, backing, hardware, carton pack).
   - Vastu placement guidelines for Pooja Mandir frames & gold foil cleaning tips.
   - Factory transit packaging specs and verified retailer customer reviews.
   - Recommended pairings / frequently framed together grid.
   - Sticky mobile inquiry bar on screens `<= 768px`.

---

## 📱 Mobile Responsiveness & Indian E-Commerce Optimization

- **2-Column Mobile Product Grid (`<= 600px`):** Modeled after top Indian shopping platforms (Flipkart, Amazon India) allowing high information density and fast browsing on smartphones.
- **Mobile Filter Sheet (`.mobile-filter-drawer`):** Opens as a smooth slide-out drawer on mobile and tablet without shifting layout.
- **Sticky Mobile Bottom Bar:** Allows mobile shoppers to instantly WhatsApp or quote without scrolling through long technical specification tables.
- **Touch-Friendly Tap Targets:** Minimum 44px tap targets for buttons, inputs, and pills.
- **Cross-Page State Persistence:** Cart items and Retail/Wholesale mode switch are stored in `localStorage` (`janki_cart` & `janki_pricing_mode`), persisting across all pages.

---

## 🛠️ File Structure

```text
C:\xampp\htdocs\antigravity\jankiframings\
├── index.html           # Home page with hero, bestsellers, categories & quotes
├── categories.html      # Dedicated Category directory with deity tags & starting prices
├── products.html        # Dedicated Product catalog with slide-over mobile filters
├── product-detail.html  # Dedicated Product Detail Page with gallery, zoom & tier calculator
├── README.md            # Comprehensive documentation
├── css\
│   └── style.css        # Responsive design system (#008f9c), 2-col mobile cards & PDP
└── js\
    ├── products.js      # 20 realistic products with photos, INR pricing & Hindu God frames
    └── app.js           # Multi-page controller, localStorage cart, PDP calculator & WhatsApp desk
```
