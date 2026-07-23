import os
import re
import json
import urllib.request
import urllib.parse
import urllib.error
import time
from html.parser import HTMLParser

# Target website
BASE_URL = "https://www.rohinipharma.com/"
SITEMAP_INDEX_URL = f"{BASE_URL}wp-sitemap.xml"

# Headers to avoid getting blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Output directories
OUTPUT_DIR = "downloaded_site"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
PAGES_DIR = os.path.join(OUTPUT_DIR, "pages")
POSTS_DIR = os.path.join(OUTPUT_DIR, "posts")
PRODUCTS_DIR = os.path.join(OUTPUT_DIR, "products")

# Ensure directories exist
for folder in [OUTPUT_DIR, IMAGES_DIR, PAGES_DIR, POSTS_DIR, PRODUCTS_DIR]:
    os.makedirs(folder, exist_ok=True)

# Helper to fetch URL content with headers
def fetch_url(url, is_binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# Parse XML sitemaps to find <loc> URLs
def parse_sitemap(sitemap_url):
    content = fetch_url(sitemap_url)
    if not content:
        return []
    try:
        text = content.decode('utf-8', errors='ignore')
        return re.findall(r'<loc>(.*?)</loc>', text)
    except Exception as e:
        print(f"Error parsing sitemap {sitemap_url}: {e}")
        return []

# Simple HTML to Markdown and Image Extractor
class ContentExtractor(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.markdown = []
        self.images = set()
        self.current_tag = None
        self.title = ""
        self.in_title = False
        self.in_body = False
        self.list_depth = 0
        self.links = set()

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attrs_dict = dict(attrs)

        if tag == 'title':
            self.in_title = True
        elif tag == 'body':
            self.in_body = True

        # Extract images
        if tag == 'img':
            src = attrs_dict.get('src') or attrs_dict.get('data-src') or attrs_dict.get('data-lazy-src')
            if src:
                full_src = urllib.parse.urljoin(self.base_url, src)
                self.images.add(full_src)
                alt = attrs_dict.get('alt', '')
                self.markdown.append(f"\n![{alt}]({full_src})\n")

        # Headings
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.markdown.append(f"\n{'#' * level} ")

        # Paragraphs & divs
        elif tag in ['p', 'br']:
            self.markdown.append("\n")

        # Lists
        elif tag in ['ul', 'ol']:
            self.list_depth += 1
            self.markdown.append("\n")
        elif tag == 'li':
            self.markdown.append("  " * (self.list_depth - 1) + "- ")

        # Links
        elif tag == 'a':
            href = attrs_dict.get('href')
            if href:
                full_href = urllib.parse.urljoin(self.base_url, href)
                self.links.add(full_href)
                self.markdown.append("[")

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag in ['ul', 'ol']:
            self.list_depth = max(0, self.list_depth - 1)
            self.markdown.append("\n")
        elif tag == 'a':
            # We would append the URL, but we need text data in between.
            # So we close link in handle_data or close it here.
            # To handle it simply, we close with a placeholder if not handled.
            self.markdown.append("]")
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']:
            self.markdown.append("\n")

    def handle_data(self, data):
        data_clean = data.strip()
        if not data_clean:
            return

        if self.in_title:
            self.title = data_clean

        # Filter out scripts, styles, etc.
        if self.current_tag in ['script', 'style', 'head', 'meta', 'link']:
            return

        # Append text content
        if self.markdown and self.markdown[-1] == "[":
            # We are inside an anchor tag
            self.markdown.append(f"{data_clean}](LINK_PLACEHOLDER)")
        else:
            self.markdown.append(data_clean + " ")

# Download image file and save locally
def download_image(img_url):
    # Ignore data URIs
    if img_url.startswith('data:'):
        return None
    
    parsed = urllib.parse.urlparse(img_url)
    filename = os.path.basename(parsed.path)
    if not filename:
        return None
        
    # Clean filename
    filename = re.sub(r'[^\w\.-]', '_', filename)
    if not filename:
        return None
        
    local_path = os.path.join(IMAGES_DIR, filename)
    
    # Avoid duplicate downloads
    if os.path.exists(local_path):
        return os.path.relpath(local_path, OUTPUT_DIR)
        
    print(f"Downloading image: {img_url} -> {local_path}")
    content = fetch_url(img_url)
    if content:
        try:
            with open(local_path, 'wb') as f:
                f.write(content)
            return os.path.relpath(local_path, OUTPUT_DIR)
        except Exception as e:
            print(f"Error saving image {filename}: {e}")
    return None

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", name)[:100]

def process_url(url, category_dir):
    print(f"\nProcessing: {url}")
    html_content = fetch_url(url)
    if not html_content:
        return None

    try:
        html_str = html_content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Encoding error for {url}: {e}")
        return None

    parser = ContentExtractor(BASE_URL)
    try:
        parser.feed(html_str)
    except Exception as e:
        print(f"HTML parsing error for {url}: {e}")
        # Continue with whatever was parsed

    # Clean markdown
    md_text = "".join(parser.markdown)
    # Fix the LINK_PLACEHOLDER
    # Simple search and replace for parsed anchor links
    # For a robust approach, we just clean up leftover placeholders
    md_text = md_text.replace("](LINK_PLACEHOLDER)", ")")

    title = parser.title or url.rstrip('/').split('/')[-1] or "index"
    filename = sanitize_filename(title) + ".md"
    file_path = os.path.join(category_dir, filename)

    # Localize image paths in Markdown and download images
    local_images = []
    for img_url in parser.images:
        local_img_path = download_image(img_url)
        if local_img_path:
            local_images.append(local_img_path)
            # Replace absolute url with relative local path in markdown
            # Format: ![alt](url) -> ![alt](../images/filename)
            rel_img_path = os.path.relpath(local_img_path, os.path.dirname(file_path)).replace("\\", "/")
            md_text = md_text.replace(img_url, rel_img_path)

    # Write Markdown file
    metadata = f"---\ntitle: {title}\nsource_url: {url}\ndownloaded_at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n---\n\n"
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(metadata + md_text)
        print(f"Saved page: {file_path}")
    except Exception as e:
        print(f"Error saving page {file_path}: {e}")

    return {
        "title": title,
        "url": url,
        "local_file": os.path.relpath(file_path, OUTPUT_DIR),
        "images": local_images
    }

def main():
    print("=== Start Crawling Rohini Pharma website ===")
    
    # 1. Fetch Sitemap Index
    sitemaps = parse_sitemap(SITEMAP_INDEX_URL)
    if not sitemaps:
        print("Sitemap index empty or blocked. Crawling home page directly...")
        sitemaps = []

    site_map = {
        "Pages": [],
        "Blog Posts": [],
        "Products": []
    }

    # 2. Extract URLs from relevant sitemaps
    pages_urls = []
    posts_urls = []
    products_urls = []

    for sm in sitemaps:
        if "posts-page" in sm:
            pages_urls.extend(parse_sitemap(sm))
        elif "posts-post" in sm:
            posts_urls.extend(parse_sitemap(sm))
        elif "posts-product" in sm:
            products_urls.extend(parse_sitemap(sm))

    # If sitemaps were blocked, fall back to some core URLs
    if not pages_urls:
        print("Falling back to core URLs...")
        pages_urls = [
            BASE_URL,
            f"{BASE_URL}about-us/",
            f"{BASE_URL}contact-us/",
            f"{BASE_URL}blogs/",
            f"{BASE_URL}shop/"
        ]

    print(f"Found {len(pages_urls)} Pages, {len(posts_urls)} Posts, {len(products_urls)} Products.")
    
    # Limit crawl for testing if needed, or download all.
    # To demonstrate capability, we'll download a couple of pages from each category first.
    # The user can run this script to do a full download.
    
    # 3. Download and process Page contents
    print("\n--- Downloading Pages ---")
    for url in pages_urls:
        res = process_url(url, PAGES_DIR)
        if res:
            site_map["Pages"].append(res)
        time.sleep(1) # Polite delay

    print("\n--- Downloading Blog Posts ---")
    for url in posts_urls:
        res = process_url(url, POSTS_DIR)
        if res:
            site_map["Blog Posts"].append(res)
        time.sleep(0.2)

    print("\n--- Downloading Products ---")
    for url in products_urls:
        res = process_url(url, PRODUCTS_DIR)
        if res:
            site_map["Products"].append(res)
        time.sleep(0.2)

    # Write site structure JSON
    with open(os.path.join(OUTPUT_DIR, "site_structure.json"), "w", encoding="utf-8") as f:
        json.dump(site_map, f, indent=4)
        
    print("\n=== Crawl Complete ===")
    print(f"All downloaded content is structured in the '{OUTPUT_DIR}/' folder.")
    print(f"Images are saved in '{IMAGES_DIR}/'")
    print(f"Site structure index is saved in '{OUTPUT_DIR}/site_structure.json'")

if __name__ == "__main__":
    main()
