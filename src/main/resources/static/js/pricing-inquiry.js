(() => {
  document.querySelectorAll(".input-date").forEach((wrap) => {
    const display = wrap.querySelector(".date-display");
    const hidden = wrap.querySelector(".date-hidden");
    const btn = wrap.querySelector(".calendar-btn");
    const sync = (val) => {
      if (!val) return;
      const parts = val.split("-");
      if (parts.length !== 3) return;
      display.value = parts[1] + "/" + parts[2] + "/" + parts[0];
    };
    btn.addEventListener("click", () => (hidden.showPicker ? hidden.showPicker() : hidden.click()));
    hidden.addEventListener("change", (e) => sync(e.target.value));
  });

  const equalizeHeights = (selector) => {
    const items = Array.from(document.querySelectorAll(selector)).filter((el) => {
      if (el.closest("[hidden]") || el.closest(".collapsed")) return false;
      return el.offsetParent !== null;
    });
    if (!items.length) return;
    items.forEach((el) => (el.style.height = "auto"));
    const max = Math.max(...items.map((el) => el.offsetHeight));
    items.forEach((el) => (el.style.height = max + "px"));
  };

  const runLayout = () => {
    equalizeHeights(".inputs-card, .customer-card, .item-card");
    equalizeHeights(".pricing-info-card, .price-rule-card, .uom-card");
  };

  const runStabilized = () => {
    runLayout();
    requestAnimationFrame(runLayout);
  };

  const section = document.getElementById("priceSection");
  const toggle = section?.querySelector(".collapse-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const activePanel = section.querySelector(".tab-panel:not([hidden])");
      if (!activePanel) return;
      const collapsed = activePanel.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", (!collapsed).toString());
      runStabilized();
    });
  }

  const tabs = section?.querySelectorAll(".tab-btn");
  const panels = {
    "Price Breakdown": document.getElementById("priceBreakdown"),
    "Additional Information": document.getElementById("additionalInfo"),
    "Govt List Price and Limits": document.getElementById("govtLimits"),
  };
  tabs?.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(panels).forEach((p) => p?.setAttribute("hidden", "true"));
      const target = panels[tab.textContent?.trim() || ""];
      target?.removeAttribute("hidden");
      target?.classList.remove("collapsed");
      toggle?.setAttribute("aria-expanded", "true");
      runStabilized();
    });
  });

  const init = async () => {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // ignore font readiness errors
      }
    }
    runStabilized();
  };

  window.addEventListener("load", init);
  window.addEventListener("resize", () => {
    clearTimeout(window.__piResize);
    window.__piResize = setTimeout(runStabilized, 100);
  });

  if (window.ResizeObserver) {
    let rafId = 0;
    const ro = new ResizeObserver(() => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        runStabilized();
      });
    });
    document
      .querySelectorAll(".card-grid, .price-grid, .additional-grid")
      .forEach((el) => ro.observe(el));
  }
})();