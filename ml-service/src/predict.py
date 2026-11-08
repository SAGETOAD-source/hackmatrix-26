import json
import math
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import HashingVectorizer

from feature_extraction import features_dataframe, normalize_url

MODELS = Path(__file__).resolve().parent.parent / "models"
MAX_URL_LEN = 2048
MODEL_NAME = "ensemble_rf_ngram_v1"
CAP_TOP_N = 1000  # D11: top-ranked non-hosting domains can never reach 'likely_phishing'

HOSTING = ["docs.google.com", "drive.google.com", "sites.google.com", "storage.googleapis.com",
           "firebaseapp.com", "web.app", "github.io", "pages.dev", "ipfs.io", "cloudflare-ipfs.com",
           "000webhostapp.com", "blogspot.com", "wixsite.com", "weebly.com", "herokuapp.com",
           "netlify.app", "vercel.app", "fleek.co", "pinata.cloud", "workers.dev", "glitch.me",
           "onrender.com", "sharepoint.com", "forms.gle", "wordpress.com", "mybluehost.me"]

_state = {}


def _load():
    if not _state:
        bundle = joblib.load(MODELS / "ensemble.joblib")
        meta = json.loads((MODELS / "ensemble_meta.json").read_text())
        _state["bundle"] = bundle
        _state["hv"] = HashingVectorizer(**bundle["hv_params"])
        _state["t_suspicious"] = meta["thresholds"]["f1"]
        _state["t_likely"] = meta["thresholds"]["p90"]
    return _state


def host_of(url):
    u = normalize_url(url).lower()
    for ch in "/?#":
        u = u.split(ch)[0]
    return u.split("@")[-1].split(":")[0]


def is_hosting(host):
    return any(host == d or host.endswith("." + d) for d in HOSTING)


def _reasons(f):
    r = []
    if f["is_ip_host"]:
        r.append("Uses a raw IP address instead of a domain name")
    if f["suspicious_tld"]:
        r.append("Uses a top-level domain often abused for scams")
    if f["is_shortener"]:
        r.append("Link shortener hides the real destination")
    if f["has_punycode"]:
        r.append("Contains punycode (possible look-alike characters)")
    if f["has_at"]:
        r.append("Contains '@', which can disguise the real host")
    if f["hyphens_host"] >= 3:
        r.append("Many hyphens in the domain name")
    if f["n_subdomains"] >= 3:
        r.append("Unusually many subdomains")
    if f["kw_in_host"] >= 2:
        r.append("Domain name stuffed with sensitive words (login, secure, account, ...)")
    elif f["kw_count"] >= 2:
        r.append("URL contains several credential or payment related words")
    if f["entropy_host"] > 3.8 and f["host_len"] > 20:
        r.append("Domain name looks randomly generated")
    if not f["in_top_1m"]:
        r.append("Domain is not among the 1 million most visited sites")
    return r[:5]


def score_url(url):
    if not isinstance(url, str) or not url.strip():
        raise ValueError("url must be a non-empty string")
    url = url.strip()
    if len(url) > MAX_URL_LEN:
        raise ValueError(f"url is longer than {MAX_URL_LEN} characters")
    st = _load()
    b = st["bundle"]
    f = features_dataframe([url])
    p_rf = float(b["rf"].predict_proba(f)[:, 1][0])
    p_ng = float(b["ngram"].predict_proba(st["hv"].transform([normalize_url(url).lower()]))[:, 1][0])
    w = b["weight_rf"]
    score = w * p_rf + (1 - w) * p_ng
    row = f.iloc[0]
    capped = bool(row["rank_log"] <= math.log10(CAP_TOP_N)) and not is_hosting(host_of(url))
    if score >= st["t_likely"]:
        tier = "suspicious" if capped else "likely_phishing"
    elif score >= st["t_suspicious"]:
        tier = "suspicious"
    else:
        tier = "low_risk"
    flagged = score >= st["t_suspicious"]
    return {
        "url": url,
        "tier": tier,
        "risk_score": round(score, 4),
        "ml_prediction": "PHISHING" if flagged else "LEGITIMATE",
        "ml_confidence": round(score if flagged else 1.0 - score, 4),
        "model": MODEL_NAME,
        "reputation_capped": bool(capped and score >= st["t_likely"]),
        "domain_in_top_1m": bool(row["in_top_1m"]),
        "reasons": _reasons(row) if tier != "low_risk" else [],
    }

