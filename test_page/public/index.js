window.onload = function() {
  const wally = new WallyConnector('b174c436-9dc3-452d-b511-cb6c13de63b8', { isDevelopment: true });
  const loginBtn = document.querySelector('input[type="button"]');
  loginBtn.onclick = () => {
    wally.loginWithEmail();
  };

  if (wally.isRedirected()) {
    wally.handleRedirect();
  }
};
