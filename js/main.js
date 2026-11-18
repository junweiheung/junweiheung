// Loader counter, then reveal the page
(function () {
  const loader = document.getElementById("loader");
  const count = document.getElementById("count");
  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let n = 0;
  function finish() {
    count.textContent = "100%";
    loader.classList.add("done");
    document.body.classList.add("ready");
    setTimeout(() => loader.remove(), 1400);
  }
  if (reduce) return finish();
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.ceil(Math.random() * 9));
    count.textContent = n + "%";
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(finish, 250);
    }
  }, 45);
})();

// Scroll reveal
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((e) => io.observe(e));
})();

// Predict my order
(function () {
  const drinks = [
    "Kopi O",
    "Milo Dinosaur",
    "Iced Lemon Tea",
    "Kopi C Kosong",
    "Bandung",
    "Teh Halia",
    "Yuan Yang",
    "Barley Peng",
    "Plain Water",
    "Hot Milo",
    "Soya Bean",
    "Teh O Limau",
  ];
  const notes = [
    "The barista sighs.",
    "Model confidence: 99%. Model accuracy: still 0%.",
    "He stared at me for three full seconds.",
    "Someone’s sales dashboard just broke.",
    "Retraining model… on the exact same data.",
    "Edge case detected. Again.",
    "He is questioning his career choices.",
  ];
  let orders = 0,
    last = "";
  const $ = (id) => document.getElementById(id);
  $("order").addEventListener("click", () => {
    let pick;
    do {
      pick = drinks[Math.floor(Math.random() * drinks.length)];
    } while (pick === last);
    last = pick;
    orders++;
    $("actual").textContent = pick;
    $("orders").textContent = orders;
    $("correct").textContent = 0;
    $("acc").textContent = "0%";
    $("note").textContent = notes[(orders - 1) % notes.length];
  });
  $("year").textContent = new Date().getFullYear();
})();
