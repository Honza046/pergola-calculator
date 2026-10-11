(function () {
  var SOURCE = "pergola-calculator";

  function bind(frame) {
    if (frame.__pergolaBound) return;
    frame.__pergolaBound = true;
    window.addEventListener("message", function (event) {
      var data = event.data;
      if (!data || data.source !== SOURCE || event.source !== frame.contentWindow) return;
      if (data.type === "resize" && typeof data.height === "number") {
        frame.style.height = Math.max(640, Math.ceil(data.height)) + "px";
      }
    });
  }

  function scan() {
    document.querySelectorAll("iframe[data-pergola-calculator]").forEach(bind);
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
