import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { WalletContext } from "../context/WalletContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { walletAddress, setWalletAddress, isVerified, setIsVerified } = useContext(WalletContext);

  // WebAuthn 验证
  const webAuthnVerify = async () => {
    try {
      const publicKey = {
        challenge: new Uint8Array(32),
        rp: { name: "My Dapp" },
        user: {
          id: new Uint8Array(16),
          name: walletAddress || "user@example.com",
          displayName: "用户"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        timeout: 60000,
        attestation: "direct"
      };
      const credential = await navigator.credentials.create({ publicKey });
      return !!credential;
    } catch (err) {
      console.error("WebAuthn验证失败:", err);
      return false;
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);

        const verified = await webAuthnVerify();
        if (verified) {
          setIsVerified(true);
          navigate("/confirm");
        } else {
          alert("身份验证失败，无法登录");
        }
      } catch (err) {
        console.error("钱包连接失败:", err);
      }
    } else {
      alert("请安装MetaMask钱包！");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>欢迎登录Dapp</h1>
      {!walletAddress ? (
        <button onClick={connectWallet}>连接钱包并进行身份验证</button>
      ) : isVerified ? (
        <p>已连接钱包且身份验证成功: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>验证身份</button>
      )}
    </div>
  );
};

export default LoginPage;
