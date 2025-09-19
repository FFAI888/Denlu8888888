// 登录页：连接钱包按钮逻辑
const connectWalletBtn = document.getElementById('connectWalletBtn');

connectWalletBtn.addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      alert(`钱包已连接：${accounts[0]}`);
      window.location.href = 'confirm.html';
    } catch (error) {
      alert('钱包连接失败！');
      console.error(error);
    }
  } else {
    alert('请安装 MetaMask 钱包！');
  }
});
