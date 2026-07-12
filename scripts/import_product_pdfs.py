#!/usr/bin/env python3
import json
import re
from pathlib import Path

import Quartz
from Foundation import NSURL
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "product-pdfs"
OUT_DIR = ROOT / "assets" / "products"
DATA_FILE = ROOT / "generated-pdf-products.json"
JS_FILE = ROOT / "pdf-products.js"

CATEGORIES = [
    "Luxury Lawns",
    "Original Lawns",
    "Pure Cottons",
    "Party Wears",
    "Daily Wears",
    "Two Piece",
    "Co-ord Sets",
]

BRANDS = [
    "Maria B",
    "Gul Ahmed",
    "Nureh",
    "Charizma",
    "Elaf",
    "Ramsha",
    "Zara Shahjahan",
    "Al-Zohaib",
    "Selina",
    "Kahf",
    "Noors Lehr",
    "Esmel",
    "Iraar",
    "Hemline",
    "Roheenaz",
    "Shezlin",
    "Zaha",
    "Mausummery",
]


def slugify(value):
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "catalog"


def clean_title(path):
    name = path.stem
    name = re.sub(r"[_-]?\d{6,}[_-]?\d*", "", name)
    name = re.sub(r"^\d+\s*[-_]+\s*", "", name)
    name = name.replace("Inlays", "").replace("inlay", "")
    name = name.replace("Catalogue", "Catalog").replace("Lookbook", "Lookbook")
    name = re.sub(r"\s+", " ", name)
    return name.strip(" -")


def infer_brand(title):
    normalized = title.lower()
    brand_map = {
        "kahf": "Kahf",
        "elaf": "Elaf",
        "charizma": "Charizma",
        "ramsha": "Ramsha",
        "nureh": "Nureh",
        "zaha": "Zaha",
        "noors": "Noors Lehr",
        "esmel": "Esmel",
        "iraar": "Iraar",
        "hemline": "Hemline",
        "roheenaz": "Roheenaz",
        "shezlin": "Shezlin",
        "mausummery": "Mausummery",
    }
    for key, brand in brand_map.items():
        if key in normalized:
            return brand
    for brand in BRANDS:
        if brand.lower() in normalized:
            return brand
    return "Other Brands"


def infer_category(title):
    normalized = title.lower()
    if "party" in normalized or "festive" in normalized or "eid" in normalized or "chiffon" in normalized:
        return "Party Wears"
    if "cotton" in normalized:
        return "Pure Cottons"
    if "co-ord" in normalized or "coord" in normalized:
        return "Co-ord Sets"
    if "two piece" in normalized:
        return "Two Piece"
    if "lawn" in normalized or "luxury" in normalized or "embroidered" in normalized or "emb" in normalized:
        return "Luxury Lawns"
    if "print" in normalized or "summer" in normalized:
        return "Original Lawns"
    return "Luxury Lawns"


def infer_price(category):
    return {
        "Luxury Lawns": 3499,
        "Original Lawns": 2499,
        "Pure Cottons": 1999,
        "Party Wears": 4999,
        "Daily Wears": 1599,
        "Two Piece": 2399,
        "Co-ord Sets": 2799,
    }.get(category, 2499)


def doc_for(path):
    url = NSURL.fileURLWithPath_(str(path.resolve()))
    return Quartz.CGPDFDocumentCreateWithURL(url)


def page_count(path):
    doc = doc_for(path)
    return Quartz.CGPDFDocumentGetNumberOfPages(doc) if doc else 0


def render_page(path, page_index, out_path, max_width=900):
    doc = doc_for(path)
    if not doc:
        raise RuntimeError(f"Could not open {path}")
    page = Quartz.CGPDFDocumentGetPage(doc, page_index + 1)
    if not page:
        raise RuntimeError(f"Could not open page {page_index + 1} in {path}")

    rect = Quartz.CGPDFPageGetBoxRect(page, Quartz.kCGPDFMediaBox)
    scale = max_width / rect.size.width
    width = int(rect.size.width * scale)
    height = int(rect.size.height * scale)

    color_space = Quartz.CGColorSpaceCreateDeviceRGB()
    context = Quartz.CGBitmapContextCreate(
        None,
        width,
        height,
        8,
        width * 4,
        color_space,
        Quartz.kCGImageAlphaPremultipliedLast,
    )
    Quartz.CGContextSetRGBFillColor(context, 1, 1, 1, 1)
    Quartz.CGContextFillRect(context, Quartz.CGRectMake(0, 0, width, height))
    Quartz.CGContextTranslateCTM(context, 0, height)
    Quartz.CGContextScaleCTM(context, scale, -scale)
    Quartz.CGContextDrawPDFPage(context, page)

    image = Quartz.CGBitmapContextCreateImage(context)
    destination = Quartz.CGImageDestinationCreateWithURL(
        NSURL.fileURLWithPath_(str(out_path.resolve())),
        "public.jpeg",
        1,
        None,
    )
    Quartz.CGImageDestinationAddImage(
        destination,
        image,
        {Quartz.kCGImageDestinationLossyCompressionQuality: 0.82},
    )
    Quartz.CGImageDestinationFinalize(destination)

    # Quartz renders these catalog PDFs upside down and mirrored in a raw bitmap context.
    with Image.open(out_path) as rendered:
        ImageOps.mirror(rendered.rotate(180)).save(out_path, quality=82, optimize=True)


def build_products():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    products = []

    for index, pdf in enumerate(sorted(PDF_DIR.glob("*.pdf")), start=1):
        title = clean_title(pdf)
        slug = slugify(title)
        count = page_count(pdf)
        if count == 0:
            continue

        image_paths = []
        pages_to_render = min(count, 4)
        for page_index in range(pages_to_render):
            out_name = f"{slug}-p{page_index + 1}.jpg"
            out_path = OUT_DIR / out_name
            render_page(pdf, page_index, out_path)
            image_paths.append(f"assets/products/{out_name}")

        brand = infer_brand(title)
        category = infer_category(title)
        product = {
            "id": f"PDF-{index:03d}",
            "slug": slug,
            "name": title,
            "brand": brand,
            "category": category,
            "fabricType": "Un-stitched",
            "price": 0,
            "priceLabel": "Contact for price",
            "stock": 1,
            "featured": index <= 4,
            "images": image_paths,
            "description": f"{title} catalog imported from PDF with {count} pages. Contact saracreations0810 on WhatsApp for exact price, availability, and piece details.",
            "remarks": "PDF catalog import. Replace price/stock after confirmation.",
            "tags": sorted(set([brand.lower().replace(' ', '-'), category.lower().replace(' ', '-'), "pdf-catalog"])),
            "pageCount": count,
        }
        products.append(product)

    DATA_FILE.write_text(json.dumps(products, indent=2), encoding="utf-8")
    JS_FILE.write_text(
        "window.SARA_PRODUCTS = (window.SARA_PRODUCTS || []).concat("
        + json.dumps(products, indent=2)
        + ");\n",
        encoding="utf-8",
    )
    print(f"Generated {len(products)} products in {DATA_FILE.relative_to(ROOT)}")
    print(f"Generated browser data in {JS_FILE.relative_to(ROOT)}")
    print(f"Rendered images to {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    build_products()
