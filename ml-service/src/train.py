import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, confusion_matrix,
                             precision_recall_curve, precision_score,
                             recall_score, f1_score, roc_auc_score)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from feature_extraction import FEATURE_NAMES

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data" / "processed" / "features.csv.gz"
MODELS = BASE / "models"
SEED = 42


def group_split(y, groups, n_splits):
    sgkf = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=SEED)
    rest, fold = next(sgkf.split(np.zeros(len(y)), y, groups))
    return rest, fold


def metrics(y_true, proba, thr):
    pred = (proba >= thr).astype(int)
    out = {
        "precision": precision_score(y_true, pred, zero_division=0),
        "recall": recall_score(y_true, pred, zero_division=0),
        "f1": f1_score(y_true, pred, zero_division=0),
    }
    if len(np.unique(y_true)) == 2:
        out["roc_auc"] = roc_auc_score(y_true, proba)
        out["pr_auc"] = average_precision_score(y_true, proba)
    return {k: round(float(v), 4) for k, v in out.items()}


def best_f1_threshold(y_true, proba):
    p, r, t = precision_recall_curve(y_true, proba)
    f1 = 2 * p * r / (p + r + 1e-12)
    return float(t[np.argmax(f1[:-1])])


def main():
    df = pd.read_csv(DATA)
    y = df["is_phishing"].values
    dom = df["domain"].fillna("")
    print("Rows with empty domain (each gets its own group):", int((dom == "").sum()))
    dom = dom.where(dom != "", ("nodomain_" + df.index.astype(str)).values)
    g = dom.astype(str).values
    src = df["source"].values

    trval, test_idx = group_split(y, g, 5)
    tr_rel, val_rel = group_split(y[trval], g[trval], 8)
    train_idx, val_idx = trval[tr_rel], trval[val_rel]

    assert not (set(g[train_idx]) & set(g[test_idx])), "domain leak train/test"
    assert not (set(g[train_idx]) & set(g[val_idx])), "domain leak train/val"
    print(f"Split: train={len(train_idx)} val={len(val_idx)} test={len(test_idx)}")
    print("Phishing share train/val/test:",
          round(y[train_idx].mean(), 3), round(y[val_idx].mean(), 3), round(y[test_idx].mean(), 3))

    X = df[FEATURE_NAMES]
    models = {
        "logistic_regression": make_pipeline(
            StandardScaler(),
            LogisticRegression(class_weight="balanced", max_iter=1000)),
        "random_forest": RandomForestClassifier(
            n_estimators=100, max_depth=20, min_samples_leaf=5,
            class_weight="balanced_subsample", n_jobs=-1, random_state=SEED),
    }

    MODELS.mkdir(exist_ok=True)
    results = {}
    for name, model in models.items():
        t0 = time.time()
        model.fit(X.iloc[train_idx], y[train_idx])
        val_p = model.predict_proba(X.iloc[val_idx])[:, 1]
        thr = best_f1_threshold(y[val_idx], val_p)
        test_p = model.predict_proba(X.iloc[test_idx])[:, 1]
        yt = y[test_idx]

        res = {
            "threshold": round(thr, 4),
            "val_f1": metrics(y[val_idx], val_p, thr)["f1"],
            "test_at_0.5": metrics(yt, test_p, 0.5),
            "test_at_thr": metrics(yt, test_p, thr),
            "per_source": {s: metrics(yt[src[test_idx] == s], test_p[src[test_idx] == s], thr)
                           for s in np.unique(src[test_idx])},
        }
        tn, fp, fn, tp = confusion_matrix(yt, (test_p >= thr).astype(int)).ravel()
        res["confusion"] = {"TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)}
        results[name] = res
        joblib.dump(model, MODELS / f"{name}.joblib", compress=3)

        print(f"\n===== {name}  ({time.time() - t0:.0f}s) =====")
        print("threshold (best val F1):", res["threshold"])
        print("TEST @0.5      :", res["test_at_0.5"])
        print("TEST @threshold:", res["test_at_thr"])
        print("Confusion (TN FP FN TP):", res["confusion"])
        for s, m in res["per_source"].items():
            print(f"  per-source {s}:", m)

    best = max(results, key=lambda n: results[n]["val_f1"])
    print("\nBest model by validation F1:", best)
    rf = models["random_forest"]
    imp = pd.Series(rf.feature_importances_, index=FEATURE_NAMES).sort_values(ascending=False)
    print("\nRandom Forest top 10 features:\n", imp.head(10).round(4))

    joblib.dump(models[best], MODELS / "best_model.joblib", compress=3)
    meta = {"best_model": best, "threshold": results[best]["threshold"],
            "features": FEATURE_NAMES, "results": results}
    (MODELS / "model_meta.json").write_text(json.dumps(meta, indent=2))
    print("\nSaved models to", MODELS)


if __name__ == "__main__":
    main()