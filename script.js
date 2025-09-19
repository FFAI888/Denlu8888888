// script.js - 1.26 基于 1.23 完整保留功能
function isMetaMaskInstalled(){ return typeof window.ethereum !== 'undefined'; }

async function connectWallet(){
    if(!isMetaMaskInstalled()){ alert('请先安装 MetaMask'); return; }
    try {
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
        const account = accounts[0];
        localStorage.setItem('walletAddress', account);
        window.location.href = 'confirm.html';
    } catch(err){ console.error(err); }
}

document.addEventListener('DOMContentLoaded', function(){
    const connectBtn = document.getElementById('connectBtn');
    if(connectBtn) connectBtn.addEventListener('click', connectWallet);

    const bindBtn = document.getElementById('bindBtn');
    if(bindBtn) bindBtn.addEventListener('click', function(){
        const ref = document.getElementById('referrerInputConfirm').value.trim();
        if(ref){
            localStorage.setItem('referrerAddress', ref);
            window.location.href = 'home.html';
        } else {
            alert('请输入邀请人地址');
        }
    });
});

function forceLogout(msg){
    alert(msg);
    localStorage.clear();
    window.location.href = 'index.html';
}

document.addEventListener('copy', ()=>forceLogout('检测到复制行为，已退出登录'));
let lastAction = Date.now();
function resetActionTimer(){ lastAction = Date.now(); }
window.onload = resetActionTimer;
window.onmousemove = resetActionTimer;
window.onkeydown = resetActionTimer;
setInterval(()=>{ if(Date.now()-lastAction>3600000) forceLogout('超过1小时无操作，已退出登录'); },60000);

async function checkLoginSecurity(){
    const wallet = localStorage.getItem('walletAddress');
    if(!wallet){ forceLogout('未检测到钱包登录，请重新登录'); return false; }
    if(!(await checkBSCNetwork())) return false;
    return true;
}

const BSC_CHAIN_ID = '0x38';
async function getCurrentChainId(){
    if(!isMetaMaskInstalled()) return null;
    return await window.ethereum.request({method:'eth_chainId'});
}
async function checkBSCNetwork(){
    const chainId = await getCurrentChainId();
    if(chainId !== BSC_CHAIN_ID){
        forceLogout('请连接 BSC 主网，已退出登录');
        return false;
    }
    return true;
}

if(isMetaMaskInstalled()){
    window.ethereum.on('accountsChanged', ()=>forceLogout('检测到钱包已切换，已退出登录'));
    window.ethereum.on('chainChanged', (chainId)=>{
        if(chainId !== BSC_CHAIN_ID) forceLogout('检测到非 BSC 主网，已退出登录');
    });
}

document.addEventListener('DOMContentLoaded', async function(){
    const protectedPages = ['home.html','confirm.html','mine.html'];
    const currentPath = window.location.pathname.split('/').pop();
    if(protectedPages.includes(currentPath)){
        await checkLoginSecurity();
    }
});
