window.addEventListener('DOMContentLoaded', async () => {
  if (!window.PagefindUI) return;
  new window.PagefindUI({
    element: '#search',
    showSubResults: true,
    resetStyles: false,
    excerptLength: 18
  });
});
