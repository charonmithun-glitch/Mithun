/* ==========================================================================
   TickerMentor — learning content
   Four tracks, twenty-four short lessons. Written for someone who has never
   bought a share. Each lesson has a plain-language body, an optional worked
   example, and a two-question check so the lesson ends with recall rather
   than a scroll.
   ========================================================================== */

window.TM_LESSONS = [
  /* ---------------------------- Foundations ---------------------------- */
  {
    id: 'f1', track: 'Foundations', minutes: 4,
    title: 'What a share actually is',
    body: [
      'A company is a business. A share is a small, legally recognised slice of the ownership of that business. If a company has issued one crore shares and you own one hundred of them, you own one ten-thousandth of the company.',
      'That ownership is not abstract. It entitles you to a proportional claim on the company\'s profits, on any assets left after debts are paid, and usually a vote on major decisions. What it does not entitle you to is your money back. You cannot hand the shares to the company and demand cash.',
      'Because you cannot demand your money back, you sell the slice to somebody else. That is what a stock exchange is: a regulated venue for finding that somebody else at a fair price. The share price is simply the last price at which two people who disagreed about the value agreed to trade.'
    ],
    example: 'A company earns ₹100 crore this year and has 10 crore shares outstanding. Each share represents ₹10 of that profit. If the share trades at ₹250, buyers are paying 25 times one year of current earnings — that is the price-to-earnings ratio, and it is really a statement about how much growth they expect.',
    terms: ['share', 'exchange', 'pe'],
    quiz: [
      { q: 'What does owning a share give you?', options: ['A guaranteed dividend payment', 'A proportional claim on the business and its future profits', 'The right to demand your money back at the price you paid'], answer: 1, why: 'A share is ownership, not a loan. There is no obligation to return your capital, which is exactly why the price can fall.' },
      { q: 'Why does a share have a price at all?', options: ['The company sets it each morning', 'Buyers and sellers who disagree agree to trade', 'The government calculates it from profits'], answer: 1, why: 'A price is the meeting point of a buyer\'s optimism and a seller\'s caution at one moment in time. It moves as that balance shifts.' }
    ]
  },
  {
    id: 'f2', track: 'Foundations', minutes: 5,
    title: 'How an order becomes a trade',
    body: [
      'You do not buy directly from the market. You send an order to a broker, who routes it to an exchange, where it meets other orders in a queue called the order book. The order book has two sides: bids (people willing to buy) and asks (people willing to sell).',
      'A market order says "fill me at whatever the best available price is". It executes immediately, but the price you get is whatever the book offers — in a thin market that can be worse than you expected. A limit order says "only fill me at this price or better". It protects your price but may never fill at all.',
      'Two frictions eat small accounts: the spread (the gap between the best bid and the best ask, which you pay on entry and effectively again on exit) and brokerage plus taxes. On a ₹200 stock with a 0.2% spread and 0.3% in costs, you start roughly half a percent behind the moment you buy.'
    ],
    example: 'Best bid ₹499.80, best ask ₹500.20. Buy 10 shares at market: you pay ₹5,002 immediately. If you sold one second later at the bid you would receive ₹4,998. The ₹4 round trip was the spread — it existed before you had an opinion about anything.',
    terms: ['spread', 'limit', 'brokerage', 'liquidity'],
    quiz: [
      { q: 'A market order guarantees…', options: ['A good price', 'An execution', 'Neither'], answer: 1, why: 'It buys certainty of execution and gives up certainty of price. The reverse trade-off is a limit order.' },
      { q: 'You pay the spread when…', options: ['Only when you sell', 'Every time you cross it, which with a market order means both entry and exit', 'Only on weekends'], answer: 1, why: 'You buy at the ask and sell at the bid. Frequent trading multiplies that cost.' }
    ]
  },
  {
    id: 'f3', track: 'Foundations', minutes: 5,
    title: 'Market cap is not the share price',
    body: [
      'The most common beginner error is thinking a ₹50 share is cheaper than a ₹2,000 share. It is not. A share is a slice, and slices can be cut any size. What matters is what the whole company costs.',
      'Market capitalisation is the share price multiplied by the number of shares outstanding. It is the price the market is currently putting on the entire business. A ₹50 stock with 500 crore shares is a ₹25,000 crore company; a ₹2,000 stock with 10 crore shares is a ₹20,000 crore company. The first is the bigger, more expensive business.',
      'Market cap is also your shorthand for risk. Large caps above roughly ₹1 lakh crore (or $10 billion) are liquid, well understood and slow-moving. Small caps can double in a year and halve in the next. Neither is better; they belong in different amounts in a portfolio.'
    ],
    example: 'Company A: ₹40 per share, 1,000 crore shares → ₹40,000 crore. Company B: ₹4,000 per share, 2 crore shares → ₹8,000 crore. Company A is five times larger despite having a share price one-hundredth the size.',
    terms: ['mcap', 'liquidity'],
    quiz: [
      { q: 'A ₹30 share is always cheaper than a ₹3,000 share.', options: ['True', 'False'], answer: 1, why: 'Share prices are arbitrary slices. Multiplied by shares outstanding they become comparable.' },
      { q: 'Market cap tells you…', options: ['The total market value of the business', 'How much cash the company holds', 'The dividend you will receive'], answer: 0, why: 'It is price × shares outstanding — the market\'s current valuation of the whole company.' }
    ]
  },
  {
    id: 'f4', track: 'Foundations', minutes: 4,
    title: 'Why prices move all day',
    body: [
      'In the short run, price is driven by the balance of buyers and sellers, which is driven by expectations and by reactions to other people\'s expectations. New information — a profit warning, an interest rate decision, a competitor\'s product — changes what people think the future looks like, and the price reprices within seconds.',
      'In the long run, price follows earnings. A business that consistently grows profit per share will, over years, see its share price follow. This is why long-horizon investors obsess over the business and short-horizon traders obsess over the order book.',
      'The practical implication is liberating: you do not need to predict the next hour. You need a view, held with appropriate humility, about what the business will earn over the next several years — and a position size that survives being wrong about the timing.'
    ],
    example: 'A company beats profit expectations by 8%, guides next quarter lower, and the stock falls 6%. Nothing about the past was bad; the price moved on the future. That is normal and it is why "the results were good" is not a thesis.',
    terms: ['earnings'],
    quiz: [
      { q: 'Over years, what most reliably pulls a share price along?', options: ['Earnings per share growth', 'Trading volume', 'News headlines'], answer: 0, why: 'Sentiment sets the day; earnings set the decade.' },
      { q: 'A company beats expectations and the stock falls. This means…', options: ['The market is irrational', 'Guidance about the future outweighed the past result', 'The data was wrong'], answer: 1, why: 'Prices discount the future. A strong quarter with a weak outlook is still bad news for a valuation built on the outlook.' }
    ]
  },

  /* ---------------------------- Fundamentals --------------------------- */
  {
    id: 'u1', track: 'Fundamentals', minutes: 6,
    title: 'P/E: price against profit',
    body: [
      'Price-to-earnings is the share price divided by earnings per share. It answers one question: how many years of current profit am I paying for one share? A P/E of 25 means you are paying 25 rupees for every 1 rupee of annual profit.',
      'A high P/E is a statement of expectation. It says the market believes profits will grow substantially. If they do not, the price falls until the ratio looks reasonable again — which is why high-P/E stocks fall hard on modest disappointments. A low P/E is a statement of doubt: either the profits are considered temporary, or the business is genuinely unloved.',
      'The mistake beginners make is treating low P/E as safe. It is not. A carmaker at P/E 8 can be far riskier than a software company at P/E 30, because the carmaker\'s earnings can halve in a downturn while the software company\'s keep compounding. Always ask what the ratio is telling you about durability, not just level.'
    ],
    example: 'Two companies both earn ₹10 per share. A trades at ₹150 (P/E 15), B at ₹450 (P/E 45). B must grow earnings roughly three times faster for a decade to justify the gap. That is not impossible — but it is the bet you are making.',
    terms: ['pe', 'eps'],
    quiz: [
      { q: 'P/E of 20 means…', options: ['You get a 20% return each year', 'You pay 20 years of current earnings for the share', 'The stock will rise 20%'], answer: 1, why: 'It is a multiple of current profit, not a return promise.' },
      { q: 'A very low P/E most often indicates…', options: ['A guaranteed bargain', 'The market expects profits to fall or to be unreliable', 'Poor data'], answer: 1, why: 'Low multiples are usually scepticism priced in. Sometimes the scepticism is wrong — that is where the work is.' }
    ]
  },
  {
    id: 'u2', track: 'Fundamentals', minutes: 5,
    title: 'ROE and debt: is the business any good?',
    body: [
      'Return on equity measures how much profit a company generates for each unit of shareholders\' money. ROE of 20% means every ₹100 of equity produced ₹20 of profit this year. Consistently high ROE without heavy borrowing is the single best shorthand for a good business.',
      'The qualifier matters. A company can inflate ROE by borrowing heavily: debt adds assets without adding equity, so the ratio rises mechanically. Debt-to-equity tells you how much of that is happening. As a rough guide, under 1.0 is comfortable for most non-financial companies, 1–2 is worth watching, and above 2 demands a clear explanation.',
      'Banks break this rule entirely. Their business *is* leverage, so debt-to-equity of 5 or more is normal and a zero would be strange. Judge banks on return on assets, net interest margin and bad-loan ratios instead.'
    ],
    example: 'Company X: profit ₹100 crore, equity ₹500 crore → ROE 20%, debt-to-equity 0.2. Company Y: same profit, same equity, but the equity was propped up by ₹2,000 crore of debt. The headline ROE is identical; Company X is the higher-quality business.',
    terms: ['roe', 'debtEquity'],
    quiz: [
      { q: 'High ROE with very high debt is…', options: ['Even better than high ROE with low debt', 'Less impressive, because leverage did some of the work', 'Irrelevant'], answer: 1, why: 'Leverage amplifies returns in good years and losses in bad ones. Quality requires both numbers.' },
      { q: 'For a bank, debt-to-equity above 5 is…', options: ['A red flag that rules it out', 'Broadly normal for the industry', 'Impossible'], answer: 1, why: 'Banks borrow to lend. Compare banks to banks, not to software companies.' }
    ]
  },
  {
    id: 'u3', track: 'Fundamentals', minutes: 5,
    title: 'Growth: revenue first, profit second',
    body: [
      'Revenue is what the company sold. Profit is what was left. Growth in revenue is harder to manufacture than growth in profit, which can be flattered for a while by cutting costs, one-off gains or accounting choices. That is why the scoring engine weights revenue growth more heavily.',
      'Look for the combination: revenue growing and margin stable or rising means the business is getting bigger *and* no worse at running itself. Revenue growing while margins collapse is often a company buying growth with discounts — it can work, but it is a different, riskier bet.',
      'One year is noise. A single strong quarter tells you very little; three to five years of consistent growth tells you something structural. Cyclical industries (steel, shipping, autos) will show wild swings that say more about the commodity cycle than about management skill.'
    ],
    example: 'Revenue +25% but profit −10%: the company is selling more at a worse margin. Sometimes that is deliberate market-share capture; sometimes it is desperation. The note is a question to investigate, not a verdict.',
    terms: ['revenue', 'margin'],
    quiz: [
      { q: 'Why weight revenue growth more than profit growth?', options: ['Revenue is always larger', 'Profit can be flattered by cost cuts and one-offs in a way revenue cannot', 'Profit is not a real number'], answer: 1, why: 'Sales are the raw evidence of demand. Profit is the result of many choices layered on top.' },
      { q: 'Revenue up sharply while margins fall usually means…', options: ['Excellent execution', 'Growth is being bought with price or cost', 'An accounting error'], answer: 1, why: 'Worth investigating every time: is it deliberate share capture, or is pricing power disappearing?' }
    ]
  },
  {
    id: 'u4', track: 'Fundamentals', minutes: 5,
    title: 'Dividends and buybacks',
    body: [
      'A dividend is cash paid to shareholders out of profit, usually quarterly or annually. The dividend yield is the annual dividend divided by the share price. A ₹4 dividend on a ₹200 share is a 2% yield.',
      'A very high yield is a question, not a gift. Yields rise either because the dividend grew or because the price fell — and the second reason is much more common. Check whether the payout is comfortably covered by profit; a company paying out 90% of earnings has little room for a bad year.',
      'Buybacks are the other way of returning cash: the company purchases its own shares, reducing the count, which raises earnings per share without any change in total profit. Buybacks are tax-efficient in many markets and are often preferred by companies that think their shares are cheap. Both mechanisms are only good if the underlying business generates more cash than it consumes.'
    ],
    example: 'Company pays ₹10 per share in dividends on ₹12 of earnings. Payout ratio is 83%. One bad year and the dividend is either cut — which usually knocks the share price — or funded with debt.',
    terms: ['dividend', 'payout'],
    quiz: [
      { q: 'A yield of 8% on a large, stable company usually signals…', options: ['Generous management', 'The market expects the dividend to be cut, or the price has collapsed', 'A mistake in the data'], answer: 1, why: 'Equity yields above the risk-free rate demand a reason. Find it before buying.' },
      { q: 'A buyback raises earnings per share because…', options: ['Profit rises', 'The same profit is divided among fewer shares', 'Debt falls'], answer: 1, why: 'The numerator is unchanged; the denominator shrinks.' }
    ]
  },

  /* ------------------------------ Risk --------------------------------- */
  {
    id: 'r1', track: 'Risk', minutes: 5,
    title: 'Volatility is not the same as risk',
    body: [
      'Volatility measures how much a price jumps around. Risk is the chance of permanently losing money. They overlap, but they are not the same thing: a stock that swings 40% and recovers is volatile but not risky if you never had to sell; a stock that looks calm for two years and then goes to zero was risky the whole time.',
      'What makes volatility dangerous is behaviour. Deep drawdowns scare people into selling near the bottom, which converts a temporary paper loss into a permanent one. Your real risk tolerance is not what you say during a calm market — it is what you actually do after watching your account fall 30%.',
      'Beta measures sensitivity to the overall market, where 1.0 means "moves with the market". Beta 1.8 means it tends to move about 80% more in both directions. It is a useful summary and a poor predictor; it is estimated from past data and quietly changes.'
    ],
    example: 'Two stocks both average 12% a year. One gets there smoothly; the other falls 45% in year two and soars afterwards. The second has identical returns and far more volatility — and far more chance that you panic out of it.',
    terms: ['volatility', 'beta', 'drawdown'],
    quiz: [
      { q: 'The biggest danger of volatility is…', options: ['The maths of compounding', 'Your own reaction to it', 'Brokerage costs'], answer: 1, why: 'Paper losses only become real losses when behaviour converts them.' },
      { q: 'Beta of 1.5 means…', options: ['Guaranteed 50% more return', 'Tends to amplify market moves by about half again', 'The stock is 50% undervalued'], answer: 1, why: 'It is a historical sensitivity to market moves, symmetric in both directions.' }
    ]
  },
  {
    id: 'r2', track: 'Risk', minutes: 5,
    title: 'Position sizing and diversification',
    body: [
      'Most beginner portfolios are not destroyed by picking bad companies. They are destroyed by putting too much into a small number of positions and then being forced to act when those positions fall.',
      'A simple rule of thumb: no single stock above 5–10% of your invested amount while learning, and at least eight to twelve positions across several sectors. This does not guarantee gains; it guarantees that no single mistake is fatal, which is the actual goal early on.',
      'Diversification is not just "more names". Ten technology stocks in one market is one bet in ten costumes. Genuine diversification spans sectors, geographies, and business models — and includes cash, which is a position too.'
    ],
    example: '₹1 lakh portfolio. Two stocks at ₹50,000 each: a 40% fall in one costs you ₹20,000, a fifth of everything. Twelve stocks at ₹8,300 each: the same 40% fall in one costs ₹3,320, and there are eleven other outcomes doing their own thing.',
    terms: ['diversification', 'positionSize'],
    quiz: [
      { q: 'Holding ten technology companies is…', options: ['Good diversification', 'Largely one concentrated bet', 'Illegal'], answer: 1, why: 'Correlation matters more than count. Shared drivers mean shared bad days.' },
      { q: 'The main purpose of position sizing is…', options: ['Maximising returns', 'Making sure no single mistake is fatal', 'Reducing brokerage'], answer: 1, why: 'You will be wrong sometimes. Sizing decides whether being wrong is survivable.' }
    ]
  },
  {
    id: 'r3', track: 'Risk', minutes: 5,
    title: 'Why your brain costs you money',
    body: [
      'Loss aversion means a ₹10,000 loss hurts roughly twice as much as a ₹10,000 gain feels good. That asymmetry makes people hold losers hoping to break even and sell winners too early to lock in the pleasant feeling — the exact opposite of what the evidence supports.',
      'Anchoring is fixating on the price you paid. The market does not know or care. If a business is worth ₹80 and you paid ₹150, the honest question is whether you would buy it at ₹75 today — not whether it might get back to ₹150.',
      'Recency bias makes the last two years feel like the permanent state of the world. Confirmation bias makes you read only the bull case for things you already own. The practical defence is writing your thesis down *before* buying, including what would prove you wrong, then re-reading it quarterly.'
    ],
    example: 'Before buying, write: "I am buying X because ___. I will reconsider if ___, ___ or ___. A 30% fall without those triggers means hold, not panic." Two minutes of writing beats a year of rationalising.',
    terms: ['lossAversion', 'anchoring'],
    quiz: [
      { q: 'Anchoring on your purchase price is harmful because…', options: ['It changes the company\'s profits', 'The market has no knowledge of what you paid', 'It affects taxes'], answer: 1, why: 'Your cost basis is a fact about you, not about the business.' },
      { q: 'The best defence against confirmation bias is…', options: ['Reading more bull cases', 'Writing down your thesis and disconfirming evidence in advance', 'Checking the price more often'], answer: 1, why: 'A written, falsifiable thesis is checkable. A feeling is not.' }
    ]
  },

  /* ----------------------------- Practice ------------------------------ */
  {
    id: 'p1', track: 'Practice', minutes: 6,
    title: 'Reading this app\'s score honestly',
    body: [
      'The score in this app is a weighted blend of five axes — valuation, quality, growth, momentum and steadiness — each expressed as a percentile against the stock\'s peers. It is a structured reading of the numbers on the previous screens, nothing more.',
      'It contains no forecast. It does not know about a management change, a new competitor, a regulatory decision, or a factory fire. It uses bundled sample fundamentals, which means it is a teaching device first and a screen second. A high score is an invitation to research, never a reason to buy.',
      'Change the risk profile and watch the ranking reorder. That instability is the whole lesson: there is no objective "best stock", only a best fit for a particular set of priorities. If a company is #1 under one profile and #14 under another, what you have found is sensitivity, not truth.'
    ],
    example: 'A high-scoring company under "Growth-hungry" often drops under "Careful" because momentum and growth lose weight to valuation and steadiness. Both rankings are internally consistent. Your job is to decide which set of trade-offs you can actually live with.',
    terms: ['percentile'],
    quiz: [
      { q: 'A score of 82 means…', options: ['An 82% chance of gains', 'It ranks high among peers on these five axes under this weighting', 'The stock is 82% undervalued'], answer: 1, why: 'It is a relative, model-specific reading. No probability of profit is implied.' },
      { q: 'Why do rankings change when the profile changes?', options: ['A bug', 'The weights on each axis change, so the trade-offs change', 'Live prices updated'], answer: 1, why: 'Different priorities produce different answers. That is a feature and a warning.' }
    ]
  },
  {
    id: 'p2', track: 'Practice', minutes: 6,
    title: 'A repeatable beginner process',
    body: [
      'Step one: write down the goal and the horizon. Money needed within three years does not belong in individual stocks at all. This single constraint prevents most beginner disasters.',
      'Step two: buy the boring core first. For most people that means a broad index fund making up the majority of the portfolio. Individual stocks are the satellite, sized so that being wrong is educational rather than devastating.',
      'Step three: research a candidate across all five axes, then write a one-paragraph thesis with an explicit list of things that would prove you wrong. Step four: buy in tranches rather than all at once, so a bad entry price is not fatal. Step five: review quarterly against the written thesis, not against the price.',
      'Step six: do nothing most of the time. The default action of a long-term investor is inaction. Every trade should be triggered by a change in the business or the thesis, never by the share price alone.'
    ],
    example: 'Goal: invest for 10 years. Core: 70% index fund. Satellite: 30% across six researched companies at 5% each. Written thesis for each, reviewed each quarter. That is a complete plan and it fits on one page.',
    terms: ['indexFund', 'horizon'],
    quiz: [
      { q: 'Money you need within three years should generally…', options: ['Be in growth stocks for the higher return', 'Stay in cash or short-term debt', 'Be split evenly'], answer: 1, why: 'A stock portfolio can be down 30% at exactly the wrong moment. Horizon is a risk control.' },
      { q: 'The default action of a long-term investor is…', options: ['Buy daily', 'Do nothing, until the business or the thesis changes', 'Sell after each gain'], answer: 1, why: 'Activity is not progress. Most trades cost money and add nothing.' }
    ]
  },
  {
    id: 'p3', track: 'Practice', minutes: 7,
    title: 'Case study: a cheap stock that stayed cheap',
    body: [
      'A large chipmaker trades at under one times book value. Every naive screen says "bargain": low price-to-book, low price-to-sales, famous name. This lesson is about why that screen is dangerous.',
      'The company\'s return on equity is negative, profit growth is sharply negative, and the share price has fallen far more than the market over the past year. Two things are being priced: real competitive losses, and an extremely expensive plan to rebuild manufacturing capacity that will consume cash for years.',
      'Cheapness plus deterioration is a value trap. The ratio looked attractive precisely because the denominator — the earnings, the assets — was in decline. A better screen would require *stable or improving* fundamentals before rewarding a low multiple. That is a modification you can make to this app\'s scoring yourself, and it is the sort of thing that separates a screen from a judgment.'
    ],
    example: 'P/B 0.8, ROE −4%, profit growth −120%, one-year return −42%. Four numbers, one conclusion: the market is not confused, it is pricing a difficult turnaround.',
    terms: ['valueTrap', 'pb'],
    quiz: [
      { q: 'A "value trap" is…', options: ['A cheap stock that stays cheap because the business is deteriorating', 'A stock that is too expensive', 'A broker error'], answer: 0, why: 'The multiple looked low because the fundamentals were falling underneath it.' },
      { q: 'Which addition most improves a naive value screen?', options: ['Buying more of whatever is cheapest', 'Requiring stable or improving fundamentals alongside the low multiple', 'Ignoring debt'], answer: 1, why: 'Cheap plus improving is a thesis. Cheap plus deteriorating is a warning.' }
    ]
  },
  {
    id: 'p4', track: 'Practice', minutes: 5,
    title: 'What "the best stock" can never mean',
    body: [
      'This app ranks companies. That ranking is a comparison of measured characteristics, not a prediction. Anyone who tells you which single stock will be the best performer next year is either guessing, selling something, or both.',
      'Markets are competitive and forward-looking. Public information is already in the price; your edge, if you have one, comes from a longer time horizon, a better understanding of a specific business, or the discipline to behave well when others do not. None of those require predicting prices.',
      'Use rankings to narrow attention and to learn to articulate why you disagree with them. The disagreement, written down and later scored, is where the actual education happens. Keep a journal from day one: thesis, date, price, and what changed. Six months of honest journaling will teach you more than a hundred articles.'
    ],
    example: 'Write a prediction down — "I expect X to beat Y over 12 months because ___" — with a date. Then check it. Half the value of this app is giving you a structured, consequence-free place to be wrong.',
    terms: ['edge', 'journal'],
    quiz: [
      { q: 'The ranking in this app is…', options: ['A forecast of future returns', 'A comparison of measured characteristics under a chosen weighting', 'Investment advice'], answer: 1, why: 'Descriptive, relative, and profile-dependent. It is a starting point for research.' },
      { q: 'A realistic source of edge for a beginner is…', options: ['Faster news access', 'A longer horizon and disciplined behaviour', 'Better chart software'], answer: 1, why: 'You will not outrun institutions on information. Patience and temperament are genuinely available to you.' }
    ]
  }
];

/* ---------------------------------------------------------------- */
/* Glossary                                                          */
/* ---------------------------------------------------------------- */

window.TM_GLOSSARY = [
  { key:'share',        term:'Share',                  def:'A unit of ownership in a company, giving a claim on profits and usually a vote.' },
  { key:'exchange',     term:'Stock exchange',         def:'A regulated marketplace where shares are bought and sold, such as the NSE, BSE or NYSE.' },
  { key:'brokerage',    term:'Brokerage',              def:'The fee a broker charges per trade, usually a small percentage or a flat amount.' },
  { key:'spread',       term:'Bid-ask spread',         def:'The gap between the highest price buyers will pay and the lowest sellers will accept. You pay it to trade.' },
  { key:'liquidity',    term:'Liquidity',              def:'How easily you can trade a meaningful amount without moving the price. Large caps are more liquid.' },
  { key:'limit',        term:'Limit order',            def:'An order that only fills at your stated price or better. Protects price, not execution.' },
  { key:'mcap',         term:'Market capitalisation',  def:'Share price × shares outstanding — the market value of the whole company.' },
  { key:'pe',           term:'P/E ratio',              def:'Price divided by earnings per share. How many years of current profit you are paying for a share.' },
  { key:'eps',          term:'Earnings per share (EPS)',def:'Profit divided by shares outstanding. The per-slice profit number.' },
  { key:'pb',           term:'P/B ratio',              def:'Price divided by book value per share. Useful for asset-heavy businesses; meaningless when book value is negative.' },
  { key:'roe',          term:'Return on equity (ROE)', def:'Profit as a percentage of shareholders\' equity. A shorthand for business quality — check debt alongside it.' },
  { key:'debtEquity',   term:'Debt-to-equity',         def:'Total debt divided by shareholders\' equity. Higher means more leverage and more fragility.' },
  { key:'margin',       term:'Operating margin',       def:'Operating profit as a percentage of revenue. How much of each sale survives costs.' },
  { key:'revenue',      term:'Revenue',                def:'Total sales before any costs are deducted. The top line.' },
  { key:'earnings',     term:'Earnings',               def:'Profit after all expenses and taxes. The bottom line.' },
  { key:'dividend',     term:'Dividend',               def:'Cash paid out of profit to shareholders, usually quarterly or annually.' },
  { key:'payout',       term:'Payout ratio',           def:'Dividends divided by earnings. A high ratio leaves little room for a bad year.' },
  { key:'volatility',   term:'Volatility',             def:'How much a price swings around. Measures movement, not the chance of permanent loss.' },
  { key:'beta',         term:'Beta',                   def:'Sensitivity to overall market moves. 1.0 = moves with the market; 1.5 = roughly half again as much.' },
  { key:'drawdown',     term:'Drawdown',               def:'The fall from a peak to a subsequent trough. Measures how bad the worst stretch felt.' },
  { key:'diversification',term:'Diversification',      def:'Spreading money across positions whose drivers differ, so no single mistake is fatal.' },
  { key:'positionSize', term:'Position size',          def:'How much of your portfolio a single holding represents. The most important risk decision you make.' },
  { key:'valueTrap',    term:'Value trap',             def:'A stock that looks cheap because its fundamentals are deteriorating, and stays cheap.' },
  { key:'percentile',   term:'Percentile rank',        def:'Where a value sits within a comparison group: 90th percentile means better than 90% of peers.' },
  { key:'indexFund',    term:'Index fund',             def:'A fund that tracks a market index, giving broad exposure at low cost. A common portfolio core.' },
  { key:'horizon',      term:'Time horizon',           def:'How long money can stay invested before you need it. The main constraint on how much risk is appropriate.' },
  { key:'lossAversion', term:'Loss aversion',          def:'The tendency for losses to hurt roughly twice as much as equivalent gains feel good.' },
  { key:'anchoring',    term:'Anchoring',              def:'Fixating on a reference price, such as what you paid, which the market knows nothing about.' },
  { key:'edge',         term:'Edge',                   def:'A repeatable reason why you might do better than the average participant. Most people do not have one.' },
  { key:'journal',      term:'Investment journal',     def:'A written record of each thesis and its outcome. The cheapest way to learn from your own mistakes.' }
];

/* ---------------------------------------------------------------- */
/* Jargon-free explanations used by the UI                           */
/* ---------------------------------------------------------------- */

window.TM_METRIC_HELP = {
  pe:      'What you pay per unit of yearly profit. Higher means more growth is expected.',
  pb:      'What you pay per unit of accounting net assets. Only meaningful when book value is positive.',
  roe:     'Profit earned per unit of shareholders\' money. Higher usually means a better business.',
  de:      'Borrowed money relative to owners\' money. Higher means more fragility. Banks are a special case.',
  rev:     'How fast sales grew year over year.',
  profit:  'How fast profit grew year over year. Easier to flatter than sales.',
  div:     'Annual dividend as a percentage of the share price.',
  margin:  'How much of each sale is left after running costs.',
  vol:     'How much the price swung over the past year.',
  beta:    'How much the stock tends to move when the overall market moves.',
  dd:      'The worst peak-to-trough fall in the past year.',
  mcap:    'The total market value of the company.',
  m1:      'Price change over the past month.',
  m3:      'Price change over the past three months.',
  y1:      'Price change over the past twelve months.'
};
