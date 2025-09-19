const connectWalletBtn = document.getElementById('connectWalletBtn');
const logoutBtn = document.getElementById('logoutBtn');
const switchNetworkBtn = document.getElementById('switchNetworkBtn');
const walletAddress = document.getElementById('walletAddress');
const networkStatus = document.getElementById('networkStatus');

const BSC_MAINNET_CHAIN_ID = '0x38';

// 页面加载
window.onload = async () => {
    await updateStatus();
}

async function updateStatus() {
    if (typeof window.ethereum !== 'undefined') {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        networkStatus.textContent = chainId === BSC_MAINNET_CHAIN_ID ? '网络状态：✅ BSC 主网' : '网络状态：❌ 非BSC主网';
        switchNetworkBtn.style.display = chainId === BSC_MAINNET_CHAIN_ID ? 'none' : 'inline-block';

        walletAddress.textContent = accounts.length > 0 ? `钱包状态：✅ ${shortenAddress(accounts[0])}` : '钱包状态：❌ 未连接';
    } else {
        networkStatus.textContent = '网络状态：❌ 未安装钱包';
        walletAddress.textContent = '钱包状态：❌ 未连接';
    }
}

// 连接钱包
connectWalletBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) walletAddress.textContent = `钱包状态：✅ ${shortenAddress(accounts[0])}`;
        await updateStatus();
    } else {
        alert('请安装 MetaMask 钱包');
    }
});

// 切换网络
switchNetworkBtn.addEventListener('click', async () => {
    try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BSC_MAINNET_CHAIN_ID }] });
        await updateStatus();
    } catch {
        alert('切换网络失败，请手动切换到 BSC 主网');
    }
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    walletAddress.textContent = '钱包状态：❌ 未连接';
    logoutBtn.style.display = 'none';
    connectWalletBtn.style.display = 'inline-block';
    switchNetworkBtn.style.display = 'none';
});

function shortenAddress(address) {
    return address.slice(0,6) + '...' + address.slice(-4);
}
