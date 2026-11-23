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
      category: "Chips & hardware",
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
      category: "Chips & hardware",
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
      category: "AI & capital",
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
      category: "Chips & hardware",
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
      category: "Neurotech",
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
      category: "AI & capital",
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
      category: "Chips & hardware",
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
      category: "Market infrastructure",
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
      category: "Market infrastructure",
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
      category: "Market infrastructure",
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
        { step: "The settlement bank", companies: ["cls"] }
      ]
    },
    {
      id: "iodine",
      href: "explainers/iodine.html",
      title: "The Crystal Behind Your Scan and Your Screen: Who Controls the World's Iodine",
      short: "The crystal behind your scan and your screen",
      kicker: "Explainer",
      topic: "Iodine",
      category: "Commodities",
      date: "2026-11-21",
      readMins: 11,
      dek: "Iodine goes into CT-scan dye and the films inside LCD screens. About two-thirds of it comes from one Chilean desert, one company says it sells about 37% of the world's supply, and the price has more than tripled since 2017.",
      summary: "A hidden element, three source areas, and a price that rose 3.5 times",
      thumb: "../images/photos/iodine-humberstone.jpg",
      stats: [
        { big: "~2/3", text: "Share of world iodine produced in Chile, excluding the US (USGS, 2025)." },
        { big: "37%", text: "Share of global iodine sales SQM estimates for itself in 2024; five Chilean firms about 60% (SQM)." },
        { big: "37%", text: "Share of iodine demand going into X-ray contrast media; LCD and LED screens about 13% (SQM estimates)." },
        { big: "3.5x", text: "US import price, from US$19.55 a kilogram in 2017 to an estimated US$68 in 2025 (USGS)." }
      ],
      chain: [
        { step: "Chilean caliche producers", companies: ["sqm", "cosayach", "acfminera"] },
        { step: "Japanese brine producers", companies: ["ise", "godoshigen", "inpex"] }
      ]
    },
    {
      id: "bond-market",
      href: "explainers/bond-market.html",
      title: "One Seesaw, Two Fears: How the Fed Uses the Bond Market",
      short: "One seesaw, two fears",
      kicker: "Explainer",
      topic: "Central banking",
      category: "Market infrastructure",
      date: "2026-11-21",
      readMins: 10,
      dek: "The Fed aims for 2% inflation. Afraid of a slump in 2020, it pushed bond prices up and yields down; afraid of inflation in 2022–23, it did the reverse. One price-yield seesaw explains both.",
      summary: "The price-yield seesaw, QE and QT, and the 2020–2023 rate cycle",
      thumb: "../images/thumbs/bond-market.svg",
      stats: [
        { big: "0.52%", text: "Record-low 10-year US Treasury yield, 4 August 2020, after the Fed cut to near zero and bought bonds (US Treasury)." },
        { big: "9.1%", text: "US inflation in June 2022, the fastest since 1981 (Bureau of Labor Statistics)." },
        { big: "5.5%", text: "Top of the Fed's target range by July 2023, after eleven rate rises from March 2022 (Federal Reserve)." },
        { big: "4.98%", text: "10-year yield peak on 19 October 2023, as bond prices fell (US Treasury)." }
      ],
      // About public institutions (the Fed, the US Treasury), which are not private
      // companies, so this explainer contributes nothing to the company map.
      chain: []
    },
    {
      id: "govt-bonds",
      href: "explainers/govt-bonds.html",
      title: "Lending to Governments: US Treasuries vs Singapore's Bonds",
      short: "Lending to governments",
      kicker: "Explainer",
      topic: "Government debt",
      category: "Market infrastructure",
      date: "2026-11-22",
      readMins: 9,
      dek: "A bond is a loan you make to a government. The US borrows to spend and now pays more interest than it spends on defence. Singapore borrows more, relative to its economy, yet almost none of it funds spending. Two countries, two very different reasons to issue debt.",
      summary: "T-Bills, bonds and SSBs, and why the US and Singapore borrow for opposite reasons",
      thumb: "../images/thumbs/govt-bonds.svg",
      stats: [
        { big: "$963B", text: "US interest on the debt in the first ten months of fiscal 2026, more than the $763B spent on defence (CBO)." },
        { big: "$40.1T", text: "US public debt outstanding; the largest foreign holders are Japan, the UK and China (US Treasury)." },
        { big: "172%", text: "Singapore's government debt-to-GDP, yet about 99% is issued to build markets and reserves, not to fund spending." },
        { big: "S$500", text: "Minimum to buy a Singapore Savings Bond, which you can redeem any month with no penalty." }
      ],
      // About governments and their treasuries/central banks, not private
      // companies, so this explainer contributes nothing to the company map.
      chain: []
    },
    {
      id: "stablecoins",
      href: "explainers/stablecoins.html",
      title: "Keeping a Coin Worth a Dollar: How Stablecoins Hold (and Lose) Their Peg",
      short: "Keeping a coin worth $1",
      kicker: "Explainer",
      topic: "Crypto",
      category: "Crypto",
      date: "2026-11-23",
      readMins: 11,
      dek: "A stablecoin promises to be worth one dollar. Some hold that promise with cash in a bank, some with crypto locked in a contract, and some with nothing but code and confidence. The last kind wiped out about $40 billion in three days. Here's what keeps a dollar a dollar, and what breaks it.",
      summary: "Fiat-backed, crypto-backed and algorithmic coins, the Terra collapse, and Bitcoin, Ether and STRC",
      thumb: "../images/thumbs/stablecoins.svg",
      stats: [
        { big: "1:1", text: "What a fiat-backed coin like USDC promises: one dollar of cash or reserves for each token." },
        { big: "~$40B", text: "Value erased when the algorithmic stablecoin TerraUSD and its sister token LUNA collapsed in May 2022." },
        { big: "2x", text: "Rough collateral a crypto-backed coin like BOLD holds: lock ~$2,000 of ETH to borrow $1,000." },
        { big: "11.5%", text: "Advertised annual dividend on Strategy's STRC, paid while it uses proceeds to buy Bitcoin." }
      ],
      chain: [
        { step: "Fiat-backed stablecoins", companies: ["tether", "circle"] },
        { step: "Crypto-backed stablecoins", companies: ["liquity"] },
        { step: "Algorithmic stablecoins", companies: ["terraform"] },
        { step: "Bitcoin-treasury instruments", companies: ["strategy"] }
      ]
    },
    {
      id: "chip-share",
      href: "explainers/chip-share.html",
      title: "Three Companies, One Industry: AMD vs Intel vs Nvidia",
      short: "AMD vs Intel vs Nvidia",
      kicker: "Explainer",
      topic: "Semiconductors",
      category: "Chips & hardware",
      date: "2026-11-24",
      readMins: 10,
      dek: "Intel once owned the processor. Today the fight splits across different markets: server and PC chips, AI accelerators, gaming graphics and embedded. In each, the leader is different. Here is who holds what, and how it got that way.",
      summary: "Market share across data centre, client, gaming and embedded, and how the lead changed hands",
      thumb: "../images/thumbs/chip-share.svg",
      stats: [
        { big: "35.5%", text: "AMD's share of x86 server CPU units in Q3 2026, a record, up from 27.8% a year earlier (Mercury Research)." },
        { big: "~75–81%", text: "Nvidia's share of data-centre AI accelerator revenue; AMD about 5–7%, custom ASICs 12–15%." },
        { big: "~90%", text: "Nvidia's share of discrete desktop graphics-card shipments; AMD about 8%, Intel about 2% (Jon Peddie)." },
        { big: "0.8% → 35.5%", text: "AMD's share of x86 server CPUs shipped, end of 2017 to Q3 2026 (Mercury Research)." }
      ],
      chain: [
        { step: "Data centre: server CPUs & AI GPUs", companies: ["amd", "intel", "nvidia"] },
        { step: "Client PCs: desktop & laptop CPUs", companies: ["amd", "intel"] },
        { step: "Gaming: GPUs, consoles & handhelds", companies: ["amd", "intel", "nvidia"] },
        { step: "Embedded: FPGAs & adaptive SoCs", companies: ["amd"] }
      ]
    },
    {
      id: "derivatives",
      href: "explainers/derivatives.html",
      title: "Financial Weapons of Mass Destruction? How Derivatives Work",
      short: "How derivatives work",
      kicker: "Explainer",
      topic: "Derivatives",
      category: "Market infrastructure",
      date: "2026-11-23",
      readMins: 14,
      dek: "A derivative is a contract whose value comes from something else: a price, a rate, an index. Farmers and airlines use them to lock in costs; speculators use them to bet with borrowed size. In 2002 Warren Buffett called them \"financial weapons of mass destruction.\" Here is what they are, why they are useful, and how the same tools helped blow up LTCM, AIG and the 2008 crisis.",
      summary: "Futures, options and swaps, hedging versus speculation, and why Buffett warned about them",
      thumb: "../images/thumbs/derivatives.svg",
      stats: [
        { big: "3", text: "Main building blocks: futures (fix a price now for a trade later), options (the right but not the duty to trade), and swaps (exchange one cash-flow stream for another)." },
        { big: "2002", text: "Year Warren Buffett called derivatives \"financial weapons of mass destruction\" in Berkshire Hathaway's annual letter." },
        { big: "$3.6B", text: "Rescue arranged for the hedge fund Long-Term Capital Management in 1998 after its derivative bets unwound." },
        { big: "$182B", text: "US government support committed to insurer AIG in 2008, much of it tied to credit-default-swap guarantees it couldn't cover." }
      ],
      // A concept explainer about market infrastructure, not a company profile,
      // so it has no country link and contributes nothing to the company map.
      chain: []
    },
    {
      id: "japan-bubble",
      href: "explainers/japan-bubble.html",
      title: "The Biggest Bubble in History: Japan's Lost Decades",
      short: "Japan's lost decades",
      kicker: "Explainer",
      topic: "Asset bubbles",
      category: "Economic history",
      date: "2026-11-26",
      readMins: 14,
      dek: "By 1989 Japan was the world's second-largest economy, home to 32 of the 50 biggest companies, with land under Tokyo's Imperial Palace said to be worth more than all of California. Then the bubble burst. Here is how post-war Japan rose so fast, how a feedback loop between land and shares inflated the biggest asset bubble in history, and why the fall became two lost decades.",
      summary: "The post-war miracle, the Plaza Accord, the land-and-share feedback loop, the burst, zombie loans and QE",
      thumb: "../images/thumbs/japan-bubble.svg",
      stats: [
        { big: "38,915", text: "The Nikkei 225's peak, reached at the end of December 1989. One broker predicted it would hit 80,000 by 1995; instead it fell about 60% by 1992." },
        { big: "+5,000%", text: "Rise in Japanese land prices from 1956 to 1986, falling in only one of those years, on a myth that land could only go up." },
        { big: "360 → ~120", text: "Yen per US dollar: the post-war fixed rate, and roughly where it went after the 1985 Plaza Accord, which doubled the price of Japanese exports." },
        { big: "~0.8%", text: "Japan's average annual real growth across the two lost decades, down from around 10% a year during the post-war miracle." }
      ],
      // An economic-history explainer about one country, linked to Japan on the
      // country map. It profiles no single company, so it adds nothing to the
      // company map (companies like Sony and Toyota appear only as examples).
      chain: []
    },
    {
      id: "seigniorage",
      href: "explainers/seigniorage.html",
      title: "The Lord's Cut: How Seigniorage Lets Money-Makers Profit",
      short: "The profit in making money",
      kicker: "Explainer",
      topic: "Seigniorage",
      category: "Market infrastructure",
      date: "2026-11-23",
      readMins: 13,
      dek: "Make a dollar for a few cents and spend it at face value, and you keep the difference. That gap is seigniorage, the oldest profit in finance. Medieval lords took it by minting coins and quietly shaving the silver out of them. Today a government, a bank and a stablecoin issuer each take a version of it. Here is how the same trick has worked from the mint to the blockchain.",
      summary: "The profit from issuing money, from coin debasement to central banks, bank deposits, stablecoins and CBDCs",
      thumb: "../images/thumbs/seigniorage.svg",
      stats: [
        { big: "~9¢", text: "Rough cost to the US to print a $100 note; the issuer captures almost the entire $100 of face value as seigniorage (Federal Reserve)." },
        { big: "98% → 2%", text: "Silver content of the Roman denarius from Augustus to the late third century, as emperors debased the coin to fund spending." },
        { big: "$76B", text: "Profit the Federal Reserve remitted to the US Treasury in 2021, largely interest on the assets behind the money it issued." },
        { big: "~$13B", text: "Tether's reported 2024 profit, earned by holding US Treasuries against the USDT it issues and keeping the yield." }
      ],
      // A concept explainer about how money issuers profit, from minting to
      // stablecoins. Not a company or single-country profile: no country link,
      // and nothing added to the company map.
      chain: []
    },
    {
      id: "asian-crisis",
      href: "explainers/asian-crisis.html",
      title: "The Domino Year: How the 1997 Asian Financial Crisis Spread",
      short: "The 1997 Asian crisis",
      kicker: "Explainer",
      topic: "Financial crises",
      category: "Economic history",
      date: "2026-11-23",
      readMins: 15,
      dek: "In July 1997 Thailand ran out of dollars defending its currency and let the baht float. It fell, and the panic jumped from one Asian economy to the next: Indonesia, Malaysia, the Philippines, then South Korea, in months. The IMF arrived with the largest rescues in its history and conditions that still divide economists. Here is how the dominoes fell, and what the bailouts did.",
      summary: "The baht's collapse, the contagion across Asia, the record IMF bailouts and their conditions, and Malaysia's different path",
      thumb: "../images/thumbs/asian-crisis.svg",
      stats: [
        { big: "Jul 2 1997", text: "The day Thailand abandoned its dollar peg and let the baht float, after burning through reserves defending it. The crisis spread from there." },
        { big: "~80%", text: "How far Indonesia's rupiah fell against the dollar at the depth of the crisis, wiping out companies that had borrowed in dollars." },
        { big: "~$58B", text: "South Korea's IMF-led rescue in December 1997, the largest in the Fund's history to that point." },
        { big: "4 phases", text: "The IMF's own split of the contagion: the lead-up in Thailand, the first spillover, the deepening across the ASEAN-4, and the spread to Korea and beyond." }
      ],
      // A regional economic-history explainer. Linked on the country map to the
      // economies deeply involved; it profiles no single company, so it adds
      // nothing to the company map.
      chain: []
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
    tether:   { name: "Tether",            hq: "British Virgin Islands", sector: "Stablecoin issuers" },
    circle:   { name: "Circle",            hq: "US",           sector: "Stablecoin issuers" },
    liquity:  { name: "Liquity (BOLD)",    hq: "Switzerland",  sector: "Stablecoin issuers" },
    terraform:{ name: "Terraform Labs",    hq: "South Korea",  sector: "Stablecoin issuers" },
    strategy: { name: "Strategy",          hq: "US",           sector: "Bitcoin treasuries" },
    sqm:      { name: "SQM",               hq: "Chile",        sector: "Iodine producers" },
    cosayach: { name: "Cosayach",          hq: "Chile",        sector: "Iodine producers" },
    acfminera:{ name: "ACF Minera",        hq: "Chile",        sector: "Iodine producers" },
    ise:      { name: "Ise Chemicals",     hq: "Japan",        sector: "Iodine producers" },
    godoshigen:{ name: "Godo Shigen",      hq: "Japan",        sector: "Iodine producers" },
    inpex:    { name: "INPEX",             hq: "Japan",        sector: "Iodine producers" }
  }
};
