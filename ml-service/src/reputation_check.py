import json

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import HashingVectorizer

from feature_extraction import FEATURE_NAMES, normalize_url
from train import DATA, MODELS, group_split

HOSTING = ["docs.google.com", "drive.google.com", "sites.google.com", "storage.googleapis.com",
           "firebaseapp.com", "web.app", "github.io", "pages.dev", "ipfs.io", "cloudflare-ipfs.com",
           "000webhostapp.com", "blogspot.com", "wixsite.com", "weebly.com", "herokuapp.com",
           "netlify.app", "vercel.app", "fleek.co", "pinata.cloud", "workers.dev", "glitch.me",
           "onrender.com", "sharepoint.com", "forms.gle", "wordpress.com", "mybluehost.me"]


def host_of(url):
    u = normalize_url(url).lower()
    for ch in "/?#":
        u = u.split(ch)[0]
    return u.split("@")[-1].split(":")[0]


def is_hosting(host):
    return any(host == d or host.endswith("." + d) for d in HOSTING)


def main():
    df = pd.read_csv(DATA)
    y = df["is_phishing"].values
    rk = 10 ** df["rank_log"].values

    print("A. Rows on top-ranked domains (full data)")
    for n in [1000, 10000, 100000]:
        m = rk <= n
        print(f"  rank<={n}: legit rows {int((m & (y == 0)).sum())}, phishing rows {int((m & (y == 1)).sum())}")

    top = df[(rk <= 10000) & (y == 1)]
    print("\nB. Top-10k domains with the most PHISHING rows:")
    print(top["domain"].value_counts().head(20).to_string())

    dom = df["domain"].fillna("")
    dom = dom.where(dom != "", ("nodomain_" + df.index.astype(str)).values)
    g = dom.astype(str).values
    trval, test_idx = group_split(y, g, 5)

    meta = json.loads((MODELS / "ensemble_meta.json").read_text())
    bundle = joblib.load(MODELS / "ensemble.joblib")
    w = bundle["weight_rf"]
    hv = HashingVectorizer(**bundle["hv_params"])
    te = df.iloc[test_idx]
    p = w * bundle["rf"].predict_proba(te[FEATURE_NAMES])[:, 1] + (1 - w) * bundle["ngram"].predict_proba(
        hv.transform(te["url"].map(normalize_url).str.lower().values))[:, 1]
    yt = y[test_idx]
    rkt = rk[test_idx]
    hosting = te["url"].map(lambda u: is_hosting(host_of(u))).values

    def stats(pred):
        tp = int((pred & (yt == 1)).sum())
        fp = int((pred & (yt == 0)).sum())
        fn = int((~pred & (yt == 1)).sum())
        tn = int((~pred & (yt == 0)).sum())
        return (f"precision {tp / max(tp + fp, 1):.3f} recall {tp / (tp + fn):.3f} "
                f"false-alarm {fp / (fp + tn):.4f} (FP {fp}, FN {fn})")

    bare = (te["path_len"].values == 0) & (te["query_len"].values == 0)
    t_flag = meta["thresholds"]["f1"]
    t_high = meta["thresholds"]["p90"]
    print(f"\nC. Policies on the TEST set (flagged = score >= {t_flag:.3f}; likely-phishing tier = score >= {t_high:.3f})")
    for n in [100, 1000, 10000]:
        m = (rkt <= n) & ~hosting & bare
        print(f"  bare homepages on top-{n}: legit rows {int((m & (yt == 0)).sum())}, phishing rows {int((m & (yt == 1)).sum())}")
    for n_home in [None, 100, 1000]:
        for n_cap in [None, 1000, 10000, 100000]:
            q = p.copy()
            if n_home:
                q[(rkt <= n_home) & ~hosting & bare] = 0.0
            capped = ((rkt <= n_cap) & ~hosting) if n_cap else np.zeros(len(q), dtype=bool)
            print(f"  home-clear top-{n_home}, cap top-{n_cap}")
            print("     flagged:", stats(q >= t_flag))
            print("     likely :", stats((q >= t_high) & ~capped))


if __name__ == "__main__":
    main()

