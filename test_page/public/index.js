window.onload = function() {
  const wally = new WallyConnector('103be027-a1a6-486c-ae24-0d19909b36d4', { isDevelopment: true });
  const loginBtn = document.querySelector('input[type="button"]');
  loginBtn.onclick = () => {
    wally.loginWithEmail();
  };

  if (wally.isRedirected()) {
    wally.handleRedirect();
  }
};
