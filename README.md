# Mithun — project index

Two independent static sites in one repository. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# http://localhost:8000/            → project index
# http://localhost:8000/tickermentor/  → TickerMentor
# http://localhost:8000/priam/         → PRIAM
```

There is no build step, no bundler, and no package installation anywhere in this repo.

---

## TickerMentor — `tickermentor/`

A beginner-friendly stock research assistant: it tells you which companies look attractive **and
explains why**, teaches the fundamentals, and lets you practise with virtual money.

**What it does**

| Section | Purpose |
| --- | --- |
| Discover | Ranks US and Indian companies on five axes, weighted by a risk profile you choose |
| Company page | Axis-by-axis reasoning, plain-language metrics vs peers, a pre-purchase checklist, thesis notes |
| Compare | Two companies head to head, with the widest gaps explained |
| Learn | 24 lessons across four tracks, each with two recall questions, plus a 30-term glossary |
| Practice | Paper trading in two currencies with a holdings table and trade log |
| Watchlist / Progress | Shortlist, lesson completion, quiz accuracy, badges |

**How the score works.** Five axes — valuation, quality, growth, momentum and steadiness — are each
expressed as a percentile against peer companies, then blended using the weights of your risk
profile. It is a *descriptive* comparison of the numbers, not a forecast. Changing the risk profile
reorders the ranking on purpose: that instability is the lesson, not a bug.

**Data.** Everything runs offline on bundled **sample data** — plausible figures that are not real or
current market data, labelled as such throughout. To use live quotes, add a key in Settings:

| Provider | Markets | Notes |
| --- | --- | --- |
| Finnhub | US, NSE | `NSE:` prefix added automatically |
| Twelve Data | US, NSE | Free tier is rate-limited |
| Alpha Vantage | US, BSE | ~25 requests/day |

Live quotes change only the price; fundamentals stay sample values, so scores remain practice
scores. A key entered in Settings is stored in that browser's `localStorage` in plain text — fine for
personal use, **never** for a public deployment, and never commit one. Failed requests fall back to
sample data and show the error rather than pretending.

**Storage.** Watchlist, portfolios, lesson progress and theses live in `localStorage`. Nothing is
uploaded. Settings has an "erase all my data" button.

---

## PRIAM — `priam/`

A landing page for PRIAM (Precision Radio Instrument for Antenna Measurements): a drone-based antenna
calibration experiment for 21-cm cosmology and low-frequency radio instruments. Covers the system
architecture, both airframes (Flamewheel F450 testbed and Tarot T960 flight article), the science
payload, the custom RF switch and balun hardware, and a full specification table.

Source repositories for the hardware and flight code:
[Drone-Project-CAD](https://github.com/km5es/Drone-Project-CAD) ·
[Drone-Project-code](https://github.com/km5es/Drone-Project-code) ·
[project guide](https://krishnamakhija.gitbook.io/priam/)

Page imagery is illustrative renders, not photographs of the built hardware.

---

## Structure

```
index.html              project index
tickermentor/           the stock app (standalone, also deployable on its own)
  index.html
  css/style.css
  js/data.js            sample dataset
  js/scoring.js         scoring engine + verdict/checklist generation
  js/market.js          provider adapters, settings, caching, fallbacks
  js/lessons.js         24 lessons, glossary, metric help text
  js/app.js             router, views, paper trading, persistence
priam/                  the drone project page
  index.html
  script.js
  public/
```

Both sites are plain HTML/CSS/JS. To host, point any static host at the repository root.

## Disclaimer

TickerMentor is an educational tool. It is not an investment adviser, does not provide investment
advice, and makes no forecast of future prices or returns. Investing carries risk, including loss of
capital.

## License

MIT — see [LICENSE](LICENSE).
