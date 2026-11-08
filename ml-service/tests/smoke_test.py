import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import predict  # noqa: E402

URLS = [
    "https://www.google.com", "https://github.com/user/repo/issues/12",
    "https://docs.python.org/3/library/os.html", "https://en.wikipedia.org/wiki/Phishing",
    "google.com", "http://paypal-secure-login.account-verify.xyz/signin",
    "http://193.42.33.145/login/verify.php?id=1&x=2",
    "https://secure-sbi-netbanking.top/update-kyc/login.php",
    "http://amazon.com.account-update.tk/verify?session=ab12cd34", "http://bit.ly/3abcde",
    "http://xn--80ak6aa92e.com", "http://münchen.de/straße", "http://exa mple.com", "   ", "a" * 3000,
]
for u in URLS:
    try:
        r = predict.score_url(u)
        print(f"{r['risk_score']:.3f} {r['tier']:<16} {u[:60]!r} capped={r['reputation_capped']} reasons={r['reasons']}")
    except Exception as e:
        print(f"ERROR ({type(e).__name__}): {str(e)[:60]!r} for {u[:30]!r}")

