import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from 'react-tooltip'
import Select, { StylesConfig } from 'react-select';

import Text from "./base/Text";
import Spacer from "./base/Spacer";
import OptionButton from "./OptionButton";
import PhotoAndDelete from "./PhotoAndDelete";
import "./AdditionalPhotos.css";

import DeleteIcon from "./DeleteIcon";

const AdditionalPhotos = ({ images, setImages, existingImages }: {
  images: Blob[],
  setImages: (b: Blob[]) => void,
  existingImages: string[]
}) => {

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      //await uploadToS3(file, setFileType, generationId);
      setImages([...images, file]);
    }
  };

  const cyclePhotos = async (i: number) => {
    setImages([...images.slice(0,i),...images.slice(i+1)]);
  }

  const uploadButtonClick = () => {
    uploadInputRef.current?.click();
  };

  return (
    <div className="additionalPhotosContainer">
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={handleCapture}
        ref={uploadInputRef}
        style={{ display: 'none' }}
      />
      { [0, 1, 2, 3, 4].map(i => (
        <div key={`additional-photo-${i}`} className="additionalPhoto" onClick={i == (images.length + existingImages.length) ? uploadButtonClick : undefined} style={{ cursor: i == (images.length + existingImages.length) ? "pointer" : undefined }}>
          { i < existingImages.length && (
            <div>
              <img src={`https://seller-images-milk.s3.amazonaws.com/${existingImages[i]}`} style={{ marginTop: "4px", maxWidth: "140px", maxHeight: "138px", borderRadius: "8px" }} />
            </div>
          )}
          { i >= existingImages.length && (i - existingImages.length) < images.length && (
            <div>
              <DeleteIcon mini={true} onDelete={() => cyclePhotos(i - existingImages.length)}/>
              <img src={URL.createObjectURL(images[i - existingImages.length])} style={{ marginTop: "4px", maxWidth: "140px", maxHeight: "138px", borderRadius: "8px" }} />
            </div>
          )}
          { i == (images.length + existingImages.length) && (
            <img src={process.env.PUBLIC_URL + "/assets/large-plus.png"} style={{ width: "50px" }} />
          )}
        </div>
      ))}

    </div>
  )
};

export default AdditionalPhotos;
