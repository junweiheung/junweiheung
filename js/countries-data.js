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
 * with that company's home country), when an article is mainly about one
 * country's own economy or history, OR, for a regional story, the specific
 * countries that were deeply involved. Articles about an industry or a mechanism
 * with no particular geography have no country.
 */
window.BOTTLENECK_COUNTRIES = {
  countries: {
    "United States of America": {
      articles: [
        { title: "Who owns Anthropic? Inside the $1.5 trillion IPO", href: "explainers/anthropic-ipo.html" },
        { title: "The safety lab that became a juggernaut: the Anthropic story", href: "explainers/anthropic-story.html" },
        { title: "From a $2 stock to the trillion-dollar club: how AMD came back", href: "explainers/amd.html" },
        { title: "Ask why: the rise and fall of Enron", href: "explainers/enron.html" },
        { title: "The bank behind the currency market (CLS)", href: "explainers/cls.html" },
        { title: "One seesaw, two fears: how the Fed uses the bond market", href: "explainers/bond-market.html" },
        { title: "Lending to governments: US Treasuries vs Singapore's bonds", href: "explainers/govt-bonds.html" }
      ]
    },
    "Singapore": {
      articles: [
        { title: "Lending to governments: US Treasuries vs Singapore's bonds", href: "explainers/govt-bonds.html" },
        { title: "The saver's ladder: from fixed deposits to stocks", href: "explainers/risk-ladder.html" }
      ]
    },
    "Germany": {
      articles: [
        { title: "The dark wizard: how Hjalmar Schacht paid for Hitler's rearmament", href: "explainers/schacht.html" }
      ]
    },
    "Japan": {
      articles: [
        { title: "The cloth inside the chip (Nittobo)", href: "explainers/glass-cloth.html" },
        { title: "The biggest bubble in history: Japan's lost decades", href: "explainers/japan-bubble.html" }
      ]
    },
    "China": {
      articles: [
        { title: "Three Kingdoms: how the Han empire broke apart", href: "explainers/three-kingdoms.html" },
        { title: "Chu and Han: from the First Emperor's death to Empress Lü's", href: "explainers/chu-han.html" }
      ]
    },
    "Thailand": {
      articles: [
        { title: "The domino year: the 1997 Asian financial crisis", href: "explainers/asian-crisis.html" }
      ]
    },
    "Indonesia": {
      articles: [
        { title: "The domino year: the 1997 Asian financial crisis", href: "explainers/asian-crisis.html" }
      ]
    },
    "South Korea": {
      articles: [
        { title: "The domino year: the 1997 Asian financial crisis", href: "explainers/asian-crisis.html" }
      ]
    },
    "Malaysia": {
      articles: [
        { title: "The domino year: the 1997 Asian financial crisis", href: "explainers/asian-crisis.html" }
      ]
    },
    "Philippines": {
      articles: [
        { title: "The domino year: the 1997 Asian financial crisis", href: "explainers/asian-crisis.html" }
      ]
    },
    "Greece": {
      articles: [
        { title: "The debt that nearly broke the euro: Greece's crisis", href: "explainers/greece-crisis.html" }
      ]
    }
  }
};
