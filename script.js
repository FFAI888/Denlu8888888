const connectWalletBtn = document.getElementById('connectWalletBtn');
const logoutBtn = document.getElementById('logoutBtn');
const switchNetworkBtn = document.getElementById('switchNetworkBtn');
const walletAddress = document.getElementById('walletAddress');
const networkStatus = document.getElementById('networkStatus');

const BSC_MAINNET_CHAIN_ID = '0x38';
const BSC_MAINNET_PARAMS = {
    chainId: BSC_MAINNET_CHAIN_ID,
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
};

// 页面加载检查状态
window.onload = async () => {
    const savedAddress = localStorage.getItem('walletAddress');
    const savedChain = localStorage.getItem('chainId');

    if (savedAddress && savedChain === BSC_MAINNET_CHAIN_ID) {
        walletAddress.innerHTML = `钱包状态：✅ ${shortenAddress(savedAddress)}`;
        connectWalletBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        clearLoginState();
    }
    await updateNetworkStatus();
}

async function updateNetworkStatus() {
    if (typeof window.ethereum !== 'undefined') {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        // 网络状态
        if (chainId === BSC_MAINNET_CHAIN_ID) {
            networkStatus.innerHTML = `网络状态：✅ BSC 主网`;
            networkStatus.classList.remove('network-warning');
            networkStatus.classList.add('network-ok');
            switchNetworkBtn.style.display = "none";
        } else {
            networkStatus.innerHTML = `网络状态：❌ 非BSC主网`;
            networkStatus.classList.remove('network-ok');
            networkStatus.classList.add('network-warning');
            switchNetworkBtn.style.display = "inline-block";
        }

        // 钱包状态
        if (accounts.length > 0) {
            walletAddress.innerHTML = `钱包状态：✅ ${shortenAddress(accounts[0])}`;
        } else {
            walletAddress.innerHTML = `钱包状态：❌ 未连接`;
        }
    } else {
        networkStatus.innerHTML = `网络状态：❌ 未安装钱包`;
        walletAddress.innerHTML = `钱包状态：❌ 未连接`;
    }
}

// 连接钱包
connectWalletBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            const chainId = await ethereum.request({ method: 'eth_chainId' });

            if (chainId !== BSC_MAINNET_CHAIN_ID) {
                alert("请切换到 BSC 主网后重新登录");
                switchNetworkBtn.style.display = "inline-block";
                await updateNetworkStatus();
                return;
            }

            walletAddress.innerHTML = `钱包状态：✅ ${shortenAddress(address)}`;
            localStorage.setItem('walletAddress', address);
            localStorage.setItem('chainId', chainId);
            connectWalletBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";

            await updateNetworkStatus();
        } catch (err) {
            console.error(err);
            walletAddress.innerHTML = `钱包状态：❌ 连接失败`;
        }
    } else {
        alert("请安装 MetaMask 钱包！");
    }
});

// 切换网络
switchNetworkBtn.addEventListener('click', async () => {
    try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BSC_MAINNET_CHAIN_ID }] });
        alert("已切换到 BSC 主网，请重新登录");
        clearLoginState();
        await updateNetworkStatus();
    } catch (err) {
        alert("切换网络失败，请手动切换到 BSC 主网");
    }
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    clearLoginState();
    updateNetworkStatus();
});

function clearLoginState() {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('chainId');
    walletAddress.innerHTML = `钱包状态：❌ 未连接`;
    connectWalletBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    switchNetworkBtn.style.display = "none";
}

function shortenAddress(address) {
    return address.slice(0,6) + "..." + address.slice(-4);
}
