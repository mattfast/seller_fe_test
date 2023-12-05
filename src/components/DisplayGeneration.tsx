import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

import Text from "./base/Text";
import Spacer from "./base/Spacer";
import CopyArea from "./CopyArea";
import GenerationFooter from "./GenerationFooter";
import PriceHistogram from "./PriceHistogram";
import AutoListButton from "./AutoListButton";

const categoryList = ["listing_title", "description", "category", "subcategory", "length", "type", "fit", "occasion", "material", "body_fit", "condition", "color", "source", "age", "style"];

function formatPrice(priceStr: string) {
  if (priceStr.includes('.')) {
      let decimalPos = priceStr.indexOf('.');
      return priceStr.substring(0, decimalPos + 3);
  } else {
      return priceStr + ".00";
  }
}

type HistogramBar = {
  index: number,
  name: string,
  value: number,
  urls?: string[]
};

const DisplayGeneration = ({ generation, user, nextPage, setFeedbackModalOpen, setEditedFields, listingUrls }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [price, setPrice] = useState<string>("0");
  const [histogramData, setHistogramData] = useState<HistogramBar[]>([]);
  const [displayHistogram, setDisplayHistogram] = useState<boolean>(false);

  console.log(generation);

  const onFieldEdit = async (category: string, text: any) => {
    setEditedFields(oldFields => ({
      ...oldFields,
      [category]: text
    }));
  }

  const onConditionChange = async (prevValue: string, currValue: string) => {
    const currPrice = price;

    setPrice("REGENERATING...");

    const response = await fetch(`${process.env.REACT_APP_BE_URL}/regenerate-price`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'prev_condition': prevValue,
        'new_condition': currValue,
        'price': currPrice.substring(1)
      })
    });

    const respJson = await response.json();

    if (respJson["price"]) {
      setPrice(formatPrice("$" + respJson["price"]));
    }
  }

  useEffect(() => {
    if (generation["price"]) {
      console.log("FORMATTING PRICE");
      console.log(generation["price"]);
      console.log(generation);
      setPrice(formatPrice("$" + generation["price"]));
    }

  }, [generation])

  useEffect(() => {
    if (generation["bin_edges"] && generation["hist_values"]) {
      let histData: HistogramBar[] = []
      for (let i = 0; i < generation["bin_edges"].length && i < generation["hist_values"].length; i++) {
        if (i == generation["bin_edges"].length - 1) {
          histData.push(
            {
              index: i,
              name: '$' + generation["bin_edges"][i],
              value: generation["hist_values"][i],
              urls: generation["bin_links"] && generation["bin_links"][i]
            }
          )
        }
        histData.push(
          {
            index: i,
            name: '$' + Math.floor(generation["bin_edges"][i]) + ' - $' + Math.floor(generation["bin_edges"][i+1]),
            value: generation["hist_values"][i],
            urls: generation["bin_links"] && generation["bin_links"][i].map(l => l.split("?")[0])
          }
        )
        console.log(histData);
      }
      setHistogramData(histData);
    }

  }, [generation])

  return (
    <Spacer gap={40}>
      <Spacer gap={16}>
        <img src={`https://seller-images-milk.s3.amazonaws.com/${generation["image_urls"][0]}`} style={{ 
          height: "auto",
          width: "auto",
          maxWidth: "80vw",
          maxHeight: "40vh",
          display: "block",
          borderRadius: "4px",
        }}/>
        { (!listingUrls || listingUrls.length == 0) && <AutoListButton nextPage={nextPage} /> }
        { (listingUrls && listingUrls.length > 0) && (
          <>
            <Text color="dark-gray" size="16px" weight={400}>
              Your item is already listed! You can find it at these links:
            </Text>
            { listingUrls.map(l => (
              <a href={l} target="_blank">
                <Text color="dark-gray" size="16px" weight={400}>
                  {l}
                </Text>
              </a>
            ))}
          </>
        )}
      </Spacer>
      <Spacer gap={32}>
        { price != "0" && <CopyArea key="price_component" category={"price"} text={price} onChange={onFieldEdit} /> }
        <div style={{ width: 'min(560px, 80vw)', cursor: 'pointer', marginTop: '-20px' }} onClick={() => setDisplayHistogram(!displayHistogram)}>
          <Text size="16px" color="black" weight={600} align="left">
            See Additional Pricing Info <img src={process.env.PUBLIC_URL + "/assets/down-arrow.png"} style={{ width: '15px', rotate: displayHistogram ? '180deg' : '0deg'}}/>
          </Text>
        </div>
        { displayHistogram && <PriceHistogram data={histogramData}/> }
        { categoryList.map(c => (
          <>
            { generation[c] && <CopyArea key={generation[c]} category={c} text={generation[c]} onChange={onFieldEdit}/> }
          </>
        ))}
        { Object.entries(generation).filter(g => ![...categoryList, "image_urls", "bin_links", "bin_edges", "hist_values", "price"].includes(g[0])).map((g) => (
          <CopyArea key={String(g[1])} category={g[0]} text={g[1]} onChange={onFieldEdit} />
        ))}
        <Text color="light-gray" weight={400} size="14px">
          How did we do? <div style={{ textDecoration: "underline", cursor: "pointer", display: "inline" }} onClick={() => setFeedbackModalOpen(true)}>Give us feedback!</div>
        </Text>
      </Spacer>
    </Spacer>
  )
};

export default DisplayGeneration;
