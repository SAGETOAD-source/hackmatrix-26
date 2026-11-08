"""
ThreatLens ML Service – Feature Extraction Module.

Extracts purely static, lexical and syntactic features from URLs.
Strictly non-intrusive: does NOT visit, fetch, or perform network requests to target URLs.

Provides:
- FEATURE_NAMES: Canonical ordered list of feature names.
- extract_features_dict(url: str) -> dict[str, float | int]: Named feature map.
- extract_features_vector(url: str) -> np.ndarray: 1D array matching FEATURE_NAMES.
"""

import ipaddress
import math
import re
from urllib.parse import urlparse
import numpy as np

# Canonical feature names in exact column order used for training and inference
FEATURE_NAMES = [
    "url_length",
    "domain_length",
    "num_dots",
    "num_hyphens",
    "num_subdomains",
    "num_digits",
    "num_special_chars",
    "has_ip_address",
    "is_https",
    "suspicious_keyword_count",
    "has_at_symbol",
    "is_shortened",
    "num_path_segments",
    "query_param_count",
    "suspicious_tld",
    "domain_entropy",
    "has_punycode",
]

# Common URL shortener domains
SHORTENER_DOMAINS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "cutt.ly",
    "tiny.cc",
    "rebrand.ly",
    "bl.ink",
    "shorturl.at",
    "rb.gy",
    "soo.gd",
    "s2r.co",
    "v.gd",
    "t.ly",
    "linktr.ee",
    "shorte.st",
}

# High-risk security/credential keywords commonly leveraged in phishing campaigns
SUSPICIOUS_KEYWORDS = [
    "login",
    "signin",
    "verify",
    "verification",
    "secure",
    "security",
    "account",
    "update",
    "banking",
    "authenticate",
    "confirm",
    "password",
    "wallet",
    "support",
    "billing",
    "recover",
    "ebayisapi",
    "webscr",
    "auth",
    "credential",
    "suspend",
    "admin",
    "payment",
    "service",
    "client",
    "validate",
    "unlock",
    "paypal",
    "microsoft",
    "apple",
    "google",
    "netflix",
]

# High-abuse Top-Level Domains (TLDs) frequently observed in malicious campaigns (Spamhaus / APWG)
SUSPICIOUS_TLDS = {
    "top",
    "xyz",
    "work",
    "click",
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "loan",
    "fit",
    "country",
    "buzz",
    "club",
    "cam",
    "live",
    "link",
    "surf",
    "icu",
    "monster",
    "rest",
    "kim",
    "gdn",
    "mom",
    "bar",
}

# Regex to detect raw IPv4 in domain
IPV4_REGEX = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    text_lower = text.lower()
    length = len(text_lower)
    counts = {}
    for char in text_lower:
        counts[char] = counts.get(char, 0) + 1
    entropy = 0.0
    for count in counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def is_ip_address(domain: str) -> int:
    """Check if domain or host is an IPv4 or IPv6 address."""
    clean_domain = domain.split(":")[0].strip("[]")
    if IPV4_REGEX.match(clean_domain):
        parts = clean_domain.split(".")
        if all(0 <= int(p) <= 255 for p in parts if p.isdigit()):
            return 1
    try:
        ipaddress.ip_address(clean_domain)
        return 1
    except ValueError:
        return 0


def extract_features_dict(url: str) -> dict[str, float | int]:
    """
    Extract a dictionary of static URL features without visiting the URL.
    Handles malformed or protocol-less input gracefully.
    """
    if not isinstance(url, str) or not url.strip():
        # Return zeros for empty/invalid input
        return {name: 0.0 for name in FEATURE_NAMES}

    url_str = url.strip()

    # Prepend scheme if missing so urllib can parse netloc
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url_str):
        parseable_url = "http://" + url_str
    else:
        parseable_url = url_str

    try:
        parsed = urlparse(parseable_url)
    except Exception:
        return {name: 0.0 for name in FEATURE_NAMES}

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    # Strip port if present
    domain = netloc.split(":")[0]
    path = parsed.path
    query = parsed.query

    # 1. URL Length
    url_length = len(url_str)

    # 2. Domain Length
    domain_length = len(domain)

    # 3. Number of dots (in entire URL)
    num_dots = url_str.count(".")

    # 4. Number of hyphens (in entire URL)
    num_hyphens = url_str.count("-")

    # 5. Number of subdomains
    # Split domain by dot: domain.tld = 0 subdomains; sub.domain.tld = 1 subdomain; www.sub.domain.tld = 2
    domain_parts = [p for p in domain.split(".") if p]
    if len(domain_parts) > 2:
        num_subdomains = len(domain_parts) - 2
    else:
        num_subdomains = 0

    # 6. Number of digits (in entire URL)
    num_digits = sum(1 for c in url_str if c.isdigit())

    # 7. Number of special characters (excluding dot and hyphen, which are counted separately)
    special_chars = set("!#$&'()*+,/:;=?@[]~%_")
    num_special_chars = sum(1 for c in url_str if c in special_chars)

    # 8. Presence of IP address
    has_ip = is_ip_address(domain)

    # 9. HTTPS Indicator
    is_https = 1 if scheme == "https" else 0

    # 10. Suspicious keyword count (in entire URL)
    url_lower = url_str.lower()
    suspicious_keyword_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    # 11. Presence of @ symbol
    has_at_symbol = 1 if "@" in url_str else 0

    # 12. URL Shortener indicator
    is_shortened = 1 if domain in SHORTENER_DOMAINS else 0

    # 13. Number of URL path segments
    path_segments = [p for p in path.split("/") if p]
    num_path_segments = len(path_segments)

    # 14. Query parameter count
    if query:
        query_params = [q for q in query.split("&") if q]
        query_param_count = len(query_params)
    else:
        query_param_count = 0

    # 15. Suspicious TLD indicator
    tld = domain_parts[-1] if domain_parts else ""
    suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

    # 16. Domain Shannon entropy
    domain_entropy = calculate_entropy(domain)

    # 17. Punycode indicator (IDN homograph attack, e.g. xn--)
    has_punycode = 1 if "xn--" in domain else 0

    return {
        "url_length": url_length,
        "domain_length": domain_length,
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_subdomains": num_subdomains,
        "num_digits": num_digits,
        "num_special_chars": num_special_chars,
        "has_ip_address": has_ip,
        "is_https": is_https,
        "suspicious_keyword_count": suspicious_keyword_count,
        "has_at_symbol": has_at_symbol,
        "is_shortened": is_shortened,
        "num_path_segments": num_path_segments,
        "query_param_count": query_param_count,
        "suspicious_tld": suspicious_tld,
        "domain_entropy": domain_entropy,
        "has_punycode": has_punycode,
    }


def extract_features_vector(url: str) -> np.ndarray:
    """
    Extract features as a 1D numpy array matching FEATURE_NAMES order.
    """
    features_dict = extract_features_dict(url)
    return np.array([features_dict[name] for name in FEATURE_NAMES], dtype=np.float64)


if __name__ == "__main__":
    # Smoke test with sample inputs
    test_urls = [
        "https://www.google.com",
        "http://paypal-security-verification.update.com.tk/login/auth.php?session=98213",
        "http://192.168.1.100/admin/login",
        "https://bit.ly/3xyzSecure",
        "http://user@target.com:password@phish.xyz/signin",
    ]
    for u in test_urls:
        feats = extract_features_dict(u)
        print(f"\nURL: {u}")
        for k, v in feats.items():
            print(f"  {k}: {v}")

