/* script.js v1.11 */
// 公共 JS：钱包连接 + BN 链检测 + 防绕过登录功能

const BSC_CHAIN_ID_DEC = 56; // BN 链主网十进制

// 等待 window.ethereum 初始化
async function waitForEthereum(timeout = 5000) {
  const start = Date.now();
  while (!window.ethereum) {
    if (Date.now() - start > timeout) return false;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

// 获取链 ID（兼容多浏览器）
async function getChainId() {
  let chainId;
  try {
    chainId = await window.ethereum.request({ method: 'eth_chainId' });
  } catch {
    try {
      chainId = await window.ethereum.request({ method: 'net_version' });
    } catch {
      chainId = null;
    }
  }

  if (!chainId) return null;

  if (chainId.startsWith('0x')) return parseInt(chainId, 16);
  return parseInt(chainId, 10);
}

// 检测钱包和链网
async function checkWalletAndChain() {
  const ethReady = await waitForEthereum();
  if (!ethReady) {
    alert('未检测到 MetaMask，请安装或刷新浏览器！');
    window.location.href = 'index.html';
    return false;
  }

  if (!window.ethereum) {
    alert('请安装 MetaMask 钱包！');
    window.location.href = 'index.html';
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      alert('钱包未连接，请先连接钱包！');
      sessionStorage.removeItem('walletConnected');
      window.location.href = 'index.html';
      return false;
    }

    const chainIdDec = await getChainId();
    if (chainIdDec !== BSC_CHAIN_ID_DEC) {
      alert('请切换到 Binance Smart Chain (BN 链)！');
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

  window.ethereum.on('accountsChanged', async () => {
    await checkWalletAndChain();
  });

  window.ethereum.on('chainChanged', async () => {
    await checkWalletAndChain();
  });
}
