// script.js - 版本号 1.11

const LOGOUT_TIMEOUT = 3600 * 1000;

// 安全及钱包功能
function isMetaMaskInstalled(){ return typeof window.ethereum !== 'undefined'; }
async function getCurrentWallet(){ if(!isMetaMaskInstalled()) return null; const accounts = await window.ethereum.request({ method:'eth_accounts' }); return accounts[0] || null; }
async function getCurrentNetwork(){ if(!isMetaMaskInstalled()) return null; return await window.ethereum.request({ method:'eth_chainId' }); }
function forceLogout(){ localStorage.removeItem('walletAddress'); localStorage.removeItem('loginTimestamp'); localStorage.removeItem('networkId'); alert('检测到不安全操作，已退出登录，请重新连接钱包'); window.location.href='index.html'; }
async function connectWallet(){ if(!isMetaMaskInstalled()){ alert('请先安装 MetaMask!'); return; } const btn = document.querySelector('button'); btn.innerText='连接中...'; btn.disabled=true; try{ const accounts = await window.ethereum.request({method:'eth_requestAccounts'}); localStorage.setItem('walletAddress',accounts[0]); localStorage.setItem('loginTimestamp',Date.now()); window.location.href='confirm.html'; }catch(err){console.error(err);alert('连接钱包失败'); btn.innerText='连接钱包'; btn.disabled=false;} }
function displayWalletAddress(){ checkSecurity(); const walletAddress = localStorage.getItem('walletAddress'); if(!walletAddress){ alert('未找到钱包地址'); window.location.href='index.html'; return;} document.getElementById('wallet-address').innerText = walletAddress; }
function showHomeStatus(){ checkSecurity(); const walletAddress = localStorage.getItem('walletAddress'); const statusEl = document.getElementById('status'); if(!walletAddress){ statusEl.innerText='未登录'; statusEl.style.color='red'; } else{ statusEl.innerText='已登录钱包: '+walletAddress; statusEl.style.color='green'; } }
function autoRedirectIfLoggedIn(targetPage){ checkSecurity(); const walletAddress = localStorage.getItem('walletAddress'); if(walletAddress && targetPage!=='home'){ window.location.href='home.html'; } }
async function checkSecurity(){ const walletAddress = localStorage.getItem('walletAddress'); if(!walletAddress) return; const loginTimestamp=parseInt(localStorage.getItem('loginTimestamp')||'0'); if(Date.now()-loginTimestamp>LOGOUT_TIMEOUT){ forceLogout(); return;} const currentWallet=await getCurrentWallet(); if(currentWallet!==walletAddress){ forceLogout(); return;} const currentNetwork=await getCurrentNetwork(); const storedNetwork = localStorage.getItem('networkId'); if(storedNetwork && storedNetwork!==currentNetwork){ forceLogout(); return;} else{ localStorage.setItem('networkId',currentNetwork); } }
document.addEventListener('copy',()=>{forceLogout();});
document.addEventListener('mousemove',updateActivity);
document.addEventListener('keydown',updateActivity);
function updateActivity(){ localStorage.setItem('loginTimestamp',Date.now()); }

// 页面背景颜色映射
const pageBackgrounds = {
    home: 'linear-gradient(135deg, #f0f2f5, #cde0f7)',
    group: 'linear-gradient(135deg, #ffd194, #70e1f5)',
    earn: 'linear-gradient(135deg, #a8ff78, #78ffd6)',
    exchange: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    profile: 'linear-gradient(135deg, #f6d365, #fda085)'
};

// 导航+页面切换+背景渐变
function navigatePage(page){
    const contentEl = document.getElementById('content');
    document.querySelectorAll('#bottom-nav button').forEach(btn=>btn.classList.remove('active'));
    document.body.style.background = pageBackgrounds[page] || '#f0f2f5';

    if(page==='home'){ document.getElementById('btn-home').classList.add('active'); contentEl.innerHTML='<h2>首页内容</h2><p>欢迎来到首页！</p>'; }
    else if(page==='group'){ document.getElementById('btn-group').classList.add('active'); contentEl.innerHTML='<h2>拼团页面</h2><p>这里是拼团功能。</p>'; }
    else if(page==='earn'){ document.getElementById('btn-earn').classList.add('active'); contentEl.innerHTML='<h2>赚币页面</h2><p>这里可以赚币。</p>'; }
    else if(page==='exchange'){ document.getElementById('btn-exchange').classList.add('active'); contentEl.innerHTML='<h2>兑换页面</h2><p>这里可以兑换。</p>'; }
    else if(page==='profile'){
        document.getElementById('btn-profile').classList.add('active');
        const referrer = localStorage.getItem('referrerAddress');
        contentEl.innerHTML = '<h2>我的页面</h2>'+
                              '<p>钱包地址: '+(localStorage.getItem('walletAddress')||'未登录')+'</p>'+
                              '<p>邀请人钱包地址: '+(referrer||'未绑定')+'</p>';
    }
}
