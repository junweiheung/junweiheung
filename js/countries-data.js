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
/*
 * A country is listed when an article is MAINLY about a single company (labelled
 * with that company's home country) OR when an article is mainly about one
 * country's own economy or history. Articles about an industry, a mechanism or
 * several companies spread across places have no country.
 */
window.BOTTLENECK_COUNTRIES = {
  countries: {
    "United States of America": {
      articles: [
        { title: "Who owns Anthropic? Inside the $1.5 trillion IPO", href: "explainers/anthropic-ipo.html" },
        { title: "From a $2 stock to the trillion-dollar club: how AMD came back", href: "explainers/amd.html" },
        { title: "The bank behind the currency market (CLS)", href: "explainers/cls.html" }
      ]
    },
    "Japan": {
      articles: [
        { title: "The cloth inside the chip (Nittobo)", href: "explainers/glass-cloth.html" },
        { title: "The biggest bubble in history: Japan's lost decades", href: "explainers/japan-bubble.html" }
      ]
    }
  }
};
