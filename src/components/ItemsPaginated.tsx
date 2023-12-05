import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import Spacer from './base/Spacer';
import Text from './base/Text';
import Item from './Item';
import Space from './base/Space';
import LoadingSpinner from './base/Spinner';

export enum ItemsSortBy {
  DATE_NEWEST = "DATE_NEWEST",
  DATE_OLDEST = "DATE_OLDEST",
  STATUS = "STATUS"
}

export enum GenerationStatus {
  GENERATING = "GENERATING",
  GENERATED = "GENERATED",
  LISTED = "LISTED"
}

export type GenerationListItem = {
  generation_id: string,
  image_url: string,
  name: string,
  price: string,
  listing_urls?: string[]
}

const generation_static_data = [
  {
    generationId: "1",
    imageUrl: "test",
    name: "first shirt",
    price: "4.99",
    status: "Generated"
  },
  {
    generationId: "1",
    imageUrl: "test",
    name: "second shirt",
    price: "4.99",
    status: "Generated"
  }
  
]

const ItemsPaginated = ({ query }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<GenerationListItem[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<string>("30");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_BE_URL}/list-generations`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
          "sort_by": sortBy,
          "page": page,
          "items_per_page": itemsPerPage,
          "query": query
        })
      });

      if (response.status == 200) {
        const respJson = await response.json();

        console.log(respJson);
        setItems(respJson["generation_list"]);
      }
      setLoading(false);
    }

    fetchItems();
  }, [sortBy, page, itemsPerPage, query])


  return (
    <Spacer gap={10}>
      { items.length == 0 && query.length == 0 && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignSelf: "stretch", border: "1px solid #E3E8EF", borderRadius: "8px", padding: "70px" }}>
          <LoadingSpinner />
          <Text size="20px" color="dark-gray" weight={500}>
            Retrieving your items
          </Text>
        </div>
      )}
      { items.length == 0 && query.length == 0 && !loading && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignSelf: "stretch", border: "1px solid #E3E8EF", borderRadius: "8px", padding: "70px" }}>
          <Text size="20px" color="dark-gray" weight={500}>
            You haven't generated any listings yet!
          </Text>
          <Text size="20px" color="dark-gray" weight={500}>
            <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => navigate("/")}>Upload a photo here</div> to get started
          </Text>
        </div>
      )}
      { items.length == 0 && query.length > 0 && !loading && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignSelf: "stretch", border: "1px solid #E3E8EF", borderRadius: "8px", padding: "70px" }}>
          <Text size="20px" color="dark-gray" weight={500}>
            No listings match the search term provided
          </Text>
        </div>
      )}
      { items.length > 0 && !loading && (
        <>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch"}}>
            <Text color="dark-gray" size="14px" weight={500}>
              Viewing All Items ({items.length})
            </Text>
            <select value={sortBy} onChange={(e) => setSortBy(e.currentTarget.value)} style={{ border: "none", fontFamily: "Switzer", fontSize: "14px", color: "#475569", outline: "none" }}>
              <option value="newest">Sort by: Date Created (Newest)</option>
              <option value="oldest">Sort by: Date Created (Oldest)</option>
            </select>
          </div>
          { items.map(i => (
            <Item item={i} />
          ))}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch"}}>
            <Text color="dark-gray" size="14px" weight={500}>
              <img
                src={process.env.PUBLIC_URL + "/assets/down-arrow.png"}
                style={{ width: "15px", rotate: "90deg", marginRight: "10px", cursor: "pointer", opacity: page == 0 ? "0.5" : undefined }}
                onClick={page > 0 ? () => setPage(page - 1) : undefined}
              />
              {page + 1}
              <img
                src={process.env.PUBLIC_URL + "/assets/down-arrow.png"}
                style={{ width: "15px", rotate: "270deg", marginLeft: "10px", cursor: "pointer", opacity: items.length < Number(itemsPerPage) ? "0.5" : undefined }}
                onClick={items.length == Number(itemsPerPage) ? () => setPage(page + 1) : undefined}
              />
            </Text>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.currentTarget.value)} style={{ border: "none", fontFamily: "Switzer", fontSize: "14px", color: "#475569", outline: "none" }}>
              <option value={10}>10 Items Per Page</option>
              <option value={20}>20 Items Per Page</option>
              <option value={30}>30 Items Per Page</option>
              <option value={40}>40 Items Per Page</option>
              <option value={50}>50 Items Per Page</option>
            </select>
          </div>
        </>
      )}

    </Spacer>
  );
};

export default ItemsPaginated;
