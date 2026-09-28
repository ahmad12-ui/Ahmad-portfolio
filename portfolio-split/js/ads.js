/* ==========================================================
   Adsterra banner loader
   - Har device par sirf wahi banner load hota hai jo fit ho
     (hidden banners load nahi hote => policy-safe, fast)
   - Banners scroll ke qareeb aane par load hote hain (lazy)
   - atOptions global hai, isliye banners ek ke baad ek
     (sequential queue) load hote hain taake config mix na ho
   - Adblock / load failure par slot khud chhup jata hai
   ========================================================== */
(function () {
  "use strict";

  var HOST = "https://www.highrevenueformat.com/";

  // Aapke Adsterra ad units (key, width, height)
  var UNITS = {
    "728x90": { key: "3d95ab51de0e1a598b5f070d26b3e31d", w: 728, h: 90 },
    "468x60": { key: "a55aa3a15f23e65ca55656dabbc9611b", w: 468, h: 60 },
    "320x50": { key: "ca3cf6c43cef959526c563bbd24ccfa9", w: 320, h: 50 },
    "300x250": { key: "f65657d90d7fd2babb44ae484807cb58", w: 300, h: 250 },
    "160x600": { key: "6a729157aa78b0d75685f7e0d3d5ab7f", w: 160, h: 600 },
    "160x300": { key: "57d882a6d5a4f8eee73a93d816d13d94", w: 160, h: 300 },
  };

  // Slot name -> screen size ke hisaab se konsa unit use hoga
  function pick(name) {
    var w = window.innerWidth,
      h = window.innerHeight;
    switch (name) {
      case "leaderboard":
        return w >= 760 ? "728x90" : w >= 500 ? "468x60" : "320x50";
      case "rectangle":
        return "300x250";
      case "rail-left":
        return w >= 1500 && h >= 720 ? "160x600" : null;
      case "rail-right":
        return w >= 1500 ? "160x300" : null;
      default:
        return null;
    }
  }

  var queue = [];
  var busy = false;

  function next() {
    if (busy || !queue.length) return;
    busy = true;

    var job = queue.shift();
    var unit = UNITS[job.unit];
    var finished = false;

    function finish(failed) {
      if (finished) return;
      finished = true;
      if (failed && job.slot.parentNode)
        job.slot.parentNode.removeChild(job.slot);
      busy = false;
      next();
    }

    // Space pehle se reserve (layout shift se bachne ke liye)
    job.box.style.width = unit.w + "px";
    job.box.style.height = unit.h + "px";
    job.slot.classList.add("is-ready");

    window.atOptions = {
      key: unit.key,
      format: "iframe",
      height: unit.h,
      width: unit.w,
      params: {},
    };

    var s = document.createElement("script");
    s.async = true;
    s.src = HOST + unit.key + "/invoke.js";
    s.onload = function () {
      finish(false);
    };
    s.onerror = function () {
      finish(true);
    };
    job.box.appendChild(s);

    // Agar network slow ho to queue ko atakne na do
    setTimeout(function () {
      finish(false);
    }, 6000);
  }

  function enqueue(slot, unitName) {
    var box = slot.querySelector(".ad-box");
    if (!box) return;
    queue.push({ slot: slot, box: box, unit: unitName });
    next();
  }

  function init() {
    var slots = document.querySelectorAll(".ad-slot[data-ad]");

    var io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            function (entries) {
              entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                enqueue(e.target, e.target.getAttribute("data-unit"));
              });
            },
            { rootMargin: "400px 0px" },
          )
        : null;

    Array.prototype.forEach.call(slots, function (slot) {
      var unit = pick(slot.getAttribute("data-ad"));
      if (!unit) {
        slot.parentNode && slot.parentNode.removeChild(slot);
        return;
      }
      slot.setAttribute("data-unit", unit);
      if (io) io.observe(slot);
      else enqueue(slot, unit);
    });

    // Native banner: agar 8 sec baad bhi khali ho (adblock etc.) to slot chhupa do
    var nativeBox = document.getElementById(
      "container-893526f03d70dded36b6b4e8090a597d",
    );
    if (nativeBox) {
      setTimeout(function () {
        if (!nativeBox.children.length) {
          var slot = nativeBox.closest(".ad-slot");
          if (slot) slot.style.display = "none";
        }
      }, 8000);
    }
  }

  // Page load hone ke baad start => portfolio ki speed par asar nahi
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
