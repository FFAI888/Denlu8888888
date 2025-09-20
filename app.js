const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressP = document.getElementById('walletAddress');
const networkWarningP = document.getElementById('networkWarning');

async function connectWallet() {
    let web3, accounts, networkId;
    networkWarningP.textContent = '';

    if (window.ethereum) {
        // MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(window.ethereum);
    } else {
        // WalletConnect
        const provider = new WalletConnectProvider.default({
            rpc: {
                1: "https://mainnet.infura.io/v3/你的InfuraID",
                56: "https://bsc-dataseed.binance.org/"
            }
        });
        await provider.enable();
        web3 = new Web3(provider);
    }

    accounts = await web3.eth.getAccounts();
    walletAddressP.textContent = `已连接钱包: ${accounts[0]}`;

    // 检查网络（例如目标链为 Ethereum Mainnet, chainId = 1）
    networkId = await web3.eth.getChainId();
    if (networkId !== 1) {
        networkWarningP.textContent = '⚠ 请切换到 Ethereum 主网';
    }
}

// 点击按钮触发连接，并显示加载状态
connectWalletBtn.addEventListener('click', async () => {
    connectWalletBtn.classList.add('loading');      // 显示旋转动画
    connectWalletBtn.querySelector('.btn-text').textContent = '连接中...';
    connectWalletBtn.disabled = true;
    try {
        await connectWallet();
        connectWalletBtn.querySelector('.btn-text').textContent = '已连接';
    } catch (err) {
        console.error(err);
        connectWalletBtn.querySelector('.btn-text').textContent = '连接钱包';
    } finally {
        connectWalletBtn.disabled = false;
        connectWalletBtn.classList.remove('loading'); // 隐藏旋转动画
    }
});
