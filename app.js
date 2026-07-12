(function () {
  "use strict";

  const products = Array.isArray(window.SARA_PRODUCTS) ? window.SARA_PRODUCTS : [];
  const config = window.SARA_CONFIG || {};

  const state = {
    search: "",
    category: "all",
    brand: "all",
    fabric: "all",
    stock: "all",
    sort: "featured"
  };

  const els = {};
  let currentDialogProduct = null;
  let toastTimer = 0;

  const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m16.5 16.5 4 4"></path></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.4-5A8 8 0 1 1 21 12z"></path></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>'
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    hydrateIcons(document);
    setupStaticLinks();
    setupFilters();
    renderCatalogSummary();
    bindEvents();
    renderFeatured();
    renderCatalog();
    openProductFromHash();
  }

  function cacheElements() {
    els.search = document.getElementById("searchInput");
    els.categoryChips = document.getElementById("categoryChips");
    els.brand = document.getElementById("brandFilter");
    els.fabric = document.getElementById("fabricFilter");
    els.stock = document.getElementById("stockFilter");
    els.sort = document.getElementById("sortFilter");
    els.grid = document.getElementById("productGrid");
    els.empty = document.getElementById("emptyState");
    els.clear = document.getElementById("clearFilters");
    els.count = document.getElementById("resultCount");
    els.collectionCount = document.getElementById("collectionCount");
    els.brandCount = document.getElementById("brandCount");
    els.categoryCount = document.getElementById("categoryCount");
    els.featuredStrip = document.getElementById("featured");
    els.featured = document.getElementById("featuredList");
    els.dialog = document.getElementById("productDialog");
    els.dialogContent = document.getElementById("dialogContent");
    els.closeDialog = document.getElementById("closeDialog");
    els.toast = document.getElementById("toast");
  }

  function hydrateIcons(root) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      const name = node.getAttribute("data-icon");
      node.innerHTML = icons[name] || "";
    });
  }

  function setupStaticLinks() {
    const message = encodeURIComponent("Hi saracreations0810, I want to know more about your latest clothing collection.");
    const whatsappUrl = buildWhatsAppUrl(message);
    const instagram = config.instagramUrl || "https://www.instagram.com/";

    document.getElementById("headerWhatsApp").href = whatsappUrl;
    document.getElementById("contactWhatsApp").href = whatsappUrl;
    document.getElementById("instagramLink").href = instagram;
  }

  function setupFilters() {
    const categories = unique(products.map((product) => product.category));
    const brands = unique(products.map((product) => product.brand));
    const fabrics = unique(products.map((product) => product.fabricType));

    els.categoryChips.innerHTML = [
      chipTemplate("all", "All", true),
      ...categories.map((category) => chipTemplate(category, category, false))
    ].join("");

    fillSelect(els.brand, [["all", "All brands"], ...brands.map((brand) => [brand, brand])]);
    fillSelect(els.fabric, [["all", "All fabric types"], ...fabrics.map((fabric) => [fabric, fabric])]);
  }

  function bindEvents() {
    els.search.addEventListener("input", (event) => {
      state.search = event.target.value.trim().toLowerCase();
      renderCatalog();
    });

    els.categoryChips.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      updateCategoryChips();
      renderCatalog();
    });

    els.brand.addEventListener("change", (event) => {
      state.brand = event.target.value;
      renderCatalog();
    });

    els.fabric.addEventListener("change", (event) => {
      state.fabric = event.target.value;
      renderCatalog();
    });

    els.stock.addEventListener("change", (event) => {
      state.stock = event.target.value;
      renderCatalog();
    });

    els.sort.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderCatalog();
    });

    els.clear.addEventListener("click", resetFilters);

    els.grid.addEventListener("click", handleProductAction);
    els.featured.addEventListener("click", handleFeaturedClick);
    els.closeDialog.addEventListener("click", closeDialog);

    els.dialog.addEventListener("close", () => {
      currentDialogProduct = null;
      if (window.location.hash.startsWith("#product=")) {
        history.replaceState("", document.title, window.location.pathname + window.location.search + "#catalog");
      }
    });

    window.addEventListener("hashchange", openProductFromHash);
  }

  function renderFeatured() {
    const featured = products.filter((product) => product.featured).slice(0, 4);
    if (!featured.length) {
      els.featuredStrip.hidden = true;
      return;
    }

    els.featuredStrip.hidden = false;
    els.featured.innerHTML = featured.map((product) => `
      <button class="featured-item" type="button" data-slug="${escapeHtml(product.slug)}">
        <img src="${escapeHtml(product.images[0])}" alt="">
        <span>
          <strong>${escapeHtml(product.name)}</strong>
          <small>${escapeHtml(featuredMeta(product))}</small>
        </span>
      </button>
    `).join("");
  }

  function renderCatalog() {
    const filtered = getFilteredProducts();
    els.count.textContent = `${formatNumber(filtered.length)} ${filtered.length === 1 ? "collection" : "collections"}`;
    els.empty.hidden = filtered.length > 0;
    els.grid.hidden = filtered.length === 0;
    els.grid.innerHTML = filtered.map(productCardTemplate).join("");
    hydrateIcons(els.grid);
  }

  function renderCatalogSummary() {
    if (!els.collectionCount) return;

    els.collectionCount.textContent = formatNumber(products.length);
    els.brandCount.textContent = formatNumber(unique(products.map((product) => product.brand)).length);
    els.categoryCount.textContent = formatNumber(unique(products.map((product) => product.category)).length);
  }

  function getFilteredProducts() {
    return products
      .filter((product) => {
        const text = [
          product.name,
          product.brand,
          product.category,
          product.fabricType,
          product.description,
          product.remarks,
          (product.tags || []).join(" ")
        ].join(" ").toLowerCase();

        const matchesSearch = !state.search || text.includes(state.search);
        const matchesCategory = state.category === "all" || product.category === state.category;
        const matchesBrand = state.brand === "all" || product.brand === state.brand;
        const matchesFabric = state.fabric === "all" || product.fabricType === state.fabric;
        const matchesStock =
          state.stock === "all" ||
          (state.stock === "available" && product.stock > 0) ||
          (state.stock === "out" && product.stock <= 0);

        return matchesSearch && matchesCategory && matchesBrand && matchesFabric && matchesStock;
      })
      .sort(sortProducts);
  }

  function sortProducts(a, b) {
    if (state.sort === "price-low") return comparePrices(a, b, "low");
    if (state.sort === "price-high") return comparePrices(a, b, "high");
    if (state.sort === "brand") return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
    if (state.sort === "pages") return (b.pageCount || 0) - (a.pageCount || 0) || a.name.localeCompare(b.name);
    if (state.sort === "stock") return b.stock - a.stock;
    if (state.sort === "newest") return products.indexOf(b) - products.indexOf(a);
    return Number(b.featured) - Number(a.featured) || products.indexOf(a) - products.indexOf(b);
  }

  function productCardTemplate(product) {
    const statusClass = availabilityClass(product);
    const statusLabel = availabilityLabel(product);
    const meta = [
      product.brand,
      product.fabricType,
      product.pageCount ? `${product.pageCount} ${product.pageCount === 1 ? "page" : "pages"}` : ""
    ].filter(Boolean);

    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}">
          <div class="badge-row">
            <span class="badge">${escapeHtml(product.category)}</span>
            <span class="status ${statusClass}">${escapeHtml(statusLabel)}</span>
          </div>
        </div>
        <div class="product-info">
          <div class="product-title-row">
            <strong>${escapeHtml(product.name)}</strong>
            <span class="price">${escapeHtml(displayPrice(product))}</span>
          </div>
          <div class="meta">
            ${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="product-actions">
            <button class="view-button" type="button" data-action="view" data-slug="${escapeHtml(product.slug)}">
              <span aria-hidden="true" class="icon-wrap" data-icon="eye"></span>
              View
            </button>
            <button class="icon-button" type="button" data-action="whatsapp" data-slug="${escapeHtml(product.slug)}" aria-label="Order ${escapeHtml(product.name)} on WhatsApp" title="WhatsApp">
              <span aria-hidden="true" class="icon-wrap" data-icon="message"></span>
            </button>
            <button class="icon-button" type="button" data-action="share" data-slug="${escapeHtml(product.slug)}" aria-label="Share ${escapeHtml(product.name)}" title="Share">
              <span aria-hidden="true" class="icon-wrap" data-icon="share"></span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function handleProductAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const product = findProduct(button.dataset.slug);
    if (!product) return;

    if (button.dataset.action === "view") {
      openProduct(product);
    }

    if (button.dataset.action === "whatsapp") {
      window.open(buildProductWhatsAppUrl(product), "_blank", "noopener");
    }

    if (button.dataset.action === "share") {
      shareProduct(product);
    }
  }

  function handleFeaturedClick(event) {
    const button = event.target.closest("button[data-slug]");
    if (!button) return;
    const product = findProduct(button.dataset.slug);
    if (product) openProduct(product);
  }

  function openProduct(product) {
    currentDialogProduct = product;
    window.location.hash = `product=${product.slug}`;
    renderProductDialog(product);
    if (!els.dialog.open) {
      els.dialog.showModal();
    }
  }

  function renderProductDialog(product) {
    const statusLabel = availabilityLabel(product);
    const details = [
      ["Collection ID", product.id],
      ["Fabric type", product.fabricType],
      ["Availability", statusLabel],
      product.pageCount ? ["Lookbook", `${product.pageCount} ${product.pageCount === 1 ? "page" : "pages"}`] : null,
      displayRemarks(product) ? ["Notes", displayRemarks(product)] : null
    ].filter(Boolean);

    els.dialogContent.innerHTML = `
      <div class="dialog-grid">
        <div class="dialog-gallery">
          <img class="dialog-main-image" id="dialogMainImage" src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}">
          <div class="thumb-row">
            ${product.images.map((image, index) => `
              <button class="thumb-button" type="button" data-image="${escapeHtml(image)}" aria-current="${index === 0 ? "true" : "false"}" aria-label="View product image ${index + 1}">
                <img src="${escapeHtml(image)}" alt="">
              </button>
            `).join("")}
          </div>
        </div>
        <div class="dialog-details">
          <p class="eyebrow">${escapeHtml(product.brand)} / ${escapeHtml(product.category)}</p>
          <h2 id="dialogTitle">${escapeHtml(product.name)}</h2>
          <div class="detail-price">${escapeHtml(displayPrice(product))}</div>
          <p class="detail-copy">${escapeHtml(displayDescription(product))}</p>
          <div class="detail-list">
            ${details.map(([label, value]) => `
              <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
            `).join("")}
          </div>
          <div class="dialog-actions">
            <a class="primary-link" href="${buildProductWhatsAppUrl(product)}" target="_blank" rel="noreferrer">
              <span aria-hidden="true" class="icon-wrap" data-icon="message"></span>
              Order on WhatsApp
            </a>
            <button class="secondary-link" type="button" data-dialog-action="copy">
              <span aria-hidden="true" class="icon-wrap" data-icon="copy"></span>
              Copy link
            </button>
            <button class="secondary-link" type="button" data-dialog-action="share">
              <span aria-hidden="true" class="icon-wrap" data-icon="share"></span>
              Share
            </button>
            <a class="secondary-link" href="mailto:${escapeHtml(config.email || "")}?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(productShareText(product))}">
              <span aria-hidden="true" class="icon-wrap" data-icon="mail"></span>
              Email
            </a>
          </div>
        </div>
      </div>
    `;

    hydrateIcons(els.dialogContent);
    bindDialogControls(product);
  }

  function bindDialogControls(product) {
    els.dialogContent.querySelectorAll(".thumb-button").forEach((button) => {
      button.addEventListener("click", () => {
        els.dialogContent.querySelector("#dialogMainImage").src = button.dataset.image;
        els.dialogContent.querySelectorAll(".thumb-button").forEach((thumb) => {
          thumb.setAttribute("aria-current", String(thumb === button));
        });
      });
    });

    els.dialogContent.querySelectorAll("[data-dialog-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.dialogAction === "copy") copyProductLink(product);
        if (button.dataset.dialogAction === "share") shareProduct(product);
      });
    });
  }

  function closeDialog() {
    if (els.dialog.open) {
      els.dialog.close();
    }
  }

  function openProductFromHash() {
    if (!window.location.hash.startsWith("#product=")) return;
    const slug = decodeURIComponent(window.location.hash.replace("#product=", ""));
    const product = findProduct(slug);
    if (!product) return;

    if (!currentDialogProduct || currentDialogProduct.slug !== product.slug) {
      renderProductDialog(product);
      currentDialogProduct = product;
    }

    if (!els.dialog.open) {
      els.dialog.showModal();
    }
  }

  function shareProduct(product) {
    const data = {
      title: product.name,
      text: productShareText(product),
      url: productUrl(product)
    };

    if (navigator.share) {
      navigator.share(data).catch(() => copyProductLink(product));
      return;
    }

    copyProductLink(product);
  }

  function copyProductLink(product) {
    const link = productUrl(product);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => showToast("Product link copied"));
      return;
    }

    const input = document.createElement("input");
    input.value = link;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast("Product link copied");
  }

  function resetFilters() {
    state.search = "";
    state.category = "all";
    state.brand = "all";
    state.fabric = "all";
    state.stock = "all";
    state.sort = "featured";

    els.search.value = "";
    els.brand.value = "all";
    els.fabric.value = "all";
    els.stock.value = "all";
    els.sort.value = "featured";
    updateCategoryChips();
    renderCatalog();
  }

  function updateCategoryChips() {
    els.categoryChips.querySelectorAll("button[data-category]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
    });
  }

  function buildProductWhatsAppUrl(product) {
    return buildWhatsAppUrl(encodeURIComponent(productShareText(product)));
  }

  function buildWhatsAppUrl(encodedMessage) {
    const phone = String(config.whatsappNumber || "").replace(/\D/g, "");
    if (phone) {
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  }

  function productShareText(product) {
    return `Hi saracreations0810, I am interested in ${product.name} (${product.id}). Price: ${displayPrice(product)}. Link: ${productUrl(product)}`;
  }

  function productUrl(product) {
    const base = window.location.href.split("#")[0];
    return `${base}#product=${encodeURIComponent(product.slug)}`;
  }

  function findProduct(slug) {
    return products.find((product) => product.slug === slug);
  }

  function chipTemplate(value, label, pressed) {
    return `<button class="chip" type="button" data-category="${escapeHtml(value)}" aria-pressed="${pressed ? "true" : "false"}">${escapeHtml(label)}</button>`;
  }

  function fillSelect(select, options) {
    select.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
  }

  function formatPrice(amount) {
    return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
  }

  function displayPrice(product) {
    if (product.priceLabel) return product.priceLabel;
    if (!product.price) return "Contact for price";
    return formatPrice(product.price);
  }

  function featuredMeta(product) {
    if (product.pageCount) {
      return `${product.brand} / ${product.pageCount} ${product.pageCount === 1 ? "page" : "pages"}`;
    }
    return displayPrice(product);
  }

  function availabilityLabel(product) {
    if (product.pageCount && product.stock > 0) return "Available to enquire";
    if (product.stock > 0) return `${product.stock} in stock`;
    return "Unavailable";
  }

  function availabilityClass(product) {
    if (product.pageCount && product.stock > 0) return "catalog";
    return product.stock > 0 ? "available" : "out";
  }

  function displayDescription(product) {
    if (product.pageCount) {
      return `${product.name} lookbook with ${product.pageCount} ${product.pageCount === 1 ? "page" : "pages"}. Contact saracreations0810 on WhatsApp for exact price, availability, and piece details.`;
    }
    return product.description || "Contact saracreations0810 for current price, availability, and order details.";
  }

  function displayRemarks(product) {
    if (!product.remarks) return "";
    if (/pdf catalog import|replace price\/stock/i.test(product.remarks)) {
      return "Contact for current price, stock, and dispatch details.";
    }
    return product.remarks;
  }

  function sortablePrice(product, emptyPosition) {
    if (!product.price || product.priceLabel) {
      return emptyPosition === "high" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    return product.price;
  }

  function comparePrices(a, b, direction) {
    const emptyPosition = direction === "low" ? "high" : "low";
    const priceA = sortablePrice(a, emptyPosition);
    const priceB = sortablePrice(b, emptyPosition);

    if (priceA === priceB) return products.indexOf(a) - products.indexOf(b);
    if (priceA === Number.POSITIVE_INFINITY || priceA === Number.NEGATIVE_INFINITY) return 1;
    if (priceB === Number.POSITIVE_INFINITY || priceB === Number.NEGATIVE_INFINITY) return -1;

    return direction === "low" ? priceA - priceB : priceB - priceA;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }
})();
