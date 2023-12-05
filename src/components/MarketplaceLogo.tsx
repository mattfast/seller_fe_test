import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';

const MarketplaceLogo = ({ marketplace, onClick }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    async function getAccountInfo() {
      const response = await fetch(`${process.env.REACT_APP_BE_URL}/get-account-info`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          "site": marketplace
        })
      });
      const respJson = await response.json();
  
      if (respJson["connected"]) {
        setConnected(true);
      }
    }

    getAccountInfo();
  }, [])

  return (
    <div style={{
      width: "76px",
      height: "76px",
      borderRadius: "8px",
      border: "1px solid #475569",
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      cursor: "pointer",
      opacity: connected ? undefined : "0.5"
    }} onClick={onClick}>
      <img src={process.env.PUBLIC_URL + `/assets/${marketplace}-logo.png`} style={{ maxWidth: "60px" }}/>
    </div>
  );
}

export default MarketplaceLogo;