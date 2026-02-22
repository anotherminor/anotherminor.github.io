window.addEventListener('DOMContentLoaded', () => {
  if (!window.PagefindUI) return;

  const ui = new window.PagefindUI({
    element: '#search',
    showSubResults: false,
    resetStyles: false,
    excerptLength: 22,
    translations: {
      placeholder: '검색어를 입력하세요',
      clear_search: '지우기',
      load_more: '더 보기',
      search_label: '사이트 검색'
    }
  });

  const searchEl = document.querySelector('#search');
  if (!searchEl) return;

  searchEl.addEventListener('click', (event) => {
    const a = event.target.closest('a');
    if (!a) return;
    a.rel = a.rel ? `${a.rel} noopener noreferrer`.trim() : 'noopener noreferrer';
  });

  void ui;
});
