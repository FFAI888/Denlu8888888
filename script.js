/* script.js v1.06 */
// 公共 JS：钱包连接 + BN 链检测 + 防绕过登录功能

const BSC_CHAIN_ID_DEC = 56; // BN 链主网十进制

// 登录页：连接钱包按钮逻辑
const connectWalletBtn = document.getElementById('connectWalletBtn');
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdDec = parseInt(chainId, 16);

      if (chainIdDec !== BSC_CHAIN_ID_DEC) {
        alert('请切换到 Binance Smart Chain (BN链)！');
        return;
      }

      // 设置登录状态标识
      sessionStorage.setItem('walletConnected', 'true');
      alert(`钱包已连接：${accounts[0]}`);
      window.location.href = 'confirm.html';
    } catch (error) {
      alert('钱包连接失败！');
      console.error(error);
    }
  });
}

// 检测钱包和链网
async function checkWalletAndChain() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        alert('钱包未连接，请先连接钱包！');
        sessionStorage.removeItem('walletConnected');
        window.location.href = 'index.html';
        return false;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdDec = parseInt(chainId, 16);

      if (chainIdDec !== BSC_CHAIN_ID_DEC) {
        alert('请切换到 Binance Smart Chain (BN链)！');
        sessionStorage.removeItem('walletConnected');
        window.location.href = 'index.html';
        return false;
      }

      return true;
    } catch (error) {
      console.error('检查钱包失败', error);
      alert('钱包连接异常，请重新登录！');
      sessionStorage.removeItem('walletConnected');
      window.location.href = 'index.html';
      return false;
    }
  } else {
    alert('请安装 MetaMask 钱包！');
    window.location.href = 'index.html';
    return false;
  }
}

// 初始化页面检查（防绕过登录 + 链检测）
async function initPageCheck() {
  if (sessionStorage.getItem('walletConnected') !== 'true') {
    alert('请先通过登录页面连接钱包！');
    window.location.href = 'index.html';
    return;
  }

  const ok = await checkWalletAndChain();
  if (!ok) return;

  // 监听账户变化
  window.ethereum.on('accountsChanged', () => {
    alert('钱包账户发生变化，请重新登录！');
    sessionStorage.removeItem('walletConnected');
    window.location.href = 'index.html';
  });

  // 监听链网络变化
  window.ethereum.on('chainChanged', async (chainId) => {
    const chainIdDec = parseInt(chainId, 16);
    if (chainIdDec !== BSC_CHAIN_ID_DEC) {
      alert('切换的网络不是 BN 链，请重新登录！');
      sessionStorage.removeItem('walletConnected');
      window.location.href = 'index.html';
    }
  });
}
