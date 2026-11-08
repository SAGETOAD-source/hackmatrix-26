"""
ThreatLens ML Service – Dataset Acquisition and Preparation Script.

Acquires verified public phishing URLs and legitimate URLs from reputable,
publicly licensed feeds:
1. Phishing sources:
   - OpenPhish Community Feed (https://openphish.com/feed.txt)
   - Mitchell Krog Phishing.Database (MIT License, https://github.com/mitchellkrogza/Phishing.Database)
2. Legitimate sources:
   - Tranco List Top Sites (Academic research top 1M ranking, https://tranco-list.eu/)
   - CISA Official .gov Domain List (Public Domain, US CISA, https://github.com/cisagov/dotgov-data)

Normalizes URLs, deduplicates, verifies labels (0 = LEGITIMATE, 1 = PHISHING),
and saves to ml-service/data/dataset.csv.
"""

import io
import os
import re
import sys
import zipfile
import urllib.request
import pandas as pd
from urllib.parse import urlparse

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(DATA_DIR, "dataset.csv")

USER_AGENT = "Mozilla/5.0 (ThreatLens-Phishing-Research; ML-Dataset-Collector/1.0)"


def fetch_url_lines(url: str, timeout: int = 15) -> list[str]:
    """Fetch text lines from a URL."""
    print(f"Fetching: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        content = response.read().decode("utf-8", errors="ignore")
    lines = [line.strip() for line in content.splitlines() if line.strip() and not line.startswith("#")]
    print(f"  Retrieved {len(lines)} lines from {url}")
    return lines


def normalize_url(raw: str) -> str:
    """Normalize a raw URL: strip whitespace, lower-case scheme & host."""
    raw = raw.strip()
    if not raw:
        return ""
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw):
        raw = "http://" + raw
    try:
        parsed = urlparse(raw)
        scheme = parsed.scheme.lower()
        if scheme not in ("http", "https"):
            return ""
        netloc = parsed.netloc.lower()
        if not netloc:
            return ""
        path = parsed.path or "/"
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{scheme}://{netloc}{path}{query}"
    except Exception:
        return ""


def download_phishing_urls(target_count: int = 10000) -> list[str]:
    """Acquire verified phishing URLs from OpenPhish and Mitchell Krog database."""
    urls = []

    # 1. OpenPhish community feed
    try:
        openphish_lines = fetch_url_lines("https://openphish.com/feed.txt", timeout=15)
        for line in openphish_lines:
            norm = normalize_url(line)
            if norm:
                urls.append(norm)
    except Exception as e:
        print(f"Warning: OpenPhish fetch failed: {e}")

    # 2. Mitchell Krog active phishing database
    try:
        krog_lines = fetch_url_lines(
            "https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-ACTIVE.txt",
            timeout=25
        )
        for line in krog_lines:
            norm = normalize_url(line)
            if norm:
                urls.append(norm)
            if len(urls) >= target_count * 2:
                break
    except Exception as e:
        print(f"Warning: Mitchell Krog fetch failed: {e}")

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            deduped.append(u)

    print(f"Total unique phishing URLs acquired: {len(deduped)}")
    return deduped[:target_count]


def download_legitimate_urls(target_count: int = 10000) -> list[str]:
    """Acquire legitimate URLs from Tranco top sites and CISA .gov list."""
    urls = []

    # 1. Tranco Top 1M list (standard academic list of popular sites)
    try:
        print("Fetching Tranco top-1m list zip...")
        req = urllib.request.Request("https://tranco-list.eu/top-1m.csv.zip", headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=25) as response:
            zip_bytes = io.BytesIO(response.read())
        with zipfile.ZipFile(zip_bytes) as z:
            # First file inside is the CSV
            csv_name = z.namelist()[0]
            with z.open(csv_name) as f:
                lines = f.read().decode("utf-8", errors="ignore").splitlines()
        print(f"  Loaded {len(lines)} domains from Tranco")

        for line in lines[: target_count * 2]:
            parts = line.strip().split(",")
            if len(parts) >= 2:
                domain = parts[1].strip()
            else:
                domain = parts[0].strip()

            if domain and "." in domain and not domain.isdigit():
                # Legitimate sites predominantly support HTTPS; include http variations
                scheme = "https" if len(urls) % 5 != 0 else "http"
                norm = normalize_url(f"{scheme}://{domain}/")
                if norm:
                    urls.append(norm)
            if len(urls) >= target_count:
                break
    except Exception as e:
        print(f"Warning: Tranco fetch failed: {e}")

    # 2. CISA Official .gov list as an additional authoritative legitimate source
    try:
        gov_lines = fetch_url_lines(
            "https://raw.githubusercontent.com/cisagov/dotgov-data/main/current-full.csv",
            timeout=15
        )
        for line in gov_lines[1:]:  # skip header
            parts = line.split(",")
            if parts:
                dom = parts[0].strip().replace('"', "")
                if dom and "." in dom:
                    norm = normalize_url(f"https://{dom}/")
                    if norm:
                        urls.append(norm)
    except Exception as e:
        print(f"Warning: CISA .gov fetch failed: {e}")

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            deduped.append(u)

    print(f"Total unique legitimate URLs acquired: {len(deduped)}")
    return deduped[:target_count]


def build_dataset(samples_per_class: int = 10000):
    print("=" * 60)
    print("ThreatLens ML Dataset Builder")
    print("=" * 60)

    phishing_urls = download_phishing_urls(target_count=samples_per_class)
    legitimate_urls = download_legitimate_urls(target_count=samples_per_class)

    # Balance counts if one side is smaller
    min_count = min(len(phishing_urls), len(legitimate_urls))
    if min_count < 1000:
        raise RuntimeError(f"Insufficient samples collected ({min_count} per class). Check network connection.")

    print(f"\nBalancing dataset to {min_count} samples per class (total: {min_count * 2})...")
    phishing_subset = phishing_urls[:min_count]
    legitimate_subset = legitimate_urls[:min_count]

    data = []
    for u in legitimate_subset:
        data.append({"url": u, "label": 0})
    for u in phishing_subset:
        data.append({"url": u, "label": 1})

    df = pd.DataFrame(data)

    # Random shuffle with fixed seed
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Clean duplicates across both classes (prevent data leakage / conflicting labels)
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["url"]).reset_index(drop=True)
    print(f"Removed {before_dedup - len(df)} duplicate URL records.")

    # Save to CSV
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\nDataset successfully created at: {OUTPUT_FILE}")
    print(f"Total samples: {len(df)}")
    print(f"Class distribution:\n{df['label'].value_counts().to_string()}")
    print("=" * 60)


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
    build_dataset(samples_per_class=count)

