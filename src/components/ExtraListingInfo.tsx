import React, { useState, useRef, useEffect } from "react";
import Select, { StylesConfig } from 'react-select';
import { useCookies } from 'react-cookie';

import Text from "./base/Text";
import Space from "./base/Space";

const shippingModeOptions = [
  {
    label: "I'LL HANDLE IT", 
    value: true
  },
  {
    label: "SEND ME MATERIALS", 
    value: false
  }
]

export const colourStyles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'white',
    width: '300px',
    fontFamily: 'Switzer',
    padding: 'min(15px, 5vw)',
    color: "black"
  }),
  option: (styles) => ({
    ...styles,
    fontFamily: 'Switzer',
    backgroundColor: 'white',
    cursor: "pointer",
    color: "black"
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: "18px",
    color: "black"
  }),
};

const ExtraListingInfo = ({ generation_id }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);

  const [sizes, setSizes] = useState<any[]>([]);
  const [size, setSize] = useState<string>("");
  const [selfShipping, setSelfShipping] = useState<boolean>(true);
  const [shippingPrice, setShippingPrice] = useState<string>("$ 0.00");

  useEffect(() => {
    async function retrieveShippingInfo() {
      const resp = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-generation`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'generation_id': generation_id,
        })
      });

      const respJson = await resp.json();

      if (respJson["pay_info"]) {
        console.log(respJson["pay_info"]);
        if (respJson["pay_info"]["self_shipping"] !== undefined) {
          setSelfShipping(respJson["pay_info"]["self_shipping"]);
        }
        if (respJson["pay_info"]["cost"]) {
          setShippingPrice("$ " + respJson["pay_info"]["cost"]);
        }
      }

      if (respJson["size"] !== undefined) {
        setSize(respJson["size"]);
      }
    }

    retrieveShippingInfo();
  }, [])

  useEffect(() => {
    async function updateShippingInfo() {
      const priceNumber = Number(shippingPrice.slice(2));
      if (size === "" || Number.isNaN(priceNumber)) return;

      const who = priceNumber === 0 ? 'seller' : 'buyer';
      await fetch(`${process.env.REACT_APP_BE_URL}/update-generation`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'generation_id': generation_id,
          'update_fields': {
            'size': size,
            'pay_info': {
              'who': who,
              'cost': priceNumber,
              'self_shipping': selfShipping
            }
          }
        })
      });
    }

    updateShippingInfo();
  }, [size, selfShipping, shippingPrice])

  useEffect(() => {
    async function fetchSizes() {
      const response = await fetch(`${process.env.REACT_APP_BE_URL}/get-sizes`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'generation_id': generation_id
        })
      });

      const respJson = await response.json();

      if (respJson["sizes"]) {
        console.log(respJson["sizes"]);
        setSizes(
          respJson["sizes"].map(s => ({ label: String(s).toUpperCase(), value: s }))
        );
        await new Promise(r => setTimeout(r, 1000));
        console.log(sizes);
      }
    }

    fetchSizes();
  }, [])

  const handleChangeShipping = async (selectedOption) => {
    setSelfShipping(selectedOption.value);
  };

  const handleChangeSize = async (selectedOption) => {
    setSize(selectedOption.value);
  };

  useEffect(() => {
    let newShippingPrice = shippingPrice.substring(2).replace(/[^0-9.]/g, '');
    let firstDotIndex = newShippingPrice.indexOf('.');

    if (firstDotIndex !== -1) {
      let beforeDot = newShippingPrice.substring(0, firstDotIndex + 1);
      let afterDot = newShippingPrice.substring(firstDotIndex + 1).replace(/\./g, '').substring(0,2);
      setShippingPrice("$ " + beforeDot + afterDot);
    } else {
      setShippingPrice("$ " + newShippingPrice);
    }
  }, [shippingPrice])

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "70px",
    }}>
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "9px"
      }}>
        <Text size="16px" weight={500} color="black">
          SHIPPING MODE
        </Text>
        <Select
          options={shippingModeOptions} 
          value={selfShipping ? {
            label: "I'LL HANDLE IT", 
            value: true
          } : {
            label: "SEND ME MATERIALS", 
            value: false
          }}
          styles={colourStyles}
          onChange={handleChangeShipping}
        />
        { !selfShipping && (
          <div style={{ maxWidth: "300px" }}>
            <Text size="11px" weight={400} color="dark-gray">
              Depending on the marketplace your item sells on, $6-8 will be charged for shipping materials.
            </Text>
          </div>
        )}
        { selfShipping && (
          <div style={{ maxWidth: "300px" }}>
            <Text size="11px" weight={400} color="dark-gray">
              Poshmark only permits their shipping service. If you prefer to not use it, don't select them on the following page.
            </Text>
          </div>
        )}
        <Space px="10px" />
        { selfShipping && (
          <>
            <Text size="16px" weight={500} color="black">
              HOW MUCH DO YOU WANT TO CHARGE?
            </Text>
            <textarea 
              placeholder="0.00"
              rows={1}
              style={{
                display: "flex",
                width: "260px",
                padding: "20px",
                borderRadius: "4px",
                border: "1px solid #cccccc",
                resize: "none",
                fontFamily: "Switzer",
                fontSize: "18px",
                fontStyle: "normal",
                fontWeight: "400",
                color: "black",
                verticalAlign: "middle"
              }}
              value={shippingPrice}
              onInput={(e) => setShippingPrice(e.currentTarget.value)}
            />
          </>
        )}
      </div>
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "9px"
      }}>
        <Text size="16px" weight={500} color="black">
          ITEM SIZE
        </Text>
        <Select
          options={sizes} 
          value={size ? { label: size, value: size } : undefined}
          styles={colourStyles}
          onChange={handleChangeSize}
        />
      </div>
    </div>
  )
};

export default ExtraListingInfo;
