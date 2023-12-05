import React, { useState, useRef, useEffect } from "react";

import Text from "./base/Text";
import Spacer from "./base/Spacer";
import "./Modal.css";
import BrandLogin, { BrandLoginStatus } from "./BrandLogin";

const ConnectModal = ({ setModalOpen, modalOpen, brand, setTermsModalOpen }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const modal = document.getElementById(`${brand}Modal`);
    if (modalOpen) {
      if (modal) modal.style.display = "flex";
    } else {
      if (modal) modal.style.display = "none";
    }
  }, [modalOpen])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current !== null) {
        let containsElement = e.composedPath().includes(containerRef.current as EventTarget);
        if (!containsElement) {
            setModalOpen(false);
            // setClosable(false);
        }
      }
    }

    let timer;
    if (modalOpen) {
      timer = setTimeout(() => {
          window.addEventListener('click', handleClickOutside);
      }, 10);
    }
    return () => {
      clearTimeout(timer); // Ensure to clear the timeout if component unmounts before timeout completes.
      window.removeEventListener('click', handleClickOutside);
    };
}, [modalOpen]);
 
  return (
    <div id={`${brand}Modal`} className="modal">
      <div ref={containerRef} className="modalContent" style={{
        maxHeight: "50vh",
        overflowY: "scroll"
      }}>
        <BrandLogin brand={brand} initialStatus={BrandLoginStatus.INPUT} setModalOpen={setTermsModalOpen} />
      </div>
    </div>
  )
};

export default ConnectModal;
