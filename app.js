const navLogin=document.getElementById('navLogin');
const navConfirm=document.getElementById('navConfirm');
const pageLogin=document.getElementById('pageLogin');
const pageConfirm=document.getElementById('pageConfirm');
const connectButton=document.getElementById('connectButton');
const status=document.getElementById('status');
const walletInput=document.getElementById('walletInput');
const qrDiv=document.getElementById('qrcode');
const overlay=document.getElementById('overlay');
const bigQrcode=document.getElementById('bigQrcode');
const btn1=document.getElementById('btn1');
const btn2=document.getElementById('btn2');
const btn3=document.getElementById('btn3');
const container=document.getElementById('buttonContainer');
let qrTimeout;

function showPage(page){
    if(page==='login'){ navLogin.classList.add('active'); navConfirm.classList.remove('active'); pageLogin.classList.add('active'); pageConfirm.classList.remove('active'); }
    else{ navConfirm.classList.add('active'); navLogin.classList.remove('active'); pageConfirm.classList.add('active'); pageLogin.classList.remove('active'); }
}

navLogin.addEventListener('click',()=>showPage('login'));
navConfirm.addEventListener('click',()=>{ showPage('confirm'); updateWalletUI(); });

async function connectWallet(){
    if(typeof window.ethereum==='undefined'){ alert("请先安装 MetaMask 或支持 BSC 的钱包！"); return; }
    try{
        const accounts=await ethereum.request({method:'eth_requestAccounts'});
        const account=accounts[0];
        const chainId=await ethereum.request({method:'eth_chainId'});
        if(chainId!=='0x38'){ alert("请切换到 Binance Smart Chain 网络！"); return; }
        localStorage.setItem("walletAddress",account);
        status.textContent="已连接: "+account;
        updateWalletUI();
    }catch(err){ console.error(err); alert("连接钱包失败！"); }
}

connectButton.addEventListener('click',connectWallet);

function clearWalletUI(){
    walletInput.value=""; qrDiv.style.display='none';
    btn1.classList.add('disabled'); btn2.classList.add('disabled'); btn3.classList.add('disabled');
}

// 自动检测钱包并更新二维码
async function updateWalletUI(){
    if(typeof ethereum === 'undefined'){ clearWalletUI(); return; }
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if(accounts.length === 0){ clearWalletUI(); return; }
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if(chainId !== '0x38'){ clearWalletUI(); alert("请切换到 BSC 网络！"); return; }
    const address = accounts[0];
    walletInput.value = address;

    qrDiv.style.display='flex';
    qrDiv.innerHTML='';
    new QRCode(qrDiv,{ text: address, width: 40, height: 40 });

    bigQrcode.innerHTML='';
    new QRCode(bigQrcode,{ text: address, width: 200, height: 200 });

    btn1.classList.remove('disabled');
    btn2.classList.remove('disabled');
    btn3.classList.remove('disabled');

    localStorage.setItem('walletAddress', address);
}

// 监听钱包变化
if(window.ethereum){
    window.ethereum.on('accountsChanged',()=>updateWalletUI());
    window.ethereum.on('chainChanged',()=>updateWalletUI());
}

// 页面加载自动更新
window.addEventListener('load', updateWalletUI);

qrDiv.addEventListener('click',()=>{
    if(overlay.classList.contains('show')){ overlay.classList.remove('show'); clearTimeout(qrTimeout); }
    else{ overlay.classList.add('show'); qrTimeout=setTimeout(()=>overlay.classList.remove('show'),20000); }
});
overlay.addEventListener('click',()=>{ overlay.classList.remove('show'); clearTimeout(qrTimeout); });

btn1.addEventListener('click',()=>{ if(btn1.classList.contains('disabled')) return; btn1.classList.remove('show'); container.classList.add('shake'); setTimeout(()=>container.classList.remove('shake'),300); btn2.classList.add('show'); });
btn2.addEventListener('click',()=>{ if(btn2.classList.contains('disabled')) return; btn2.classList.remove('show'); container.classList.add('shake'); setTimeout(()=>container.classList.remove('shake'),300); btn3.classList.add('show'); });
btn3.addEventListener('click',()=>{ if(btn3.classList.contains('disabled')) return; btn3.classList.remove('show'); container.classList.add('shake'); setTimeout(()=>container.classList.remove('shake'),300); alert('最终确认绑定完成！'); });
