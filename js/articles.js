/*
 * Bottleneck: the single source of truth for every explainer.
 *
 * Both html/explainers.html and the homepage (index.html) read this file.
 * To publish a new explainer:
 *   1. Put the page in html/explainers/, e.g. html/explainers/gpus.html (styles in css/, scripts in js/)
 *   2. Put a 16:9 thumbnail in images/thumbs/ (SVG or PNG)
 *   3. Add an entry to the END of `articles` below. The newest date is shown as "Latest";
 *      if two share a date, the one added later wins.
 *   4. Add any new companies to `companies` (the id is what you use in `chain`).
 *
 * `chain` drives the company map: each step lists the companies the explainer covers at that step.
 * A company that appears in several explainers links them together on the map.
 * `margins` is optional: what each company keeps per dollar, as reported in that explainer.
 * Paths (href, thumb) are relative to the html/ folder.
 */
window.BOTTLENECK = {
  articles: [
    {
      id: "smile",
      href: "explainers/smile.html",
      title: "Who Keeps the Money? The Smile Curve of AI Chips",
      short: "Who keeps the money?",
      kicker: "Investigation",
      topic: "Semiconductors",
      date: "2026-11-18",
      readMins: 12,
      dek: "The world will spend about $1.5 trillion on chips this year. I followed one AI chip through eight companies to see who actually keeps the money. The answer bends a thirty-year-old rule.",
      summary: "Eight companies, one chip, and why margin follows scarcity",
      thumb: "../images/thumbs/smile.svg",
      stats: [
        { big: "$1.51T", text: "Global chip sales forecast for 2026, up about 90% in a year." },
        { big: "66¢", text: "What TSMC keeps of each dollar, from the step that should earn least." },
        { big: "47→80¢", text: "SK hynix's operating margin, one year apart." },
        { big: "6¢", text: "Foxconn's cut for building over 40% of AI servers." }
      ],
      chain: [
        { step: "Chip design", companies: ["nvidia", "amd", "broadcom"] },
        { step: "EDA software", companies: ["synopsys", "cadence"] },
        { step: "Equipment", companies: ["asml", "amat", "lam", "tel", "kla"] },
        { step: "Wafer fab", companies: ["tsmc"] },
        { step: "Memory", companies: ["skhynix", "samsung", "micron"] },
        { step: "Packaging", companies: ["tsmc", "ase"] },
        { step: "Rack assembly", companies: ["foxconn", "quanta", "wistron"] },
        { step: "Software", companies: ["nvidia"] }
      ],
      margins: {
        nvidia: "75¢ gross",
        cadence: "88¢ non-GAAP gross",
        asml: "57¢ gross",
        tsmc: "66¢ gross",
        skhynix: "80¢ operating",
        ase: "22¢ gross",
        foxconn: "6¢ gross"
      }
    },
    {
      id: "gpu-unlock",
      href: "explainers/gpu-unlock.html",
      title: "Unlocked, and Still Out of Reach: The Hidden Compute in Gaming GPUs",
      short: "Unlocked, and still out of reach",
      kicker: "Explainer",
      topic: "GPUs",
      date: "2026-11-18",
      readMins: 10,
      dek: "An open-source unlock nearly doubles the AI compute of RTX 30 and 40 graphics cards. Gamers get 0% more frames, and used prices keep climbing. Here's why the unlock helps the people who need it least.",
      summary: "A compute unlock, a used-card rush, and why gamers lose the bidding war",
      thumb: "../images/thumbs/gpu-unlock.svg",
      stats: [
        { big: "+65%", text: "RTX 3090 BF16 matrix compute after the unlock: 75 → 125 TFLOPS. The RTX 4090 roughly doubles." },
        { big: "0%", text: "Extra frames in games. The parts games use were never locked." },
        { big: "+29%", text: "Used RTX 3090 average in 90 days, to about S$2,100: above its launch price." },
        { big: "7%", text: "Gaming's share of Nvidia's US$215.9 billion fiscal-2026 revenue." }
      ],
      chain: [
        { step: "Chip design", companies: ["nvidia"] },
        { step: "Wafer fab", companies: ["tsmc", "samsung"] },
        { step: "Graphics boards", companies: ["asus", "msi"] }
      ],
      margins: {
        nvidia: "data centre US$193.7B vs gaming US$16.0B revenue, FY2026"
      }
    },
    {
      id: "stargate",
      href: "explainers/stargate.html",
      title: "The Gate That Didn't Open: How Stargate Shrank",
      short: "The gate that didn't open",
      kicker: "Explainer",
      topic: "AI infrastructure",
      date: "2026-11-19",
      readMins: 13,
      dek: "A US$500 billion White House promise, a land grab across Texas, and a joint venture that barely started. How the biggest number in tech shrank.",
      summary: "A half-trillion pledge, a debt mismatch, and who ends up holding the buildings",
      thumb: "../images/thumbs/stargate.svg",
      stats: [
        { big: "US$500B", text: "Promised at the White House in January 2025, over four years." },
        { big: "~7 GW", text: "Planned across six US sites by September 2025. About 0.6 GW was running by September 2026, by one tracker's estimate." },
        { big: "3", text: "Stargate projects dropped, paused or handed to Microsoft in spring 2026." },
        { big: "198 bp", text: "Record cost of insuring Oracle's debt, July 2026: roughly four times a year earlier." }
      ],
      chain: [
        { step: "Funding", companies: ["softbank", "mgx"] },
        { step: "Data-centre build", companies: ["crusoe", "oracle", "nscale"] },
        { step: "Chips", companies: ["nvidia"] },
        { step: "Compute buyer", companies: ["openai", "microsoft"] }
      ]
    },
    {
      id: "glass-cloth",
      href: "explainers/glass-cloth.html",
      title: "The Cloth Inside the Chip: One Japanese Mill and AI's Quietest Shortage",
      short: "The cloth inside the chip",
      kicker: "Explainer",
      topic: "Advanced packaging",
      date: "2026-11-19",
      readMins: 11,
      dek: "Under every advanced AI processor sits a sheet of woven glass. One Japanese company, founded as a silk spinner in 1918, reportedly makes about 90% of the best grade, and the queue for it is long.",
      summary: "A woven glass sheet, a 1918 textile firm, and a shortage nobody sees",
      thumb: "../images/thumbs/glass-cloth.svg",
      stats: [
        { big: "~90%", text: "Nittobo's estimated share of T-glass cloth, the grade that keeps big AI chip packages flat." },
        { big: "814→1,700", text: "Nvidia interposer area in mm², Hopper to Blackwell: +109%." },
        { big: "8–10→20+", text: "Weeks of lead time for the laminate the cloth goes into, as reported." },
        { big: "¥15B", text: "About US$94 million (S$121 million) for a new Fukushima building, targeting up to ~3× output." }
      ],
      chain: [
        { step: "Glass cloth", companies: ["nittobo", "nanya"] },
        { step: "Substrate and board laminates", companies: ["kingboard"] },
        { step: "Chip packaging", companies: ["tsmc"] },
        { step: "Chip design", companies: ["nvidia"] }
      ]
    },
    {
      id: "implants",
      href: "explainers/implants.html",
      title: "Chipped at Work: How Close Are Bosses to Putting Tech Inside You?",
      short: "Chipped at work",
      kicker: "Explainer",
      topic: "Neurotech and work",
      date: "2026-11-19",
      readMins: 12,
      dek: "A Wisconsin company once threw a party to microchip its staff. Brain implants now let paralysed people move cursors by thought. How realistic is it that your boss asks you to get one?",
      summary: "Hand chips, brain implants, EEG caps, and the laws that got there first",
      thumb: "../images/thumbs/implants.svg",
      stats: [
        { big: "~80 / 250", text: "Staff at Three Square Market with a hand chip by 2018, a year after its 2017 chip party." },
        { big: "21", text: "People in Neuralink's trials, January 2026. No brain implant is approved for healthy people." },
        { big: "US$1–2", text: "Rough daily cost per worker of an EEG cap that scores fatigue at mines and in trucking." },
        { big: "13", text: "US states, including Washington in 2026, that ban employers from requiring an implant." }
      ],
      chain: [
        { step: "Brain implants", companies: ["neuralink", "synchron", "precision", "paradromics"] },
        { step: "Hand chips", companies: ["biohax", "walletmor"] },
        { step: "Wearable EEG", companies: ["smartcap"] },
        { step: "Workplace adopters", companies: ["threesquare"] }
      ]
    },
    {
      id: "anthropic-ipo",
      href: "explainers/anthropic-ipo.html",
      title: "Who Owns Anthropic? Inside the $1.5 Trillion IPO",
      short: "Who owns Anthropic?",
      kicker: "Explainer",
      topic: "AI and capital markets",
      date: "2026-11-19",
      readMins: 13,
      dek: "Anthropic sold 980 million shares at $83 in the biggest IPO on record. Amazon and Google own over a quarter of it but can't vote. Seven co-founders hold one share with 50.1% of the votes.",
      summary: "The cap table, the voting structure, the price, and the lock-up calendar",
      thumb: "../images/thumbs/anthropic-ipo.svg",
      stats: [
        { big: "$81.3B", text: "Raised at $83 a share, the largest IPO on record, valuing Anthropic at about $1.5 trillion fully diluted." },
        { big: "28% / 0%", text: "Amazon and Google's combined stake, and their share of the votes." },
        { big: "50.1%", text: "Votes carried by a single Class F share held by the seven co-founders." },
        { big: "15.5B", text: "Locked-up shares that unlock in about 25 waves over the next year." }
      ],
      chain: [
        { step: "Strategic owners", companies: ["amazon", "google"] },
        { step: "IPO placement", companies: ["google", "nvidia", "amd", "broadcom", "micron", "microsoft", "tsmc"] },
        { step: "The issuer", companies: ["anthropic"] }
      ]
    },
    {
      id: "amd",
      href: "explainers/amd.html",
      title: "From a $2 Stock to the Trillion-Dollar Club: How AMD Came Back",
      short: "How AMD came back",
      kicker: "Explainer",
      topic: "Semiconductors",
      date: "2026-11-19",
      readMins: 13,
      dek: "In July 2015 AMD closed at $1.62 and analysts wondered if it would survive. Under Lisa Su it passed Intel, won OpenAI as an AI-chip customer, and briefly topped $1 trillion in September 2026.",
      summary: "A $1.62 stock, the Zen bet, a $49B share swap, and the AI race",
      thumb: "../images/thumbs/amd.svg",
      stats: [
        { big: "$1.62", text: "AMD's lowest close, July 2015, nine months into Lisa Su's time as CEO. Its market value was under $2 billion." },
        { big: "46.2%", text: "AMD's share of x86 server-chip revenue in early 2026, up from 1–2% of units in 2018 (Mercury Research)." },
        { big: "$49B", text: "Closing value of the all-stock Xilinx deal (Feb 2022), up from about $35B when agreed in 2020." },
        { big: "$8.5B", text: "AMD's data-centre sales in July–September 2026, nearly two-thirds of revenue, after its value briefly passed $1 trillion." }
      ],
      chain: [
        { step: "Chip design", companies: ["amd", "nvidia", "intel"] },
        { step: "Foundry", companies: ["tsmc", "globalfoundries"] },
        { step: "AI customers", companies: ["openai", "microsoft", "meta", "oracle", "anthropic"] }
      ]
    },
    {
      id: "pi-clubs",
      href: "explainers/pi-clubs.html",
      title: "The Insurer Nobody Sees: Twelve Clubs Behind Every Big Ship",
      short: "The 12 clubs behind every big ship",
      kicker: "Explainer",
      topic: "Shipping insurance",
      date: "2026-11-19",
      readMins: 11,
      dek: "Whenever a big ship hits something, a bill lands on a company you have almost certainly never heard of. Twelve mutual clubs insure about 90% of the world's ocean-going tonnage and share one tower of cover. In 2024 a Singapore-flagged ship pushed it to its last layer.",
      summary: "Twelve mutual clubs, one four-layer tower, and the Dali claim that reached the top",
      thumb: "../images/thumbs/pi-clubs.svg",
      stats: [
        { big: "~90%", text: "Share of the world's ocean-going tonnage covered for liability by the International Group's 12 clubs, by the clubs' own description." },
        { big: "$2.8bn+", text: "Reserved insured loss from the Dali hitting Baltimore's Key Bridge (2024), up from a first reserve of ~$1.5bn: the largest single marine loss on record (Howden Re)." },
        { big: "$3.1bn", text: "Approximate size of the clubs' shared tower of cover for the loss year (S$4.0 billion); raised to $3.35bn for 2026." },
        { big: "10 of 12", text: "International Group clubs with offices in Singapore, per the Group's chief executive (April 2024)." }
      ],
      chain: [
        { step: "Ship owner and manager", companies: ["synergy"] },
        { step: "P&I clubs", companies: ["britannia", "gard", "northstandard"] }
      ]
    },
    {
      id: "oil-window",
      href: "explainers/oil-window.html",
      title: "The Price Behind the Price: Who Sets the Number Oil Is Sold Against",
      short: "The price behind the price",
      kicker: "Explainer",
      topic: "Oil price benchmarks",
      date: "2026-11-20",
      readMins: 12,
      dek: "Most of the world's exported crude oil is sold against a number that a news-and-data firm fixes once a day, from a thin slice of trades. One of those numbers, Dubai, has less and less Dubai in it. This month, Abu Dhabi moved its own crude onto it.",
      summary: "Dated Brent, Platts Dubai, the 16:30 window, and ADNOC's switch",
      thumb: "../images/thumbs/oil-window.svg",
      stats: [
        { big: "~78%", text: "Share of exported crude priced off Brent, directly or indirectly (Energy Intelligence via ICE). Other estimates: about two-thirds." },
        { big: "<700k", text: "Barrels a day from the five North Sea grades behind Dated Brent in early 2023, down from 850,000 in December 2020." },
        { big: "400k→60k", text: "Barrels a day of Dubai crude itself, early 1990s peak to a 2012 paper's latest figure. The benchmark kept the name." },
        { big: "1 Nov", text: "2026: ADNOC moved the pricing of all its crude grades onto Platts Dubai, away from its own Murban futures." }
      ],
      chain: [
        { step: "Price reporting", companies: ["platts"] },
        { step: "Benchmark futures", companies: ["ice"] },
        { step: "Traders in the window", companies: ["vitol", "bp", "shell"] },
        { step: "Producers pricing off it", companies: ["aramco", "adnoc"] }
      ]
    },
    {
      id: "cls",
      href: "explainers/cls.html",
      title: "The Bank Behind the Currency Market: How CLS Keeps FX Trades From Going Wrong",
      short: "The bank behind the currency market",
      kicker: "Explainer",
      topic: "FX settlement",
      date: "2026-11-20",
      readMins: 11,
      dek: "More than US$14 trillion of currency trades come due every day, in two currencies across two clocks. One little-known New York bank, CLS, locks the two halves together for 18 currencies, Singapore's among them. Yet only about a third of the market settles that safely.",
      summary: "Herstatt risk, payment-versus-payment, and the $1.4tn a day with no safeguard",
      thumb: "../images/thumbs/cls.svg",
      stats: [
        { big: "$14tn+", text: "Gross FX obligations coming due on an average day in April 2025 (BIS)." },
        { big: "36%", text: "Share settled payment-versus-payment, the lock where both legs happen together or not at all (BIS)." },
        { big: "$1.4tn", text: "A day settled gross with no safeguard, about 10% of the total (BIS)." },
        { big: "18", text: "Currencies CLS settles, using an account at each currency's central bank. The Singapore dollar has been one since 2003 (CLS; Wikipedia)." }
      ],
      chain: [
        { step: "The settlement bank", companies: ["cls"] },
        { step: "Central banks holding the accounts", companies: ["mas"] }
      ]
    }
  ],

  companies: {
    nvidia:   { name: "Nvidia",            hq: "US",           sector: "Chip design" },
    amd:      { name: "AMD",               hq: "US",           sector: "Chip design" },
    broadcom: { name: "Broadcom",          hq: "US",           sector: "Chip design" },
    synopsys: { name: "Synopsys",          hq: "US",           sector: "EDA software" },
    cadence:  { name: "Cadence",           hq: "US",           sector: "EDA software" },
    asml:     { name: "ASML",              hq: "Netherlands",  sector: "Chipmaking equipment" },
    amat:     { name: "Applied Materials", hq: "US",           sector: "Chipmaking equipment" },
    lam:      { name: "Lam Research",      hq: "US",           sector: "Chipmaking equipment" },
    tel:      { name: "Tokyo Electron",    hq: "Japan",        sector: "Chipmaking equipment" },
    kla:      { name: "KLA",               hq: "US",           sector: "Chipmaking equipment" },
    tsmc:     { name: "TSMC",              hq: "Taiwan",       sector: "Foundry" },
    skhynix:  { name: "SK hynix",          hq: "South Korea",  sector: "Memory" },
    samsung:  { name: "Samsung",           hq: "South Korea",  sector: "Memory" },
    micron:   { name: "Micron",            hq: "US",           sector: "Memory" },
    ase:      { name: "ASE",               hq: "Taiwan",       sector: "Packaging" },
    foxconn:  { name: "Foxconn",           hq: "Taiwan",       sector: "Server & board assembly" },
    quanta:   { name: "Quanta",            hq: "Taiwan",       sector: "Server & board assembly" },
    wistron:  { name: "Wistron",           hq: "Taiwan",       sector: "Server & board assembly" },
    asus:     { name: "ASUS",              hq: "Taiwan",       sector: "Server & board assembly" },
    msi:      { name: "MSI",               hq: "Taiwan",       sector: "Server & board assembly" },
    openai:   { name: "OpenAI",            hq: "US",           sector: "AI labs" },
    oracle:   { name: "Oracle",            hq: "US",           sector: "Cloud & data centres" },
    softbank: { name: "SoftBank",          hq: "Japan",        sector: "Investors" },
    mgx:      { name: "MGX",               hq: "UAE",          sector: "Investors" },
    crusoe:   { name: "Crusoe",            hq: "US",           sector: "Cloud & data centres" },
    nscale:   { name: "Nscale",            hq: "UK",           sector: "Cloud & data centres" },
    microsoft:{ name: "Microsoft",         hq: "US",           sector: "Cloud & data centres" },
    nittobo:  { name: "Nittobo",           hq: "Japan",        sector: "Materials" },
    nanya:    { name: "Nan Ya Plastics",   hq: "Taiwan",       sector: "Materials" },
    kingboard:{ name: "Kingboard",         hq: "Hong Kong",    sector: "Materials" },
    neuralink:{ name: "Neuralink",         hq: "US",           sector: "Brain & body implants" },
    synchron: { name: "Synchron",          hq: "US",           sector: "Brain & body implants" },
    precision:{ name: "Precision Neuroscience", hq: "US",      sector: "Brain & body implants" },
    paradromics:{ name: "Paradromics",     hq: "US",           sector: "Brain & body implants" },
    biohax:   { name: "BioHax",            hq: "Sweden",       sector: "Brain & body implants" },
    walletmor:{ name: "Walletmor",         hq: "Poland",       sector: "Brain & body implants" },
    smartcap: { name: "SmartCap",          hq: "Australia",    sector: "Wearables" },
    threesquare:{ name: "Three Square Market", hq: "US",       sector: "Wearables" },
    anthropic:{ name: "Anthropic",         hq: "US",           sector: "AI labs" },
    intel:    { name: "Intel",             hq: "US",           sector: "Chip design" },
    globalfoundries:{ name: "GlobalFoundries", hq: "US",       sector: "Foundry" },
    meta:     { name: "Meta",              hq: "US",           sector: "Cloud & data centres" },
    amazon:   { name: "Amazon",            hq: "US",           sector: "Cloud & data centres" },
    google:   { name: "Google",            hq: "US",           sector: "Cloud & data centres" },
    synergy:  { name: "Synergy Marine",    hq: "Singapore",    sector: "Shipping" },
    britannia:{ name: "Britannia P&I Club", hq: "UK",          sector: "Shipping insurance" },
    gard:     { name: "Gard",              hq: "Norway",       sector: "Shipping insurance" },
    northstandard:{ name: "NorthStandard", hq: "UK",           sector: "Shipping insurance" },
    platts:   { name: "S&P Global Platts", hq: "US",           sector: "Price reporting" },
    ice:      { name: "ICE",               hq: "US",           sector: "Exchanges" },
    vitol:    { name: "Vitol",             hq: "Switzerland",  sector: "Oil trading" },
    bp:       { name: "BP",                hq: "UK",           sector: "Oil trading" },
    shell:    { name: "Shell",             hq: "UK",           sector: "Oil trading" },
    aramco:   { name: "Saudi Aramco",      hq: "Saudi Arabia", sector: "Oil producers" },
    adnoc:    { name: "ADNOC",             hq: "UAE",          sector: "Oil producers" },
    cls:      { name: "CLS Bank",          hq: "US",           sector: "FX settlement" },
    mas:      { name: "Monetary Authority of Singapore", hq: "Singapore", sector: "Central banks" }
  }
};
