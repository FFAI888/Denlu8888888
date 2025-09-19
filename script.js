const connectWalletBtn = document.getElementById('connectWalletBtn');
const logoutBtn = document.getElementById('logoutBtn');
const switchNetworkBtn = document.getElementById('switchNetworkBtn');
const walletAddress = document.getElementById('walletAddress');
const networkStatus = document.getElementById('networkStatus');
const walletIcon = document.getElementById('walletIcon');
const networkIcon = document.getElementById('networkIcon');

const BSC_MAINNET_CHAIN_ID = '0x38';
const BSC_MAINNET_PARAMS = {
    chainId: BSC_MAINNET_CHAIN_ID,
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
};

// 页面加载
window.onload = async () => {
    const savedAddress = localStorage.getItem('walletAddress');
    const savedChain = localStorage.getItem('chainId');

    if (savedAddress && savedChain === BSC_MAINNET_CHAIN_ID) {
        walletAddress.innerHTML = `钱包状态：<span id="walletIcon">✅</span> ${shortenAddress(savedAddress)}`;
        connectWalletBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        clearLoginState();
    }
    await updateNetworkStatus();
}

// 更新网络和钱包状态显示
async function updateNetworkStatus() {
    if (typeof window.ethereum !== 'undefined') {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        // 网络状态
        if (chainId === BSC_MAINNET_CHAIN_ID) {
            networkStatus.innerHTML = `网络状态：<span id="networkIcon">✅</span> BSC 主网`;
            networkStatus.classList.remove('network-warning');
            networkStatus.classList.add('network-ok');
            switchNetworkBtn.style.display = "none";
        } else {
            networkStatus.innerHTML = `网络状态：<span id="networkIcon">❌</span> 非BSC主网，请切换`;
            networkStatus.classList.remove('network-ok');
            networkStatus.classList.add('network-warning');
            switchNetworkBtn.style.display = "inline-block";
        }

        // 钱包状态
        if (accounts.length > 0) {
            walletAddress.innerHTML = `钱包状态：<span id="walletIcon">✅</span> ${shortenAddress(accounts[0])}`;
        } else {
            walletAddress.innerHTML = `钱包状态：<span id="walletIcon">❌</span> 未连接`;
        }
    } else {
        networkStatus.innerHTML = `网络状态：<span id="networkIcon">❌</span> 未安装钱包`;
        networkStatus.classList.add('network-warning');
        walletAddress.innerHTML = `钱包状态：<span id="walletIcon">❌</span> 未连接`;
    }
}

// 按钮状态动画
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// 点击连接钱包
connectWalletBtn.addEventListener('click', async () => {
    setButtonLoading(connectWalletBtn, true);
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            const chainId = await ethereum.request({ method: 'eth_chainId' });

            if (chainId !== BSC_MAINNET_CHAIN_ID) {
                alert("请切换到 BSC 主网后重新登录");
                switchNetworkBtn.style.display = "inline-block";
                await updateNetworkStatus();
                setButtonLoading(connectWalletBtn, false);
                return;
            }

            const message = "BSC主网登录验证：" + Math.floor(Math.random() * 1000000);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);

            if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
                localStorage.setItem('walletAddress', address);
                localStorage.setItem('chainId', chainId);
                walletAddress.innerHTML = `钱包状态：<span id="walletIcon">✅</span> ${shortenAddress(address)}`;
                connectWalletBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
                switchNetworkBtn.style.display = "none";
            } else {
                walletAddress.innerHTML = `钱包状态：<span id="walletIcon">❌</span> 签名验证失败`;
            }

            await updateNetworkStatus();

        } catch (err) {
            console.error(err);
            walletAddress.innerHTML = `钱包状态：<span id="walletIcon">❌</span> 连接失败`;
        }
    } else {
        alert("请安装 MetaMask 钱包！");
    }
    setButtonLoading(connectWalletBtn, false);
});

// 切换网络按钮
switchNetworkBtn.addEventListener('click', async () => {
    setButtonLoading(switchNetworkBtn, true);
    try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BSC_MAINNET_CHAIN_ID }] });
        alert("已切换到 BSC 主网，请重新连接钱包");
        clearLoginState();
        await updateNetworkStatus();
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await ethereum.request({ method: 'wallet_addEthereumChain', params: [BSC_MAINNET_PARAMS] });
                alert("已添加 BSC 主网，请重新连接钱包");
                clearLoginState();
                await updateNetworkStatus();
            } catch (addError) {
                console.error(addError);
                alert("无法添加 BSC 主网，请手动切换网络");
            }
        } else {
            console.error(switchError);
            alert("切换网络失败，请手动切换到 BSC 主网");
        }
    }
    setButtonLoading(switchNetworkBtn, false);
});

// 退出登录
logoutBtn.addEventListener('click', () => {
    setButtonLoading(logoutBtn, true);
    clearLoginState();
    updateNetworkStatus();
    setTimeout(() => setButtonLoading(logoutBtn, false), 500);
});

// 钱包或网络变化监听
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => {
        alert("钱包地址已切换，请重新登录");
        clearLoginState();
        updateNetworkStatus();
    });
    window.ethereum.on('chainChanged', async (chainId) => {
        clearLoginState();
        await updateNetworkStatus();
        if (chainId !== BSC_MAINNET_CHAIN_ID) {
            alert("网络已切换，请切换回 BSC 主网并重新登录");
            switchNetworkBtn.style.display = "inline-block";
        }
    });
}

function clearLoginState() {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('chainId');
    walletAddress.innerHTML = `钱包状态：<span id="walletIcon">❌</span> 未连接`;
    connectWalletBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    switchNetworkBtn.style.display = "none";
}

function shortenAddress(address) {
    return address.slice(0,6) + "..." + address.slice(-4);
}
