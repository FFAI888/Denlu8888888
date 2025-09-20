// 版本号 v1.06
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { walletAddress, isVerified } = useContext(WalletContext);

  useEffect(() => {
    if (!walletAddress || !isVerified) {
      navigate("/");
    }
  }, [walletAddress, isVerified, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>首页</h1>
      {walletAddress && <p>已登录钱包: {walletAddress}</p>}
      <p>欢迎来到你的Dapp首页！</p>
    </div>
  );
};

export default HomePage;
