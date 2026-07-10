(function() {
  var lastTs = Number(localStorage.getItem("dl-sync-ts")) || 0;
  var toast = document.createElement("div");
  toast.className = "sync-toast";
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  function show(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function() { toast.classList.remove("show"); }, 3500);
  }

  setInterval(function() {
    fetch("/DragonLab/sync-status.json")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.ts > lastTs) {
          lastTs = d.ts;
          localStorage.setItem("dl-sync-ts", String(lastTs));
          var msg = "\u2713 Synced: " + d.copied + " copied";
          if (d.skipped) msg += ", " + d.skipped + " skipped";
          msg += "  " + d.time;
          show(msg);
        }
      })
      .catch(function() {}); // silent fail when file doesn't exist yet
  }, 3000);
})();
