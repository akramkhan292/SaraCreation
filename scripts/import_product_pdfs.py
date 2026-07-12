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


def slugify(value):
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "catalog"


def clean_title(path):
    name = path.stem
    name = re.sub(r"[_-]?\d{6,}[_-]?\d*", "", name)
    name = re.sub(r"^\d+\s*[-_]+\s*", "", name)
    name = name.replace("Inlays", "").replace("inlay", "")
    name = name.replace("Catalogue", "Catalog")
    name = re.sub(r"\s+", " ", name)
    return name.strip(" -")


def page_groups(source, start, end, size=1):
    pages = list(range(start, end + 1))
    if len(pages) % size:
        raise ValueError(f"Pages {start}-{end} cannot be grouped in sets of {size}")
    return [
        [(source, page) for page in pages[index:index + size]]
        for index in range(0, len(pages), size)
    ]


def numbered_codes(prefix, count, start=1, width=2):
    return [f"{prefix}-{number:0{width}d}" for number in range(start, start + count)]


def paired_codes(prefix, pairs):
    return [f"{prefix}-{number}{letter}" for number in range(1, pairs + 1) for letter in ("A", "B")]


BRIDGERTON_DETAIL = "elaf-bridgerton-prints-catalog"
BRIDGERTON_LOOKBOOK = "elaf-bridgerton-lookbook-26"
BRIDGERTON_GROUPS = []
for product_index, detail_start in enumerate(range(3, 51, 3), start=1):
    BRIDGERTON_GROUPS.append(
        [(BRIDGERTON_LOOKBOOK, product_index)]
        + [(BRIDGERTON_DETAIL, page) for page in range(detail_start, detail_start + 3)]
    )


COLLECTION_SPECS = [
    {
        "source": BRIDGERTON_DETAIL,
        "name": "Elaf Bridgerton Prints '26",
        "brand": "Elaf",
        "category": "Original Lawns",
        "groups": BRIDGERTON_GROUPS,
        "codes": paired_codes("EPB", 8),
    },
    {
        "source": "elaf-luxury-vol-ii-26-digital-catalog",
        "name": "Elaf Luxury Lawn Vol. II '26",
        "brand": "Elaf",
        "category": "Luxury Lawns",
        "groups": page_groups("elaf-luxury-vol-ii-26-digital-catalog", 3, 58, 4),
        "codes": paired_codes("ELQ", 7),
    },
    {
        "source": "belle-saison-by-esmel",
        "name": "Belle Saison by Esmel",
        "brand": "Esmel",
        "category": "Luxury Lawns",
        "groups": page_groups("belle-saison-by-esmel", 1, 12),
        "codes": numbered_codes("ESM", 12),
    },
    {
        "source": "bliss-lawn",
        "name": "Bliss Lawn",
        "brand": "Other Brands",
        "category": "Original Lawns",
        "groups": page_groups("bliss-lawn", 1, 9),
        "codes": [str(code) for code in range(20867, 20876)],
    },
    {
        "source": "daria-plush-catalog",
        "name": "Daria Plush Lawn '26",
        "brand": "Daria",
        "category": "Original Lawns",
        "groups": page_groups("daria-plush-catalog", 2, 13),
        "codes": [f"DA-{code}" for code in range(96, 108)],
    },
    {
        "source": "charizma-signature-lawn-unstitched-collection-vol-01-1",
        "name": "Charizma Signature Lawn Vol. 1",
        "brand": "Charizma",
        "category": "Luxury Lawns",
        "groups": page_groups("charizma-signature-lawn-unstitched-collection-vol-01-1", 1, 9),
        "codes": numbered_codes("CS6", 9),
    },
    {
        "source": "noors-lehr-luxury-chiffon-2025",
        "name": "Noors Lehr Luxury Chiffon 2025",
        "brand": "Noors Lehr",
        "category": "Party Wears",
        "groups": page_groups("noors-lehr-luxury-chiffon-2025", 1, 20, 2),
        "codes": numbered_codes("NL", 10),
    },
    {
        "source": "ramsha-dastan-vol-03",
        "name": "Ramsha Dastan Vol. 3",
        "brand": "Ramsha",
        "category": "Luxury Lawns",
        "groups": page_groups("ramsha-dastan-vol-03", 1, 6),
        "codes": numbered_codes("DAS", 6),
    },
    {
        "source": "ramsha-riwayat-luxury-lawn-vol-15",
        "name": "Ramsha Riwayat Luxury Lawn Vol. 15",
        "brand": "Ramsha",
        "category": "Luxury Lawns",
        "groups": page_groups("ramsha-riwayat-luxury-lawn-vol-15", 1, 8),
        "codes": [f"Y-{code}" for code in range(1501, 1509)],
    },
    {
        "source": "kahf-aangan-catalog",
        "name": "Kahf Aangan '26",
        "brand": "Kahf",
        "category": "Luxury Lawns",
        "groups": page_groups("kahf-aangan-catalog", 3, 66, 4),
        "codes": paired_codes("KPS", 8),
    },
    {
        "source": "kohinoor-by-iraar",
        "name": "Kohinoor by Iraar",
        "brand": "Iraar",
        "category": "Luxury Lawns",
        "groups": page_groups("kohinoor-by-iraar", 1, 8),
        "codes": numbered_codes("KOH", 8),
    },
    {
        "source": "mausummery-emb-vol-1",
        "name": "Mausummery Embroidered Vol. 1",
        "brand": "Mausummery",
        "category": "Luxury Lawns",
        "groups": page_groups("mausummery-emb-vol-1", 1, 11),
        "codes": numbered_codes("MEV", 11),
        "names": ["Citrine", "Peony", "Garnet", "Amethyst", "Daisy", "Iris", "Jade", "Emerald", "Freesia", "Orchid", "Onyx"],
    },
    {
        "source": "nureh-gardenia-emb-printed-collection",
        "name": "Nureh Gardenia",
        "brand": "Nureh",
        "category": "Luxury Lawns",
        "groups": page_groups("nureh-gardenia-emb-printed-collection", 2, 37, 4),
        "codes": [f"NSG-{code}" for code in range(197, 206)],
    },
    {
        "source": "shezlin-eid-edit-26",
        "name": "Shezlin Eid Edit '26",
        "brand": "Shezlin",
        "category": "Party Wears",
        "groups": page_groups("shezlin-eid-edit-26", 1, 13),
        "codes": numbered_codes("SEE", 13),
        "names": ["Zarminah", "Elara", "Reem", "Mehrzaad", "Sereen", "Naqsh", "Liyana", "Faryal", "Zehraaye", "Aura", "Zarqa", "Mehreen", "Raaheen"],
    },
    {
        "source": "soleil-by-hemline",
        "name": "Soleil by Hemline",
        "brand": "Hemline",
        "category": "Original Lawns",
        "groups": page_groups("soleil-by-hemline", 1, 12),
        "codes": numbered_codes("SOL", 12),
        "names": ["Elora", "Serene Bloom", "Moonlit Lace", "Pearl Sonata", "Eden Whisper", "Vanilla Lush", "Camelia Kiss", "Lilac Whim", "Silver Bloom", "Flora Amour", "Ivory Creme", "Honey Petal"],
    },
    {
        "source": "zaha-festive-lawn-26",
        "name": "Zaha Wildflower Lawn '26",
        "brand": "Zaha",
        "category": "Party Wears",
        "groups": page_groups("zaha-festive-lawn-26", 1, 12),
        "codes": numbered_codes("ZFL", 12),
        "names": ["Himalayan Bell Mist", "Blue Poppy", "Peony Reverie", "Midnight Bloom", "Pink Mink Frolic", "Dahlia", "Ghost Orchid Whisper", "Queen of the Andes", "Apricot Mallow Bloom", "Forget Me Not Breeze", "Periwinkle Muse", "Jade Vine Reverie"],
    },
    {
        "source": "veil-of-summer-by-roheenaz",
        "name": "Veil of Summer by Roheenaz",
        "brand": "Roheenaz",
        "category": "Original Lawns",
        "groups": page_groups("veil-of-summer-by-roheenaz", 1, 10),
        "codes": numbered_codes("VSR", 10),
        "names": ["Soleil Blanc", "Lumiere Yellow", "Azure Elan", "Black Lace", "Blanc Mirage", "Aurora Light", "Serene Dusk", "Elan Bloom", "Whispered Veil", "Petal Royale"],
    },
]


def doc_for(path):
    url = NSURL.fileURLWithPath_(str(path.resolve()))
    return Quartz.CGPDFDocumentCreateWithURL(url)


def page_count(path):
    doc = doc_for(path)
    return Quartz.CGPDFDocumentGetNumberOfPages(doc) if doc else 0


def render_page(path, page_index, out_path, max_width=720):
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
        {Quartz.kCGImageDestinationLossyCompressionQuality: 0.8},
    )
    Quartz.CGImageDestinationFinalize(destination)

    # Quartz renders these catalog PDFs upside down and mirrored in a raw bitmap context.
    with Image.open(out_path) as rendered:
        ImageOps.mirror(rendered.rotate(180)).save(out_path, quality=80, optimize=True)


def image_path(source, page):
    return f"assets/products/{source}-p{page}.jpg"


def build_catalog():
    pdfs = {slugify(clean_title(pdf)): pdf for pdf in sorted(PDF_DIR.glob("*.pdf"))}
    required_sources = {source for spec in COLLECTION_SPECS for group in spec["groups"] for source, _ in group}
    missing_sources = sorted(required_sources - pdfs.keys())
    if missing_sources:
        raise RuntimeError(f"Missing source PDFs: {', '.join(missing_sources)}")

    collections = []
    products = []
    required_pages = {}

    for collection_index, spec in enumerate(COLLECTION_SPECS, start=1):
        groups = spec["groups"]
        codes = spec["codes"]
        names = spec.get("names")
        if len(groups) != len(codes) or (names and len(groups) != len(names)):
            raise ValueError(f"Product metadata count mismatch for {spec['name']}")

        collection_slug = slugify(spec["name"])
        collection_products = []
        for product_index, group in enumerate(groups, start=1):
            code = codes[product_index - 1]
            name = names[product_index - 1] if names else f"Design {product_index:02d}"
            images = [image_path(source, page) for source, page in group]
            for source, page in group:
                required_pages.setdefault(source, set()).add(page)

            product = {
                "id": code,
                "slug": f"{collection_slug}-{slugify(code)}",
                "name": name,
                "collectionSlug": collection_slug,
                "collectionName": spec["name"],
                "brand": spec["brand"],
                "category": spec["category"],
                "fabricType": "Unstitched",
                "price": 0,
                "priceLabel": "Contact for price",
                "stock": 1,
                "images": images,
                "description": f"{name} from {spec['name']}.",
                "sequence": product_index,
            }
            collection_products.append(product)
            products.append(product)

        collections.append({
            "id": f"COL-{collection_index:03d}",
            "slug": collection_slug,
            "name": spec["name"],
            "brand": spec["brand"],
            "category": spec["category"],
            "fabricType": "Unstitched",
            "coverImage": collection_products[0]["images"][0],
            "productCount": len(collection_products),
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for source, pages in sorted(required_pages.items()):
        pdf = pdfs[source]
        count = page_count(pdf)
        for page in sorted(pages):
            if page < 1 or page > count:
                raise ValueError(f"Page {page} is outside {source} ({count} pages)")
            out_path = OUT_DIR / f"{source}-p{page}.jpg"
            render_page(pdf, page - 1, out_path)
        print(f"Rendered {source}: {len(pages)} product pages")

    collections.sort(key=lambda item: item["name"].lower())
    catalog = {"collections": collections, "products": products}
    DATA_FILE.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    JS_FILE.write_text(
        "window.SARA_COLLECTIONS = "
        + json.dumps(collections, indent=2)
        + ";\nwindow.SARA_PRODUCTS = (window.SARA_PRODUCTS || []).concat("
        + json.dumps(products, indent=2)
        + ");\n",
        encoding="utf-8",
    )
    print(f"Generated {len(collections)} collections and {len(products)} products")
    print(f"Generated browser data in {JS_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    build_catalog()
