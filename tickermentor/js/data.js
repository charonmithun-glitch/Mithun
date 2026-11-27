/* ==========================================================================
   TickerMentor — reference dataset
   --------------------------------------------------------------------------
   These figures are ILLUSTRATIVE SAMPLE DATA bundled so the app is usable
   offline and before an API key is added. They are plausible but not real
   market data, and they are not current. Every screen that renders them
   shows a "Sample data" badge. Add an API key in Settings to pull live
   quotes (fundamentals remain sample values unless the provider supplies
   them).

   Schema — one object per company:
     symbol, name, market ('US' | 'IN'), sector, price, currency
     pe       trailing price/earnings
     pb       price/book
     roe      return on equity, %
     de       debt/equity (ratio, not %)
     rev      revenue growth, % y/y
     profit   profit growth, % y/y
     div      dividend yield, %
     margin   operating margin, %
     mcap     market cap in local billions
     beta     5y beta vs market
     vol      1y annualised volatility, %
     m1       return, last 1 month, %
     m3       return, last 3 months, %
     y1       return, last 12 months, %
     dd       max drawdown, last 12 months, % (negative)
     about    one-line plain-English description for beginners
   ========================================================================== */

window.TM_SAMPLE_DATA = [
  /* ------------------------------- United States ------------------------- */
  { symbol:'AAPL', name:'Apple Inc.', market:'US', sector:'Technology', price:232.40, currency:'USD',
    pe:35.2, pb:56.1, roe:160, de:1.5, rev:6, profit:8, div:0.45, margin:31, mcap:3520, beta:1.2, vol:22, m1:2, m3:6, y1:18, dd:-18,
    about:'Makes the iPhone, Mac and services like iCloud. Enormously profitable, priced for near-perfection.' },
  { symbol:'MSFT', name:'Microsoft Corp.', market:'US', sector:'Technology', price:428.10, currency:'USD',
    pe:34.8, pb:12.4, roe:35, de:0.4, rev:15, profit:13, div:0.75, margin:44, mcap:3180, beta:0.9, vol:20, m1:3, m3:9, y1:22, dd:-14,
    about:'Windows, Office and the Azure cloud business. A steadier way to own enterprise software.' },
  { symbol:'NVDA', name:'NVIDIA Corp.', market:'US', sector:'Technology', price:138.20, currency:'USD',
    pe:52.0, pb:48.0, roe:91, de:0.2, rev:94, profit:110, div:0.03, margin:62, mcap:3390, beta:1.7, vol:48, m1:8, m3:19, y1:64, dd:-32,
    about:'Designs the chips that train AI models. Explosive growth paired with violent price swings.' },
  { symbol:'GOOGL', name:'Alphabet Inc.', market:'US', sector:'Communication', price:176.30, currency:'USD',
    pe:23.4, pb:6.8, roe:31, de:0.1, rev:14, profit:28, div:0.45, margin:32, mcap:2140, beta:1.0, vol:26, m1:1, m3:4, y1:14, dd:-24,
    about:'Google Search, YouTube and Google Cloud. Huge cash generation, cheap relative to peers.' },
  { symbol:'AMZN', name:'Amazon.com Inc.', market:'US', sector:'Consumer', price:214.60, currency:'USD',
    pe:41.2, pb:8.1, roe:22, de:0.6, rev:11, profit:38, div:0, margin:10, mcap:2240, beta:1.2, vol:29, m1:4, m3:11, y1:27, dd:-21,
    about:'Online retail plus AWS, the cloud business that supplies most of its profit.' },
  { symbol:'META', name:'Meta Platforms', market:'US', sector:'Communication', price:585.40, currency:'USD',
    pe:27.6, pb:9.2, roe:36, de:0.3, rev:19, profit:35, div:0.35, margin:38, mcap:1480, beta:1.3, vol:34, m1:5, m3:14, y1:41, dd:-27,
    about:'Facebook, Instagram, WhatsApp, plus heavy spending on AI and AR glasses.' },
  { symbol:'TSLA', name:'Tesla, Inc.', market:'US', sector:'Consumer', price:344.90, currency:'USD',
    pe:96.0, pb:15.4, roe:20, de:0.2, rev:2, profit:-22, div:0, margin:9, mcap:1100, beta:2.3, vol:58, m1:-6, m3:12, y1:9, dd:-42,
    about:'Electric vehicles and energy storage, priced like a technology company rather than a carmaker.' },
  { symbol:'JNJ', name:'Johnson & Johnson', market:'US', sector:'Healthcare', price:154.20, currency:'USD',
    pe:15.1, pb:5.2, roe:24, de:0.5, rev:5, profit:8, div:3.1, margin:26, mcap:372, beta:0.55, vol:16, m1:-1, m3:2, y1:-4, dd:-13,
    about:'Pharmaceuticals and medical devices. The archetype of a slow, boring, dividend-paying compounder.' },
  { symbol:'JPM', name:'JPMorgan Chase', market:'US', sector:'Financials', price:243.10, currency:'USD',
    pe:13.4, pb:2.0, roe:17, de:1.2, rev:9, profit:3, div:2.1, margin:38, mcap:690, beta:1.1, vol:21, m1:2, m3:8, y1:26, dd:-15,
    about:'The largest US bank. Profits rise and fall with interest rates and the economy.' },
  { symbol:'V', name:'Visa Inc.', market:'US', sector:'Financials', price:311.80, currency:'USD',
    pe:31.0, pb:14.2, roe:48, de:0.6, rev:10, profit:12, div:0.75, margin:54, mcap:610, beta:0.95, vol:17, m1:1, m3:5, y1:16, dd:-11,
    about:'Collects a small fee on a huge share of the world\'s card payments. Very high margins.' },
  { symbol:'KO', name:'Coca-Cola Co.', market:'US', sector:'Consumer', price:63.10, currency:'USD',
    pe:24.6, pb:10.1, roe:41, de:1.6, rev:4, profit:5, div:3.0, margin:24, mcap:272, beta:0.6, vol:14, m1:0, m3:-2, y1:3, dd:-12,
    about:'Sells syrup and marketing more than it sells drinks. Consistent dividends for decades.' },
  { symbol:'PG', name:'Procter & Gamble', market:'US', sector:'Consumer', price:171.40, currency:'USD',
    pe:26.8, pb:7.9, roe:32, de:0.7, rev:3, profit:4, div:2.4, margin:22, mcap:403, beta:0.45, vol:13, m1:1, m3:3, y1:8, dd:-9,
    about:'Tide, Pampers, Gillette. Buys back stock and raises its dividend every year.' },
  { symbol:'XOM', name:'Exxon Mobil', market:'US', sector:'Energy', price:118.20, currency:'USD',
    pe:14.2, pb:1.9, roe:14, de:0.2, rev:1, profit:-8, div:3.3, margin:13, mcap:520, beta:0.85, vol:24, m1:-3, m3:-1, y1:2, dd:-20,
    about:'Oil and gas. Earnings swing hard with the price of crude, so the dividend matters more than growth.' },
  { symbol:'WMT', name:'Walmart Inc.', market:'US', sector:'Consumer', price:91.20, currency:'USD',
    pe:39.0, pb:7.4, roe:22, de:0.7, rev:6, profit:9, div:1.0, margin:4, mcap:733, beta:0.55, vol:17, m1:3, m3:7, y1:34, dd:-10,
    about:'The world\'s biggest retailer. Razor-thin margins, but enormous and stable volume.' },
  { symbol:'COST', name:'Costco Wholesale', market:'US', sector:'Consumer', price:912.40, currency:'USD',
    pe:53.2, pb:17.1, roe:31, de:0.4, rev:8, profit:12, div:0.5, margin:4, mcap:404, beta:0.8, vol:19, m1:2, m3:6, y1:38, dd:-12,
    about:'Membership warehouse club. Most of the profit comes from membership fees, not groceries.' },
  { symbol:'UNH', name:'UnitedHealth Group', market:'US', sector:'Healthcare', price:577.30, currency:'USD',
    pe:20.4, pb:4.6, roe:26, de:0.7, rev:8, profit:9, div:1.4, margin:8, mcap:531, beta:0.6, vol:25, m1:-4, m3:-8, y1:6, dd:-29,
    about:'The largest US health insurer, plus a fast-growing healthcare services arm.' },
  { symbol:'HD', name:'Home Depot', market:'US', sector:'Consumer', price:404.60, currency:'USD',
    pe:26.9, pb:60.0, roe:900, de:9.0, rev:4, profit:2, div:2.2, margin:13, mcap:401, beta:1.0, vol:20, m1:1, m3:4, y1:15, dd:-17,
    about:'Home improvement retail. Return on equity looks absurd because buybacks shrank the equity base.' },
  { symbol:'PEP', name:'PepsiCo', market:'US', sector:'Consumer', price:161.20, currency:'USD',
    pe:22.1, pb:12.0, roe:52, de:2.1, rev:2, profit:3, div:3.3, margin:13, mcap:222, beta:0.55, vol:15, m1:-2, m3:-4, y1:-3, dd:-18,
    about:'Frito-Lay snacks are the profit engine; Pepsi is the delivery vehicle.' },
  { symbol:'DIS', name:'Walt Disney Co.', market:'US', sector:'Communication', price:112.40, currency:'USD',
    pe:36.5, pb:1.9, roe:5, de:0.5, rev:4, profit:14, div:0.8, margin:12, mcap:204, beta:1.15, vol:27, m1:2, m3:9, y1:24, dd:-25,
    about:'Parks, films, and the streaming business that finally turned profitable.' },
  { symbol:'NFLX', name:'Netflix, Inc.', market:'US', sector:'Communication', price:872.30, currency:'USD',
    pe:45.6, pb:16.8, roe:36, de:0.7, rev:15, profit:41, div:0, margin:27, mcap:373, beta:1.3, vol:33, m1:6, m3:17, y1:52, dd:-19,
    about:'Streaming subscriptions worldwide. Now growing profit faster than it grows subscribers.' },
  { symbol:'AMD', name:'Advanced Micro Devices', market:'US', sector:'Technology', price:137.40, currency:'USD',
    pe:44.0, pb:4.1, roe:3, de:0.05, rev:18, profit:24, div:0, margin:22, mcap:222, beta:1.7, vol:46, m1:-5, m3:2, y1:-8, dd:-38,
    about:'Designs CPUs and AI accelerators to compete with Intel and NVIDIA. High hopes, low current profit.' },
  { symbol:'INTC', name:'Intel Corp.', market:'US', sector:'Technology', price:24.10, currency:'USD',
    pe:0, pb:0.8, roe:-4, de:0.5, rev:-3, profit:-120, div:0, margin:-2, mcap:103, beta:1.0, vol:52, m1:-9, m3:-14, y1:-42, dd:-58,
    about:'A fallen chip champion trying to rebuild a manufacturing business. A classic "cheap for a reason" case study.' },
  { symbol:'BA', name:'Boeing Co.', market:'US', sector:'Industrials', price:153.20, currency:'USD',
    pe:0, pb:-6.0, roe:0, de:-4.0, rev:-8, profit:0, div:0, margin:-6, mcap:94, beta:1.5, vol:38, m1:-4, m3:-7, y1:-16, dd:-34,
    about:'Aircraft maker in a multi-year turnaround. Negative book value — a good example of why one ratio never tells the story.' },
  { symbol:'PFE', name:'Pfizer Inc.', market:'US', sector:'Healthcare', price:25.60, currency:'USD',
    pe:17.8, pb:1.7, roe:9, de:0.7, rev:2, profit:-8, div:6.4, margin:18, mcap:145, beta:0.6, vol:23, m1:0, m3:-3, y1:-9, dd:-24,
    about:'Large pharma recovering from the post-pandemic drop in sales. Very high dividend yield for a reason.' },

  /* --------------------------------- India ------------------------------- */
  { symbol:'RELIANCE', name:'Reliance Industries', market:'IN', sector:'Energy', price:1282.50, currency:'INR',
    pe:24.8, pb:2.1, roe:9, de:0.4, rev:8, profit:6, div:0.35, margin:15, mcap:17350, beta:1.05, vol:22, m1:1, m3:3, y1:9, dd:-19,
    about:'Oil-to-chemicals, telecom (Jio) and retail all under one roof. A conglomerate, so read segment by segment.' },
  { symbol:'TCS', name:'Tata Consultancy Services', market:'IN', sector:'Technology', price:4180.00, currency:'INR',
    pe:29.4, pb:15.2, roe:52, de:0.0, rev:6, profit:9, div:1.6, margin:25, mcap:15130, beta:0.7, vol:17, m1:2, m3:5, y1:14, dd:-13,
    about:'India\'s largest IT services firm. Huge cash returns, steady growth, exposed to Western tech budgets.' },
  { symbol:'INFY', name:'Infosys Ltd.', market:'IN', sector:'Technology', price:1862.00, currency:'INR',
    pe:27.1, pb:8.9, roe:32, de:0.0, rev:5, profit:7, div:2.2, margin:21, mcap:7740, beta:0.75, vol:19, m1:1, m3:3, y1:11, dd:-15,
    about:'Software services and consulting. Similar story to TCS with slightly more volatility.' },
  { symbol:'HDFCBANK', name:'HDFC Bank', market:'IN', sector:'Financials', price:1712.40, currency:'INR',
    pe:19.2, pb:2.9, roe:17, de:0.0, rev:15, profit:12, div:1.1, margin:0, mcap:13010, beta:0.95, vol:20, m1:1, m3:4, y1:6, dd:-17,
    about:'India\'s largest private bank. Loan growth drives profit; bad loans are the main risk to watch.' },
  { symbol:'ICICIBANK', name:'ICICI Bank', market:'IN', sector:'Financials', price:1298.70, currency:'INR',
    pe:18.4, pb:3.3, roe:18, de:0.0, rev:17, profit:16, div:0.8, margin:0, mcap:9140, beta:1.0, vol:21, m1:3, m3:7, y1:19, dd:-14,
    about:'Private bank with strong deposit franchise and improving asset quality.' },
  { symbol:'ITC', name:'ITC Ltd.', market:'IN', sector:'Consumer', price:462.30, currency:'INR',
    pe:25.8, pb:7.4, roe:29, de:0.0, rev:7, profit:5, div:3.2, margin:24, mcap:5780, beta:0.6, vol:16, m1:-1, m3:2, y1:4, dd:-12,
    about:'Cigarettes fund dividends; hotels, packaged foods and paper are the grown-up diversification story.' },
  { symbol:'HINDUNILVR', name:'Hindustan Unilever', market:'IN', sector:'Consumer', price:2380.00, currency:'INR',
    pe:52.4, pb:9.8, roe:20, de:0.0, rev:2, profit:3, div:1.7, margin:23, mcap:5590, beta:0.5, vol:15, m1:-2, m3:-5, y1:-6, dd:-21,
    about:'Soaps, shampoos and tea across India. Excellent business, but priced for a rebound that is slow to arrive.' },
  { symbol:'SBIN', name:'State Bank of India', market:'IN', sector:'Financials', price:812.60, currency:'INR',
    pe:10.6, pb:1.7, roe:17, de:0.0, rev:12, profit:20, div:1.7, margin:0, mcap:7250, beta:1.2, vol:24, m1:2, m3:6, y1:28, dd:-16,
    about:'India\'s largest public sector bank. Cheap on almost every measure, with government ownership attached.' },
  { symbol:'BHARTIARTL', name:'Bharti Airtel', market:'IN', sector:'Communication', price:1584.20, currency:'INR',
    pe:63.0, pb:9.4, roe:16, de:1.6, rev:12, profit:45, div:0.5, margin:24, mcap:9450, beta:0.9, vol:21, m1:4, m3:10, y1:44, dd:-13,
    about:'Telecom plus Africa operations. Prices have risen after years of brutal competition.' },
  { symbol:'LT', name:'Larsen & Toubro', market:'IN', sector:'Industrials', price:3620.00, currency:'INR',
    pe:33.6, pb:5.2, roe:15, de:0.9, rev:15, profit:18, div:0.9, margin:11, mcap:4980, beta:1.15, vol:23, m1:3, m3:8, y1:22, dd:-18,
    about:'Builds infrastructure — metros, refineries, defence. Order book is the number that matters.' },
  { symbol:'ASIANPAINT', name:'Asian Paints', market:'IN', sector:'Consumer', price:2280.00, currency:'INR',
    pe:48.2, pb:11.6, roe:24, de:0.1, rev:1, profit:-18, div:1.4, margin:14, mcap:2185, beta:0.7, vol:20, m1:-3, m3:-9, y1:-24, dd:-33,
    about:'Paints and home decor. A premium-priced name currently fighting new competition and weak demand.' },
  { symbol:'MARUTI', name:'Maruti Suzuki India', market:'IN', sector:'Consumer', price:11240.00, currency:'INR',
    pe:26.4, pb:4.4, roe:17, de:0.0, rev:9, profit:11, div:1.1, margin:9, mcap:3530, beta:0.9, vol:22, m1:2, m3:5, y1:12, dd:-16,
    about:'India\'s biggest carmaker. Volume growth plus a steady shift toward pricier SUV models.' },
  { symbol:'SUNPHARMA', name:'Sun Pharmaceutical', market:'IN', sector:'Healthcare', price:1792.00, currency:'INR',
    pe:38.2, pb:6.1, roe:17, de:0.1, rev:10, profit:16, div:0.8, margin:27, mcap:4300, beta:0.7, vol:20, m1:1, m3:4, y1:17, dd:-15,
    about:'India\'s largest drugmaker, with a large US generics and specialty business.' },
  { symbol:'TATAMOTORS', name:'Tata Motors', market:'IN', sector:'Consumer', price:742.30, currency:'INR',
    pe:9.8, pb:2.9, roe:34, de:0.7, rev:10, profit:22, div:0.4, margin:9, mcap:2730, beta:1.5, vol:39, m1:-5, m3:2, y1:16, dd:-31,
    about:'Cars in India plus Jaguar Land Rover abroad. Cheap on earnings, but earnings are cyclical.' },
  { symbol:'WIPRO', name:'Wipro Ltd.', market:'IN', sector:'Technology', price:292.40, currency:'INR',
    pe:22.6, pb:3.6, roe:16, de:0.1, rev:-1, profit:4, div:2.0, margin:17, mcap:1530, beta:0.85, vol:21, m1:-1, m3:-2, y1:5, dd:-20,
    about:'IT services growth laggard. Cheaper than TCS, for defensible reasons.' },
  { symbol:'ADANIPORTS', name:'Adani Ports & SEZ', market:'IN', sector:'Industrials', price:1218.00, currency:'INR',
    pe:27.4, pb:4.2, roe:15, de:1.3, rev:16, profit:21, div:0.5, margin:38, mcap:2630, beta:1.35, vol:34, m1:4, m3:9, y1:12, dd:-28,
    about:'Runs ports that handle a large share of India\'s cargo. High leverage is part of the story.' }
];

/* Sector benchmarks, used for context in explanations (not for scoring —
   scoring derives medians from whatever dataset is loaded). */
window.TM_SECTOR_NOTES = {
  Technology:     'Software and semiconductors. Growth is the prize; valuation and cycles are the risk.',
  Communication:  'Internet advertising, media and telecom. Usually steady cash with a few very large bets.',
  Consumer:       'Things people buy repeatedly, plus discretionary purchases that suffer in downturns.',
  Financials:     'Banks, insurers and payment networks. Profits track interest rates and credit quality.',
  Healthcare:     'Drugs and devices. Regulated pricing, long R&D cycles, slow but durable demand.',
  Industrials:    'Machinery, transport, defence and infrastructure. Cyclical, order-book driven.',
  Energy:         'Oil, gas and increasingly renewables. Earnings move with commodity prices.'
};
