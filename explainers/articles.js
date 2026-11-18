/*
 * Bottleneck: the single source of truth for every explainer.
 *
 * Both explainers/index.html and the homepage (../index.html) read this file.
 * To publish a new explainer:
 *   1. Put the page in this folder, e.g. explainers/gpus.html
 *   2. Put a 16:9 thumbnail in explainers/thumbs/ (SVG or PNG)
 *   3. Add an entry to the END of `articles` below. The newest date is shown as "Latest";
 *      if two share a date, the one added later wins.
 *   4. Add any new companies to `companies` (the id is what you use in `chain`).
 *
 * `chain` drives the company map: each step lists the companies the explainer covers at that step.
 * A company that appears in several explainers links them together on the map.
 * `margins` is optional: what each company keeps per dollar, as reported in that explainer.
 * Paths (href, thumb) are relative to the explainers/ folder.
 */
window.BOTTLENECK = {
  articles: [
    {
      id: "smile",
      href: "smile.html",
      title: "Who Keeps the Money? The Smile Curve of AI Chips",
      short: "Who keeps the money?",
      kicker: "Investigation",
      topic: "Semiconductors",
      date: "2026-11-18",
      readMins: 12,
      dek: "The world will spend about $1.5 trillion on chips this year. I followed one AI chip through eight companies to see who actually keeps the money. The answer bends a thirty-year-old rule.",
      summary: "Eight companies, one chip, and why margin follows scarcity",
      thumb: "thumbs/smile.svg",
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
      href: "gpu-unlock.html",
      title: "Unlocked, and Still Out of Reach: The Hidden Compute in Gaming GPUs",
      short: "Unlocked, and still out of reach",
      kicker: "Explainer",
      topic: "GPUs",
      date: "2026-11-18",
      readMins: 10,
      dek: "An open-source unlock nearly doubles the AI compute of RTX 30 and 40 graphics cards. Gamers get 0% more frames, and used prices keep climbing. Here's why the unlock helps the people who need it least.",
      summary: "A compute unlock, a used-card rush, and why gamers lose the bidding war",
      thumb: "thumbs/gpu-unlock.svg",
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
    }
  ],

  companies: {
    nvidia:   { name: "Nvidia",            hq: "US" },
    amd:      { name: "AMD",               hq: "US" },
    broadcom: { name: "Broadcom",          hq: "US" },
    synopsys: { name: "Synopsys",          hq: "US" },
    cadence:  { name: "Cadence",           hq: "US" },
    asml:     { name: "ASML",              hq: "Netherlands" },
    amat:     { name: "Applied Materials", hq: "US" },
    lam:      { name: "Lam Research",      hq: "US" },
    tel:      { name: "Tokyo Electron",    hq: "Japan" },
    kla:      { name: "KLA",               hq: "US" },
    tsmc:     { name: "TSMC",              hq: "Taiwan" },
    skhynix:  { name: "SK hynix",          hq: "South Korea" },
    samsung:  { name: "Samsung",           hq: "South Korea" },
    micron:   { name: "Micron",            hq: "US" },
    ase:      { name: "ASE",               hq: "Taiwan" },
    foxconn:  { name: "Foxconn",           hq: "Taiwan" },
    quanta:   { name: "Quanta",            hq: "Taiwan" },
    wistron:  { name: "Wistron",           hq: "Taiwan" },
    asus:     { name: "ASUS",              hq: "Taiwan" },
    msi:      { name: "MSI",               hq: "Taiwan" }
  }
};
