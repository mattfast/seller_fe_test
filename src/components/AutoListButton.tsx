import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './base/Button';
import Text from './base/Text';
import { ListStatus } from '../List';

const AutoListButton = ({ nextPage }) => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={nextPage}>
      <div style={{
        position: "absolute",
        top: "-10px",
        right: "-20px",
        width: "54px",
        height: "21px",
        borderRadius: "8px",
        background: "#FF25DC",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Text size="16px" weight={600} color="white">New!</Text>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "4px",
        background: "#3B82F6",
        whiteSpace: "nowrap"
      }}>
        <Button>
          <div style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px"
          }}>
            <img src={process.env.PUBLIC_URL + "/assets/plus.png"} style={{ width: "22px" }} />
            <Text size="16px" weight={600} color="white">Automatically List Online</Text>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default AutoListButton;

