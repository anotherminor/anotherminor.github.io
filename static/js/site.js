window.addEventListener('DOMContentLoaded', () => {
  const copyResetDelay = 2000;
  const threadsHeightBuffer = 30;
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

  const setCopyState = (button, statusText, nextLabel, isCopied) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const timerId = copyResetTimers.get(button);
    if (timerId) window.clearTimeout(timerId);

    const block = button.closest('.code-block');
    const status = block?.querySelector('[data-code-copy-status]');

    button.classList.toggle('is-copied', isCopied);
    button.setAttribute('aria-label', nextLabel);

    if (status instanceof HTMLElement) {
      status.textContent = statusText;
    }

    const resetTimer = window.setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', '코드 복사');
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

    button.disabled = false;
  };

  enhanceLinksIn(document);
  initializeThreadsEmbeds(document);
  window.addEventListener('message', adjustThreadsIframeHeight);

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('[data-code-copy]');
    if (!(button instanceof HTMLButtonElement)) return;

    event.preventDefault();
    void handleCodeCopy(button);
  });

  if (!document.body || typeof MutationObserver === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        enhanceLinksIn(node);
        initializeThreadsEmbeds(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
