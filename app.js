(function () {
  "use strict";

  const collections = Array.isArray(window.SARA_COLLECTIONS) ? window.SARA_COLLECTIONS : [];
  const products = Array.isArray(window.SARA_PRODUCTS) ? window.SARA_PRODUCTS : [];
  const config = window.SARA_CONFIG || {};

  const state = {
    collectionSlug: null,
    collectionSearch: "",
    designSearch: ""
  };

  const els = {};
  let currentProduct = null;
  let suppressDialogRoute = false;
  let toastTimer = 0;

  const icons = {
    "arrow-left": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path><path d="M9 12h10"></path></svg>',
    "arrow-right": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
    "chevron-down": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m16.5 16.5 4 4"></path></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.4-5A8 8 0 1 1 21 12z"></path></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.7 6.8-4.4M8.6 13.3l6.8 4.4"></path></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>'
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    hydrateIcons(document);
    setupStaticLinks();
    renderCollectionMenu();
    bindEvents();
    handleRoute(false);
  }

  function cacheElements() {
    els.catalog = document.getElementById("catalog");
    els.catalogIntro = document.getElementById("catalogIntro");
    els.collectionMenu = document.getElementById("collectionMenu");
    els.menuCollectionCount = document.getElementById("menuCollectionCount");
    els.collectionMenuList = document.getElementById("collectionMenuList");
    els.collectionsView = document.getElementById("collectionsView");
    els.collectionView = document.getElementById("collectionView");
    els.collectionSearch = document.getElementById("collectionSearch");
    els.collectionGrid = document.getElementById("collectionGrid");
    els.collectionEmpty = document.getElementById("collectionEmpty");
    els.collectionResultCount = document.getElementById("collectionResultCount");
    els.clearCollectionSearch = document.getElementById("clearCollectionSearch");
    els.allCollectionsButton = document.getElementById("allCollectionsButton");
    els.selectedCollectionEyebrow = document.getElementById("selectedCollectionEyebrow");
    els.selectedCollectionTitle = document.getElementById("selectedCollectionTitle");
    els.selectedCollectionMeta = document.getElementById("selectedCollectionMeta");
    els.designSearch = document.getElementById("designSearch");
    els.productGrid = document.getElementById("productGrid");
    els.productEmpty = document.getElementById("productEmpty");
    els.designResultCount = document.getElementById("designResultCount");
    els.clearDesignSearch = document.getElementById("clearDesignSearch");
    els.dialog = document.getElementById("productDialog");
    els.dialogContent = document.getElementById("dialogContent");
    els.closeDialog = document.getElementById("closeDialog");
    els.toast = document.getElementById("toast");
  }

  function hydrateIcons(root) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      node.innerHTML = icons[node.dataset.icon] || "";
    });
  }

  function setupStaticLinks() {
    const message = encodeURIComponent("Hi saracreations0810, I want to know more about your latest designer collections.");
    const whatsappUrl = buildWhatsAppUrl(message);
    const instagramUrl = config.instagramUrl || "https://www.instagram.com/";

    document.getElementById("headerWhatsApp").href = whatsappUrl;
    document.getElementById("contactWhatsApp").href = whatsappUrl;
    document.getElementById("instagramLink").href = instagramUrl;
  }

  function bindEvents() {
    els.collectionSearch.addEventListener("input", (event) => {
      state.collectionSearch = event.target.value.trim().toLowerCase();
      renderCollections();
    });

    els.clearCollectionSearch.addEventListener("click", () => {
      state.collectionSearch = "";
      els.collectionSearch.value = "";
      renderCollections();
      els.collectionSearch.focus();
    });

    els.collectionGrid.addEventListener("click", handleCollectionClick);
    els.collectionMenuList.addEventListener("click", handleCollectionClick);

    els.allCollectionsButton.addEventListener("click", () => {
      updateRoute("#catalog", "push");
      showCollections(true);
    });

    els.designSearch.addEventListener("input", (event) => {
      state.designSearch = event.target.value.trim().toLowerCase();
      renderProducts();
    });

    els.clearDesignSearch.addEventListener("click", () => {
      state.designSearch = "";
      els.designSearch.value = "";
      renderProducts();
      els.designSearch.focus();
    });

    els.productGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-product]");
      if (!button) return;
      const product = findProduct(button.dataset.product);
      if (product) openProduct(product, true);
    });

    els.dialogContent.addEventListener("click", handleDialogAction);
    els.closeDialog.addEventListener("click", () => els.dialog.close());
    els.dialog.addEventListener("click", (event) => {
      if (event.target === els.dialog) els.dialog.close();
    });
    els.dialog.addEventListener("close", handleDialogClose);

    document.addEventListener("click", (event) => {
      if (els.collectionMenu.open && !els.collectionMenu.contains(event.target)) {
        els.collectionMenu.removeAttribute("open");
      }
    });

    window.addEventListener("popstate", () => handleRoute(false));
    window.addEventListener("hashchange", () => handleRoute(false));
  }

  function renderCollectionMenu() {
    els.menuCollectionCount.textContent = formatNumber(collections.length);
    els.collectionMenuList.innerHTML = collections.map((collection) => `
      <button class="collection-menu-item" type="button" data-collection="${escapeHtml(collection.slug)}">
        <img src="${escapeHtml(collection.coverImage)}" alt="" loading="lazy" decoding="async">
        <span>
          <strong>${escapeHtml(collection.name)}</strong>
          <small>${escapeHtml(collection.brand)} / ${formatNumber(collection.productCount)} ${plural(collection.productCount, "design")}</small>
        </span>
        <span class="icon-wrap" data-icon="arrow-right" aria-hidden="true"></span>
      </button>
    `).join("");
    hydrateIcons(els.collectionMenuList);
  }

  function renderCollections() {
    const filtered = collections.filter((collection) => {
      const text = [collection.name, collection.brand, collection.category].join(" ").toLowerCase();
      return !state.collectionSearch || text.includes(state.collectionSearch);
    });

    els.collectionResultCount.textContent = `${formatNumber(filtered.length)} ${plural(filtered.length, "collection")}`;
    els.collectionEmpty.hidden = filtered.length > 0;
    els.collectionGrid.hidden = filtered.length === 0;
    els.collectionGrid.innerHTML = filtered.map(collectionCardTemplate).join("");
    hydrateIcons(els.collectionGrid);
  }

  function collectionCardTemplate(collection) {
    return `
      <article class="collection-card">
        <button type="button" data-collection="${escapeHtml(collection.slug)}" aria-label="Open ${escapeHtml(collection.name)}">
          <span class="collection-card-media">
            <img src="${escapeHtml(collection.coverImage)}" alt="${escapeHtml(collection.name)}" loading="lazy" decoding="async">
          </span>
          <span class="collection-card-body">
            <small>${escapeHtml(collection.brand)}</small>
            <strong>${escapeHtml(collection.name)}</strong>
            <span class="collection-card-meta">
              ${formatNumber(collection.productCount)} ${plural(collection.productCount, "design")}
              <span class="icon-wrap" data-icon="arrow-right" aria-hidden="true"></span>
            </span>
          </span>
        </button>
      </article>
    `;
  }

  function handleCollectionClick(event) {
    const button = event.target.closest("button[data-collection]");
    if (!button) return;
    const collection = findCollection(button.dataset.collection);
    if (!collection) return;

    updateRoute(`#collection=${encodeURIComponent(collection.slug)}`, "push");
    showCollection(collection, true);
  }

  function showCollections(shouldScroll) {
    closeDialogForRoute();
    state.collectionSlug = null;
    state.designSearch = "";
    els.designSearch.value = "";
    els.catalogIntro.hidden = false;
    els.collectionView.hidden = true;
    els.collectionsView.hidden = false;
    els.collectionMenu.removeAttribute("open");
    updateMenuState();
    renderCollections();
    if (shouldScroll) scrollToCatalog();
  }

  function showCollection(collection, shouldScroll) {
    state.collectionSlug = collection.slug;
    state.designSearch = "";
    els.designSearch.value = "";
    els.selectedCollectionEyebrow.textContent = `${collection.brand} / ${collection.category}`;
    els.selectedCollectionTitle.textContent = collection.name;
    els.selectedCollectionMeta.textContent = collection.fabricType;
    els.catalogIntro.hidden = true;
    els.collectionsView.hidden = true;
    els.collectionView.hidden = false;
    els.collectionMenu.removeAttribute("open");
    updateMenuState();
    renderProducts();
    if (shouldScroll) scrollToCatalog();
  }

  function renderProducts() {
    const collection = findCollection(state.collectionSlug);
    if (!collection) return;

    const filtered = products
      .filter((product) => product.collectionSlug === collection.slug)
      .filter((product) => {
        const text = [product.name, product.id, product.brand, product.category].join(" ").toLowerCase();
        return !state.designSearch || text.includes(state.designSearch);
      })
      .sort((a, b) => a.sequence - b.sequence);

    els.designResultCount.textContent = `${formatNumber(filtered.length)} ${plural(filtered.length, "design")}`;
    els.productEmpty.hidden = filtered.length > 0;
    els.productGrid.hidden = filtered.length === 0;
    els.productGrid.innerHTML = filtered.map(productCardTemplate).join("");
  }

  function productCardTemplate(product) {
    return `
      <article class="product-card">
        <button type="button" data-product="${escapeHtml(product.slug)}" aria-label="View ${escapeHtml(product.name)}, reference ${escapeHtml(product.id)}">
          <span class="product-media">
            <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
          </span>
          <span class="product-info">
            <small>${escapeHtml(product.id)}</small>
            <strong>${escapeHtml(product.name)}</strong>
          </span>
        </button>
      </article>
    `;
  }

  function openProduct(product, shouldUpdateRoute) {
    const collection = findCollection(product.collectionSlug);
    if (!collection) return;
    if (state.collectionSlug !== collection.slug) showCollection(collection, false);

    currentProduct = product;
    renderProductDialog(product);
    if (shouldUpdateRoute) {
      updateRoute(`#product=${encodeURIComponent(product.slug)}`, "push");
    }
    if (!els.dialog.open) els.dialog.showModal();
  }

  function renderProductDialog(product) {
    const thumbnails = product.images.length > 1 ? `
      <div class="thumb-row" aria-label="Product images">
        ${product.images.map((image, index) => `
          <button class="thumb-button" type="button" data-image="${escapeHtml(image)}" aria-current="${index === 0 ? "true" : "false"}" aria-label="View image ${index + 1}">
            <img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">
          </button>
        `).join("")}
      </div>
    ` : "";

    els.dialogContent.innerHTML = `
      <div class="dialog-grid">
        <div class="dialog-gallery">
          <div class="dialog-image-stage">
            <img id="dialogMainImage" src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}">
          </div>
          ${thumbnails}
        </div>
        <div class="dialog-details">
          <p class="eyebrow">${escapeHtml(product.brand)} / ${escapeHtml(product.collectionName)}</p>
          <h2 id="dialogTitle">${escapeHtml(product.name)}</h2>
          <p class="product-reference">Reference ${escapeHtml(product.id)}</p>
          <p class="dialog-meta">${escapeHtml(product.fabricType)} / ${escapeHtml(product.category)}</p>
          <p class="detail-price">${escapeHtml(displayPrice(product))}</p>
          <div class="dialog-actions">
            <a class="primary-button" href="${buildProductWhatsAppUrl(product)}" target="_blank" rel="noreferrer">
              <span class="icon-wrap" data-icon="message" aria-hidden="true"></span>
              Enquire on WhatsApp
            </a>
            <button class="secondary-button" type="button" data-dialog-action="share">
              <span class="icon-wrap" data-icon="share" aria-hidden="true"></span>
              Share
            </button>
          </div>
        </div>
      </div>
    `;
    hydrateIcons(els.dialogContent);
  }

  function handleDialogAction(event) {
    const thumb = event.target.closest("button[data-image]");
    if (thumb) {
      const mainImage = els.dialogContent.querySelector("#dialogMainImage");
      mainImage.src = thumb.dataset.image;
      els.dialogContent.querySelectorAll(".thumb-button").forEach((button) => {
        button.setAttribute("aria-current", String(button === thumb));
      });
      return;
    }

    const action = event.target.closest("button[data-dialog-action]");
    if (action && action.dataset.dialogAction === "share" && currentProduct) {
      shareProduct(currentProduct);
    }
  }

  function handleDialogClose() {
    const collectionSlug = currentProduct ? currentProduct.collectionSlug : state.collectionSlug;
    currentProduct = null;
    if (!suppressDialogRoute && window.location.hash.startsWith("#product=") && collectionSlug) {
      updateRoute(`#collection=${encodeURIComponent(collectionSlug)}`, "replace");
    }
  }

  function closeDialogForRoute() {
    if (!els.dialog.open) return;
    suppressDialogRoute = true;
    els.dialog.close();
    suppressDialogRoute = false;
  }

  function handleRoute(shouldScroll) {
    const hash = window.location.hash;
    if (hash.startsWith("#product=")) {
      const product = findProduct(decodeHashValue(hash, "#product="));
      if (product) {
        const collection = findCollection(product.collectionSlug);
        if (collection) showCollection(collection, shouldScroll);
        openProduct(product, false);
        return;
      }
    }

    closeDialogForRoute();
    if (hash.startsWith("#collection=")) {
      const collection = findCollection(decodeHashValue(hash, "#collection="));
      if (collection) {
        showCollection(collection, shouldScroll);
        return;
      }
    }

    showCollections(shouldScroll);
  }

  function decodeHashValue(hash, prefix) {
    try {
      return decodeURIComponent(hash.slice(prefix.length));
    } catch (error) {
      return hash.slice(prefix.length);
    }
  }

  function updateRoute(hash, mode) {
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    try {
      if (mode === "replace") {
        history.replaceState(null, "", url);
      } else {
        history.pushState(null, "", url);
      }
    } catch (error) {
      window.location.hash = hash;
    }
  }

  function updateMenuState() {
    els.collectionMenuList.querySelectorAll("button[data-collection]").forEach((button) => {
      if (button.dataset.collection === state.collectionSlug) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function scrollToCatalog() {
    els.catalog.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function findCollection(slug) {
    return collections.find((collection) => collection.slug === slug);
  }

  function findProduct(slug) {
    return products.find((product) => product.slug === slug);
  }

  function buildProductWhatsAppUrl(product) {
    return buildWhatsAppUrl(encodeURIComponent(productShareText(product)));
  }

  function buildWhatsAppUrl(encodedMessage) {
    const phone = String(config.whatsappNumber || "").replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;
  }

  function productShareText(product) {
    return `Hi saracreations0810, I am interested in ${product.collectionName} - ${product.name} (${product.id}). Price: ${displayPrice(product)}. Link: ${productUrl(product)}`;
  }

  function productUrl(product) {
    return `${window.location.href.split("#")[0]}#product=${encodeURIComponent(product.slug)}`;
  }

  function shareProduct(product) {
    const data = {
      title: `${product.name} / ${product.collectionName}`,
      text: productShareText(product),
      url: productUrl(product)
    };

    if (navigator.share) {
      navigator.share(data).catch((error) => {
        if (error.name !== "AbortError") copyProductLink(product);
      });
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

  function displayPrice(product) {
    if (product.priceLabel) return product.priceLabel;
    if (!product.price) return "Contact for price";
    return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(product.price)}`;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  }

  function plural(value, word) {
    return value === 1 ? word : `${word}s`;
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
    toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }
})();
