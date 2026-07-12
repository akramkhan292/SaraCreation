# saracreations0810 Collection Catalog

This is a simple, free-hosting-ready clothing catalog for saracreations0810.

## What It Includes

- Collection-first browsing with a header collection menu
- Separate product cards inside every collection
- Responsive collection and product search
- Multi-image product galleries for detailed lookbooks
- WhatsApp order links
- Shareable product links
- Email and Instagram contact links
- Product images imported from PDF catalogues

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

The current catalog is loaded from `pdf-products.js`. It contains separate collection and product records generated from PDFs in `product-pdfs/`, with product images in `assets/products/`.

The importer groups repeated pages from the same design into one product gallery and keeps one-page product sheets separate. Run it after adding or replacing source PDFs:

```bash
python3 scripts/import_product_pdfs.py
```

When adding a new PDF, add its collection name, page groups, and product references to `COLLECTION_SPECS` in `scripts/import_product_pdfs.py`, then run the importer.

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
