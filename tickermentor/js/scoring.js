/* ==========================================================================
   TickerMentor — scoring engine
   --------------------------------------------------------------------------
   Everything in here is deterministic and inspectable. There is no model,
   no prediction, and no attempt to forecast prices. The output is a
   structured reading of the numbers already in the dataset, so that a
   beginner can see *why* one company ranks above another and learn to
   disagree with it.

   IMPORTANT: higher score never means "this will go up". It means "this
   company currently looks more attractive on the five axes below, relative
   to its sector peers, under this particular weighting."
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* Risk profiles                                                     */
  /* ---------------------------------------------------------------- */

  var PROFILES = {
    conservative: {
      label: 'Careful',
      blurb: 'You would rather give up some upside than sit through a 40% fall.',
      weights: { valuation: 30, quality: 32, growth: 10, momentum: 5, risk: 23 }
    },
    balanced: {
      label: 'Balanced',
      blurb: 'You want sensible companies and accept normal market swings.',
      weights: { valuation: 25, quality: 25, growth: 20, momentum: 15, risk: 15 }
    },
    aggressive: {
      label: 'Growth-hungry',
      blurb: 'You will tolerate deep drawdowns for faster-growing businesses.',
      weights: { valuation: 15, quality: 18, growth: 32, momentum: 22, risk: 13 }
    }
  };

  var AXES = [
    { key: 'valuation', label: 'Valuation',  hint: 'What you pay for each rupee or dollar of profit and assets.' },
    { key: 'quality',   label: 'Quality',    hint: 'How profitably and how safely the business is run.' },
    { key: 'growth',    label: 'Growth',     hint: 'How fast revenue and profit have been expanding.' },
    { key: 'momentum',  label: 'Momentum',   hint: 'How the share price has behaved lately. The weakest of the five.' },
    { key: 'risk',      label: 'Steadiness', hint: 'How violently the price has moved. Higher is calmer.' }
  ];

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function num(v) {
    return typeof v === 'number' && isFinite(v);
  }

  /* Percentile rank of `value` inside `list`, where `better` is +1 for
     "higher is better" and -1 for "lower is better". Invalid entries are
     ignored rather than treated as zero, which would badly distort banks
     (margin) and loss-makers (P/E). */
  function percentile(value, list, better) {
    var vals = list.filter(num);
    if (!num(value) || vals.length < 2) return null;
    var worse = 0, equal = 0;
    for (var i = 0; i < vals.length; i++) {
      var d = (vals[i] - value) * better;
      if (d < 0) worse++;
      else if (d === 0) equal++;
    }
    if (worse + equal === vals.length) return 100;   // best in peer group
    if (worse === 0) return 0;                        // worst in peer group
    return (worse / (vals.length - 1)) * 100;
  }

  /* Average the non-null contributions, so a missing input lowers
     confidence rather than silently scoring zero. */
  function blend(parts) {
    var used = parts.filter(function (p) { return p !== null; });
    if (!used.length) return { score: 50, coverage: 0 };
    var sum = 0;
    used.forEach(function (p) { sum += p; });
    return { score: sum / used.length, coverage: used.length / parts.length };
  }

  function median(values) {
    var v = values.filter(num).slice().sort(function (a, b) { return a - b; });
    if (!v.length) return 0;
    var mid = Math.floor(v.length / 2);
    return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  }

  function peerGroup(stock, dataset) {
    var sector = dataset.filter(function (s) {
      return s.sector === stock.sector && s.market === stock.market;
    });
    return sector.length >= 4 ? sector : dataset.filter(function (s) { return s.market === stock.market; });
  }

  /* ---------------------------------------------------------------- */
  /* Factor scoring                                                    */
  /* ---------------------------------------------------------------- */

  function scoreAxes(stock, dataset) {
    var peers = peerGroup(stock, dataset);
    var notes = [];

    /* Valuation — cheap is good, but only when earnings are real. */
    var pePart = null, pbPart = null;
    if (num(stock.pe) && stock.pe > 0) {
      pePart = percentile(stock.pe, peers.map(function (p) { return p.pe > 0 ? p.pe : null; }), -1);
    } else {
      notes.push({
        tone: 'warn',
        text: 'No usable price-to-earnings ratio — the company is currently loss-making or has negligible profit, so "cheap" cannot be judged on earnings.'
      });
    }
    if (num(stock.pb) && stock.pb > 0) {
      pbPart = percentile(stock.pb, peers.map(function (p) { return p.pb > 0 ? p.pb : null; }), -1);
    } else if (num(stock.pb) && stock.pb < 0) {
      notes.push({
        tone: 'warn',
        text: 'Negative book value. Accounting losses have eaten the company\'s net assets, so price-to-book is meaningless here.'
      });
    }
    var valuation = blend([pePart, pbPart]);

    /* Quality — returns on capital plus a margin buffer plus restraint on debt. */
    var roePart = percentile(stock.roe, peers.map(function (p) { return p.roe; }), 1);
    var marginPart = num(stock.margin) && stock.margin !== 0
      ? percentile(stock.margin, peers.map(function (p) { return p.margin; }), 1)
      : null;
    var debtPart = percentile(Math.abs(stock.de), peers.map(function (p) { return Math.abs(p.de); }), -1);
    var quality = blend([roePart, marginPart, debtPart]);

    /* Growth — revenue is harder to flatter than profit, so weight it more. */
    var revPart = percentile(stock.rev, peers.map(function (p) { return p.rev; }), 1);
    var profitPart = percentile(stock.profit, peers.map(function (p) { return p.profit; }), 1);
    var growth = blend([revPart, revPart, profitPart]);

    /* Momentum — recent returns. Labelled weak on purpose. */
    var y1Part = percentile(stock.y1, peers.map(function (p) { return p.y1; }), 1);
    var m3Part = percentile(stock.m3, peers.map(function (p) { return p.m3; }), 1);
    var momentum = blend([y1Part, y1Part, m3Part]);

    /* Steadiness — volatility and beta inversion, plus drawdown. */
    var volPart = percentile(stock.vol, peers.map(function (p) { return p.vol; }), -1);
    var ddPart = percentile(stock.dd, peers.map(function (p) { return p.dd; }), 1);
    var betaPart = percentile(Math.abs(stock.beta - 1), peers.map(function (p) {
      return Math.abs(p.beta - 1);
    }), -1);
    var risk = blend([volPart, volPart, ddPart, betaPart]);

    return {
      valuation: valuation.score,
      quality: quality.score,
      growth: growth.score,
      momentum: momentum.score,
      risk: risk.score,
      coverage: (valuation.coverage + quality.coverage + growth.coverage +
                 momentum.coverage + risk.coverage) / 5,
      notes: notes,
      peers: peers.length,
      peerLabel: peers.length === dataset.filter(function (s) { return s.market === stock.market; }).length
        ? 'market'
        : stock.sector + ' sector'
    };
  }

  /* ---------------------------------------------------------------- */
  /* Verdict copy                                                      */
  /* ---------------------------------------------------------------- */

  function verdictFor(score) {
    if (score >= 75) return { label: 'Strong on this model', tone: 'good' };
    if (score >= 60) return { label: 'Above average', tone: 'good' };
    if (score >= 45) return { label: 'Middle of the pack', tone: 'neutral' };
    if (score >= 32) return { label: 'Weak on this model', tone: 'warn' };
    return { label: 'Poor on this model', tone: 'bad' };
  }

  /* Turn the two strongest and two weakest axes into plain language. */
  function narrate(axes, stock) {
    var ordered = AXES.map(function (a) {
      return { key: a.key, label: a.label, score: axes[a.key] };
    }).sort(function (a, b) { return b.score - a.score; });

    var strengths = ordered.slice(0, 2).filter(function (a) { return a.score >= 55; });
    var weaknesses = ordered.slice(-2).reverse().filter(function (a) { return a.score <= 50; });

    var TEMPLATE = {
      valuation: {
        good: 'trades at a lower price relative to its earnings and assets than its peers',
        bad: 'is priced richly against its peers — you are paying a premium for the story'
      },
      quality: {
        good: 'earns high returns on equity with a comfortable margin and modest debt',
        bad: 'has weak returns or a stretched balance sheet, so mistakes have less cushion'
      },
      growth: {
        good: 'is growing revenue and profit faster than comparable companies',
        bad: 'is growing slowly or shrinking, which caps how much the business can compound'
      },
      momentum: {
        good: 'has had a strong run in the share price recently',
        bad: 'has been out of favour in the share price recently'
      },
      risk: {
        good: 'has moved relatively calmly compared with its peers',
        bad: 'has swung around violently — expect a rough ride if you hold it'
      }
    };

    return {
      strengths: strengths.map(function (a) {
        return stock.name + ' ' + TEMPLATE[a.key].good + ' (' + a.label.toLowerCase() + ' ' + Math.round(a.score) + '/100).';
      }),
      weaknesses: weaknesses.map(function (a) {
        return stock.name + ' ' + TEMPLATE[a.key].bad + ' (' + a.label.toLowerCase() + ' ' + Math.round(a.score) + '/100).';
      })
    };
  }

  /* Questions the user should be able to answer before buying. This is the
     pedagogical core: the score is bait, the checklist is the lesson. */
  function checklist(stock, axes) {
    var out = [];

    out.push({
      q: 'Do I understand how ' + stock.name + ' actually makes money?',
      why: stock.about
    });

    if (axes.valuation < 40) {
      out.push({
        q: 'Am I paying a premium price?',
        why: 'Its valuation ranks in the bottom 40% of peers. High expectations mean a small disappointment can hurt the share price a lot.'
      });
    } else if (axes.valuation > 70) {
      out.push({
        q: 'Is it cheap for a good reason?',
        why: 'It looks inexpensive next to peers. Cheap stocks are often cheap because something is going wrong — find out what before assuming the market is wrong.'
      });
    }

    if (Math.abs(stock.de) > 1.2) {
      out.push({
        q: 'Can it survive a bad year with this much debt?',
        why: 'Debt-to-equity is ' + stock.de.toFixed(1) + '. Debt magnifies both good years and bad ones, and interest must be paid regardless.'
      });
    }

    if (stock.vol > 35) {
      out.push({
        q: 'Would I hold through a ' + Math.round(Math.abs(stock.dd)) + '% fall without panicking?',
        why: 'It fell that much within the last twelve months. Volatility is the price of admission for higher-return candidates.'
      });
    }

    if (num(stock.pe) && stock.pe > 45) {
      out.push({
        q: 'Is the growth already priced in?',
        why: 'A P/E of ' + stock.pe.toFixed(0) + ' means buyers are paying that many years of current profit. Growth has to arrive to justify it.'
      });
    }

    if (stock.div > 2.5) {
      out.push({
        q: 'Is the dividend safe, or is the yield a warning?',
        why: 'A ' + stock.div.toFixed(1) + '% yield is high. Check whether the payout is covered by profit, or whether the share price has simply fallen.'
      });
    }

    out.push({
      q: 'How much of my portfolio would this be?',
      why: 'Position sizing protects you from being wrong. Most beginners lose money through concentration, not through picking a bad company.'
    });

    return out;
  }

  /* ---------------------------------------------------------------- */
  /* Public API                                                        */
  /* ---------------------------------------------------------------- */

  function score(stock, dataset, profileKey) {
    var profile = PROFILES[profileKey] || PROFILES.balanced;
    var axes = scoreAxes(stock, dataset);

    var total = 0;
    AXES.forEach(function (a) {
      total += axes[a.key] * (profile.weights[a.key] / 100);
    });

    var verdict = verdictFor(total);
    var story = narrate(axes, stock);

    return {
      symbol: stock.symbol,
      stock: stock,
      profile: profileKey,
      profileLabel: profile.label,
      weights: profile.weights,
      axes: axes,
      total: total,
      verdict: verdict,
      strengths: story.strengths,
      weaknesses: story.weaknesses,
      flags: axes.notes,
      checklist: checklist(stock, axes),
      confidence: clamp(Math.round(axes.coverage * 100), 0, 100),
      peerCount: axes.peers,
      peerLabel: axes.peerLabel
    };
  }

  function rank(dataset, profileKey, opts) {
    opts = opts || {};
    var pool = dataset.filter(function (s) {
      if (opts.market && opts.market !== 'ALL' && s.market !== opts.market) return false;
      if (opts.sector && opts.sector !== 'ALL' && s.sector !== opts.sector) return false;
      return true;
    });
    return pool
      .map(function (s) { return score(s, dataset, profileKey); })
      .sort(function (a, b) { return b.total - a.total; });
  }

  /* Compare two names side by side, axis by axis. */
  function compare(a, b, dataset, profileKey) {
    var sa = score(a, dataset, profileKey);
    var sb = score(b, dataset, profileKey);
    var diffs = AXES.map(function (axis) {
      return {
        key: axis.key,
        label: axis.label,
        a: sa.axes[axis.key],
        b: sb.axes[axis.key],
        delta: sa.axes[axis.key] - sb.axes[axis.key]
      };
    });
    return { a: sa, b: sb, axes: diffs };
  }

  function datasetMedian(dataset, key) {
    return median(dataset.map(function (s) { return s[key]; }));
  }

  window.TMScore = {
    PROFILES: PROFILES,
    AXES: AXES,
    score: score,
    rank: rank,
    compare: compare,
    median: datasetMedian
  };
})();
