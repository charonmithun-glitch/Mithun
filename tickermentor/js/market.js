/* ==========================================================================
   TickerMentor — market data adapters
   --------------------------------------------------------------------------
   One interface, several providers. Everything degrades gracefully: if no
   key is set, or the network is blocked, or the provider rate-limits you,
   the app falls back to the bundled sample dataset and says so on screen.

   IMPORTANT: an API key typed into this app lives in localStorage in this
   browser. That is fine for personal use on your own machine and is NOT
   safe for anything public. Never ship a key in a hosted page, and never
   commit one to a repository.

   Providers, and what each actually gives you:
     sample       Bundled illustrative data. No key, no network.
     finnhub      Real-time US quotes; NSE quotes via the "NSE:" prefix.
     twelvedata   Real-time/delayed quotes for US and NSE with exchange=.
     alphavantage Free-tier quotes, heavily rate-limited (25 req/day).
   Fundamentals (P/E, ROE, debt and so on) stay as the bundled sample values
   regardless of provider — none of these free tiers return them cheaply,
   and silently mixing live price with stale fundamentals would be worse
   than being explicit about it.
   ========================================================================== */

(function () {
  'use strict';

  var CACHE_TTL = 60 * 1000;
  var TIMEOUT = 9000;
  var cache = {};

  var PROVIDERS = {
    sample: {
      label: 'Sample data',
      needsKey: false,
      note: 'Bundled illustrative figures. Nothing here is live or current.'
    },
    finnhub: {
      label: 'Finnhub',
      needsKey: true,
      signup: 'https://finnhub.io/register',
      note: 'US quotes work directly. For NSE stocks the symbol is prefixed automatically.'
    },
    twelvedata: {
      label: 'Twelve Data',
      needsKey: true,
      signup: 'https://twelvedata.com/pricing',
      note: 'Supports both US and NSE. Free tier is rate-limited but fine for a handful of symbols.'
    },
    alphavantage: {
      label: 'Alpha Vantage',
      needsKey: true,
      signup: 'https://www.alphavantage.co/support/#api-key',
      note: 'Free tier allows roughly 25 requests per day. Use it sparingly.'
    }
  };

  var DEFAULT_SETTINGS = {
    provider: 'sample',
    key: '',
    profile: 'balanced',
    market: 'US'
  };

  /* ---------------------------------------------------------------- */
  /* Settings                                                          */
  /* ---------------------------------------------------------------- */

  function loadSettings() {
    var out = {};
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) { out[k] = DEFAULT_SETTINGS[k]; });
    try {
      var raw = localStorage.getItem('tm.settings');
      if (raw) {
        var parsed = JSON.parse(raw);
        Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
          if (parsed[k] !== undefined && parsed[k] !== null) out[k] = parsed[k];
        });
      }
    } catch (e) { /* private mode or corrupt value — use defaults */ }
    if (!PROVIDERS[out.provider]) out.provider = 'sample';
    return out;
  }

  function saveSettings(next) {
    var merged = Object.assign(loadSettings(), next || {});
    try { localStorage.setItem('tm.settings', JSON.stringify(merged)); } catch (e) { /* ignore */ }
    return merged;
  }

  /* ---------------------------------------------------------------- */
  /* Fetch helper                                                      */
  /* ---------------------------------------------------------------- */

  function getJSON(url) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT);

    return fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ' from ' + new URL(url).hostname);
        }
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        return data;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out after ' + (TIMEOUT / 1000) + 's');
        }
        if (err instanceof TypeError) {
          throw new Error('Network blocked or offline — the provider host is unreachable from here');
        }
        throw err;
      });
  }

  /* ---------------------------------------------------------------- */
  /* Provider adapters                                                 */
  /* ---------------------------------------------------------------- */

  var adapters = {
    finnhub: function (stock, key) {
      var symbol = stock.market === 'IN' ? 'NSE:' + stock.symbol : stock.symbol;
      return getJSON('https://finnhub.io/api/v1/quote?symbol=' +
                     encodeURIComponent(symbol) + '&token=' + encodeURIComponent(key))
        .then(function (d) {
          if (!d || !d.c) throw new Error('No quote returned (check the symbol or your key)');
          return { price: d.c, change: d.d, changePct: d.dp, previousClose: d.pc, asOf: d.t };
        });
    },

    twelvedata: function (stock, key) {
      var url = 'https://api.twelvedata.com/quote?symbol=' + encodeURIComponent(stock.symbol) +
                '&apikey=' + encodeURIComponent(key) +
                (stock.market === 'IN' ? '&exchange=NSE' : '');
      return getJSON(url).then(function (d) {
        if (d.status === 'error' || d.code >= 400) {
          throw new Error(d.message || 'Twelve Data rejected the request');
        }
        var price = parseFloat(d.close);
        if (!isFinite(price)) throw new Error('No price in the response');
        return {
          price: price,
          change: parseFloat(d.change),
          changePct: parseFloat(d.percent_change),
          previousClose: parseFloat(d.previous_close),
          asOf: Date.parse(d.datetime) || Date.now()
        };
      });
    },

    alphavantage: function (stock, key) {
      var symbol = stock.market === 'IN' ? stock.symbol + '.BSE' : stock.symbol;
      return getJSON('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' +
                     encodeURIComponent(symbol) + '&apikey=' + encodeURIComponent(key))
        .then(function (d) {
          if (d.Note) throw new Error('Rate limit hit — ' + d.Note);
          if (d.Information) throw new Error(d.Information);
          var q = d['Global Quote'] || {};
          var price = parseFloat(q['05. price']);
          if (!isFinite(price)) throw new Error('No quote returned (daily limit, or unknown symbol)');
          return {
            price: price,
            change: parseFloat(q['09. change']),
            changePct: parseFloat(String(q['10. change percent'] || '').replace('%', '')),
            previousClose: parseFloat(q['08. previous close']),
            asOf: Date.parse(q['07. latest trading day']) || Date.now()
          };
        });
    }
  };

  /* ---------------------------------------------------------------- */
  /* Quote API                                                         */
  /* ---------------------------------------------------------------- */

  /* Resolves with { status, quote, error }. Never rejects — callers want a
     status they can render, not an exception they must remember to catch. */
  function quote(stock, settings) {
    settings = settings || loadSettings();
    var provider = settings.provider;

    if (provider === 'sample' || !PROVIDERS[provider] || !settings.key) {
      return Promise.resolve({
        status: 'sample',
        quote: null,
        providerLabel: PROVIDERS.sample.label
      });
    }

    var cacheKey = provider + ':' + stock.market + ':' + stock.symbol;
    var hit = cache[cacheKey];
    if (hit && Date.now() - hit.at < CACHE_TTL) {
      return Promise.resolve(hit.result);
    }

    var run = adapters[provider];
    if (!run) {
      return Promise.resolve({ status: 'sample', quote: null, providerLabel: PROVIDERS.sample.label });
    }

    return run(stock, settings.key)
      .then(function (q) {
        var result = {
          status: 'live',
          quote: q,
          providerLabel: PROVIDERS[provider].label,
          fetchedAt: Date.now()
        };
        cache[cacheKey] = { at: Date.now(), result: result };
        return result;
      })
      .catch(function (err) {
        var result = {
          status: 'error',
          quote: null,
          providerLabel: PROVIDERS[provider].label,
          error: err.message || String(err)
        };
        /* Cache failures briefly so a broken key does not hammer the API. */
        cache[cacheKey] = { at: Date.now() - CACHE_TTL + 15000, result: result };
        return result;
      });
  }

  /* Merge a live quote over the sample record without mutating it. */
  function withQuote(stock, result) {
    if (!result || result.status !== 'live' || !result.quote) return stock;
    var q = result.quote;
    var copy = Object.assign({}, stock);
    copy.livePrice = q.price;
    copy.liveChange = isFinite(q.change) ? q.change : null;
    copy.liveChangePct = isFinite(q.changePct) ? q.changePct : null;
    copy.liveAsOf = q.asOf || null;
    copy.price = q.price;
    return copy;
  }

  function describeProvider(name) {
    return PROVIDERS[name] || PROVIDERS.sample;
  }

  /* Settings changes (new key, new provider) must invalidate cached
     results, including cached failures — otherwise correcting a typo in
     your key still shows the old error for the full failure TTL. */
  function clearCache() {
    cache = {};
  }

  window.TMMarket = {
    PROVIDERS: PROVIDERS,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    quote: quote,
    withQuote: withQuote,
    describeProvider: describeProvider,
    clearCache: clearCache
  };
})();
