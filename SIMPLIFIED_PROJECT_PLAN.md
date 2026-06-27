# saracreations0810 Simplified E-Commerce Project Plan

## Simple Goal

Build a lightweight online clothing catalog for saracreations0810 where customers can browse products, filter by category/brand/fabric type, view product details, and place orders through WhatsApp or Instagram.

This keeps the first version simple, free to host, and easy to maintain.

## Version 1: Must-Have Features

1. Home and catalog page
   - Brand name/logo
   - Featured products
   - Category sections
   - Search and filters

2. Product listing
   - Product name
   - Brand
   - Category
   - Fabric type: stitched or un-stitched
   - Price in Indian Rupees
   - Stock status
   - Product image

3. Product detail page
   - Image gallery
   - Product description
   - Price
   - Category, brand, and fabric type
   - Remarks or extra notes
   - WhatsApp order button
   - Copy product link button
   - Social share buttons

4. Contact/order flow
   - WhatsApp order link with product name included automatically
   - Instagram link
   - Email link: saracreations0810@gmail.com

5. Simple product management
   - Store products in a `products.json` file at first
   - Add/edit/remove products by updating the file
   - Store images in the website folder

## Version 1: Remove or Delay

These features are useful later, but they make the first launch too large:

- Full admin dashboard
- Customer login
- Online payment gateway
- Cart and checkout
- Customer reviews
- Grammar auto-correct API
- Email notification automation
- QR code generation
- Bulk CSV import/export
- Price history tracking
- Advanced inventory reports
- Soft delete/archive system
- Separate backend server
- Database setup

## Recommended Free Hosting

Best simple choice: Vercel Hobby plan.

Why:
- Free for personal/small projects
- Easy GitHub deployment
- Automatic HTTPS
- Fast CDN
- Good for React, Vite, Next.js, or static websites

Other free options:

- GitHub Pages: best for a very simple static HTML/CSS/JS website.
- Netlify Free: good for static sites and forms, but watch monthly usage credits.
- Firebase Hosting Spark plan: good later if Firebase database/auth is added.

Note: hosting can be free, but a custom domain like `saracreations0810.com` usually costs money from a domain provider.

Official references checked:

- Vercel pricing: https://vercel.com/pricing
- GitHub Pages overview: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Netlify pricing: https://www.netlify.com/pricing/
- Firebase pricing: https://firebase.google.com/pricing

## Suggested Tech Stack

For the simplest launch:

- Frontend: React + Vite
- Styling: Tailwind CSS
- Data: local `products.json`
- Images: local `/public/products/` folder
- Orders: WhatsApp link
- Hosting: Vercel

No backend is needed for version 1.

## Product Data Fields

Each product should only need:

```json
{
  "id": "sc-001",
  "name": "Luxury Lawn Suit",
  "brand": "Maria B",
  "category": "Luxury Lawns",
  "fabricType": "Un-stitched",
  "price": 2499,
  "stock": "Available",
  "images": ["/products/sc-001-1.jpg", "/products/sc-001-2.jpg"],
  "description": "Premium lawn fabric with elegant print.",
  "remarks": "Best for daily and semi-formal wear."
}
```

## Main Categories

Keep only the categories that are most important at launch:

- Luxury Lawns
- Original Lawns
- Pure Cottons
- Party Wears
- Daily Wears
- Two Piece
- Co-ord Sets

## Basic Pages

1. Home
2. Products
3. Product Detail
4. About
5. Contact

## Free Hosting Steps On Vercel

1. Create a GitHub repository.
2. Push the website code to GitHub.
3. Go to Vercel and choose "Add New Project".
4. Import the GitHub repository.
5. Use these settings for a Vite project:
   - Build command: `npm run build`
   - Output folder: `dist`
6. Click Deploy.
7. Use the free Vercel URL first.
8. Add a custom domain later if needed.

## Upgrade Plan Later

After the catalog is live and customers start using it, add features in this order:

1. Admin product editor
2. Image upload dashboard
3. Customer reviews
4. Inventory/stock report
5. Email notifications
6. Payment gateway
7. Full database

## Final Scope Summary

The first version should be a beautiful product catalog, not a full e-commerce system. Customers browse, share, and order through WhatsApp. The site can be hosted free, launched quickly, and upgraded later without rebuilding everything.
