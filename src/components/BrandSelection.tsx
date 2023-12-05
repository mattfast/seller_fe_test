import React, { useState, useEffect } from 'react';

import BrandLogin from './BrandLogin';
import Text from './base/Text';
import { BrandLoginStatus } from './BrandLogin';

const BrandSelection = ({ brand, brandList, setBrandList, setModalOpen }) => {
  const [connected, setConnected] = useState<boolean>(false);

  const handleCheckboxChange = () => {
    if (connected) {
      if (brandList.includes(brand)) {
        setBrandList(oldList => oldList.filter(b => b != brand));
      } else {
        setBrandList(oldList => [...oldList, brand]);
      }
    }
  }

  const setConnectedBox = (b: boolean) => {
    setConnected(b);
    if (!b) {
      setBrandList(oldList => oldList.filter(b => b != brand));
    } else {
      setBrandList(oldList => [...oldList, brand]);
    }
  }

  return (
    <div style={{
      borderRadius: "8px",
      border: "1px solid #000",
      background: "#FFF",
      padding: "24px",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "13px",
        left: "13px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        opacity: connected ? undefined : "0.5"
      }}>
        <input
          type="checkbox"
          checked={brandList.includes(brand)}
          onChange={handleCheckboxChange}
        />
        <Text color="black" size="16px" weight={500}>
          List here
        </Text>
      </div>
      <div style={{ marginTop: "30px"}}>
        <BrandLogin brand={brand} setConnected={setConnectedBox} initialStatus={connected ? BrandLoginStatus.CONNECTED : undefined} setModalOpen={setModalOpen} />
      </div>
    </div>
  )
}

export default BrandSelection;