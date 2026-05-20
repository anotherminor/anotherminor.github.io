window.addEventListener('DOMContentLoaded', () => {
  if (!window.PagefindUI) return;

  const textWalkerFilter = NodeFilter.SHOW_TEXT;
  const comparablePattern = /[\s"'“”‘’….,:;!?()[\]\-]+/g;

  const normalizeComparableText = (value) => value.replace(comparablePattern, '');
  const normalizeRenderedText = (value) =>
    normalizeComparableText((value ?? '').replace(/\u00a0/g, ' ').trim()).toLowerCase();

  const trimLeadingWhitespaceFromHTML = (html) => {
    if (!html) return html;

    const template = document.createElement('template');
    template.innerHTML = html;

    const trimLeadingNode = (node) => {
      while (node.firstChild) {
        const firstChild = node.firstChild;

        if (firstChild.nodeType === Node.TEXT_NODE) {
          const value = firstChild.textContent ?? '';
          const trimmed = value.replace(/^\s+/, '');

          if (!trimmed) {
            firstChild.remove();
            continue;
          }

          firstChild.textContent = trimmed;
          return;
        }

        if (firstChild.nodeType === Node.ELEMENT_NODE) {
          trimLeadingNode(firstChild);

          if (!(firstChild.textContent ?? '').trim()) {
            firstChild.remove();
            continue;
          }

          return;
        }

        firstChild.remove();
      }
    };

    trimLeadingNode(template.content);
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!(node instanceof HTMLElement)) continue;
      if (node.tagName !== 'MARK') continue;
      if ((node.textContent ?? '').trim()) continue;

      node.remove();
    }

    return template.innerHTML;
  };

  const stripLeadingEmptyMarkup = (html) => {
    if (!html) return html;

    const template = document.createElement('template');
    template.innerHTML = html;

    while (template.content.firstChild) {
      const firstChild = template.content.firstChild;

      if (firstChild.nodeType === Node.TEXT_NODE) {
        if ((firstChild.textContent ?? '').trim()) break;
        firstChild.remove();
        continue;
      }

      if (firstChild.nodeType === Node.ELEMENT_NODE) {
        if ((firstChild.textContent ?? '').trim()) break;
        firstChild.remove();
        continue;
      }

      firstChild.remove();
    }

    return template.innerHTML;
  };

  const cleanExcerptMarkup = (result) => {
    let excerptContent = '';
    if (result.excerpt) {
      let cleanedExcerpt = trimLeadingWhitespaceFromHTML(result.excerpt);
      cleanedExcerpt = stripLeadingEmptyMarkup(cleanedExcerpt).trim();
      excerptContent = cleanedExcerpt;
    }
    
    // Build meta string (Category · Date)
    const metaParts = [];
    if (result.meta?.category) {
      metaParts.push(result.meta.category);
    }
    if (result.meta?.date) {
      metaParts.push(result.meta.date);
    }
    
    let metaMarkup = '';
    if (metaParts.length > 0) {
      const metaText = metaParts.join(' &middot; ');
      metaMarkup = `<div class="pagefind-ui__result-meta">${metaText}</div>`;
    }

    result.excerpt = `<div class="excerpt-text">${excerptContent}</div>${metaMarkup}`;
    return result;
  };


  // Hugo build alone does not create the search index.
  // Run `npx pagefind --site public` after `hugo`, or use this repo's standard
  // `npm run search:index` / `npm run build` flow so the pinned Pagefind version
  // indexes only `posts/**/*.html`. Without that step, search will show no results.
  const ui = new window.PagefindUI({
    element: '#search',
    showImages: false,
    showEmptyFilters: false,
    showSubResults: false,
    processResult: cleanExcerptMarkup,
    resetStyles: false,
    excerptLength: 45,
    translations: {
      placeholder: '검색어를 입력하세요',
      clear_search: '지우기',
      load_more: '더 보기',
      search_label: '사이트 검색'
    }
  });

  const searchEl = document.querySelector('#search');
  if (!searchEl) return;
  const heroTitleEl = document.querySelector('[data-search-hero-title]');
  const numberFormat = new Intl.NumberFormat('ko-KR');
  let statusFrame = 0;
  let statusTimeouts = [];
  const defaultHeroTitle = heroTitleEl?.textContent?.trim() || '검색';
  let lastQuery = '';

  const readCount = () => {
    const excluded = searchEl.querySelectorAll('.pagefind-ui__result[data-excluded]').length;
    const messageText = searchEl.querySelector('.pagefind-ui__message')?.textContent?.trim() ?? '';
    const normalized = messageText.replaceAll(',', '');
    const match = normalized.match(/\d+/);
    if (match) return Math.max(0, Number.parseInt(match[0], 10) - excluded);
    return searchEl.querySelectorAll('.pagefind-ui__result:not([data-excluded])').length;
  };

  const updateStatus = () => {
    if (!heroTitleEl) return;

    const input = searchEl.querySelector('.pagefind-ui__search-input');
    const query = (input instanceof HTMLInputElement && input.value.trim())
      ? input.value.trim()
      : lastQuery;
    if (!query) {
      heroTitleEl.textContent = defaultHeroTitle;
      return;
    }

    heroTitleEl.textContent = `'${query}' ${numberFormat.format(readCount())}건`;
  };

  const shouldHideRenderedExcerpt = (titleText, excerptText) => {
    const normalizedTitle = normalizeRenderedText(titleText);
    const normalizedExcerpt = normalizeRenderedText(excerptText);

    if (!normalizedExcerpt) return true;
    if (!normalizedTitle) return false;
    if (normalizedExcerpt === normalizedTitle) return true;
    if (normalizedExcerpt.length <= 14 && normalizedTitle.includes(normalizedExcerpt)) return true;

    return false;
  };

  const isResultRelevantToQuery = (query, content) => {
    const stripped = query.replace(/\s+/g, '');
    if (stripped.length < 2) return true;
    // Require a longer common substring for longer queries to avoid false positives.
    // e.g. "안녕하세요" (5 chars) requires 4-char match like "안녕하세" or "녕하세요".
    const minLen = Math.min(stripped.length, 4);
    const lower = content.toLowerCase();
    for (let i = 0; i <= stripped.length - minLen; i++) {
      if (lower.includes(stripped.slice(i, i + minLen).toLowerCase())) return true;
    }
    return false;
  };

  const sanitizeRenderedExcerpts = () => {
    const input = searchEl.querySelector('.pagefind-ui__search-input');
    const query = (input instanceof HTMLInputElement && input.value.trim())
      ? input.value.trim()
      : lastQuery;

    searchEl.querySelectorAll('.pagefind-ui__result').forEach((resultEl) => {
      const titleText = resultEl.querySelector('.pagefind-ui__result-title')?.textContent ?? '';
      const excerptEl = resultEl.querySelector('.pagefind-ui__result-excerpt');
      if (!(excerptEl instanceof HTMLElement)) return;

      // Make sure we only check the text node / mark nodes, and exclude the meta section
      let excerptText = '';
      Array.from(excerptEl.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          excerptText += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('pagefind-ui__result-meta')) {
          excerptText += node.textContent;
        }
      });
      excerptText = excerptText.trim();

      if (!isResultRelevantToQuery(query, titleText + excerptText)) {
        resultEl.dataset.excluded = 'true';
        resultEl.style.display = 'none';
        return;
      }

      delete resultEl.dataset.excluded;
      resultEl.style.removeProperty('display');

      if (shouldHideRenderedExcerpt(titleText, excerptText)) {
        // Hide only the excerpt text wrapper, leave the meta block visible
        const excerptTextEl = excerptEl.querySelector('.excerpt-text');
        if (excerptTextEl) {
          excerptTextEl.style.display = 'none';
        } else {
          excerptEl.style.display = 'none';
        }
        return;
      }

      const excerptTextEl = excerptEl.querySelector('.excerpt-text');
      if (excerptTextEl) {
        excerptTextEl.style.removeProperty('display');
      }
      excerptEl.style.removeProperty('display');
    });
  };

  const scheduleStatusUpdate = () => {
    window.cancelAnimationFrame(statusFrame);
    statusTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    statusTimeouts = [];

    statusFrame = window.requestAnimationFrame(() => {
      sanitizeRenderedExcerpts();
      updateStatus();
    });
    [120, 320].forEach((delay) => {
      statusTimeouts.push(window.setTimeout(() => {
        updateStatus();
        sanitizeRenderedExcerpts();
      }, delay));
    });

    sanitizeRenderedExcerpts();
  };

  // Re-run sanitization whenever Pagefind renders or updates results in the DOM.
  // Uses setTimeout (not rAF) so it fires even when the tab is in the background.
  let observerTimerId = 0;
  const resultsObserver = new MutationObserver(() => {
    clearTimeout(observerTimerId);
    observerTimerId = setTimeout(() => {
      sanitizeRenderedExcerpts();
      updateStatus();
    }, 50);
  });
  resultsObserver.observe(searchEl, { childList: true, subtree: true });

  searchEl.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains('pagefind-ui__search-input')) return;
    lastQuery = target.value.trim();
    scheduleStatusUpdate();
  });

  scheduleStatusUpdate();

  searchEl.addEventListener('click', (event) => {
    const a = event.target.closest('a');
    if (a) {
      a.rel = a.rel ? `${a.rel} noopener noreferrer`.trim() : 'noopener noreferrer';
    }

    const button = event.target.closest('.pagefind-ui__button');
    if (button) {
      scheduleStatusUpdate();
    }
  });

  window.addEventListener('beforeunload', () => {
    window.cancelAnimationFrame(statusFrame);
    clearTimeout(observerTimerId);
    statusTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    resultsObserver.disconnect();
  }, { once: true });

  void ui;
});
