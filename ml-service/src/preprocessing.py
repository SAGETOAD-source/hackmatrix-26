import time
from pathlib import Path

import pandas as pd

from feature_extraction import (FEATURE_NAMES, extract_features,
                                normalize_url, registered_domain)

BASE = Path(__file__).resolve().parent.parent
RAW = BASE / "data" / "raw"
OUT = BASE / "data" / "processed" / "features.csv.gz"


def load_phiusiil():
    df = pd.read_csv(RAW / "PhiUSIIL_Phishing_URL_Dataset.csv", usecols=["URL", "label"])
    return pd.DataFrame({
        "url": df["URL"],
        "is_phishing": 1 - df["label"],          # D1: phishing = 1
        "source": "phiusiil",
    })


def load_malicious_phish():
    df = pd.read_csv(RAW / "malicious_phish.csv")
    df = df[df["type"].isin(["benign", "phishing"])]  # D4
    return pd.DataFrame({
        "url": df["url"],
        "is_phishing": (df["type"] == "phishing").astype(int),
        "source": "malicious_phish",
    })


def main():
    t0 = time.time()
    df = pd.concat([load_phiusiil(), load_malicious_phish()], ignore_index=True)
    print("Loaded rows:", len(df))

    df = df.dropna(subset=["url"])
    df["url"] = df["url"].astype(str).str.strip()
    df["norm"] = df["url"].map(normalize_url).str.lower()   # D3
    df = df[df["norm"].str.len() > 0]

    conflict = df.groupby("norm")["is_phishing"].nunique()
    bad = conflict[conflict > 1].index
    print("Normalized URLs with conflicting labels (dropped):", len(bad))
    df = df[~df["norm"].isin(bad)]

    before = len(df)
    df = df.drop_duplicates(subset="norm").reset_index(drop=True)
    print("Duplicates removed:", before - len(df))

    print("Extracting features (a few minutes)...")
    feats, keep = [], []
    for i, u in enumerate(df["url"]):
        try:
            feats.append(extract_features(u))
            keep.append(i)
        except Exception:
            pass
        if i and i % 100000 == 0:
            print(f"  {i} rows, {time.time() - t0:.0f}s")
    print("Failed to parse (dropped):", len(df) - len(keep))

    df = df.iloc[keep].reset_index(drop=True)
    feats = pd.DataFrame(feats, columns=FEATURE_NAMES).astype(float)
    df["domain"] = df["url"].map(registered_domain)

    out = pd.concat([df[["url", "is_phishing", "source", "domain"]], feats], axis=1)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUT, index=False, compression="gzip")

    print("\nSaved:", OUT)
    print("Shape:", out.shape)
    print("NaN cells:", int(out[FEATURE_NAMES].isna().sum().sum()))
    print("\nRows per source and class (is_phishing):")
    print(pd.crosstab(out["source"], out["is_phishing"]))
    print("\nPhishing share:", round(out["is_phishing"].mean(), 3))
    print(f"Done in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()