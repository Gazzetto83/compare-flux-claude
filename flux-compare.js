(function () {
  "use strict";

  function initFluxCompare(root) {
    if (!root) return;

    const srcEl1 = root.querySelector('[data-flux-src="1"]');
    const srcEl2 = root.querySelector('[data-flux-src="2"]');
    const stage = root.querySelector(".flux-cmp__stage");
    const hintEl = root.querySelector(".flux-cmp__hint");
    const subControls = root.querySelector(".flux-cmp__subbar-controls");
    const tabs = root.querySelectorAll(".flux-cmp__tab");
    const swapBtn = root.querySelector('[data-action="swap"]');

    const images = [
      { src: srcEl1 ? srcEl1.getAttribute("src") : "flux1.jpg", label: "FLUX.1" },
      { src: srcEl2 ? srcEl2.getAttribute("src") : "flux2.jpg", label: "FLUX.2" }
    ];

    let swapped = false;
    let currentMode = "v-split";
    let zoomLevel = 2.5;
    let selectedColumn = 0;

    function getPair() {
      return swapped ? [images[1], images[0]] : [images[0], images[1]];
    }

    function getLoupeSize() {
      return window.innerWidth <= 600 ? 120 : 180;
    }

    function renderZoomControl() {
      subControls.innerHTML = `
        <label style="display:inline-flex;align-items:center;gap:6px;">
          Zoom: <strong id="fc-zoom-val">${zoomLevel}x</strong>
          <input type="range" min="1.5" max="4" step="0.5" value="${zoomLevel}" style="accent-color:#e53935;">
        </label>
      `;
      const range = subControls.querySelector("input");
      const valLabel = subControls.querySelector("#fc-zoom-val");
      range.addEventListener("input", function (e) {
        zoomLevel = parseFloat(e.target.value);
        valLabel.textContent = zoomLevel + "x";
      });
    }

    function renderColumnControl() {
      const cols = ["Col 1 (FP4 / NVFP4)", "Col 2 (FP8)", "Col 3 (FP16 / BF16)"];
      subControls.innerHTML = cols
        .map(
          (name, idx) =>
            `<button type="button" class="flux-cmp__pill ${
              selectedColumn === idx ? "is-active" : ""
            }" data-col="${idx}">${name}</button>`
        )
        .join("");

      subControls.querySelectorAll(".flux-cmp__pill").forEach((btn) => {
        btn.addEventListener("click", function () {
          selectedColumn = parseInt(btn.dataset.col, 10);
          render();
        });
      });
    }

    function render() {
      const [first, second] = getPair();
      subControls.innerHTML = "";
      stage.innerHTML = "";

      if (currentMode === "v-split" || currentMode === "h-split") {
        const isH = currentMode === "h-split";
        hintEl.textContent = isH
          ? "Drag vertically to compare top and bottom."
          : "Drag horizontally to compare left and right.";

        stage.innerHTML = `
          <div class="flux-cmp__overlay-box ${isH ? "is-horizontal" : ""}">
            <img class="flux-cmp__img-base" src="${second.src}" alt="${second.label}">
            <img class="flux-cmp__img-top" src="${first.src}" alt="${first.label}">
            <div class="${isH ? "flux-cmp__divider-h" : "flux-cmp__divider-v"}"></div>
            <span class="flux-cmp__badge flux-cmp__badge--left">${first.label}</span>
            <span class="flux-cmp__badge flux-cmp__badge--right">${second.label}</span>
          </div>
        `;

        const box = stage.querySelector(".flux-cmp__overlay-box");
        const topImg = stage.querySelector(".flux-cmp__img-top");
        const divider = stage.querySelector(
          isH ? ".flux-cmp__divider-h" : ".flux-cmp__divider-v"
        );

        if (isH) {
          topImg.style.clipPath = "inset(0 0 50% 0)";
        }

        function updateSplit(clientX, clientY) {
          const rect = box.getBoundingClientRect();
          if (isH) {
            const pct = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
            topImg.style.clipPath = `inset(0 0 ${100 - pct}% 0)`;
            divider.style.top = pct + "%";
          } else {
            const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            topImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
            divider.style.left = pct + "%";
          }
        }

        box.addEventListener("mousemove", (e) => updateSplit(e.clientX, e.clientY));
        box.addEventListener("touchstart", (e) => {
          if (e.touches && e.touches[0]) updateSplit(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        box.addEventListener("touchmove", (e) => {
          if (e.touches && e.touches[0]) updateSplit(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
      } else if (currentMode === "magnifier") {
        hintEl.textContent = `Hover or touch to magnify ${first.label}. Click "Swap Images" to inspect ${second.label}.`;
        renderZoomControl();

        stage.innerHTML = `
          <div class="flux-cmp__mag-box">
            <img class="flux-cmp__img-base" src="${first.src}" alt="${first.label}">
            <div class="flux-cmp__loupe"></div>
            <span class="flux-cmp__badge flux-cmp__badge--left">Inspecting: ${first.label}</span>
          </div>
        `;

        const box = stage.querySelector(".flux-cmp__mag-box");
        const loupe = stage.querySelector(".flux-cmp__loupe");

        function updateMag(clientX, clientY) {
          const rect = box.getBoundingClientRect();
          const half = getLoupeSize() / 2;
          const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
          const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

          loupe.style.display = "block";
          loupe.style.left = x - half + "px";
          loupe.style.top = y - half + "px";
          loupe.style.backgroundImage = `url('${first.src}')`;
          loupe.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
          loupe.style.backgroundPosition = `-${x * zoomLevel - half}px -${y * zoomLevel - half}px`;
        }

        box.addEventListener("mouseenter", () => { loupe.style.display = "block"; });
        box.addEventListener("mouseleave", () => { loupe.style.display = "none"; });
        box.addEventListener("mousemove", (e) => updateMag(e.clientX, e.clientY));

        box.addEventListener("touchstart", (e) => {
          if (e.touches && e.touches[0]) updateMag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        box.addEventListener("touchmove", (e) => {
          if (e.touches && e.touches[0]) updateMag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        box.addEventListener("touchend", () => { loupe.style.display = "none"; });
      } else if (currentMode === "sync-loupe") {
        hintEl.textContent = "Hover or touch either image to inspect the exact same spot simultaneously.";
        renderZoomControl();

        stage.innerHTML = `
          <div class="flux-cmp__dual-box">
            <div class="flux-cmp__dual-pane" data-pane="0">
              <img src="${first.src}" alt="${first.label}">
              <div class="flux-cmp__loupe"></div>
              <span class="flux-cmp__badge flux-cmp__badge--left">${first.label}</span>
            </div>
            <div class="flux-cmp__dual-pane" data-pane="1">
              <img src="${second.src}" alt="${second.label}">
              <div class="flux-cmp__loupe"></div>
              <span class="flux-cmp__badge flux-cmp__badge--left">${second.label}</span>
            </div>
          </div>
        `;

        const panes = stage.querySelectorAll(".flux-cmp__dual-pane");
        const loupes = stage.querySelectorAll(".flux-cmp__loupe");
        const srcs = [first.src, second.src];

        function updateSync(pane, clientX, clientY) {
          const rect = pane.getBoundingClientRect();
          const half = getLoupeSize() / 2;
          const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

          panes.forEach((targetPane, idx) => {
            const tRect = targetPane.getBoundingClientRect();
            const x = relX * tRect.width;
            const y = relY * tRect.height;
            const l = loupes[idx];

            l.style.display = "block";
            l.style.left = x - half + "px";
            l.style.top = y - half + "px";
            l.style.backgroundImage = `url('${srcs[idx]}')`;
            l.style.backgroundSize = `${tRect.width * zoomLevel}px ${tRect.height * zoomLevel}px`;
            l.style.backgroundPosition = `-${x * zoomLevel - half}px -${y * zoomLevel - half}px`;
          });
        }

        panes.forEach((pane) => {
          pane.addEventListener("mouseenter", () => {
            loupes.forEach((l) => (l.style.display = "block"));
          });
          pane.addEventListener("mouseleave", () => {
            loupes.forEach((l) => (l.style.display = "none"));
          });
          pane.addEventListener("mousemove", (e) => updateSync(pane, e.clientX, e.clientY));

          pane.addEventListener("touchstart", (e) => {
            if (e.touches && e.touches[0]) updateSync(pane, e.touches[0].clientX, e.touches[0].clientY);
          }, { passive: true });
          pane.addEventListener("touchmove", (e) => {
            if (e.touches && e.touches[0]) updateSync(pane, e.touches[0].clientX, e.touches[0].clientY);
          }, { passive: true });
          pane.addEventListener("touchend", () => {
            loupes.forEach((l) => (l.style.display = "none"));
          });
        });
      } else if (currentMode === "stack") {
        hintEl.textContent = "Full banners stacked vertically for overview comparison.";
        stage.innerHTML = `
          <div class="flux-cmp__stack-box">
            <div class="flux-cmp__stack-item">
              <img src="${first.src}" alt="${first.label}">
              <span class="flux-cmp__badge flux-cmp__badge--left">${first.label}</span>
            </div>
            <div class="flux-cmp__stack-item">
              <img src="${second.src}" alt="${second.label}">
              <span class="flux-cmp__badge flux-cmp__badge--left">${second.label}</span>
            </div>
          </div>
        `;
      } else if (currentMode === "column") {
        hintEl.textContent = "Select a column precision to compare single snow globes 1-to-1.";
        renderColumnControl();
        const shiftPct = selectedColumn * 33.3333;

        stage.innerHTML = `
          <div class="flux-cmp__col-box">
            <div class="flux-cmp__col-card">
              <img src="${first.src}" alt="${first.label}" style="transform: translateX(-${shiftPct}%);">
              <span class="flux-cmp__badge flux-cmp__badge--left">${first.label}</span>
            </div>
            <div class="flux-cmp__col-card">
              <img src="${second.src}" alt="${second.label}" style="transform: translateX(-${shiftPct}%);">
              <span class="flux-cmp__badge flux-cmp__badge--left">${second.label}</span>
            </div>
          </div>
        `;
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        currentMode = tab.dataset.mode;
        render();
      });
    });

    if (swapBtn) {
      swapBtn.addEventListener("click", function () {
        swapped = !swapped;
        render();
      });
    }

    render();
  }

  function boot() {
    initFluxCompare(document.getElementById("flux-compare-widget"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
