import math
import re
from collections import Counter

import pandas as pd
import tldextract

_tld = tldextract.TLDExtract(suffix_list_urls=())  # bundled list, no network

SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.\-]*://")
IP_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
KEYWORDS = ["login", "signin", "verify", "secure", "account", "update", "confirm",
            "password", "bank", "paypal", "webscr", "wallet", "invoice", "support"]
SUSPICIOUS_TLDS = {"xyz", "top", "tk", "ml", "ga", "cf", "gq", "icu", "ws", "cc",
                   "click", "work", "zip", "mov", "buzz", "rest", "monster"}
SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
              "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at"}


def normalize_url(url) -> str:
    """Decision D3: drop scheme and leading www. so they can't be shortcuts."""
    u = str(url).strip()
    u = SCHEME_RE.sub("", u)
    if u.lower().startswith("www."):
        u = u[4:]
    return u


def _entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    n = len(s)
    return -sum((c / n) * math.log2(c / n) for c in counts.values())


def registered_domain(url) -> str:
    """Used to split train/test by domain (no domain in both sets)."""
    host = _split(normalize_url(url))[0]
    ext = _tld(host)
    return f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain


def _split(u: str):
    m = re.search(r"[/?#]", u)
    hostport, rest = (u[:m.start()], u[m.start():]) if m else (u, "")
    if "@" in hostport:
        hostport = hostport.rsplit("@", 1)[1]
    host = hostport.split(":")[0].lower()
    has_port = ":" in hostport
    path, _, query = rest.partition("?")
    query = query.split("#")[0]
    return host, has_port, path, query


def extract_features(url) -> dict:
    u = normalize_url(url)
    low = u.lower()
    host, has_port, path, query = _split(u)
    ext = _tld(host)
    n = max(len(u), 1)
    digits = sum(c.isdigit() for c in u)
    letters = sum(c.isalpha() for c in u)
    sub = ext.subdomain
    domain_full = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain

    return {
        "url_len": len(u),
        "host_len": len(host),
        "path_len": len(path),
        "query_len": len(query),
        "domain_len": len(ext.domain),
        "tld_len": len(ext.suffix),
        "n_subdomains": len(sub.split(".")) if sub else 0,
        "dots_host": host.count("."),
        "hyphens_host": host.count("-"),
        "hyphens_url": u.count("-"),
        "underscores": u.count("_"),
        "digits_host": sum(c.isdigit() for c in host),
        "digit_ratio": digits / n,
        "letter_ratio": letters / n,
        "special_ratio": (n - digits - letters) / n,
        "path_depth": path.count("/"),
        "n_params": (query.count("&") + 1) if query else 0,
        "n_equals": u.count("="),
        "n_percent": u.count("%"),
        "has_at": int("@" in u),
        "has_port": int(has_port),
        "is_ip_host": int(bool(IP_RE.match(host))),
        "has_punycode": int("xn--" in host),
        "suspicious_tld": int(ext.suffix.split(".")[-1] in SUSPICIOUS_TLDS),
        "is_shortener": int(domain_full in SHORTENERS),
        "kw_count": sum(k in low for k in KEYWORDS),
        "kw_in_host": sum(k in host for k in KEYWORDS),
        "entropy_url": _entropy(low),
        "entropy_host": _entropy(host),
    }


FEATURE_NAMES = list(extract_features("example.com").keys())


def features_dataframe(urls) -> pd.DataFrame:
    rows = [extract_features(u) for u in urls]
    return pd.DataFrame(rows, columns=FEATURE_NAMES).astype(float)