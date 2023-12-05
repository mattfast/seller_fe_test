import React, { useState, useRef, useEffect } from "react";

import Text from "./base/Text";
import Spacer from "./base/Spacer";
import "./Modal.css";

const ConnectTermsModal = ({ setModalOpen, modalOpen, brand }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const modal = document.getElementById("connectTermsModal");
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
    <div id="connectTermsModal" className="modal">
      <div ref={containerRef} className="modalContent" style={{
        maxHeight: "50vh",
        overflowY: "scroll"
      }}>
        <Spacer gap={10} align="left">
        <Text color="black" size="16px" weight={400} align="left">
        Privacy Statement for Resell:
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Last Updated: November 18, 2023
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          1. Introduction
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          These terms and conditions govern the integration of your Depop account with Resell. By linking your account, you agree to these terms.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          2. Permission to Access {brand} Account
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          You grant Resell permission to access your Depop account solely for the purpose of creating listings on your behalf.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          No other access or permissions are granted.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          3. How We Use Your Information
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Resell will create listings on {brand} based on the information and instructions you provide.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          You retain full responsibility for the content of these listings, including compliance with {brand}'s policies and applicable laws.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          4. Data Privacy and Security
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Resell agrees to handle all data obtained from your {brand} account in accordance with its privacy policy and relevant data protection laws.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Personal data will not be used for any purposes other than those specified in these terms.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          5. Limitation of Liability
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Resell is not responsible for any errors or issues that arise from the listing process on Depop.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Your use of Resell to create Depop listings is at your own risk.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          6. Account Security
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          You are responsible for maintaining the security of your {brand} account.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          If you suspect any unauthorized use of your account, you should inform both {brand} and Resell immediately.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          7. Termination of Access
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          You may revoke Resell's access to your {brand} account at any time.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          Resell reserves the right to terminate its service to your {brand} account at any point without notice.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          8. Amendments to Terms
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          These terms may be amended from time to time. Continued use of the service after amendments constitutes your acceptance of the changes.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          9. Governing Law
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          These terms are governed by the laws of the State of California. Any disputes related to these terms will be subject to the exclusive jurisdiction of the courts of the State of California.
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          10. Contact Us
        </Text>
        <Text color="black" size="16px" weight={400} align="left">
          For any inquiries or concerns regarding these terms, please contact us at matthew@milk-ai.com.
        </Text>
        </Spacer>
      </div>
    </div>
  )
};

export default ConnectTermsModal;
