/*
 * Bottleneck country map data. Isolated from articles.js and the company map:
 * this is the macro, country-level view of the series.
 *
 * To add or update a country, edit `countries` below.
 *   - The key MUST match the country name in js/vendor/countries-110m.json exactly.
 *     Examples: "United States of America", "South Korea", "Taiwan", "Bosnia and Herz.".
 *   - `articles` is the list of pieces that cover that country. The map shades each
 *     country by how many articles it has (articles.length), so you don't keep a
 *     separate count in sync.
 *   - `href` is optional; relative to the html/ folder. Omit it for pieces not yet live.
 *
 * Countries not listed here are drawn empty (zero articles).
 */
window.BOTTLENECK_COUNTRIES = {
  countries: {
    "United States of America": {
      articles: [
        { title: "Why the Fed fights its own bond market", href: "explainers/bond-market.html" },
        { title: "Lending to governments: US Treasuries vs Singapore's bonds", href: "explainers/govt-bonds.html" },
        { title: "Keeping a coin worth a dollar: how stablecoins hold their peg", href: "explainers/stablecoins.html" },
        { title: "Three companies, four battlegrounds: AMD vs Intel vs Nvidia", href: "explainers/chip-share.html" }
      ]
    },
    "Taiwan": {
      articles: [
        { title: "Who keeps the money?", href: "explainers/smile.html" },
        { title: "The cloth inside the chip", href: "explainers/glass-cloth.html" }
      ]
    },
    "Japan": {
      articles: [
        { title: "The cloth inside the chip", href: "explainers/glass-cloth.html" },
        { title: "The crystal behind your scan", href: "explainers/iodine.html" }
      ]
    },
    "Chile": {
      articles: [
        { title: "The crystal behind your scan and your screen", href: "explainers/iodine.html" }
      ]
    },
    "South Korea": {
      articles: [
        { title: "Who keeps the money?", href: "explainers/smile.html" },
        { title: "Keeping a coin worth a dollar: how stablecoins hold their peg", href: "explainers/stablecoins.html" }
      ]
    },
    "Netherlands": {
      articles: [
        { title: "Who keeps the money?", href: "explainers/smile.html" }
      ]
    },
    "Singapore": {
      articles: [
        { title: "The bank behind the currency market", href: "explainers/cls.html" },
        { title: "Lending to governments: US Treasuries vs Singapore's bonds", href: "explainers/govt-bonds.html" }
      ]
    }
  }
};
