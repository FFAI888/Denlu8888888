// script.js - 版本号 1.25

const BSC_CHAIN_ID = '0x38'; // BSC 主网链ID

// 检查是否安装 MetaMask
function isMetaMaskInstalled(){
    return typeof window.ethereum !== 'undefined';
}

// 获取当前链ID
async function getCurrentChainId(){
    if(!isMetaMaskInstalled()) return null;
    return await window.ethereum.request({method:'eth_chainId'});
}

// 强制退出登录
function forceLogout(msg){
    alert(msg);
    localStorage.removeItem('walletAddress');
    window.location.href='index.html';
}

// 登录安全检查
async function checkLoginSecurity(){
    const wallet = localStorage.getItem('walletAddress');
    if(!wallet) {
        forceLogout('未检测到钱包地址，请重新登录');
        return false;
    }
    const chainId = await getCurrentChainId();
    if(chainId !== BSC_CHAIN_ID){
        forceLogout('请连接 BSC 主网，已退出登录');
        return false;
    }
    return true;
}

// 钱包切换监听
if(isMetaMaskInstalled()){
    window.ethereum.on('accountsChanged', function(accounts){
        forceLogout('检测到钱包已切换，已退出登录');
    });
    window.ethereum.on('chainChanged', function(chainId){
        if(chainId !== BSC_CHAIN_ID){
            forceLogout('检测到非 BSC 主网，已退出登录');
        }
    });
}

// 受保护页调用安全检查
document.addEventListener('DOMContentLoaded', async function(){
    const protectedPages = ['home.html','confirm.html'];
    const currentPath = window.location.pathname.split('/').pop();
    if(protectedPages.includes(currentPath)){
        await checkLoginSecurity();
    }
});
