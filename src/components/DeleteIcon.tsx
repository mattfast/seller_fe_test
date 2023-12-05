import React, { useEffect, useState, useRef } from 'react';

const DeleteIcon = ({ onDelete, mini }: {
  onDelete: () => void,
  mini?: boolean
}) => {

  return (
    <div 
      onClick={onDelete}
      style={{
        height: mini ? "24px" : "48px",
        width: mini ? "24px" : "48px",
        borderRadius: "48px",
        background: "#FFEEF0",
        position: "absolute",
        top: mini ? "8px" : "16px",
        right: mini ? "8px" : "16px",
        zIndex: 10,
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <img 
        src={process.env.PUBLIC_URL + "/assets/trash-can.png"}
        style={{ 
          position: "absolute",
          top: mini ? "5px" : "10px",
          left: mini ? "6px" : "12px",
          height: "auto",
          width: mini ? "12px" : "24px",
        }}
      />
    </div>
  )

}

export default DeleteIcon;