import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';

import Title from "./base/Title";
import Text from "./base/Text";
import Login from "./Login";
import { UserType, Status } from "../LandingPage";
import "./AppHeader.css";
import TextWithBorder from "./TextWithBorder";

const AppHeader = ({ user, setUser, setStatus, isPortrait, setFeedbackModalOpen }: {
  user: UserType | null,
  setUser: (user: UserType) => void,
  setFeedbackModalOpen: (b: boolean) => void,
  isPortrait?: boolean,
  setStatus?: (status: Status) => void,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById("loginButton");
    const el2 = document.getElementById("manageItems");
    if (isPortrait) {
      if (el) el.style.transform = `translateX(-42px)`;
      if (el2) el2.style.transform = "translateX(-42px)";
    } else {
      if (el) el.style.transform = `translateX(-42px) translateY(5px)`;
      if (el2) el2.style.transform = "translateX(-42px) translateY(5px)";
    }
  }, [isPortrait])

  return (
    <div className="appHeader">
      { isPortrait && (
        <div
          className="feedbackLeft" 
          style={{
            cursor: "pointer",
            border: "1px solid #000",
            background: "var(--white, #FFF)",
            borderRadius: "4px",
            padding: "5px "
          }}
          onClick={() => setFeedbackModalOpen(true)}>
          <Text color="black" size="16px" weight={400}>
            Feedback
          </Text>
        </div>
      )}
      <div className="appTitle" onClick={setStatus ? () => setStatus(Status.PRE_GENERATION) : () => navigate("/")}>
        <Title>RESELL</Title>
      </div>
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
      }}>
        { !isPortrait && (<div style={{
          cursor: "pointer",
          transform: "translateX(-42px)",
          border: "1px solid #000", background:
          "var(--white, #FFF)",
          borderRadius: "4px",
          padding: "5px "
        }} onClick={() => setFeedbackModalOpen(true)}>
          <Text color="black" size="16px" weight={400}>
            Feedback
          </Text>
        </div>)}
        { user && user['email'] && (
          <div id="manageItems" style={{ cursor: "pointer", transform: "translateX(-42px) translateY(5px)" }} onClick={() => navigate('/manage')}>
            <Text size="17px" weight={400} color="dark-gray">
              Manage Items
            </Text>
          </div>
        )}
        <div id="loginButton" className="loginButton">
          { user && user['email'] && (
            <div onClick={() => navigate('/profile')}>
              <Text size="16px" weight={400} color="dark-gray">
                My Account
              </Text>
            </div>
          )}
          { !user || !user['email'] && (
            <Login setUser={setUser} onSuccess={() => window.location.reload()}>
              <Text size="16px" weight={400} color="dark-gray">
                Login
              </Text>
            </Login>
          )}
        </div>
      </div>
    </div>
  )
};

export default AppHeader;
