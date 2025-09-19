/* script.js - 版本号 1.26 */

// 全局变量
let currentAccount = null;
let inactivityTimer = null;
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1小时
const BSC_MAINNET_CHAIN_ID = "0x38"; // BSC主网ID

// 显示提示信息（登录页面专用，自动消失3秒）
function showLoginAlert(message) {
    const alertBox = document.getElementById("login-alert");
    if (!alertBox) return;

    alertBox.innerText = message;
    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.classList.add("hide");
        setTimeout(() => alertBox.classList.remove("hide"), 500);
    }, 3000);
}

// 连接钱包
async function connectWallet() {
    if (!window.ethereum) {
        showLoginAlert("请安装 MetaMask 钱包插件");
        return;
    }
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const chainId = await ethereum.request({ method: "eth_chainId" });

        // 统一转换为数字判断
        const chainIdNum = parseInt(chainId, 16);
        if (chainIdNum !== 56) {
            showLoginAlert("请切换到 BSC 主网");
            await forceLogout();
            return;
        }

        currentAccount = accounts[0];
        localStorage.setItem("walletAddress", currentAccount);

        // 自动填充邀请人
        const inviter = localStorage.getItem("inviterAddress") || "";
        const inviterInput = document.getElementById("inviter");
        if (inviterInput && inviter) {
            inviterInput.value = inviter;
        }

        window.location.href = "home.html";
    } catch (err) {
        console.error("连接钱包失败：", err);
        showLoginAlert("连接失败，请重试");
    }
}

// 确认关系
function confirmRelation() {
    const inviterInput = document.getElementById("confirm-inviter");
    if (!inviterInput) return;
    const inviter = inviterInput.value.trim();
    if (!inviter) {
        showLoginAlert("请输入邀请人钱包地址");
        return;
    }
    localStorage.setItem("inviterAddress", inviter);
    showLoginAlert("绑定成功");
    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);
}

// 复制地址
function copyAddress() {
    const wallet = localStorage.getItem("walletAddress");
    if (!wallet) {
        showLoginAlert("未检测到钱包地址");
        return;
    }
    navigator.clipboard.writeText(wallet).then(() => {
        showLoginAlert("钱包地址已复制");
    });
}

// 强制退出
async function forceLogout() {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("inviterAddress");
    currentAccount = null;
    window.location.href = "index.html";
}

// 空闲检测
function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        showLoginAlert("长时间未操作，请重新登录");
        forceLogout();
    }, INACTIVITY_LIMIT);
}

// 页面跳转
function goPage(page) {
    if (!localStorage.getItem("walletAddress")) {
        showLoginAlert("请先登录");
        forceLogout();
        return;
    }
    window.location.href = page;
}

// 页面初始化
window.addEventListener("DOMContentLoaded", async () => {
    const wallet = localStorage.getItem("walletAddress");
    const inviter = localStorage.getItem("inviterAddress");

    // 非登录页检查是否已登录
    if (!location.pathname.endsWith("index.html")) {
        if (!wallet) {
            showLoginAlert("请先连接钱包");
            forceLogout();
            return;
        }

        try {
            const chainId = await ethereum.request({ method: "eth_chainId" });
            const chainIdNum = parseInt(chainId, 16);
            if (chainIdNum !== 56) {
                showLoginAlert("请切换到 BSC 主网");
                await forceLogout();
                return;
            }
        } catch (err) {
            console.error("检查网络失败：", err);
            showLoginAlert("网络检测失败");
            await forceLogout();
            return;
        }
    }

    // 监听钱包事件
    if (window.ethereum) {
        ethereum.on("accountsChanged", () => {
            showLoginAlert("钱包切换，请重新登录");
            forceLogout();
        });
        ethereum.on("chainChanged", (chainId) => {
            const chainIdNum = parseInt(chainId, 16);
            if (chainIdNum !== 56) {
                showLoginAlert("请切换到 BSC 主网");
                forceLogout();
            }
        });
    }

    // 防复制强制退出
    document.addEventListener("copy", () => {
        showLoginAlert("检测到复制，已退出登录");
        forceLogout();
    });

    // 空闲检测
    ["click", "mousemove", "keydown"].forEach(event =>
        document.addEventListener(event, resetInactivityTimer)
    );
    resetInactivityTimer();

    // 填充邀请人
    const inviterInput = document.getElementById("inviter");
    if (inviterInput && inviter) inviterInput.value = inviter;

    // “我的”页面显示钱包和复制按钮
    if (location.pathname.endsWith("mine.html")) {
        const walletDiv = document.createElement("div");
        walletDiv.className = "wallet-info";
        walletDiv.innerHTML = `
            <span>${wallet || "未登录"}</span>
            <button class="copy-btn" onclick="copyAddress()">复制</button>
        `;
        document.body.appendChild(walletDiv);
    }
});
