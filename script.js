// script.js - 版本号 1.23 完整整合
// 支持 BSC 主网、登录保护、邀请人绑定、底部导航、复制、超时退出、动画等

let currentPage = 'home';
const LOGOUT_TIMEOUT = 3600*1000; // 1小时超时
const BSC_CHAIN_ID = '0x38'; // BSC 主网链ID
const pageBackgrounds = {
    home:'linear-gradient(135deg, #f0f2f5, #cde0f7)',
    group:'linear-gradient(135deg, #ffd194, #70e1f5)',
    earn:'linear-gradient(135deg, #a8ff78, #78ffd6)',
    exchange:'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    profile:'linear-gradient(135deg, #f6d365, #fda085)'
};

// 钱包检测
function isMetaMaskInstalled(){ return typeof window.ethereum!=='undefined'; }
async function getCurrentWallet(){ if(!isMetaMaskInstalled()) return null; const accounts=await window.ethereum.request({method:'eth_accounts'}); return accounts[0]||null; }
async function getCurrentChainId(){ if(!isMetaMaskInstalled()) return null; return await window.ethereum.request({method:'eth_chainId'}); }

// 登录页面连接钱包
document.addEventListener('DOMContentLoaded', function(){
    const connectBtn = document.getElementById('connectBtn');
    if(connectBtn){
        connectBtn.addEventListener('click', async function(){
            if(!isMetaMaskInstalled()){
                alert('请先安装 MetaMask 钱包！');
                return;
            }
            connectBtn.innerText = '连接中...';
            connectBtn.disabled = true;
            try{
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if(!accounts || accounts.length === 0){
                    alert('未获取到钱包地址');
                    connectBtn.innerText='连接钱包';
                    connectBtn.disabled=false;
                    return;
                }

                // 检测 BSC 主网
                const chainId = await getCurrentChainId();
                if(chainId !== BSC_CHAIN_ID){
                    forceLogout('请连接 BSC 主网，已退出登录');
                    return;
                }

                localStorage.setItem('walletAddress', accounts[0]);
                localStorage.setItem('loginTimestamp', Date.now());

                const referrer = localStorage.getItem('referrerAddress') || '';
                if(referrer) document.getElementById('referrerInput').value = referrer;

                window.location.href='confirm.html';
            }catch(err){
                console.error(err);
                alert('连接钱包失败，请重试');
                connectBtn.innerText='连接钱包';
                connectBtn.disabled=false;
            }
        });
    }

    // 登录保护：检查用户是否绕过登录页
    checkLoginSecurity();
});

// 页面导航、复制、滑动、底部导航逻辑保持不变
function navigatePage(page){
    if(page===currentPage) return;
    const contentEl = document.getElementById('content');
    const oldPage = currentPage; currentPage=page;
    document.querySelectorAll('#bottom-nav button').forEach(btn=>btn.classList.remove('active'));
    const btnIdMap = {home:'btn-home',group:'btn-group',earn:'btn-earn',exchange:'btn-exchange',profile:'btn-profile'};
    document.getElementById(btnIdMap[page]).classList.add('active');
    document.body.style.background=pageBackgrounds[page]||'#f0f2f5';
    const pagesOrder=['home','group','earn','exchange','profile'];
    const direction=pagesOrder.indexOf(page)>pagesOrder.indexOf(oldPage)?'left':'right';

    const newContent=document.createElement('div');
    newContent.style.position='absolute'; newContent.style.width='100%'; newContent.style.top='0'; newContent.style.left='0';
    newContent.style.padding='20px'; newContent.style.textAlign='center';

    if(page==='home'){
        newContent.innerHTML = `
            <h2>首页</h2>
            <div class="card"><span class="icon">🎉</span>欢迎回来！</div>
            <div class="card"><span class="icon">📦</span>最新活动卡片</div>
            <div class="card"><span class="icon">💡</span>推荐功能模块</div>
        `;
    }else if(page==='group'){
        newContent.innerHTML = `
            <h2>拼团页面</h2>
            <div class="card"><h3>拼团商品A</h3><p>已参与人数: 3/5</p><div class="progress-bar"><div class="progress-bar-inner" style="width:60%"></div></div></div>
            <div class="card"><h3>拼团商品B</h3><p>已参与人数: 1/4</p><div class="progress-bar"><div class="progress-bar-inner" style="width:25%"></div></div></div>
        `;
    }else if(page==='earn'){
        newContent.innerHTML = `
            <h2>赚币页面</h2>
            <div class="card"><span class="icon">📝</span>每日签到 <button class="func-btn">赚10币</button></div>
            <div class="card"><span class="icon">📤</span>邀请好友 <button class="func-btn">赚50币</button></div>
        `;
    }else if(page==='exchange'){
        newContent.innerHTML = `
            <h2>兑换页面</h2>
            <div class="card"><span class="icon">🎁</span>兑换商品A <button class="func-btn">兑换</button></div>
            <div class="card"><span class="icon">🎁</span>兑换商品B <button class="func-btn">兑换</button></div>
        `;
    }else if(page==='profile'){
        const wallet=localStorage.getItem('walletAddress')||'未登录';
        const referrer=localStorage.getItem('referrerAddress')||'未绑定';
        newContent.innerHTML = `
            <h2>我的页面</h2>
            <div class="wallet-info"><span class="icon">💼</span>钱包地址: ${wallet} 
                <button class="copy-btn" onclick="copyToClipboard('${wallet}')">复制</button>
            </div>
            <div class="wallet-info"><span class="icon">🎁</span>邀请人: ${referrer} 
                <button class="copy-btn" onclick="copyToClipboard('${referrer}')">复制</button>
            </div>
        `;
    }

    newContent.classList.add(direction==='left'?'slide-in-left':'slide-in-right');
    contentEl.classList.add(direction==='left'?'slide-out-left':'slide-out-right');
    contentEl.parentNode.appendChild(newContent);
    setTimeout(()=>{ contentEl.parentNode.removeChild(contentEl); newContent.id='content'; },400);
}

function copyToClipboard(text){
    if(!text||text==='未登录'||text==='未绑定'){ alert('无可复制内容'); return; }
    navigator.clipboard.writeText(text).then(()=>{ alert('已复制: '+text); }).catch(err=>{ alert('复制失败: '+err); });
}

// 登录保护函数：防止绕过登录页
async function checkLoginSecurity(){
    const walletAddress = localStorage.getItem('walletAddress');
    const loginTimestamp = parseInt(localStorage.getItem('loginTimestamp')||'0');
    const currentChainId = await getCurrentChainId();

    if(!walletAddress){
        forceLogout('未检测到钱包登录，请先连接钱包');
        return false;
    }

    if(currentChainId !== BSC_CHAIN_ID){
        forceLogout('请连接 BSC 主网，已退出登录');
        return false;
    }

    if(Date.now() - loginTimestamp > LOGOUT_TIMEOUT){
        forceLogout('无操作超过1小时，已退出登录');
        return false;
    }

    const currentWallet = await getCurrentWallet();
    if(currentWallet !== walletAddress){
        forceLogout('检测到钱包已切换，已退出登录');
        return false;
    }

    return true; // 登录状态有效
}

// 安全机制
async function checkSecurity(){ 
    await checkLoginSecurity();
}

function forceLogout(msg='检测到不安全操作，已退出登录，请重新连接钱包'){
    showAlert(msg);
    setTimeout(()=>{
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('networkId');
        window.location.href='index.html';
    },1500);
}

function showAlert(msg){
    let alertBox=document.getElementById('alert-box');
    if(!alertBox){ alertBox=document.createElement('div'); alertBox.id='alert-box'; document.body.appendChild(alertBox); }
    alertBox.innerText=msg; alertBox.classList.remove('hide'); alertBox.classList.add('show');
    setTimeout(()=>{ alertBox.classList.remove('show'); alertBox.classList.add('hide'); },1500);
}

document.addEventListener('copy',()=>{ forceLogout('检测到复制网页操作，已退出登录'); });
document.addEventListener('mousemove',updateActivity);
document.addEventListener('keydown',updateActivity);
function updateActivity(){ localStorage.setItem('loginTimestamp',Date.now()); }
setInterval(checkSecurity,10000);
