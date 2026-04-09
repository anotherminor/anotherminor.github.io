window.addEventListener('DOMContentLoaded', () => {
  const copyResetDelay = 2000;
  const threadsHeightBuffer = 30;
  const imageTooltipOffset = 14;
  const imageTooltipLongPressDelay = 450;
  const imageTooltipLongPressMoveThreshold = 12;
  const copyResetTimers = new WeakMap();
  let imageTooltipElement = null;
  let imageTooltipImage = null;
  let imageTooltipLongPressImage = null;
  let imageTooltipLongPressTimer = 0;
  let imageTooltipPointerId = null;
  let imageTooltipPointerStartX = 0;
  let imageTooltipPointerStartY = 0;
  let imageTooltipSuppressClickUntil = 0;

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
      element.textContent = `${hours}시간 ${minutes}분 전`;
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

  const getImageTooltipText = (image) => {
    if (!(image instanceof HTMLImageElement)) return '';
    return (image.getAttribute('alt') || '').trim();
  };

  const getImageTooltipElement = () => {
    if (imageTooltipElement instanceof HTMLElement) return imageTooltipElement;
    if (!document.body) return null;

    const tooltip = document.createElement('div');
    tooltip.className = 'image-alt-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.append(tooltip);
    imageTooltipElement = tooltip;
    return tooltip;
  };

  const positionImageTooltip = (tooltip, x, y) => {
    const margin = 16;
    const { innerWidth, innerHeight } = window;
    const tooltipRect = tooltip.getBoundingClientRect();

    let nextLeft = x - tooltipRect.width / 2;
    nextLeft = Math.max(margin, Math.min(nextLeft, innerWidth - tooltipRect.width - margin));

    let nextTop = y - tooltipRect.height - imageTooltipOffset;
    if (nextTop < margin) {
      nextTop = Math.min(y + imageTooltipOffset, innerHeight - tooltipRect.height - margin);
    }

    tooltip.style.left = `${Math.round(nextLeft)}px`;
    tooltip.style.top = `${Math.round(Math.max(margin, nextTop))}px`;
  };

  const showImageTooltip = (image, point = null) => {
    const text = getImageTooltipText(image);
    const tooltip = getImageTooltipElement();
    if (!text || !(tooltip instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return;

    tooltip.textContent = text;
    tooltip.dataset.visible = 'true';
    imageTooltipImage = image;

    const rect = image.getBoundingClientRect();
    const anchorX = point && Number.isFinite(point.x) ? point.x : rect.left + rect.width / 2;
    const anchorY = point && Number.isFinite(point.y) ? point.y : rect.top;

    positionImageTooltip(tooltip, anchorX, anchorY);
  };

  const hideImageTooltip = () => {
    if (!(imageTooltipElement instanceof HTMLElement)) return;
    imageTooltipElement.dataset.visible = 'false';
    imageTooltipImage = null;
  };

  const clearImageTooltipLongPressTimer = () => {
    if (!imageTooltipLongPressTimer) return;
    window.clearTimeout(imageTooltipLongPressTimer);
    imageTooltipLongPressTimer = 0;
  };

  const clearImageTooltipLongPressState = () => {
    clearImageTooltipLongPressTimer();
    imageTooltipPointerId = null;
    imageTooltipPointerStartX = 0;
    imageTooltipPointerStartY = 0;
    imageTooltipLongPressImage = null;
  };

  const findTooltipImage = (target) => {
    if (!(target instanceof Element)) return null;
    const image = target.closest('.prose-body img');
    if (!(image instanceof HTMLImageElement)) return null;
    return getImageTooltipText(image) ? image : null;
  };

  enhanceLinksIn(document);
  initializeRelativeTimes(document);
  initializeThreadsEmbeds(document);
  window.addEventListener('message', adjustThreadsIframeHeight);
  window.addEventListener('message', adjustInstagramIframeHeight);
  window.addEventListener('scroll', hideImageTooltip, { passive: true });
  window.addEventListener('resize', hideImageTooltip);

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (Date.now() < imageTooltipSuppressClickUntil && findTooltipImage(target)) {
      event.preventDefault();
      imageTooltipSuppressClickUntil = 0;
      return;
    }

    const button = target.closest('[data-code-copy]');
    if (!(button instanceof HTMLButtonElement)) return;

    event.preventDefault();
    void handleCodeCopy(button);
  });

  document.addEventListener('mouseover', (event) => {
    const image = findTooltipImage(event.target);
    if (!image) return;

    showImageTooltip(image);
  });

  document.addEventListener('mouseout', (event) => {
    const image = findTooltipImage(event.target);
    if (!image) return;

    const related = event.relatedTarget;
    if (related instanceof Node && image.contains(related)) return;
    if (imageTooltipLongPressImage === image) return;
    hideImageTooltip();
  });

  document.addEventListener('pointerdown', (event) => {
    const image = findTooltipImage(event.target);
    if (!image || event.pointerType === 'mouse') return;

    clearImageTooltipLongPressState();
    imageTooltipPointerId = event.pointerId;
    imageTooltipPointerStartX = event.clientX;
    imageTooltipPointerStartY = event.clientY;
    imageTooltipLongPressImage = image;
    imageTooltipLongPressTimer = window.setTimeout(() => {
      if (!(imageTooltipLongPressImage instanceof HTMLImageElement)) return;
      showImageTooltip(imageTooltipLongPressImage, {
        x: event.clientX,
        y: event.clientY,
      });
      imageTooltipSuppressClickUntil = Date.now() + 400;
      clearImageTooltipLongPressTimer();
    }, imageTooltipLongPressDelay);
  });

  document.addEventListener('pointermove', (event) => {
    if (
      imageTooltipPointerId === null ||
      event.pointerId !== imageTooltipPointerId ||
      !imageTooltipLongPressTimer
    ) {
      return;
    }

    const deltaX = event.clientX - imageTooltipPointerStartX;
    const deltaY = event.clientY - imageTooltipPointerStartY;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < imageTooltipLongPressMoveThreshold) return;

    clearImageTooltipLongPressState();
  });

  document.addEventListener('pointerup', (event) => {
    if (imageTooltipPointerId === null || event.pointerId !== imageTooltipPointerId) return;

    clearImageTooltipLongPressTimer();
    if (imageTooltipLongPressImage) {
      hideImageTooltip();
    }
    clearImageTooltipLongPressState();
  });

  document.addEventListener('pointercancel', (event) => {
    if (imageTooltipPointerId === null || event.pointerId !== imageTooltipPointerId) return;

    hideImageTooltip();
    clearImageTooltipLongPressState();
  });

  document.addEventListener('contextmenu', (event) => {
    const image = findTooltipImage(event.target);
    if (!image || image !== imageTooltipLongPressImage) return;

    event.preventDefault();
  });

  if (!document.body || typeof MutationObserver === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        enhanceLinksIn(node);
        initializeRelativeTimes(node);
        initializeThreadsEmbeds(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
