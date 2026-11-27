/* ==========================================================================
   TickerMentor — application
   Hash-routed single page app. No framework, no build step.
   Sections: store · helpers · views · router
   ========================================================================== */

(function () {
  'use strict';

  /* ================================================================ */
  /* Store                                                            */
  /* ================================================================ */

  var KEYS = {
    watchlist: 'tm.watchlist',
    sim: 'tm.sim',
    progress: 'tm.progress',
    journal: 'tm.journal'
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota/private mode */ }
    return value;
  }

  var settings = TMMarket.loadSettings();

  var watchlist = read(KEYS.watchlist, []);
  var progress = read(KEYS.progress, { lessons: {}, quiz: {} });
  var journal = read(KEYS.journal, {});

  function freshSim() {
    return {
      US: { cash: 10000, positions: {}, trades: [] },
      IN: { cash: 1000000, positions: {}, trades: [] }
    };
  }
  var sim = read(KEYS.sim, freshSim());

  var quotes = {};        // cached live quote results, keyed by symbol
  var quoteBusy = {};     // in-flight requests, so a screen never double-fetches

  /* A JSON key of the settings that affect quoting. When it changes, stale
     results (including cached failures) must be discarded. */
  function quoteSettingsKey(s) { return s.provider + '|' + s.key; }
  var lastQuoteKey = quoteSettingsKey(settings);

  /* ================================================================ */
  /* Helpers                                                          */
  /* ================================================================ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function currencyOf(market) { return market === 'IN' ? 'INR' : 'USD'; }

  function money(value, currency, opts) {
    opts = opts || {};
    if (value === null || value === undefined || !isFinite(value)) return '—';
    var locale = currency === 'INR' ? 'en-IN' : 'en-US';
    var digits = opts.digits !== undefined ? opts.digits : (Math.abs(value) >= 1000 ? 0 : 2);
    if (opts.compact && Math.abs(value) >= 1000) {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency', currency: currency, notation: 'compact', maximumFractionDigits: 1
        }).format(value);
      } catch (e) { /* older browser */ }
    }
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency: currency,
        minimumFractionDigits: digits, maximumFractionDigits: digits
      }).format(value);
    } catch (e) {
      return (currency === 'INR' ? '₹' : '$') + value.toFixed(digits);
    }
  }

  function pct(value, digits) {
    if (value === null || value === undefined || !isFinite(value)) return '—';
    var d = digits === undefined ? 1 : digits;
    return (value > 0 ? '+' : '') + value.toFixed(d) + '%';
  }

  function signClass(value) {
    if (!isFinite(value) || value === 0) return 'flat';
    return value > 0 ? 'up' : 'down';
  }

  function dataset() {
    return TM_SAMPLE_DATA.map(function (s) {
      return TMMarket.withQuote(s, quotes[s.symbol]);
    });
  }

  function findStock(symbol) {
    return dataset().filter(function (s) { return s.symbol === symbol; })[0] || null;
  }

  function marketsInList(list) {
    var out = {};
    list.forEach(function (s) { out[s.market] = true; });
    return Object.keys(out);
  }

  function medianOf(list, key) {
    var vals = list.map(function (s) { return s[key]; })
      .filter(function (v) { return typeof v === 'number' && isFinite(v); })
      .sort(function (a, b) { return a - b; });
    if (!vals.length) return null;
    var mid = Math.floor(vals.length / 2);
    return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  }

  /* Fire a live quote fetch for a set of symbols, then re-render the route. */
  function hydrate(list) {
    var wanted = list.filter(function (s) {
      return settings.provider !== 'sample' && settings.key && !quotes[s.symbol] && !quoteBusy[s.symbol];
    }).slice(0, 12);

    if (!wanted.length) return;

    wanted.forEach(function (s) { quoteBusy[s.symbol] = true; });

    wanted.forEach(function (s) {
      TMMarket.quote(s, settings).then(function (result) {
        quotes[s.symbol] = result;
        delete quoteBusy[s.symbol];
        if (result.status === 'error') noteQuoteError(result.error);
        render();
      });
    });
  }

  var lastQuoteError = null;
  function noteQuoteError(msg) {
    if (lastQuoteError === msg) return;
    lastQuoteError = msg;
  }

  /* ================================================================ */
  /* Small renderers                                                  */
  /* ================================================================ */

  function scoreBadge(score) {
    var tone = score >= 75 ? 'good' : score >= 60 ? 'ok' : score >= 45 ? 'mid' : score >= 32 ? 'low' : 'bad';
    return '<span class="score-badge tone-' + tone + '">' + Math.round(score) + '</span>';
  }

  function axisBar(label, value, hint) {
    var tone = value >= 70 ? 'good' : value >= 50 ? 'mid' : 'low';
    return '' +
      '<div class="axis">' +
        '<div class="axis-top">' +
          '<span class="axis-label" title="' + esc(hint) + '">' + esc(label) + '</span>' +
          '<span class="axis-val">' + Math.round(value) + '</span>' +
        '</div>' +
        '<div class="axis-track"><span class="axis-fill tone-' + tone + '" style="width:' + Math.max(2, Math.round(value)) + '%"></span></div>' +
      '</div>';
  }

  function priceBlock(stock) {
    var q = quotes[stock.symbol];
    var cur = stock.currency;
    var live = q && q.status === 'live' && q.quote;

    var price = live ? q.quote.price : stock.price;
    var chg = live && isFinite(q.quote.change) ? q.quote.change : null;
    var chgPct = live && isFinite(q.quote.changePct) ? q.quote.changePct : null;

    var html = '<div class="price-row">' +
      '<span class="price">' + money(price, cur) + '</span>';

    if (chg !== null) {
      html += '<span class="chg ' + signClass(chg) + '">' +
        money(Math.abs(chg), cur) + ' · ' + pct(chgPct) + '</span>';
    }
    html += '</div>';

    if (live) {
      html += '<span class="tag tag-live">Live · ' + esc(q.providerLabel) + '</span>';
    } else if (q && q.status === 'error') {
      html += '<span class="tag tag-warn" title="' + esc(q.error) + '">Live quote unavailable — showing sample</span>';
    } else {
      html += '<span class="tag tag-sample">Sample price</span>';
    }

    return html;
  }

  function dataSourceBanner() {
    var provider = TMMarket.describeProvider(settings.provider);
    if (settings.provider === 'sample' || !settings.key) {
      return '<div class="banner banner-info">' +
        '<strong>Practice data.</strong> Prices and fundamentals on this screen are bundled sample figures, not live or current market data. ' +
        'That is fine for learning — add an API key in <a href="#/settings">Settings</a> if you want live quotes.' +
        '</div>';
    }
    return '<div class="banner banner-info">' +
      '<strong>Live quotes via ' + esc(provider.label) + '.</strong> ' +
      'Prices refresh from the API; fundamentals (P/E, ROE, debt and so on) remain sample values, so treat the scores as practice. ' +
      'Price badges marked <span class="tag tag-sample">Sample price</span> were not refreshed on this screen. ' +
      (lastQuoteError ? '<span class="banner-err">Last error: ' + esc(lastQuoteError) + '</span>' : '') +
      '</div>';
  }

  /* ================================================================ */
  /* View: Discover                                                   */
  /* ================================================================ */

  function viewDiscover() {
    var market = settings.market;
    var ranked = TMScore.rank(dataset(), settings.profile, { market: market });
    var profile = TMScore.PROFILES[settings.profile];

    var sectors = ['ALL'].concat(dataset()
      .filter(function (s) { return market === 'ALL' || s.market === market; })
      .map(function (s) { return s.sector; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort());

    var filtered = ranked.filter(function (r) {
      if (settings.sector && settings.sector !== 'ALL' && r.stock.sector !== settings.sector) return false;
      var q = (settings.search || '').trim().toLowerCase();
      if (q && (r.stock.symbol + ' ' + r.stock.name).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    var top = filtered[0];

    var html = dataSourceBanner();

    html += '<section class="hero-panel">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Ranked for a <strong>' + esc(profile.label.toLowerCase()) + '</strong> investor</p>' +
        '<h1>Which stock looks best <em>for you</em>?</h1>' +
        '<p class="lede">Every company is scored on five axes and compared with its peers. Nothing here predicts a price — ' +
        'the point is to learn <em>why</em> one business ranks above another, and then argue with it.</p>' +
      '</div>' +
      '<div class="hero-side">' +
        '<label class="field"><span>Risk profile</span>' +
          '<select data-action="set-profile">' +
            Object.keys(TMScore.PROFILES).map(function (k) {
              return '<option value="' + k + '"' + (k === settings.profile ? ' selected' : '') + '>' +
                esc(TMScore.PROFILES[k].label) + '</option>';
            }).join('') +
          '</select>' +
        '</label>' +
        '<p class="hero-side-note">' + esc(profile.blurb) + '</p>' +
      '</div>' +
    '</section>';

    html += '<div class="controls">' +
      '<div class="segmented" role="group" aria-label="Market">' +
        [['US', 'US stocks'], ['IN', 'Indian stocks'], ['ALL', 'Both']].map(function (m) {
          return '<button type="button" data-action="set-market" data-value="' + m[0] + '"' +
            (settings.market === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>';
        }).join('') +
      '</div>' +
      '<label class="field field-inline"><span class="sr-only">Filter by sector</span>' +
        '<select data-action="set-sector">' +
          sectors.map(function (s) {
            return '<option value="' + esc(s) + '"' +
              ((settings.sector || 'ALL') === s ? ' selected' : '') + '>' +
              (s === 'ALL' ? 'All sectors' : esc(s)) + '</option>';
          }).join('') +
        '</select>' +
      '</label>' +
      '<label class="field field-inline search-field"><span class="sr-only">Search</span>' +
        '<input type="search" placeholder="Search symbol or name" value="' + esc(settings.search || '') + '" data-action="search">' +
      '</label>' +
    '</div>';

    if (top) {
      html += '<section class="toppick">' +
        '<div class="toppick-head">' +
          '<span class="pill">Top of this list</span>' +
          '<span class="muted">Out of ' + filtered.length + ' companies' +
            (filtered.length < ranked.length ? ' (filtered from ' + ranked.length + ')' : '') + '</span>' +
        '</div>' +
        '<div class="toppick-body">' +
          '<div class="toppick-id">' +
            '<h2>' + esc(top.stock.name) + ' <span class="sym">' + esc(top.stock.symbol) + '</span></h2>' +
            priceBlock(top.stock) +
            '<p class="muted small">' + esc(top.stock.about) + '</p>' +
          '</div>' +
          '<div class="toppick-score">' +
            scoreBadge(top.total) +
            '<span class="toppick-verdict">' + esc(top.verdict.label) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="toppick-why">' +
          '<div class="why-col">' +
            '<h3>Why it ranks here</h3>' +
            '<ul class="tick-list">' +
              (top.strengths.length ? top.strengths : ['No single axis stands out above 55 — this is a compromise, not a standout.'])
                .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
            '</ul>' +
          '</div>' +
          '<div class="why-col">' +
            '<h3>What would make me cautious</h3>' +
            '<ul class="warn-list">' +
              (top.weaknesses.length ? top.weaknesses : ['Nothing ranks poorly — but a high score still is not a promise.'])
                .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="toppick-cta">' +
          '<a class="btn btn-primary" href="#/stock/' + esc(top.stock.symbol) + '">Open the full breakdown</a>' +
          '<button class="btn btn-outline" data-action="toggle-watch" data-symbol="' + esc(top.stock.symbol) + '">' +
            (watchlist.indexOf(top.stock.symbol) >= 0 ? '★ Watching' : '☆ Add to watchlist') + '</button>' +
          '<a class="btn btn-quiet" href="#/practice">Practise buying it →</a>' +
        '</div>' +
      '</section>';
    }

    html += '<section class="rank-list">' +
      '<div class="rank-head">' +
        '<h2>All companies, ranked</h2>' +
        '<p class="muted small">Scores are relative to peers <em>within this market</em>; the five bars show where each one earns or loses its points. ' +
        'Tap a row for the reasoning.</p>' +
      '</div>';

    if (!filtered.length) {
      html += '<p class="empty">No companies match that filter. Try clearing the search or choosing another sector.</p>';
    }

    filtered.forEach(function (r, i) {
      var st = r.stock;
      html += '<article class="rank-row">' +
        '<div class="rank-pos">' + (i + 1) + '</div>' +
        '<div class="rank-main">' +
          '<div class="rank-title">' +
            '<a href="#/stock/' + esc(st.symbol) + '">' + esc(st.name) + '</a>' +
            '<span class="sym">' + esc(st.symbol) + '</span>' +
            '<span class="chip">' + esc(st.market === 'IN' ? 'NSE' : 'US') + '</span>' +
            '<span class="chip chip-muted">' + esc(st.sector) + '</span>' +
          '</div>' +
          '<div class="rank-meta">' +
            '<span>' + money(st.price, st.currency, { compact: true }) + '</span>' +
            '<span class="' + signClass(st.y1) + '">1y ' + pct(st.y1, 0) + '</span>' +
            '<span>P/E ' + (st.pe > 0 ? st.pe.toFixed(0) : 'n/a') + '</span>' +
            '<span>ROE ' + st.roe.toFixed(0) + '%</span>' +
          '</div>' +
          '<div class="mini-axes">' +
            TMScore.AXES.map(function (a) {
              var v = r.axes[a.key];
              return '<span class="mini-axis" title="' + esc(a.label + ': ' + Math.round(v) + '/100') + '">' +
                '<span class="mini-axis-fill" style="height:' + Math.max(6, Math.round(v)) + '%"></span>' +
                '<span class="mini-axis-name">' + esc(a.label.slice(0, 4)) + '</span></span>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="rank-score">' +
          scoreBadge(r.total) +
          '<span class="rank-verdict">' + esc(r.verdict.label) + '</span>' +
        '</div>' +
        '<div class="rank-act">' +
          '<a class="btn btn-sm btn-outline" href="#/stock/' + esc(st.symbol) + '">Why</a>' +
          '<button class="icon-btn' + (watchlist.indexOf(st.symbol) >= 0 ? ' on' : '') + '" ' +
            'data-action="toggle-watch" data-symbol="' + esc(st.symbol) + '" ' +
            'title="Watchlist" aria-label="Toggle watchlist for ' + esc(st.symbol) + '">★</button>' +
        '</div>' +
      '</article>';
    });

    html += '</section>';

    html += '<p class="disclaimer">TickerMentor is a learning tool, not an investment adviser. Rankings are descriptive comparisons of sample data and ' +
      'contain no forecast. Nothing here is a recommendation to buy or sell any security.</p>';

    /* Only the top pick is fetched live. Pulling a quote for every row
       would blow through free-tier rate limits, so the ranked list stays
       on sample prices and the banner says so. */
    if (top) hydrate([top.stock]);
    return html;
  }

  /* ================================================================ */
  /* View: Stock detail                                               */
  /* ================================================================ */

  function viewStock(symbol) {
    var stock = findStock(symbol);
    if (!stock) return '<p class="empty">Unknown symbol. <a href="#/discover">Back to the list.</a></p>';

    var data = dataset();
    var result = TMScore.score(stock, data, settings.profile);
    var peers = data.filter(function (s) { return s.market === stock.market; });
    var watched = watchlist.indexOf(stock.symbol) >= 0;
    var cur = stock.currency;

    var METRICS = [
      ['pe', 'P/E', stock.pe > 0 ? stock.pe.toFixed(1) : 'n/a'],
      ['pb', 'P/B', stock.pb > 0 ? stock.pb.toFixed(1) : 'n/a'],
      ['roe', 'ROE', pct(stock.roe, 0)],
      ['de', 'Debt/equity', stock.de.toFixed(2)],
      ['rev', 'Sales growth', pct(stock.rev, 0)],
      ['profit', 'Profit growth', pct(stock.profit, 0)],
      ['margin', 'Op. margin', pct(stock.margin, 0)],
      ['div', 'Dividend yield', pct(stock.div, 2)],
      ['mcap', 'Market cap', money(stock.mcap * 1e9, cur, { compact: true })],
      ['beta', 'Beta', stock.beta.toFixed(2)],
      ['vol', 'Volatility', pct(stock.vol, 0)],
      ['dd', 'Max drawdown', pct(stock.dd, 0)]
    ];

    var html = '<div class="crumbs"><a href="#/discover">Discover</a> <span>/</span> <span>' + esc(stock.symbol) + '</span></div>';

    html += '<section class="stock-head">' +
      '<div class="stock-head-main">' +
        '<div class="stock-title">' +
          '<h1>' + esc(stock.name) + '</h1>' +
          '<span class="sym lg">' + esc(stock.symbol) + '</span>' +
          '<span class="chip">' + esc(stock.market === 'IN' ? 'NSE' : 'US') + '</span>' +
        '</div>' +
        '<p class="stock-about">' + esc(stock.about) + '</p>' +
        priceBlock(stock) +
        '<div class="stock-head-actions">' +
          '<button class="btn btn-outline" data-action="toggle-watch" data-symbol="' + esc(stock.symbol) + '">' +
            (watched ? '★ Watching' : '☆ Add to watchlist') + '</button>' +
          '<a class="btn btn-quiet" href="#/practice">Try a virtual trade →</a>' +
        '</div>' +
      '</div>' +
      '<div class="stock-score-card">' +
        '<span class="score-label">Score for a ' + esc(TMScore.PROFILES[settings.profile].label.toLowerCase()) + ' investor</span>' +
        '<div class="score-big tone-' + (result.total >= 60 ? 'good' : result.total >= 45 ? 'mid' : 'low') + '">' +
          Math.round(result.total) + '</div>' +
        '<span class="score-verdict">' + esc(result.verdict.label) + '</span>' +
        '<span class="score-peer">Ranked against ' + result.peerCount + ' ' + esc(result.peerLabel) + ' companies</span>' +
        '<span class="score-conf">Data coverage ' + result.confidence + '%</span>' +
      '</div>' +
    '</section>';

    html += '<div class="two-col">' +
      '<section class="panel">' +
        '<h2>The five axes</h2>' +
        '<p class="muted small">Each bar is a percentile: 90 means better than 90% of comparable companies on that axis. ' +
        'Weights come from your risk profile.</p>' +
        TMScore.AXES.map(function (a) {
          return '<div class="axis-block">' +
            axisBar(a.label, result.axes[a.key], a.hint) +
            '<p class="axis-note">' + esc(a.hint) +
            ' <span class="weight">weight ' + result.weights[a.key] + '%</span></p>' +
          '</div>';
        }).join('') +
        '<div class="profile-switch">' +
          '<span class="muted small">See how the score changes:</span>' +
          Object.keys(TMScore.PROFILES).map(function (k) {
            var s = TMScore.score(stock, data, k);
            return '<button class="btn btn-sm ' + (k === settings.profile ? 'btn-primary' : 'btn-outline') + '" ' +
              'data-action="set-profile" data-value="' + k + '">' +
              esc(TMScore.PROFILES[k].label) + ' <span class="btn-score">' + Math.round(s.total) + '</span></button>';
          }).join('') +
        '</div>' +
      '</section>' +

      '<section class="panel">' +
        '<h2>The case for and against</h2>' +
        '<h3 class="sub-head good">Strengths</h3>' +
        '<ul class="tick-list">' +
          (result.strengths.length ? result.strengths : ['No axis scores above 55 — this company is unremarkable on every measure.'])
            .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
        '</ul>' +
        '<h3 class="sub-head warn">Weaknesses</h3>' +
        '<ul class="warn-list">' +
          (result.weaknesses.length ? result.weaknesses : ['Nothing scores poorly here. That is rare — check you believe the inputs.'])
            .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
        '</ul>' +
        (result.flags.length ? '<h3 class="sub-head warn">Data warnings</h3><ul class="warn-list">' +
          result.flags.map(function (f) { return '<li>' + esc(f.text) + '</li>'; }).join('') + '</ul>' : '') +
      '</section>' +
    '</div>';

    /* Numbers table with comparison to market median */
    html += '<section class="panel">' +
      '<h2>The numbers, in plain language</h2>' +
      '<p class="muted small">Each figure is shown next to the median for ' +
      (stock.market === 'IN' ? 'the Indian' : 'the US') + ' companies in this app.</p>' +
      '<div class="metric-grid">' +
        METRICS.map(function (m) {
          var help = TM_METRIC_HELP[m[0]] || '';
          var med = medianOf(peers, m[0]);
          var medTxt = med === null ? '—' : (m[0] === 'mcap' ? money(med * 1e9, cur, { compact: true })
            : (['rev','profit','margin','roe','vol','dd','div'].indexOf(m[0]) >= 0 ? pct(med, m[0] === 'div' ? 2 : 0)
            : med.toFixed(2)));
          return '<div class="metric">' +
            '<span class="metric-name" title="' + esc(help) + '">' + esc(m[1]) + '<i>?</i></span>' +
            '<span class="metric-val">' + esc(m[2]) + '</span>' +
            '<span class="metric-med">median ' + esc(medTxt) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<p class="muted tiny">Hover or tap a label for a plain-language definition. Full glossary in <a href="#/learn">Learn</a>.</p>' +
    '</section>';

    /* Returns */
    html += '<section class="panel">' +
      '<h2>Recent performance vs market</h2>' +
      '<p class="muted small">Trailing returns only. Past performance tells you how a business has been treated, not what happens next.</p>' +
      '<div class="return-rows">' +
        [['m1', 'Past month'], ['m3', 'Past 3 months'], ['y1', 'Past 12 months']].map(function (r) {
          var med = medianOf(peers, r[0]) || 0;
          return '<div class="return-row">' +
            '<span class="return-label">' + r[1] + '</span>' +
            '<span class="return-bar-wrap">' +
              '<span class="return-bar ' + signClass(stock[r[0]]) + '" style="width:' +
                Math.min(50, Math.abs(stock[r[0]]) * 1.4 + 2) + '%"></span>' +
            '</span>' +
            '<span class="return-val ' + signClass(stock[r[0]]) + '">' + pct(stock[r[0]], 0) + '</span>' +
            '<span class="return-vs">market ' + pct(med, 0) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';

    /* Checklist */
    html += '<section class="panel panel-accent">' +
      '<h2>Before you would buy this</h2>' +
      '<p class="muted small">The score is the bait. These are the questions that actually matter, generated from this company\'s own numbers.</p>' +
      '<ol class="checklist">' +
        result.checklist.map(function (c) {
          return '<li><strong>' + esc(c.q) + '</strong><p>' + esc(c.why) + '</p></li>';
        }).join('') +
      '</ol>' +
    '</section>';

    /* Journal */
    html += '<section class="panel">' +
      '<h2>Write your thesis</h2>' +
      '<p class="muted small">Saved in this browser only. Writing it down before you buy is the single highest-value habit in investing.</p>' +
      '<form data-action="save-journal" data-symbol="' + esc(stock.symbol) + '">' +
        '<textarea name="note" rows="4" placeholder="I am interested in ' + esc(stock.symbol) + ' because… It would prove me wrong if…">' +
          esc(journal[stock.symbol] ? journal[stock.symbol].note : '') +
        '</textarea>' +
        '<div class="form-row">' +
          '<button class="btn btn-primary btn-sm" type="submit">Save thesis</button>' +
          (journal[stock.symbol] ? '<span class="muted tiny">Last saved ' + new Date(journal[stock.symbol].at).toLocaleDateString() + '</span>' : '') +
          '<a class="btn btn-quiet btn-sm" href="#/compare/' + esc(stock.symbol) + '">Compare with another →</a>' +
        '</div>' +
      '</form>' +
    '</section>';

    html += '<p class="disclaimer">Scores are relative comparisons of sample data under your chosen weighting. No forecast is implied and nothing here is advice.</p>';

    hydrate([stock]);
    return html;
  }

  /* ================================================================ */
  /* View: Compare                                                    */
  /* ================================================================ */

  function viewCompare(symA, symB) {
    var a = findStock(symA);
    var b = symB ? findStock(symB) : null;
    if (!a) return '<p class="empty">Unknown symbol. <a href="#/discover">Back to the list.</a></p>';

    var data = dataset();
    var options = data.filter(function (s) { return s.market === a.market; });

    var html = '<div class="crumbs"><a href="#/discover">Discover</a> <span>/</span> <a href="#/stock/' + esc(a.symbol) + '">' + esc(a.symbol) + '</a> <span>/</span> <span>Compare</span></div>';
    html += '<h1 class="page-title">Compare two companies</h1>';

    html += '<div class="compare-picker">' +
      '<label class="field"><span>Company A</span><select data-action="compare-a">' +
        options.map(function (s) {
          return '<option value="' + esc(s.symbol) + '"' + (s.symbol === a.symbol ? ' selected' : '') + '>' +
            esc(s.symbol + ' — ' + s.name) + '</option>';
        }).join('') +
      '</select></label>' +
      '<span class="vs">vs</span>' +
      '<label class="field"><span>Company B</span><select data-action="compare-b">' +
        '<option value="">Choose one…</option>' +
        options.filter(function (s) { return s.symbol !== a.symbol; }).map(function (s) {
          return '<option value="' + esc(s.symbol) + '"' + (b && s.symbol === b.symbol ? ' selected' : '') + '>' +
            esc(s.symbol + ' — ' + s.name) + '</option>';
        }).join('') +
      '</select></label>' +
    '</div>';

    if (!b) {
      html += '<p class="empty">Pick a second company to see the side-by-side breakdown.</p>';
      return html;
    }

    var cmp = TMScore.compare(a, b, data, settings.profile);
    var winner = cmp.a.total >= cmp.b.total ? a : b;

    html += '<div class="compare-head">' +
      '<div class="compare-name"><h2>' + esc(a.name) + '</h2><span class="sym">' + esc(a.symbol) + '</span>' +
        scoreBadge(cmp.a.total) + '</div>' +
      '<div class="compare-name"><h2>' + esc(b.name) + '</h2><span class="sym">' + esc(b.symbol) + '</span>' +
        scoreBadge(cmp.b.total) + '</div>' +
    '</div>';

    html += '<section class="panel">' +
      '<h2>Axis by axis</h2>' +
      '<p class="muted small">Bars extend from the middle: right favours ' + esc(a.symbol) +
      ', left favours ' + esc(b.symbol) + '.</p>' +
      '<div class="duel">' +
        cmp.axes.map(function (d) {
          var delta = d.a - d.b;
          var width = Math.min(50, Math.abs(delta) / 2 + 1.5);
          return '<div class="duel-row">' +
            '<span class="duel-val ' + (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat') + '">' + Math.round(d.a) + '</span>' +
            '<div class="duel-track">' +
              '<span class="duel-mid"></span>' +
              '<span class="duel-bar ' + (delta >= 0 ? 'right' : 'left') + '" style="width:' + width + '%"></span>' +
            '</div>' +
            '<span class="duel-val ' + (delta < 0 ? 'up' : delta > 0 ? 'down' : 'flat') + '">' + Math.round(d.b) + '</span>' +
            '<span class="duel-label">' + esc(d.label) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';

    html += '<section class="panel panel-accent">' +
      '<h2>What this comparison teaches</h2>' +
      '<p><strong>' + esc(winner.name) + '</strong> scores higher overall, but a weighted total hides trade-offs. ' +
      cmp.axes.sort(function (x, y) { return Math.abs(y.delta) - Math.abs(x.delta); }).slice(0, 2)
        .map(function (d) {
          var lead = d.delta >= 0 ? a : b;
          return 'The widest gap is ' + esc(d.label.toLowerCase()) + ', where <strong>' + esc(lead.name) +
            '</strong> leads by ' + Math.abs(Math.round(d.delta)) + ' points.';
        }).join(' ') +
      ' Ask yourself which of those differences you actually expect to persist for years — that is the whole exercise.</p>' +
      '<p class="muted small">Change your risk profile on the Discover screen and come back: the winner often flips. ' +
      'If it does, you have found sensitivity rather than a clear answer.</p>' +
    '</section>';

    hydrate([a, b]);
    return html;
  }

  /* ================================================================ */
  /* View: Learn + Lesson                                             */
  /* ================================================================ */

  function viewLearn() {
    var tracks = {};
    TM_LESSONS.forEach(function (l) {
      (tracks[l.track] = tracks[l.track] || []).push(l);
    });

    var done = Object.keys(progress.lessons).length;
    var total = TM_LESSONS.length;
    var quizTotal = 0, quizRight = 0;
    Object.keys(progress.quiz).forEach(function (lid) {
      Object.keys(progress.quiz[lid]).forEach(function (qi) {
        quizTotal++;
        if (progress.quiz[lid][qi].correct) quizRight++;
      });
    });

    var html = '<section class="hero-panel hero-panel-slim">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Learn</p>' +
        '<h1>Start from zero, in twenty minutes</h1>' +
        '<p class="lede">Four short tracks. Each lesson takes a few minutes, ends with two questions, and is written for someone who has never bought a share.</p>' +
      '</div>' +
      '<div class="hero-side stats-side">' +
        '<div class="stat"><span class="stat-num">' + done + '<span class="stat-den">/' + total + '</span></span><span class="stat-label">lessons complete</span></div>' +
        '<div class="stat"><span class="stat-num">' + (quizTotal ? Math.round(quizRight / quizTotal * 100) + '%' : '—') + '</span><span class="stat-label">quiz accuracy</span></div>' +
        '<div class="progress-track"><span style="width:' + Math.round(done / total * 100) + '%"></span></div>' +
      '</div>' +
    '</section>';

    Object.keys(tracks).forEach(function (track) {
      var lessons = tracks[track];
      var doneHere = lessons.filter(function (l) { return progress.lessons[l.id]; }).length;
      html += '<section class="track">' +
        '<div class="track-head">' +
          '<h2>' + esc(track) + '</h2>' +
          '<span class="muted small">' + doneHere + ' of ' + lessons.length + ' done · ' +
            lessons.reduce(function (a, l) { return a + l.minutes; }, 0) + ' min</span>' +
        '</div>' +
        '<div class="lesson-grid">' +
          lessons.map(function (l) {
            var complete = !!progress.lessons[l.id];
            return '<a class="lesson-card' + (complete ? ' complete' : '') + '" href="#/lesson/' + esc(l.id) + '">' +
              '<div class="lesson-card-top">' +
                '<span class="lesson-num">' + (complete ? '✓' : l.id.replace(/[a-z]/, '')) + '</span>' +
                '<span class="lesson-min">' + l.minutes + ' min</span>' +
              '</div>' +
              '<h3>' + esc(l.title) + '</h3>' +
              '<p>' + esc(l.body[0].slice(0, 96)) + '…</p>' +
            '</a>';
          }).join('') +
        '</div>' +
      '</section>';
    });

    /* Glossary */
    html += '<section class="track" id="glossary">' +
      '<div class="track-head"><h2>Glossary</h2><span class="muted small">' + TM_GLOSSARY.length + ' terms, no jargon</span></div>' +
      '<div class="glossary">' +
        TM_GLOSSARY.slice().sort(function (a, b) { return a.term.localeCompare(b.term); }).map(function (g) {
          return '<div class="gloss-item" id="term-' + esc(g.key) + '">' +
            '<dt>' + esc(g.term) + '</dt><dd>' + esc(g.def) + '</dd></div>';
        }).join('') +
      '</div>' +
    '</section>';

    return html;
  }

  function viewLesson(id) {
    var lesson = TM_LESSONS.filter(function (l) { return l.id === id; })[0];
    if (!lesson) return '<p class="empty">Lesson not found. <a href="#/learn">Back to Learn.</a></p>';

    var idx = TM_LESSONS.indexOf(lesson);
    var next = TM_LESSONS[idx + 1];
    var prev = TM_LESSONS[idx - 1];
    var answers = progress.quiz[lesson.id] || {};

    var html = '<div class="crumbs"><a href="#/learn">Learn</a> <span>/</span> <span>' + esc(lesson.track) + '</span></div>';
    html += '<article class="lesson">' +
      '<header class="lesson-header">' +
        '<span class="pill">' + esc(lesson.track) + ' · ' + lesson.minutes + ' min</span>' +
        '<h1>' + esc(lesson.title) + '</h1>' +
      '</header>' +
      '<div class="lesson-body">' +
        lesson.body.map(function (p, i) {
          /* Link the first mention of each glossary term in the first paragraph. */
          var text = esc(p);
          return '<p' + (i === 0 ? ' class="lead-para"' : '') + '>' + text + '</p>';
        }).join('') +
      '</div>' +
      (lesson.example ? '<aside class="example"><h3>Worked example</h3><p>' + esc(lesson.example) + '</p></aside>' : '') +
      '<div class="lesson-terms">' +
        '<span class="muted small">Terms used here:</span>' +
        lesson.terms.map(function (t) {
          var g = TM_GLOSSARY.filter(function (x) { return x.key === t; })[0];
          return g ? '<a class="term-chip" href="#/learn" data-term="' + esc(t) + '">' + esc(g.term) + '</a>' : '';
        }).join('') +
      '</div>' +
      '<section class="quiz">' +
        '<h2>Check yourself</h2>' +
        lesson.quiz.map(function (q, qi) {
          var picked = answers[qi];
          return '<div class="quiz-q">' +
            '<p class="quiz-prompt">' + (qi + 1) + '. ' + esc(q.q) + '</p>' +
            '<div class="quiz-opts">' +
              q.options.map(function (opt, oi) {
                var cls = '';
                if (picked !== undefined) {
                  if (oi === q.answer) cls = ' correct';
                  else if (oi === picked.opt) cls = ' wrong';
                }
                return '<button class="quiz-opt' + cls + '" data-action="quiz" data-lesson="' + esc(lesson.id) +
                  '" data-q="' + qi + '" data-opt="' + oi + '"' + (picked !== undefined ? ' disabled' : '') + '>' +
                  esc(opt) + '</button>';
              }).join('') +
            '</div>' +
            (picked !== undefined ? '<p class="quiz-why' + (picked.correct ? ' good' : ' warn') + '">' +
              (picked.correct ? 'Correct. ' : 'Not quite. ') + esc(q.why) + '</p>' : '') +
          '</div>';
        }).join('') +
      '</section>' +
      '<footer class="lesson-footer">' +
        (prev ? '<a class="btn btn-outline btn-sm" href="#/lesson/' + esc(prev.id) + '">← ' + esc(prev.title) + '</a>' : '<span></span>') +
        '<button class="btn ' + (progress.lessons[lesson.id] ? 'btn-done' : 'btn-primary') + '" data-action="complete-lesson" data-id="' + esc(lesson.id) + '">' +
          (progress.lessons[lesson.id] ? '✓ Completed' : 'Mark as complete') + '</button>' +
        (next ? '<a class="btn btn-outline btn-sm" href="#/lesson/' + esc(next.id) + '">' + esc(next.title) + ' →</a>' : '<a class="btn btn-outline btn-sm" href="#/learn">Back to Learn →</a>') +
      '</footer>' +
    '</article>';

    return html;
  }

  /* ================================================================ */
  /* View: Practice (paper trading)                                   */
  /* ================================================================ */

  function portfolioFor(market) {
    var book = sim[market];
    var rows = Object.keys(book.positions).map(function (sym) {
      var pos = book.positions[sym];
      var stock = findStock(sym);
      var price = stock ? stock.price : pos.avgCost;
      var value = price * pos.qty;
      var cost = pos.avgCost * pos.qty;
      return {
        symbol: sym,
        name: stock ? stock.name : sym,
        qty: pos.qty,
        avgCost: pos.avgCost,
        price: price,
        value: value,
        cost: cost,
        pnl: value - cost,
        pnlPct: cost ? ((value - cost) / cost) * 100 : 0,
        currency: currencyOf(market)
      };
    });

    var holdings = rows.reduce(function (a, r) { return a + r.value; }, 0);
    return {
      market: market,
      cash: book.cash,
      holdings: holdings,
      total: book.cash + holdings,
      grown: book.cash + holdings - (market === 'IN' ? 1000000 : 10000),
      rows: rows.sort(function (a, b) { return b.value - a.value; }),
      trades: book.trades.slice().reverse()
    };
  }

  function viewPractice() {
    var market = settings.market === 'ALL' ? 'US' : settings.market;
    var p = portfolioFor(market);
    var cur = currencyOf(market);
    var data = dataset();
    var options = data.filter(function (s) { return s.market === market; });

    var html = '<section class="hero-panel hero-panel-slim">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Practice</p>' +
        '<h1>Make your mistakes for free</h1>' +
        '<p class="lede">Virtual money, real prices from the dataset. Nothing is sent anywhere and no real order is placed — ' +
        'this exists so that the first time you feel a paper loss, it costs you nothing.</p>' +
      '</div>' +
      '<div class="hero-side stats-side">' +
        '<div class="stat"><span class="stat-num">' + money(p.total, cur, { compact: true }) + '</span><span class="stat-label">portfolio value</span></div>' +
        '<div class="stat"><span class="stat-num ' + signClass(p.grown) + '">' + (p.grown >= 0 ? '+' : '') + money(p.grown, cur, { compact: true }) + '</span><span class="stat-label">since start</span></div>' +
        '<div class="stat"><span class="stat-num">' + money(p.cash, cur, { compact: true }) + '</span><span class="stat-label">cash available</span></div>' +
      '</div>' +
    '</section>';

    html += '<div class="segmented segmented-wide" role="group" aria-label="Practice market">' +
      [['US', 'US — $10,000 virtual'], ['IN', 'India — ₹10,00,000 virtual']].map(function (m) {
        return '<button type="button" data-action="set-market" data-value="' + m[0] + '"' +
          (market === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>';
      }).join('') +
    '</div>';

    html += '<div class="two-col two-col-wide">' +
      '<section class="panel">' +
        '<h2>Place a virtual order</h2>' +
        '<form data-action="trade" data-market="' + market + '" class="trade-form">' +
          '<label class="field"><span>Company</span>' +
            '<select name="symbol" required>' +
              options.map(function (s) {
                return '<option value="' + esc(s.symbol) + '">' + esc(s.symbol + ' — ' + s.name + ' (' + money(s.price, s.currency) + ')') + '</option>';
              }).join('') +
            '</select>' +
          '</label>' +
          '<div class="form-row">' +
            '<label class="field"><span>Quantity</span><input type="number" name="qty" min="1" step="1" value="1" required></label>' +
            '<label class="field"><span>Side</span>' +
              '<select name="side"><option value="buy">Buy</option><option value="sell">Sell</option></select>' +
            '</label>' +
          '</div>' +
          '<button class="btn btn-primary" type="submit">Place virtual order</button>' +
          '<p class="muted tiny">Orders fill immediately at the current dataset price, with no brokerage or taxes — ' +
          'which makes this easier than the real thing. Remember that when you go live.</p>' +
        '</form>' +
      '</section>' +

      '<section class="panel">' +
        '<h2>Holdings</h2>' +
        (p.rows.length ? '<div class="table-scroll"><table class="data-table">' +
          '<thead><tr><th>Company</th><th>Qty</th><th>Avg cost</th><th>Price</th><th>Value</th><th>P&amp;L</th></tr></thead>' +
          '<tbody>' + p.rows.map(function (r) {
            return '<tr>' +
              '<td><a href="#/stock/' + esc(r.symbol) + '">' + esc(r.symbol) + '</a><span class="cell-sub">' + esc(r.name) + '</span></td>' +
              '<td>' + r.qty + '</td>' +
              '<td>' + money(r.avgCost, cur) + '</td>' +
              '<td>' + money(r.price, cur) + '</td>' +
              '<td>' + money(r.value, cur, { compact: true }) + '</td>' +
              '<td class="' + signClass(r.pnl) + '">' + (r.pnl >= 0 ? '+' : '') + money(r.pnl, cur) +
                '<span class="cell-sub">' + pct(r.pnlPct) + '</span></td>' +
            '</tr>';
          }).join('') + '</tbody></table></div>'
        : '<p class="empty">No holdings yet. Place your first virtual order to see how it feels.</p>') +
      '</section>' +
    '</div>';

    html += '<section class="panel">' +
      '<h2>Trade log</h2>' +
      '<p class="muted small">Your own record of decisions, in order. Reviewing this honestly is worth more than any tip.</p>' +
      (p.trades.length ? '<div class="table-scroll"><table class="data-table">' +
        '<thead><tr><th>When</th><th>Side</th><th>Company</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead>' +
        '<tbody>' + p.trades.map(function (t) {
          return '<tr><td>' + new Date(t.at).toLocaleString() + '</td>' +
            '<td><span class="side-tag ' + (t.side === 'buy' ? 'buy' : 'sell') + '">' + t.side + '</span></td>' +
            '<td>' + esc(t.symbol) + '</td><td>' + t.qty + '</td>' +
            '<td>' + money(t.price, cur) + '</td><td>' + money(t.price * t.qty, cur) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<p class="empty">No trades yet.</p>') +
      '<div class="form-row">' +
        '<button class="btn btn-outline btn-sm" data-action="reset-sim" data-market="' + market + '">Reset ' + market + ' account</button>' +
        '<span class="muted tiny">Resetting clears holdings and history for this market only.</span>' +
      '</div>' +
    '</section>';

    return html;
  }

  /* ================================================================ */
  /* View: Watchlist                                                  */
  /* ================================================================ */

  function viewWatchlist() {
    var data = dataset();
    var rows = data.filter(function (s) { return watchlist.indexOf(s.symbol) >= 0; });

    var html = '<section class="hero-panel hero-panel-slim">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Watchlist</p>' +
        '<h1>Companies you are following</h1>' +
        '<p class="lede">A shortlist, not a shopping list. Watching a company for a few weeks before buying is a cheap way to test whether your thesis survives contact with reality.</p>' +
      '</div>' +
      '<div class="hero-side stats-side">' +
        '<div class="stat"><span class="stat-num">' + rows.length + '</span><span class="stat-label">companies watched</span></div>' +
      '</div>' +
    '</section>';

    if (!rows.length) {
      html += '<p class="empty">Nothing watched yet. Star a company from <a href="#/discover">Discover</a> to track it here.</p>';
      return html;
    }

    html += '<div class="watch-grid">' + rows.map(function (s) {
      var r = TMScore.score(s, data, settings.profile);
      return '<article class="watch-card">' +
        '<div class="watch-top">' +
          '<div><h2>' + esc(s.symbol) + '</h2><p class="muted small">' + esc(s.name) + '</p></div>' +
          scoreBadge(r.total) +
        '</div>' +
        priceBlock(s) +
        '<dl class="watch-stats">' +
          '<div><dt>P/E</dt><dd>' + (s.pe > 0 ? s.pe.toFixed(0) : 'n/a') + '</dd></div>' +
          '<div><dt>ROE</dt><dd>' + s.roe.toFixed(0) + '%</dd></div>' +
          '<div><dt>1y</dt><dd class="' + signClass(s.y1) + '">' + pct(s.y1, 0) + '</dd></div>' +
          '<div><dt>Vol.</dt><dd>' + s.vol.toFixed(0) + '%</dd></div>' +
        '</dl>' +
        '<div class="watch-actions">' +
          '<a class="btn btn-sm btn-outline" href="#/stock/' + esc(s.symbol) + '">Breakdown</a>' +
          '<button class="icon-btn on" data-action="toggle-watch" data-symbol="' + esc(s.symbol) + '" aria-label="Remove ' + esc(s.symbol) + '">★</button>' +
        '</div>' +
      '</article>';
    }).join('') + '</div>';

    hydrate(rows);
    return html;
  }

  /* ================================================================ */
  /* View: Progress                                                   */
  /* ================================================================ */

  function viewProgress() {
    var lessonTotal = TM_LESSONS.length;
    var done = Object.keys(progress.lessons).length;
    var quizTotal = 0, quizRight = 0;
    Object.keys(progress.quiz).forEach(function (lid) {
      Object.keys(progress.quiz[lid]).forEach(function (qi) {
        quizTotal++;
        if (progress.quiz[lid][qi].correct) quizRight++;
      });
    });

    var pUS = portfolioFor('US');
    var pIN = portfolioFor('IN');

    var badges = [
      { id: 'first', label: 'First steps', got: done >= 1, hint: 'Complete one lesson' },
      { id: 'found', label: 'Foundations', got: TM_LESSONS.filter(function (l) { return l.track === 'Foundations' && progress.lessons[l.id]; }).length === 4, hint: 'Finish the Foundations track' },
      { id: 'quiz', label: 'Sharp recall', got: quizTotal >= 8 && quizRight / quizTotal >= 0.75, hint: 'Score 75%+ across 8+ quiz questions' },
      { id: 'trade', label: 'Skin in the game', got: pUS.trades.length + pIN.trades.length > 0, hint: 'Place a virtual trade' },
      { id: 'journal', label: 'Written thesis', got: Object.keys(journal).length > 0, hint: 'Write a thesis on any company' },
      { id: 'all', label: 'Course complete', got: done === lessonTotal, hint: 'Complete all ' + lessonTotal + ' lessons' }
    ];

    var html = '<section class="hero-panel hero-panel-slim">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Progress</p>' +
        '<h1>What you have actually learned</h1>' +
        '<p class="lede">Stored in this browser only. Nothing is uploaded, and clearing site data resets it.</p>' +
      '</div>' +
    '</section>';

    html += '<div class="stat-grid">' +
      '<div class="stat-card"><span class="stat-num">' + done + '<span class="stat-den">/' + lessonTotal + '</span></span><span class="stat-label">lessons</span></div>' +
      '<div class="stat-card"><span class="stat-num">' + (quizTotal ? Math.round(quizRight / quizTotal * 100) + '%' : '—') + '</span><span class="stat-label">quiz accuracy</span></div>' +
      '<div class="stat-card"><span class="stat-num">' + Object.keys(journal).length + '</span><span class="stat-label">theses written</span></div>' +
      '<div class="stat-card"><span class="stat-num">' + (pUS.trades.length + pIN.trades.length) + '</span><span class="stat-label">virtual trades</span></div>' +
    '</div>';

    html += '<section class="panel">' +
      '<h2>Badges</h2>' +
      '<div class="badge-grid">' +
        badges.map(function (b) {
          return '<div class="badge' + (b.got ? ' got' : '') + '">' +
            '<span class="badge-dot"></span>' +
            '<strong>' + esc(b.label) + '</strong>' +
            '<span>' + esc(b.hint) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';

    html += '<section class="panel">' +
      '<h2>Your theses</h2>' +
      (Object.keys(journal).length ? Object.keys(journal).map(function (sym) {
        return '<div class="journal-entry">' +
          '<div class="journal-head"><a href="#/stock/' + esc(sym) + '"><strong>' + esc(sym) + '</strong></a>' +
          '<span class="muted tiny">' + new Date(journal[sym].at).toLocaleDateString() + '</span></div>' +
          '<p>' + esc(journal[sym].note) + '</p>' +
        '</div>';
      }).join('') : '<p class="empty">No theses yet. Open any company and write one — it takes two minutes and is the single best habit in this app.</p>') +
    '</section>';

    html += '<section class="panel">' +
      '<h2>Practice accounts</h2>' +
      '<div class="two-col two-col-tight">' +
        [['US', pUS], ['IN', pIN]].map(function (pair) {
          var cur = currencyOf(pair[0]);
          var p = pair[1];
          return '<div class="acct"><h3>' + (pair[0] === 'IN' ? 'India' : 'United States') + '</h3>' +
            '<dl class="watch-stats">' +
              '<div><dt>Value</dt><dd>' + money(p.total, cur, { compact: true }) + '</dd></div>' +
              '<div><dt>Cash</dt><dd>' + money(p.cash, cur, { compact: true }) + '</dd></div>' +
              '<div><dt>Holdings</dt><dd>' + p.rows.length + '</dd></div>' +
              '<div><dt>P&amp;L</dt><dd class="' + signClass(p.grown) + '">' + (p.grown >= 0 ? '+' : '') + money(p.grown, cur, { compact: true }) + '</dd></div>' +
            '</dl>' +
            '<a class="btn btn-sm btn-outline" href="#/practice">Open practice →</a>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';

    return html;
  }

  /* ================================================================ */
  /* View: Settings                                                   */
  /* ================================================================ */

  function viewSettings() {
    var provider = TMMarket.describeProvider(settings.provider);

    var html = '<section class="hero-panel hero-panel-slim">' +
      '<div class="hero-copy">' +
        '<p class="kicker">Settings</p>' +
        '<h1>Data source</h1>' +
        '<p class="lede">By default everything runs on bundled sample data. Add a key only if you want live quotes and understand the trade-offs below.</p>' +
      '</div>' +
    '</section>';

    html += '<section class="panel panel-accent">' +
      '<h2>Read this before adding a key</h2>' +
      '<ul class="warn-list">' +
        '<li>A key entered here is stored in your browser\'s localStorage in plain text. That is acceptable for personal use on your own device and <strong>not</strong> acceptable for a public deployment.</li>' +
        '<li>Never commit a key to a Git repository, and never paste one into a shared machine.</li>' +
        '<li>Free tiers are rate-limited. This app caches quotes for 60 seconds and fetches at most 12 symbols per screen to stay inside typical limits.</li>' +
        '<li>Live quotes change only the price. Fundamentals stay as sample values, so scores remain practice scores.</li>' +
        '<li>If a request fails — bad key, rate limit, blocked host — the app falls back to sample data and shows you the error rather than pretending.</li>' +
      '</ul>' +
    '</section>';

    html += '<section class="panel">' +
      '<h2>Provider</h2>' +
      '<form data-action="save-settings">' +
        '<div class="provider-grid">' +
          Object.keys(TMMarket.PROVIDERS).map(function (k) {
            var p = TMMarket.PROVIDERS[k];
            return '<label class="provider-option' + (settings.provider === k ? ' on' : '') + '">' +
              '<input type="radio" name="provider" value="' + k + '"' + (settings.provider === k ? ' checked' : '') + '>' +
              '<strong>' + esc(p.label) + '</strong>' +
              '<span>' + esc(p.note) + '</span>' +
              (p.signup ? '<a href="' + esc(p.signup) + '" target="_blank" rel="noopener">Get a key ↗</a>' : '') +
            '</label>';
          }).join('') +
        '</div>' +
        '<label class="field"><span>API key</span>' +
          '<input type="password" name="key" autocomplete="off" spellcheck="false" ' +
            'placeholder="Paste your key — stored locally only" value="' + esc(settings.key || '') + '">' +
        '</label>' +
        '<div class="form-row">' +
          '<button class="btn btn-primary" type="submit">Save settings</button>' +
          '<button class="btn btn-outline" type="button" data-action="clear-key">Remove key</button>' +
          '<button class="btn btn-quiet" type="button" data-action="test-quote">Test a live quote</button>' +
        '</div>' +
        '<p class="muted tiny">' + esc(provider.note) + '</p>' +
        '<div id="quote-test" class="quote-test"></div>' +
      '</form>' +
    '</section>';

    html += '<section class="panel">' +
      '<h2>Your data</h2>' +
      '<p class="muted small">Everything TickerMentor knows about you lives in this browser: watchlist, virtual portfolios, lesson progress and theses.</p>' +
      '<div class="form-row">' +
        '<button class="btn btn-outline btn-sm" data-action="wipe">Erase all my data</button>' +
        '<span class="muted tiny">Watchlist, progress, theses and both practice accounts. Cannot be undone.</span>' +
      '</div>' +
    '</section>';

    return html;
  }

  /* ================================================================ */
  /* Shell + router                                                   */
  /* ================================================================ */

  var NAV = [
    ['#/discover', 'Discover', 'search'],
    ['#/watchlist', 'Watchlist', 'star'],
    ['#/learn', 'Learn', 'book'],
    ['#/practice', 'Practice', 'chart'],
    ['#/progress', 'Progress', 'trophy']
  ];

  function icon(name) {
    var paths = {
      search: '<circle cx="7.5" cy="7.5" r="4.5"/><path d="M11 11l3.5 3.5"/>',
      star: '<path d="M7.5 2.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6L2.3 6.3l3.6-.5z"/>',
      book: '<path d="M3 3.5h4a2 2 0 012 2v7a2 2 0 00-2-2H3zM12 3.5H8a2 2 0 00-2 2v7a2 2 0 012-2h4z"/>',
      chart: '<path d="M2.5 12.5V6M6 12.5V3M9.5 12.5V8M13 12.5V5"/>',
      trophy: '<path d="M5 2.5h5v3a2.5 2.5 0 01-5 0zM3 3.5h2M10 3.5h2M7.5 8v3M5 13.5h5"/>',
      gear: '<circle cx="7.5" cy="7.5" r="2"/><path d="M7.5 1.5v1.6M7.5 11.9v1.6M1.5 7.5h1.6M11.9 7.5h1.6M3.3 3.3l1.1 1.1M10.6 10.6l1.1 1.1M11.7 3.3l-1.1 1.1M4.4 10.6l-1.1 1.1"/>',
      menu: '<path d="M2.5 4h10M2.5 7.5h10M2.5 11h10"/>'
    };
    return '<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.3" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
  }

  function renderShell(route) {
    return '' +
      '<header class="app-header">' +
        '<a class="brand" href="#/discover">' +
          '<span class="brand-mark">' + icon('chart') + '</span>' +
          '<span class="brand-name">Ticker<strong>Mentor</strong></span>' +
        '</a>' +
        '<nav class="app-nav">' +
          NAV.map(function (n) {
            var active = route.indexOf(n[0].replace('#', '')) === 0;
            return '<a href="' + n[0] + '"' + (active ? ' class="on"' : '') + '>' +
              icon(n[2]) + '<span>' + n[1] + '</span></a>';
          }).join('') +
        '</nav>' +
        '<div class="app-header-right">' +
          '<a class="icon-link" href="#/settings" title="Settings" aria-label="Settings">' + icon('gear') + '</a>' +
          '<span class="mode-chip ' + (settings.provider === 'sample' || !settings.key ? 'practice' : 'live') + '">' +
            (settings.provider === 'sample' || !settings.key ? 'Practice data' : 'Live: ' + esc(TMMarket.describeProvider(settings.provider).label)) +
          '</span>' +
        '</div>' +
      '</header>' +
      '<main class="app-main">' +
        '<div class="wrap" id="view"></div>' +
      '</main>' +
      '<footer class="app-footer">' +
        '<div class="wrap footer-inner">' +
          '<p><strong>TickerMentor</strong> is an educational tool. It is not an investment adviser, does not provide investment advice, ' +
          'and makes no forecast of future prices or returns. Data may be sample data — check the badge on each screen.</p>' +
          '<p class="tiny">Built as a learning project. Investing carries real risk, including loss of capital. Consider your own circumstances, and consult a licensed adviser where appropriate.</p>' +
        '</div>' +
      '</footer>';
  }

  function parseRoute() {
    var hash = location.hash.replace(/^#/, '') || '/discover';
    return hash.split('/').filter(Boolean);
  }

  function render() {
    var key = quoteSettingsKey(settings);
    if (key !== lastQuoteKey) {
      lastQuoteKey = key;
      quotes = {};
      quoteBusy = {};
      TMMarket.clearCache();
    }

    var seg = parseRoute();
    var app = $('#app');
    var route = '/' + seg.join('/');
    var body;

    switch (seg[0]) {
      case 'stock':
        body = viewStock(decodeURIComponent(seg[1] || ''));
        break;
      case 'compare':
        body = viewCompare(decodeURIComponent(seg[1] || ''), decodeURIComponent(seg[2] || ''));
        break;
      case 'learn':
        body = viewLearn();
        break;
      case 'lesson':
        body = viewLesson(decodeURIComponent(seg[1] || ''));
        break;
      case 'practice':
        body = viewPractice();
        break;
      case 'watchlist':
        body = viewWatchlist();
        break;
      case 'progress':
        body = viewProgress();
        break;
      case 'settings':
        body = viewSettings();
        break;
      default:
        body = viewDiscover();
    }

    app.innerHTML = renderShell(route);
    $('#view').innerHTML = body;
    document.title = 'TickerMentor — ' + (
      seg[0] === 'stock' ? (seg[1] || 'Company') :
      seg[0] === 'lesson' ? 'Lesson' :
      (seg[0] || 'discover').replace(/^\w/, function (c) { return c.toUpperCase(); })
    );
  }

  /* ================================================================ */
  /* Events                                                           */
  /* ================================================================ */

  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');

    switch (action) {
      case 'set-profile': {
        settings = TMMarket.saveSettings({ profile: target.getAttribute('data-value') });
        render();
        break;
      }
      case 'set-market': {
        settings = TMMarket.saveSettings({ market: target.getAttribute('data-value') });
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      case 'toggle-watch': {
        var sym = target.getAttribute('data-symbol');
        var i = watchlist.indexOf(sym);
        if (i >= 0) watchlist.splice(i, 1); else watchlist.push(sym);
        write(KEYS.watchlist, watchlist);
        render();
        break;
      }
      case 'complete-lesson': {
        var id = target.getAttribute('data-id');
        progress.lessons[id] = progress.lessons[id] ? undefined : true;
        if (!progress.lessons[id]) delete progress.lessons[id];
        write(KEYS.progress, progress);
        render();
        break;
      }
      case 'quiz': {
        var lessonId = target.getAttribute('data-lesson');
        var qi = target.getAttribute('data-q');
        var oi = parseInt(target.getAttribute('data-opt'), 10);
        var lesson = TM_LESSONS.filter(function (l) { return l.id === lessonId; })[0];
        if (!lesson) break;
        progress.quiz[lessonId] = progress.quiz[lessonId] || {};
        progress.quiz[lessonId][qi] = { opt: oi, correct: oi === lesson.quiz[parseInt(qi, 10)].answer };
        write(KEYS.progress, progress);
        render();
        break;
      }
      case 'reset-sim': {
        var mk = target.getAttribute('data-market');
        if (!window.confirm('Reset the ' + mk + ' practice account? This clears holdings and history.')) break;
        sim[mk] = freshSim()[mk];
        write(KEYS.sim, sim);
        render();
        break;
      }
      case 'clear-key': {
        settings = TMMarket.saveSettings({ key: '', provider: 'sample' });
        quotes = {};
        render();
        break;
      }
      case 'test-quote': {
        var box = $('#quote-test');
        if (box) box.innerHTML = '<p class="muted small">Testing…</p>';
        var probe = dataset().filter(function (s) { return s.market === (settings.market === 'ALL' ? 'US' : settings.market); })[0];
        TMMarket.quote(probe, settings).then(function (res) {
          if (!box) return;
          box.innerHTML = res.status === 'live'
            ? '<p class="good small">✓ Live quote worked: ' + esc(probe.symbol) + ' at ' +
              money(res.quote.price, probe.currency) + ' via ' + esc(res.providerLabel) + '.</p>'
            : '<p class="warn small">✗ ' + esc(res.error || 'Provider returned sample data. Add a key first.') + '</p>';
        });
        break;
      }
      case 'wipe': {
        if (!window.confirm('Erase everything TickerMentor has stored in this browser?')) break;
        [KEYS.watchlist, KEYS.sim, KEYS.progress, KEYS.journal, 'tm.settings'].forEach(function (k) {
          try { localStorage.removeItem(k); } catch (err) { /* ignore */ }
        });
        location.hash = '#/discover';
        location.reload();
        break;
      }
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-action]');
    if (!form) return;
    e.preventDefault();
    var action = form.getAttribute('data-action');

    if (action === 'trade') {
      var market = form.getAttribute('data-market');
      var fd = new FormData(form);
      var symbol = fd.get('symbol');
      var qty = parseInt(fd.get('qty'), 10);
      var side = fd.get('side');
      var stock = findStock(symbol);

      if (!stock || !qty || qty < 1) return;
      var book = sim[market];
      var price = stock.price;
      var cur = stock.currency;

      if (side === 'buy') {
        var cost = price * qty;
        if (cost > book.cash) {
          window.alert('Not enough virtual cash. This order costs ' + money(cost, cur) +
            ' and you have ' + money(book.cash, cur) + '.');
          return;
        }
        book.cash -= cost;
        var existing = book.positions[symbol];
        if (existing) {
          var totalQty = existing.qty + qty;
          existing.avgCost = ((existing.avgCost * existing.qty) + cost) / totalQty;
          existing.qty = totalQty;
        } else {
          book.positions[symbol] = { qty: qty, avgCost: price };
        }
      } else {
        var pos = book.positions[symbol];
        if (!pos || pos.qty < qty) {
          window.alert('You do not own ' + qty + ' shares of ' + symbol + '.');
          return;
        }
        book.cash += price * qty;
        pos.qty -= qty;
        if (pos.qty === 0) delete book.positions[symbol];
      }

      book.trades.push({ at: Date.now(), symbol: symbol, side: side, qty: qty, price: price });
      write(KEYS.sim, sim);
      render();
    }

    if (action === 'save-journal') {
      var sym = form.getAttribute('data-symbol');
      var note = (new FormData(form).get('note') || '').trim();
      if (!note) { delete journal[sym]; } else { journal[sym] = { note: note, at: Date.now() }; }
      write(KEYS.journal, journal);
      render();
    }

    if (action === 'save-settings') {
      var fd2 = new FormData(form);
      settings = TMMarket.saveSettings({
        provider: fd2.get('provider') || 'sample',
        key: (fd2.get('key') || '').trim()
      });
      quotes = {};
      render();
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var action = t.getAttribute('data-action');

    if (action === 'set-profile') {
      settings = TMMarket.saveSettings({ profile: t.value });
      render();
    }
    if (action === 'set-sector') {
      settings.sector = t.value;
      settings = TMMarket.saveSettings({ sector: t.value });
      render();
    }
    if (action === 'compare-a') {
      location.hash = '#/compare/' + t.value + '/' + (parseRoute()[2] || '');
    }
    if (action === 'compare-b') {
      if (t.value) location.hash = '#/compare/' + parseRoute()[1] + '/' + t.value;
    }
    if (action === 'set-provider') {
      settings = TMMarket.saveSettings({ provider: t.value });
      render();
    }
  });

  var searchTimer = null;
  document.addEventListener('input', function (e) {
    var t = e.target.closest('[data-action="search"]');
    if (!t) return;
    clearTimeout(searchTimer);
    var value = t.value;
    searchTimer = setTimeout(function () {
      settings.search = value;
      var pos = t.selectionStart;
      render();
      var again = $('[data-action="search"]');
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    }, 220);
  });

  window.addEventListener('hashchange', function () {
    render();
    window.scrollTo({ top: 0 });
  });

  /* Boot */
  render();
})();
