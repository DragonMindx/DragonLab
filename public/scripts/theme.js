// Apply saved theme
if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");

// BG preload: fade in after both images loaded
(function() {
  var day = new Image(); var night = new Image(); var loaded = 0;
  function done() { if (++loaded === 2) document.documentElement.classList.add("bg-loaded"); }
  day.onload = night.onload = done;
  day.src = "/DragonLab/images/Bg_Norway_lofoten_mountains.jpg";
  night.src = "/DragonLab/images/Bg_Norway_dusk.jpg";
})();

document.addEventListener("DOMContentLoaded", function() {
  // Theme toggle
  var btn = document.getElementById("themeToggle");
  if (btn) {
    var d = document.documentElement.classList.contains("dark");
    btn.textContent = d ? "☀ Light" : "🌙 Dark";
    btn.addEventListener("click", function() {
      var dark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", dark ? "dark" : "light");
      btn.textContent = dark ? "☀ Light" : "🌙 Dark";
    });
  }

  // Back to top
  var btt = document.createElement("button");
  btt.className = "back-to-top"; btt.textContent = "↑";
  document.body.appendChild(btt);
  btt.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", function() { btt.style.opacity = window.scrollY > 300 ? "1" : "0"; });

  // Code copy
  document.querySelectorAll(".article-content pre").forEach(function(pre) {
    if (!pre.querySelector("code")) return;
    pre.style.position = "relative";
    var cp = document.createElement("button");
    cp.className = "code-copy"; cp.textContent = "Copy";
    cp.addEventListener("click", function() {
      var code = pre.querySelector("code")?.textContent || "";
      navigator.clipboard.writeText(code).then(function() {
        cp.textContent = "Copied!";
        setTimeout(function() { cp.textContent = "Copy"; }, 1500);
      });
    });
    pre.appendChild(cp);
  });
});
