# saracreations0810 Static Catalog

This is a simple, free-hosting-ready clothing catalog for saracreations0810.

## What It Includes

- Responsive collections catalog
- Search, category, brand, fabric type, stock, and sort filters
- Featured collections
- Collection detail popup with gallery
- WhatsApp order links
- Copy/share collection links
- Email and Instagram contact links
- Imported PDF catalogue image previews

## How To Edit The Catalog

Contact and social settings live in `products.js`:

```js
window.SARA_CONFIG = {
  brandName: "saracreations0810",
  email: "saracreations0810@gmail.com",
  instagramUrl: "https://www.instagram.com/saracreations0810/",
  whatsappNumber: ""
};
```

For WhatsApp direct ordering, add the phone number with country code and no plus sign:

```js
whatsappNumber: "919876543210"
```

The current collections are loaded from `pdf-products.js`, which was generated from PDFs in `product-pdfs/` and preview images in `assets/products/`.

Manual collections can also be added in `products.js` by appending items to `window.SARA_PRODUCTS`. Each collection can use one or more images:

```js
images: ["assets/your-product-photo-1.jpg", "assets/your-product-photo-2.jpg"]
```

## Open Locally

Open `index.html` directly in a browser.

No npm install, backend, database, or build command is needed.

## Free Hosting

### Vercel

1. Push this folder to GitHub.
2. Open Vercel.
3. Create a new project from the GitHub repository.
4. Framework preset: Other.
5. Build command: leave empty.
6. Output directory: leave empty.
7. Deploy.

### GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to repository Settings.
3. Open Pages.
4. Source: deploy from branch.
5. Branch: `main`.
6. Folder: `/root`.
7. Save.

### Netlify

Drag and drop this folder into Netlify Drop, or connect the GitHub repository.

Build command can stay empty because this is a static website.
