window.addEventListener('DOMContentLoaded', () => {
  const copyResetDelay = 2000;
  const threadsHeightBuffer = 40;
  const copyResetTimers = new WeakMap();

  const isExternalHref = (href) => {
    if (!href || href.startsWith('#')) return false;

    try {
      const url = new URL(href, window.location.href);
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
      return isHttp && url.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  const enhanceLink = (anchor) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href');
    if (!isExternalHref(href)) return;

    anchor.target = '_blank';

    const relTokens = new Set(
      (anchor.getAttribute('rel') || '')
        .split(/\s+/)
        .filter(Boolean)
    );

    relTokens.add('noopener');
    relTokens.add('noreferrer');
    anchor.rel = Array.from(relTokens).join(' ');
  };

  const enhanceLinksIn = (root) => {
    if (root instanceof HTMLAnchorElement) {
      enhanceLink(root);
      return;
    }

    if (!(root instanceof Document || root instanceof Element)) return;
    root.querySelectorAll('a[href]').forEach(enhanceLink);
  };

  const hasMeaningfulNodeContent = (node) => {
    if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) return false;
    return Boolean((node.textContent || '').trim());
  };

  const normalizeProseMedia = (root = document) => {
    if (!(root instanceof Document || root instanceof Element)) return;

    root.querySelectorAll('.prose-body p').forEach((paragraph) => {
      if (!(paragraph instanceof HTMLParagraphElement)) return;

      const nodes = Array.from(paragraph.childNodes);
      const firstMeaningfulNode = nodes.find(hasMeaningfulNodeContent);
      if (!(firstMeaningfulNode instanceof HTMLImageElement)) return;

      const imageIndex = nodes.indexOf(firstMeaningfulNode);
      if (nodes.slice(0, imageIndex).some(hasMeaningfulNodeContent)) return;

      const captionNodes = nodes.slice(imageIndex + 1);
      if (!captionNodes.some(hasMeaningfulNodeContent)) return;

      const figure = document.createElement('figure');
      figure.className = 'prose-media';

      firstMeaningfulNode.classList.add('prose-media__image');
      figure.append(firstMeaningfulNode);

      const caption = document.createElement('figcaption');
      caption.className = 'prose-media__caption';
      captionNodes.forEach((node) => caption.append(node));
      figure.append(caption);

      paragraph.replaceWith(figure);
    });
  };

  const initializeThreadsEmbeds = (root = document) => {
    if (!(root instanceof Document || root instanceof Element)) return;

    root
      .querySelectorAll('.social-embed--threads .social-embed__script-wrap')
      .forEach((wrap) => {
        if (!(wrap instanceof HTMLElement)) return;
        if (!wrap.dataset.threadsReady) {
          wrap.dataset.threadsReady = 'false';
        }
      });
  };

  const adjustThreadsIframeHeight = (event) => {
    if (
      event.origin !== 'https://www.threads.net' &&
      event.origin !== 'https://www.threads.com'
    ) {
      return;
    }

    const nextHeight =
      typeof event.data === 'number'
        ? event.data
        : typeof event.data === 'string' && /^\d+$/.test(event.data.trim())
          ? Number(event.data.trim())
          : null;

    if (!nextHeight || !Number.isFinite(nextHeight)) return;

    document
      .querySelectorAll('.social-embed--threads .social-embed__script-wrap > iframe')
      .forEach((frame) => {
        if (!(frame instanceof HTMLIFrameElement)) return;
        if (frame.contentWindow !== event.source) return;

        frame.style.height = `${nextHeight + threadsHeightBuffer}px`;
        frame.style.maxHeight = '';

        const wrap = frame.parentElement;
        if (wrap instanceof HTMLElement) {
          wrap.dataset.threadsReady = 'true';
        }
        frame.style.setProperty('border-radius', '27px', 'important');
      });
  };

  const adjustInstagramIframeHeight = (event) => {
    if (event.origin !== 'https://www.instagram.com') return;

    let payload = event.data;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return;
      }
    }

    if (!payload || payload.type !== 'MEASURE') return;

    const nextHeight = payload.details && Number(payload.details.height);
    if (!nextHeight || !Number.isFinite(nextHeight)) return;

    document
      .querySelectorAll('.social-embed--instagram iframe')
      .forEach((frame) => {
        if (!(frame instanceof HTMLIFrameElement)) return;
        if (frame.contentWindow !== event.source) return;

        frame.style.height = `${nextHeight}px`;
      });
  };

  const adjustTwitterIframeHeight = (event) => {
    if (event.origin !== 'https://platform.twitter.com') return;

    let payload = event.data;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return;
      }
    }

    if (!payload || typeof payload !== 'object') return;

    const embed = payload['twttr.embed'];
    if (!embed || embed.method !== 'twttr.private.resize') return;

    const params = embed.params && embed.params[0];
    const nextHeight = params && Number(params.height);
    if (!nextHeight || !Number.isFinite(nextHeight)) return;
    const nextWidth = params && Number(params.width);

    document
      .querySelectorAll('.social-embed--twitter iframe')
      .forEach((frame) => {
        if (!(frame instanceof HTMLIFrameElement)) return;
        if (frame.contentWindow !== event.source) return;
        frame.style.height = `${nextHeight}px`;
        if (nextWidth && Number.isFinite(nextWidth)) {
          frame.style.width = `${nextWidth}px`;
        }
      });
  };

  const copyWithFallback = async (text) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to the legacy selection-based copy path.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';

    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  };

  const initializeRelativeTimes = (root = document) => {
    if (!(root instanceof Document || root instanceof Element)) return;

    const elements = [];
    if (root instanceof HTMLTimeElement && root.matches('time[data-relative-time]')) {
      elements.push(root);
    }

    root.querySelectorAll('time[data-relative-time]').forEach((element) => {
      elements.push(element);
    });

    elements.forEach((element) => {
      if (!(element instanceof HTMLTimeElement)) return;

      if (!element.dataset.absoluteLabel) {
        element.dataset.absoluteLabel = (element.textContent || '').trim();
      }

      const iso = element.getAttribute('datetime');
      if (!iso) return;

      const publishedAt = new Date(iso);
      if (Number.isNaN(publishedAt.getTime())) return;

      const diffMs = Date.now() - publishedAt.getTime();
      const dayMs = 24 * 60 * 60 * 1000;

      if (diffMs < 0 || diffMs >= dayMs) {
        element.textContent = element.dataset.absoluteLabel;
        return;
      }

      const totalMinutes = Math.floor(diffMs / (60 * 1000));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      element.textContent = hours > 0 ? `${hours}시간 ${minutes}분 전` : `${minutes}분 전`;
    });
  };

  const setCopyState = (button, statusText, nextLabel, isCopied) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const timerId = copyResetTimers.get(button);
    if (timerId) window.clearTimeout(timerId);

    const block = button.closest('.code-block');
    const status = block?.querySelector('[data-code-copy-status]');

    button.classList.toggle('is-copied', isCopied);
    button.setAttribute('aria-label', nextLabel);
    button.disabled = isCopied;
    if (isCopied) {
      button.style.color = 'var(--code-block-meta-color)';
      button.blur();
    } else {
      button.style.removeProperty('color');
    }

    if (status instanceof HTMLElement) {
      status.textContent = statusText;
    }

    const resetTimer = window.setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', '코드 복사');
      button.disabled = false;
      button.style.removeProperty('color');
      if (status instanceof HTMLElement) {
        status.textContent = '';
      }
      copyResetTimers.delete(button);
    }, copyResetDelay);

    copyResetTimers.set(button, resetTimer);
  };

  const handleCodeCopy = async (button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const block = button.closest('.code-block');
    const code = block?.querySelector('.code-block__body code');
    const codeText = code?.textContent;
    if (!codeText) return;

    button.disabled = true;

    const didCopy = await copyWithFallback(codeText);

    setCopyState(
      button,
      didCopy ? '코드를 복사했습니다.' : '코드 복사에 실패했습니다.',
      didCopy ? '복사 완료' : '코드 복사',
      didCopy
    );

    if (!didCopy) {
      button.disabled = false;
    }
  };

  normalizeProseMedia(document);
  enhanceLinksIn(document);
  initializeRelativeTimes(document);
  initializeThreadsEmbeds(document);
  window.addEventListener('message', adjustThreadsIframeHeight);
  window.addEventListener('message', adjustInstagramIframeHeight);
  window.addEventListener('message', adjustTwitterIframeHeight);

  const twitterDarkMq = window.matchMedia('(prefers-color-scheme: dark)');

  const applyTwitterTheme = (dark) => {
    document.querySelectorAll('.social-embed--twitter iframe').forEach((frame) => {
      if (!(frame instanceof HTMLIFrameElement) || !frame.src) return;
      try {
        const url = new URL(frame.src);
        url.searchParams.set('theme', dark ? 'dark' : 'light');
        frame.src = url.toString();
      } catch { /* invalid src, skip */ }
    });
  };

  applyTwitterTheme(twitterDarkMq.matches);
  twitterDarkMq.addEventListener('change', (e) => applyTwitterTheme(e.matches));

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('[data-code-copy]');
    if (!(button instanceof HTMLButtonElement)) return;

    event.preventDefault();
    void handleCodeCopy(button);
  });

  if (!document.body || typeof MutationObserver === 'undefined') return;

  const applyThreadsRadius = (node) => {
    if (!(node instanceof Element)) return;
    const frames = node instanceof HTMLIFrameElement && node.closest('.social-embed--threads')
      ? [node]
      : Array.from(node.querySelectorAll('.social-embed--threads iframe'));
    frames.forEach((f) => f.style.setProperty('border-radius', '27px', 'important'));
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        normalizeProseMedia(node);
        enhanceLinksIn(node);
        initializeRelativeTimes(node);
        initializeThreadsEmbeds(node);
        applyThreadsRadius(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
