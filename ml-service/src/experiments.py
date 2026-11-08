import time
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split

from feature_extraction import FEATURE_NAMES, normalize_url
from train import DATA, SEED, best_f1_threshold, group_split, metrics


def main():
    df = pd.read_csv(DATA)
    y = df["is_phishing"].values
    dom = df["domain"].fillna("")
    dom = dom.where(dom != "", ("nodomain_" + df.index.astype(str)).values)
    g = dom.astype(str).values
    src = df["source"].values
    X = df[FEATURE_NAMES]

    trval, test_idx = group_split(y, g, 5)
    tr_rel, val_rel = group_split(y[trval], g[trval], 8)
    train_idx, val_idx = trval[tr_rel], trval[val_rel]

    t0 = time.time()
    tr, te = train_test_split(np.arange(len(df)), test_size=0.2, stratify=y, random_state=SEED)
    rf = RandomForestClassifier(n_estimators=100, max_depth=20, min_samples_leaf=5,
                                class_weight="balanced_subsample", n_jobs=-1, random_state=SEED)
    rf.fit(X.iloc[tr], y[tr])
    p = rf.predict_proba(X.iloc[te])[:, 1]
    print("EXP1 RF RANDOM split (domains may leak) @0.5:", metrics(y[te], p, 0.5),
          f"{time.time() - t0:.0f}s")

    t0 = time.time()
    texts = df["url"].map(normalize_url).str.lower().values
    hv = HashingVectorizer(analyzer="char", ngram_range=(3, 5), n_features=2**20,
                           alternate_sign=False, norm="l2", dtype=np.float32)
    Xt = hv.transform(texts)
    clf = SGDClassifier(loss="log_loss", alpha=1e-6, class_weight="balanced",
                        max_iter=15, tol=None, random_state=SEED)
    clf.fit(Xt[train_idx], y[train_idx])
    val_p = clf.predict_proba(Xt[val_idx])[:, 1]
    thr = best_f1_threshold(y[val_idx], val_p)
    test_p = clf.predict_proba(Xt[test_idx])[:, 1]
    yt = y[test_idx]
    print("EXP2 char-ngram LR GROUPED split @0.5:", metrics(yt, test_p, 0.5))
    print("EXP2 @val threshold", round(thr, 3), metrics(yt, test_p, thr), f"{time.time() - t0:.0f}s")
    for s in np.unique(src[test_idx]):
        m = src[test_idx] == s
        print("  per-source", s, metrics(yt[m], test_p[m], thr))


if __name__ == "__main__":
    main()

