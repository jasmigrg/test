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
      requestAnimationFrame(runStabilized);
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
      requestAnimationFrame(runStabilized);
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

  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const applyData = (data, prefixes = null) => {
    if (!data) return;
    document.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.getAttribute("data-field");
      if (!key) return;
      if (prefixes && !prefixes.some((p) => key.startsWith(p))) return;
      const val = getByPath(data, key);
      if (typeof val === "undefined") return;
      if (el.type === "checkbox") {
        el.checked = Boolean(val);
        return;
      }
      if (el.type === "radio") {
        el.checked = String(el.value) === String(val);
        return;
      }
      el.value = val;
    });
  };

  const fetchPricingData = async (itemNumber) => {
    const ctx = window.__ctx || "";
    const url = `${ctx}/api/pricing-inquiry?itemNumber=${encodeURIComponent(itemNumber || "")}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Mock API failed");
    return res.json();
  };

  const inputsScope = ["inputs."];
  let cachedData = null;

  const itemInput = document.querySelector('[data-field="inputs.itemNumber"]');
  const getPriceBtn = document.querySelector(".inputs-card .primary");
  const clearBtn = document.querySelector('[data-action="clear"]');
  const itemError = document.querySelector('[data-role="item-error"]');

  if (itemInput) {
    const handleItem = async () => {
      const itemNumber = itemInput.value.trim();
      if (!itemNumber) {
        if (itemError) itemError.hidden = true;
        return;
      }
      try {
        const data = await fetchPricingData(itemNumber);
        if (data && data.error) {
          if (itemError) itemError.hidden = false;
          return;
        }
        if (itemError) itemError.hidden = true;
        cachedData = data;
        applyData(data, inputsScope);
      } catch (e) {
        // ignore for mock failures
      }
    };
    itemInput.addEventListener("change", handleItem);
    itemInput.addEventListener("blur", handleItem);
    itemInput.addEventListener("input", () => {
      if (itemError) itemError.hidden = true;
    });
  }

  if (getPriceBtn) {
    getPriceBtn.addEventListener("click", async () => {
      const itemNumber = itemInput?.value?.trim() || "";
      try {
        const data = cachedData || (await fetchPricingData(itemNumber));
        if (data && data.error) {
          if (itemError) itemError.hidden = false;
          return;
        }
        if (itemError) itemError.hidden = true;
        cachedData = data;
        applyData(data);
      } catch (e) {
        // ignore for mock failures
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      cachedData = null;
      if (itemError) itemError.hidden = true;
      document.querySelectorAll("[data-field]").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") {
          el.checked = false;
          return;
        }
        el.value = "";
      });
      document.querySelectorAll(".input-date").forEach((wrap) => {
        const display = wrap.querySelector(".date-display");
        const hidden = wrap.querySelector(".date-hidden");
        if (display) display.value = "";
        if (hidden) hidden.value = "";
      });
    });
  }

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