import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Analytics } from '@vercel/analytics/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip'
import { UserType } from "./LandingPage";

import Spacer from "./components/base/Spacer";
import Space from "./components/base/Space";
import Text from "./components/base/Text";

import AppHeader from "./components/AppHeader";
import PrivacyModal from "./components/PrivacyModal";
import TermsModal from "./components/TermsModal";
import ConnectModal from "./components/ConnectModal";
import BottomBar from "./components/BottomBar";
import FeedbackModal from "./components/FeedbackModal";
import ItemsPaginated from "./components/ItemsPaginated";
import MarketplaceLogo from "./components/MarketplaceLogo";
import ConnectTermsModal from "./components/ConnectTermsModal";

const Manage = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState<UserType | null>(null);
  const [connectDepopModalOpen, setConnectDepopModalOpen] = useState<boolean>(false);
  const [connectPoshmarkModalOpen, setConnectPoshmarkModalOpen] = useState<boolean>(false);
  const [connectMercariModalOpen, setConnectMercariModalOpen] = useState<boolean>(false);
  const [connectTermsModalOpen, setConnectTermsModalOpen] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<ReactNode | null>(null);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        position: "top-center",
        closeOnClick: true,
        autoClose: false,
        pauseOnHover: true,
        draggable: true,
      });
    }

  }, [errorMessage])

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        position: "top-center",
        closeOnClick: true,
        autoClose: false,
        pauseOnHover: true,
        draggable: true,
      });
    }

  }, [successMessage])

  useEffect(() => {
    async function retrieveUser() {
      let response;
      if (cookies['user-id']) {
        response = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-user`, {
          method: "GET",
          headers: {
            'auth-token': cookies['user-id'],
          }
        })
      } else {
        navigate("/");
      }

      const respJson = await response.json();
      setUser({
        userId: respJson["user_id"],
        email: respJson["email"] ?? undefined,
        subscriptionTier: respJson["subscription_tier"] ?? undefined,
        generationsLeft: respJson["generations_left"] ?? undefined,
      });

      respJson["cookie"] && setCookie("user-id", respJson["cookie"]);
    }
    
    retrieveUser();
  }, [cookies])

  return (
    <>
      <AppHeader user={user} setUser={setUser} setFeedbackModalOpen={setFeedbackModalOpen} isPortrait={isPortrait} />
      <Space px="90px" />
      <Spacer gap={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            maxWidth: "min(985px, 70vw)",
            display: "flex",
            justifyContent: "left",
            alignSelf: "stretch"
          }}>
            <Text color="black" size="50px" align="left" weight={500}>
              Manage Items
            </Text>
          </div>
          <Space px="15px" />
          <div style={{
            maxWidth: "min(985px, 70vw)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 20px",
            borderRadius: "8px",
            border: "1px solid #475569",
            alignSelf: "stretch",
            gap: "20px",
          }}>
            <div style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: "20px"
            }}>
              <Text color="dark-gray" size="24px" weight={500}>
                Search
              </Text>
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                style={{
                  width: "200px",
                  height: "20px",
                  borderRadius: "8px",
                  padding: "5px",
                  border: "1px solid #475569"
                }}
              />
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              alignItems: "center",
            }}>
              <Text color="dark-gray" size="24px" weight={500}>
                Marketplaces
              </Text>
              <MarketplaceLogo marketplace="depop" onClick={() => setConnectDepopModalOpen(true)}/>
              <MarketplaceLogo marketplace="mercari" onClick={() => setConnectMercariModalOpen(true)} />
              <MarketplaceLogo marketplace="poshmark" onClick={() => setConnectPoshmarkModalOpen(true)} />
            </div>
          </div>
          <Space px="15px" />
          <div 
            style={{
              flexWrap: "nowrap",
              gap: "8px",
              cursor: "pointer",
              alignItems: "center",
              width: "min(985px, 70vw)",
              alignSelf: "stretch",
              display: "flex",
              justifyContent: "left",
            }}
            onClick={() => navigate("/")}
          >
            <img src={process.env.PUBLIC_URL + "/assets/plus-black.png"} style={{ width: "40px" }} />
            <Text color="black" size="30px" weight={500}>
              New Item
            </Text>
          </div>
          <Space px="15px" />
          <ItemsPaginated query={query}/>
        </div>
      </Spacer>
      <Space px="100px" />
      <BottomBar setPrivacyModalOpen={setPrivacyModalOpen} setTermsModalOpen={setTermsModalOpen} />
      <ConnectModal setModalOpen={setConnectDepopModalOpen} modalOpen={connectDepopModalOpen} brand="depop" setTermsModalOpen={setConnectTermsModalOpen}  />
      <ConnectModal setModalOpen={setConnectPoshmarkModalOpen} modalOpen={connectPoshmarkModalOpen} brand="poshmark" setTermsModalOpen={setConnectTermsModalOpen}  />
      <ConnectModal setModalOpen={setConnectMercariModalOpen} modalOpen={connectMercariModalOpen} brand="mercari" setTermsModalOpen={setConnectTermsModalOpen}  />
      <ConnectTermsModal setModalOpen={setConnectTermsModalOpen} modalOpen={connectTermsModalOpen} brand="mercari"  />
      <TermsModal setModalOpen={setTermsModalOpen} modalOpen={termsModalOpen} />
      <PrivacyModal setModalOpen={setPrivacyModalOpen} modalOpen={privacyModalOpen} />
      <FeedbackModal setModalOpen={setFeedbackModalOpen} modalOpen={feedbackModalOpen} setSuccessMessage={setSuccessMessage} />
      <ToastContainer />
      <Analytics />
    </>
  )
};

export default Manage;
