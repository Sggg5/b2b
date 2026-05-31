(function () {
  const quoteKey = "frantaQuoteItems";

  function getProducts() {
    const embedded = document.getElementById("productsData");
    if (embedded) {
      try {
        return JSON.parse(embedded.textContent);
      } catch {
        return [];
      }
    }
    return [];
  }

  function getQuote() {
    try {
      return JSON.parse(localStorage.getItem(quoteKey) || "[]");
    } catch {
      return [];
    }
  }

  function setQuote(items) {
    localStorage.setItem(quoteKey, JSON.stringify([...new Set(items)]));
    updateQuoteCount();
    renderMiniQuote();
  }

  function updateQuoteCount() {
    const count = getQuote().length;
    document.querySelectorAll("[data-quote-count]").forEach((node) => {
      node.textContent = String(count);
    });
  }

  function addToQuote(slug) {
    setQuote([...getQuote(), slug]);
    const button = document.querySelector(`[data-add-quote="${slug}"]`);
    if (button) {
      const previous = button.textContent;
      button.textContent = "已加入";
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1200);
    }
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-add-quote]");
    if (!trigger) return;
    addToQuote(trigger.dataset.addQuote);
  });

  document.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-quote]");
    if (!remove) return;
    setQuote(getQuote().filter((slug) => slug !== remove.dataset.removeQuote));
  });

  function initFilters() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    const keyword = document.getElementById("keywordFilter");
    const category = document.getElementById("categoryFilter");
    const material = document.getElementById("materialFilter");
    const pressure = document.getElementById("pressureFilter");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");
    const categoryChoices = [...document.querySelectorAll("[data-category-choice]")];
    const cards = [...grid.querySelectorAll(".product-card")];

    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) category.value = params.get("category");

    function applyFilters() {
      const term = keyword.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matches =
          (!term || card.textContent.toLowerCase().includes(term)) &&
          (!category.value || card.dataset.category === category.value) &&
          (!material.value || card.dataset.material === material.value) &&
          (!pressure.value || card.dataset.pressure === pressure.value);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      resultCount.textContent = String(visible);
      emptyState.hidden = visible > 0;
      categoryChoices.forEach((choice) => {
        choice.classList.toggle("active", choice.dataset.categoryChoice === category.value);
      });
    }

    [keyword, category, material, pressure].forEach((control) => {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    categoryChoices.forEach((choice) => {
      choice.addEventListener("click", () => {
        category.value = choice.dataset.categoryChoice;
        applyFilters();
      });
    });

    document.getElementById("resetFilters").addEventListener("click", () => {
      keyword.value = "";
      category.value = "";
      material.value = "";
      pressure.value = "";
      applyFilters();
    });

    applyFilters();
  }

  function renderMiniQuote() {
    const container = document.getElementById("catalogQuoteItems");
    if (!container) return;

    const products = getProducts();
    const productBySlug = new Map(products.map((product) => [product.slug, product]));
    const selected = getQuote().map((slug) => productBySlug.get(slug)).filter(Boolean);

    if (!selected.length) {
      container.innerHTML = '<p class="empty-panel tight">尚未加入产品。</p>';
      return;
    }

    container.innerHTML = selected
      .map(
        (product) => `<article class="mini-quote-item">
          <div>
            <strong>${product.name}</strong>
            <span>${product.id}</span>
          </div>
          <button class="text-button" data-remove-quote="${product.slug}" type="button">移除</button>
        </article>`
      )
      .join("");
  }

  function initQuotePage() {
    const container = document.getElementById("quoteItems");
    if (!container) return;

    const products = getProducts();
    const productBySlug = new Map(products.map((product) => [product.slug, product]));

    function render() {
      const slugs = getQuote();
      const selected = slugs.map((slug) => productBySlug.get(slug)).filter(Boolean);

      if (!selected.length) {
        container.innerHTML = '<p class="empty-panel">询价单为空，请先从产品中心加入产品。</p>';
        return;
      }

      container.innerHTML = selected
        .map(
          (product) => `<article class="quote-item">
            <img src="${product.image}" alt="${product.name}">
            <div>
              <strong>${product.name}</strong>
              <span>${product.id} · ${product.material} · ${product.size}</span>
            </div>
            <button class="text-button" data-remove-quote="${product.slug}" type="button">移除</button>
          </article>`
        )
        .join("");
    }

    document.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-quote]");
      if (!remove) return;
      setQuote(getQuote().filter((slug) => slug !== remove.dataset.removeQuote));
      render();
    });

    document.getElementById("clearQuote").addEventListener("click", () => {
      setQuote([]);
      render();
    });

    document.getElementById("quoteForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const message = document.getElementById("quoteMessage");
      message.textContent = "询价信息已在本地完成校验。接入 Pages Functions 后即可提交到 D1。";
    });

    render();
  }

  updateQuoteCount();
  initFilters();
  renderMiniQuote();
  initQuotePage();
})();
