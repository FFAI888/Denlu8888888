// 版本号 v1.06
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";

const ConfirmPage = () => {
  const navigate = useNavigate();
  const { walletAddress, isVerified } = useContext(WalletContext);

  useEffect(() => {
    if (!walletAddress || !isVerified) {
      navigate("/");
    }
  }, [walletAddress, isVerified, navigate]);

  const handleConfirm = () => {
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>确认关系</h1>
      <p>请确认您要进行的操作</p>
      <button onClick={handleConfirm}>确认</button>
    </div>
  );
};

export default ConfirmPage;
