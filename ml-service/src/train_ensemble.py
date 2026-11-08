import json
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import confusion_matrix, precision_recall_curve, roc_auc_score

from feature_extraction import FEATURE_NAMES, features_dataframe, normalize_url
from train import DATA, MODELS, SEED, best_f1_threshold, group_split, metrics

HV_PARAMS = dict(analyzer="char", ngram_range=(3, 5), n_features=2**20,
                 alternate_sign=False, norm="l2", dtype=np.float32)


def threshold_for_precision(y_true, proba, target):
    p, r, t = precision_recall_curve(y_true, proba)
    ok = np.where(p[:-1] >= target)[0]
    return float(t[ok[0]]) if len(ok) else None


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
    assert not (set(g[train_idx]) & set(g[test_idx]))
    assert not (set(g[train_idx]) & set(g[val_idx]))

    t0 = time.time()
    rf = RandomForestClassifier(n_estimators=100, max_depth=20, min_samples_leaf=5,
                                class_weight="balanced_subsample", n_jobs=-1, random_state=SEED)
    rf.fit(X.iloc[train_idx], y[train_idx])
    print(f"RF trained in {time.time() - t0:.0f}s")

    t0 = time.time()
    hv = HashingVectorizer(**HV_PARAMS)
    Xt = hv.transform(df["url"].map(normalize_url).str.lower().values)
    ng = SGDClassifier(loss="log_loss", alpha=1e-6, class_weight="balanced",
                       max_iter=15, tol=None, random_state=SEED)
    ng.fit(Xt[train_idx], y[train_idx])
    print(f"n-gram LR trained in {time.time() - t0:.0f}s")

    rf_val, ng_val = rf.predict_proba(X.iloc[val_idx])[:, 1], ng.predict_proba(Xt[val_idx])[:, 1]
    rf_te, ng_te = rf.predict_proba(X.iloc[test_idx])[:, 1], ng.predict_proba(Xt[test_idx])[:, 1]

    best_w, best_auc = None, -1.0
    for w in [0.0, 0.3, 0.5, 0.7, 1.0]:
        a = roc_auc_score(y[val_idx], w * rf_val + (1 - w) * ng_val)
        print(f"weight RF={w}: val ROC-AUC {a:.4f}")
        if a > best_auc:
            best_w, best_auc = w, a
    print("Chosen RF weight:", best_w)

    val_p = best_w * rf_val + (1 - best_w) * ng_val
    te_p = best_w * rf_te + (1 - best_w) * ng_te
    yt, st = y[test_idx], src[test_idx]

    thr = best_f1_threshold(y[val_idx], val_p)
    res = metrics(yt, te_p, thr)
    print("\nENSEMBLE TEST @best-F1 threshold", round(thr, 3), res)
    for s in np.unique(st):
        m = st == s
        print("  per-source", s, metrics(yt[m], te_p[m], thr))
    tn, fp, fn, tp = confusion_matrix(yt, (te_p >= thr).astype(int)).ravel()
    print("Confusion (TN FP FN TP):", int(tn), int(fp), int(fn), int(tp))

    thresholds = {"f1": thr}
    print("\nOperating points (threshold picked on validation, measured on test):")
    for target in [0.7, 0.8, 0.9]:
        t = threshold_for_precision(y[val_idx], val_p, target)
        if t is None:
            print(f"  precision>={target}: not reachable")
            continue
        tn, fp, fn, tp = confusion_matrix(yt, (te_p >= t).astype(int)).ravel()
        print(f"  target precision {target}: thr={t:.3f} test precision={tp / max(tp + fp, 1):.3f} "
              f"recall={tp / (tp + fn):.3f} false-alarm rate={fp / (fp + tn):.3f}")
        thresholds[f"p{int(target * 100)}"] = t

    def score(urls):
        f = features_dataframe(urls)
        a = rf.predict_proba(f)[:, 1]
        b = ng.predict_proba(hv.transform([normalize_url(u).lower() for u in urls]))[:, 1]
        return best_w * a + (1 - best_w) * b

    sanity = [
        "https://www.google.com",
        "https://github.com/user/repo/issues/12",
        "https://en.wikipedia.org/wiki/Phishing",
        "https://docs.python.org/3/library/os.html",
        "https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster",
        "http://paypal-secure-login.account-verify.xyz/signin",
        "http://193.42.33.145/login/verify.php?id=1&x=2",
        "https://secure-sbi-netbanking.top/update-kyc/login.php",
        "http://amazon.com.account-update.tk/verify?session=ab12cd34",
    ]
    print("\nSANITY CHECK (hand-made URLs, not from any dataset):")
    for u, p in zip(sanity, score(sanity)):
        print(f"  {p:.3f}  {u}")

    MODELS.mkdir(exist_ok=True)
    out = MODELS / "ensemble.joblib"
    joblib.dump({"rf": rf, "ngram": ng, "hv_params": HV_PARAMS, "weight_rf": best_w,
                 "features": FEATURE_NAMES}, out, compress=3)
    (MODELS / "ensemble_meta.json").write_text(json.dumps(
        {"weight_rf": best_w, "thresholds": thresholds, "test_metrics": res}, indent=2))
    print(f"\nSaved {out} ({out.stat().st_size / 1e6:.0f} MB)")


if __name__ == "__main__":
    main()

