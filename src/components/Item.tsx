import React, { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

import Spacer from './base/Spacer';
import Text from './base/Text';
import { GenerationListItem } from './ItemsPaginated';

const Item = ({ item }: {
  item: GenerationListItem
}) => {

  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      borderRadius: "8px",
      border: "1px solid #E3E8EF",
      padding: "20px",
      cursor: "pointer",
      width: "min(985px, 70vw)",
      gap: "16px"
    }}
      onClick={() => navigate(`/${item.generation_id}/list`)}
    >
      <img src={`https://seller-images-milk.s3.amazonaws.com/${item.image_url}`} style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px" }} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "8px"
      }}>
        <Text color="black" weight={500} size="24px" align="left">
          {item.name}
        </Text>
        <Text color="dark-gray" weight={500} size="12px" align="left">
          Price: ${item.price}
        </Text>
        <Text color="dark-gray" weight={500} size="12px" align="left">
          Status: {item.listing_urls ? "Listed" : "Generated"}
        </Text>
      </div>
    </div>
  );
};

export default Item;
