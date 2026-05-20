(function () {
  var root = document.querySelector('.interactions');
  if (!root) return;

  var SLUG = root.dataset.slug;
  var URL  = root.dataset.url;
  var KEY  = root.dataset.key;
  var EDGE = root.dataset.edge;
  var LIKE_KEY = 'liked_' + SLUG;
  var deletingId = null;
  var dialog = document.getElementById('del-modal');
  var likeBtn = document.getElementById('like-btn');
  var commentList = document.getElementById('comment-list');
  var commentForm = document.getElementById('comment-form');
  var commentSubmit = commentForm.querySelector('.comment-form__submit');
  var deleteForm = document.getElementById('del-form');
  var deleteConfirm = document.getElementById('del-confirm');

  // ── helpers ──

  function headers(extra) {
    var h = {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Content-Type': 'application/json'
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  async function parseBody(res) {
    var text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_err) {
      return text;
    }
  }

  function readError(err, fallback) {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    return fallback;
  }

  async function rpc(fn, body, fallback) {
    return request(
      'rpc/' + fn,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body)
      },
      fallback
    );
  }

  async function request(path, opts, fallback) {
    var res = await fetch(URL + '/rest/v1/' + path, opts);
    var payload = await parseBody(res);
    if (!res.ok) {
      var message = fallback;
      if (payload && typeof payload === 'object') {
        message = payload.message || payload.error_description || payload.error || fallback;
      } else if (typeof payload === 'string' && payload) {
        message = payload;
      }
      var error = new Error(message);
      error.status = res.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function fmt(iso) {
    return new Date(iso).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }

  async function hashPw(salt, pw) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + pw));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function setCommentState(message) {
    commentList.innerHTML = '<p class="comment-list__empty">' + esc(message) + '</p>';
  }

  function togglePending(button, pending) {
    if (!button) return;
    button.disabled = pending;
    button.setAttribute('aria-busy', pending ? 'true' : 'false');
  }

  function openDialog() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', 'open');
    }
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  // ── 조회수 ──

  async function trackView() {
    try {
      var next = await rpc(
        'increment_views',
        { page_slug: SLUG },
        '조회수를 업데이트하지 못했습니다.'
      );
      document.getElementById('view-count').textContent = Number(next || 0).toLocaleString();
    } catch (err) {
      document.getElementById('view-count').textContent = '-';
      console.error('Failed to track view:', err);
    }
  }

  // ── 좋아요 ──

  async function loadLikes() {
    try {
      var data = await request(
        'page_likes?slug=eq.' + encodeURIComponent(SLUG) + '&select=count',
        { headers: headers() },
        '좋아요 수를 불러오지 못했습니다.'
      );
      var n = data && data[0] ? Number(data[0].count) || 0 : 0;
      document.getElementById('like-count').textContent = n.toLocaleString();
    } catch (err) {
      document.getElementById('like-count').textContent = '-';
      console.error('Failed to load likes:', err);
    }

    if (localStorage.getItem(LIKE_KEY)) {
      likeBtn.classList.add('liked');
    }
  }

  likeBtn.addEventListener('click', async function () {
    var liked = !!localStorage.getItem(LIKE_KEY);
    var delta = liked ? -1 : 1;
    togglePending(likeBtn, true);

    try {
      var next = await rpc(
        'toggle_like',
        { page_slug: SLUG, delta: delta },
        '좋아요 처리에 실패했습니다.'
      );
      next = Math.max(0, Number(next || 0));
      document.getElementById('like-count').textContent = next.toLocaleString();
      if (liked) {
        localStorage.removeItem(LIKE_KEY);
        likeBtn.classList.remove('liked');
      } else {
        localStorage.setItem(LIKE_KEY, '1');
        likeBtn.classList.add('liked');
      }
    } catch (err) {
      alert(readError(err, '좋아요 처리에 실패했습니다.'));
    } finally {
      togglePending(likeBtn, false);
    }
  });

  // ── 댓글 목록 ──

  async function loadComments() {
    try {
      var data = await request(
        'comments?slug=eq.' + encodeURIComponent(SLUG) + '&select=id,name,content,created_at&order=created_at.asc',
        { headers: headers() },
        '댓글을 불러오지 못했습니다.'
      );
      var count = Array.isArray(data) ? data.length : 0;
      document.getElementById('comment-count').textContent = count ? '(' + count + ')' : '';

      if (!count) {
        setCommentState('첫 댓글을 남겨주세요!');
        return;
      }

      commentList.innerHTML = data.map(function (c) {
        return '<div class="comment-item" id="cm-' + c.id + '">'
          + '<div class="comment-item__meta">'
          + '<span class="comment-item__name">' + esc(c.name) + '</span>'
          + '<span class="comment-item__date">' + fmt(c.created_at) + '</span>'
          + '</div>'
          + '<div class="comment-item__body">' + esc(c.content) + '</div>'
          + '<button type="button" class="comment-item__del" data-id="' + esc(c.id) + '">삭제</button>'
          + '</div>';
      }).join('');
    } catch (err) {
      document.getElementById('comment-count').textContent = '';
      setCommentState(readError(err, '댓글을 불러오지 못했습니다.'));
      console.error('Failed to load comments:', err);
    }
  }

  // ── 댓글 등록 ──

  commentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var name    = document.getElementById('c-name').value.trim();
    var pw      = document.getElementById('c-pw').value;
    var content = document.getElementById('c-body').value.trim();
    if (!name || !pw || !content) {
      alert('이름, 비밀번호, 댓글 내용을 모두 입력해주세요.');
      return;
    }

    togglePending(commentSubmit, true);
    try {
      var password_salt = crypto.randomUUID();
      var password_hash = await hashPw(password_salt, pw);
      await request(
        'comments',
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ slug: SLUG, name: name, content: content, password_hash: password_hash, password_salt: password_salt })
        },
        '댓글 등록에 실패했습니다.'
      );
      document.getElementById('c-name').value = '';
      document.getElementById('c-pw').value   = '';
      document.getElementById('c-body').value = '';
      await loadComments();
    } catch (err) {
      alert(readError(err, '댓글 등록에 실패했습니다.'));
    } finally {
      togglePending(commentSubmit, false);
    }
  });

  // ── 삭제 모달 ──

  commentList.addEventListener('click', function (e) {
    var btn = e.target.closest('.comment-item__del');
    if (!btn) return;
    deletingId = btn.dataset.id;
    document.getElementById('del-pw').value = '';
    openDialog();
  });

  document.getElementById('del-cancel').addEventListener('click', function () {
    closeDialog();
    deletingId = null;
  });

  async function submitDelete() {
    var pw = document.getElementById('del-pw').value;
    if (!pw) { alert('비밀번호를 입력해주세요.'); return; }
    if (!deletingId) { alert('삭제할 댓글을 다시 선택해주세요.'); return; }
    if (!EDGE) { alert('삭제 기능 URL이 설정되지 않았습니다.'); return; }

    togglePending(deleteConfirm, true);
    try {
      var res = await fetch(EDGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': KEY,
          'Authorization': 'Bearer ' + KEY
        },
        body: JSON.stringify({ id: deletingId, password: pw })
      });
      var payload = await parseBody(res);
      if (!res.ok) {
        throw new Error(
          payload && typeof payload === 'object'
            ? (payload.message || payload.error || '삭제 실패')
            : (typeof payload === 'string' && payload ? payload : '삭제 실패')
        );
      }
      closeDialog();
      deletingId = null;
      await loadComments();
    } catch (err) {
      alert(readError(err, '삭제 실패'));
    } finally {
      togglePending(deleteConfirm, false);
    }
  }

  deleteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitDelete();
  });

  // ── init ──

  trackView();
  loadLikes();
  loadComments();
})();