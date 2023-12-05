import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';

import './PhotoOptions.css';
import OptionButton from './OptionButton';
import Spacer from './base/Spacer';
import Text from './base/Text';
import DeleteIcon from './DeleteIcon';

const PhotoAndDelete = ({ imageUrl, onDelete, mini }: {
  imageUrl: string,
  onDelete: () => void,
  mini?: boolean
}) => {

  return (
    <Spacer gap={10}>
      <div style={{
        position: "relative",
        display: "inline-block"
      }}>
        <DeleteIcon onDelete={onDelete}/>
        <img 
          src={imageUrl}
          style={{ 
            height: "auto",
            width: "auto",
            maxWidth: mini ? "140px" : "80vw",
            maxHeight: mini ? "140px" : "40vh",
            display: "block",
            borderRadius: "8px",
          }}
        />
      </div>
    </Spacer>
  );
};

export default PhotoAndDelete;
