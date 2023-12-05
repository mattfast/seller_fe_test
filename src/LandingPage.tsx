import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Analytics } from '@vercel/analytics/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip'

import Spacer from "./components/base/Spacer";
import Space from "./components/base/Space";
import Text from "./components/base/Text";
import "./LandingPage.css";

import AppHeader from "./components/AppHeader";
import DisplayGeneration from "./components/DisplayGeneration";
import PhotoOptions from "./components/PhotoOptions";
import PhotoAndDelete from "./components/PhotoAndDelete";
import WideButton from "./components/WideButton";
import BottomBar from "./components/BottomBar";
import LoadingSpinner from "./components/base/Spinner";
import Login from "./components/Login";
import PhotoInput from "./components/PhotoInput";
import PrivacyModal from "./components/PrivacyModal";
import TermsModal from "./components/TermsModal";
import FeedbackModal from "./components/FeedbackModal";
import GoogleLoginButton from "./components/GoogleLoginButton";
//import EbaySignInButton from "./components/EbaySignin";

export enum Status {
  PRE_GENERATION,
  GENERATING,
  LOGIN,
  GENERATIONS_EXCEEDED,
  POST_GENERATION
}

export type AccountInfo = {
  username: string,
  password: string,
  two_factor?: boolean;
  connected?: boolean;
}

export type UserType = {
  userId: string;
  email?: string;
  subscriptionTier?: string;
  generationsLeft?: number;
  listingsLeft?: number;
  lastGeneration?: string;
  subscriptionExpires?: string;
}

export type Generation = {
  generationId: string;
  userId: string;
  generatedFields: any;
  listingUrls: string[];
  size?: string;
  payInfo?: {
    who: string;
    cost: number;
    selfShipping: boolean;
  }
}

const LandingPage = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [searchParams, setSearchParams] = useSearchParams();

  const [image, setImage] = useState<Blob | null>(null);
  const [brand, setBrand] = useState<string>("");
  const [isRare, setIsRare] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(Status.PRE_GENERATION);
  const [user, setUser] = useState<UserType | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<ReactNode | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [currentPlatform, setCurrentPlatform] = useState('Depop');
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
    async function verifySubscription() {
      const checkoutStatus = searchParams.get("checkout");
      if (checkoutStatus && checkoutStatus == "success") {
        const response = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-user`, {
          method: "GET",
          headers: {
            'auth-token': cookies['user-id'],
          }
        });

        const respJson = await response.json();

        if (response.status == 200 && respJson['generations_left'] != 0) {
          navigate(`/${user?.lastGeneration}/list`)
        }
      }
    }

    verifySubscription();
  }, [searchParams])

  useEffect(() => {
    async function createOrRetrieveUser() {
      let response;
      if (cookies['user-id']) {
        response = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-user`, {
          method: "GET",
          headers: {
            'auth-token': cookies['user-id'],
          }
        })
      } else {
        response = await fetch(`${process.env.REACT_APP_BE_URL}/create-user`, {
          method: "POST",
        })
      }

      const respJson = await response.json();
      setUser({
        userId: respJson["user_id"],
        email: respJson["email"] ?? undefined,
        subscriptionTier: respJson["subscription_tier"] ?? undefined,
        generationsLeft: respJson["generations_left"] ?? undefined,
        lastGeneration: respJson["last_generation"] ?? undefined
      });

      respJson["cookie"] && setCookie("user-id", respJson["cookie"]);
    }
    
    createOrRetrieveUser();
  }, [cookies])

  const generate = async () => {
    const response = await fetch(`${process.env.REACT_APP_BE_URL}/list-image`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'url': `${user?.userId}/0.${fileType}`,
        'is_unique': isRare,
        'brand': brand
      })
    });

    if (response.status !== 201) {
      setErrorMessage(
        <div>Our AI model is a bit overloaded with requests right now.<br /><br />Wait about 30 seconds, and give it another shot!</div>
      );
    } else {
      setStatus(Status.GENERATING);
    }

  }

  useEffect(() => {
    async function pollForGeneration() {
      while (status === Status.GENERATING) {
        const response = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-user`, {
          method: "GET",
          headers: {
            'auth-token': cookies['user-id'],
          }
        });

        const respJson = await response.json();

        if (respJson['last_generation']) {
          console.log("LAST GENERATION");
          console.log(respJson);
          console.log(respJson['last_generation']);
          if (respJson['last_generation']['error']) {
            setErrorMessage(
              <div>Our AI model is a bit overloaded with requests right now.<br /><br />Wait about 30 seconds, and give it another shot!</div>
            );
            setStatus(Status.PRE_GENERATION);
          } else if (respJson['last_generation']['is_clothing'] === false) {
            setErrorMessage(
              <div>Your picture does not show the clothing quite clearly enough.<br /><br />Make sure the lighting is good, and try taking a photo with a neutral background!</div>
            );
            setStatus(Status.PRE_GENERATION);
          } else {
            console.log(respJson['last_generation']);

            if (user?.email) {
              if (user?.generationsLeft && user?.generationsLeft <= 0 && user?.subscriptionTier != "Plus") setStatus(Status.GENERATIONS_EXCEEDED);
              else navigate(`/${respJson['last_generation']}/list`)
            }
            else setStatus(Status.LOGIN);
          }

          break;
        } else {
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    pollForGeneration();

  }, [status])

  useEffect(() => {
    if (status == Status.GENERATING) {
      const interval = setInterval(() => {
        setSecondsElapsed(prevSeconds => prevSeconds + 1);
      }, 1000); // Increment the seconds every 1000 milliseconds
  
      return () => clearInterval(interval);
    }
  }, [status]); 

  useEffect(() => {
    const platforms = ['Depop', 'Poshmark', 'Mercari'];
    let current = 0;

    const interval = setInterval(() => {
        current = current === platforms.length - 1 ? 0 : current + 1;
        setCurrentPlatform(platforms[current]);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
}, []);

    // "min(80vw, 560px)"

  return (
    <div className="landingPageBackground">
      <AppHeader user={user} setUser={setUser} setStatus={setStatus} setFeedbackModalOpen={setFeedbackModalOpen} isPortrait={isPortrait} />
      { status == Status.PRE_GENERATION && (
        <Spacer gap={0}>
          <div style={{ maxWidth: "min(60vw, 320px)" }}>
            <Space px="320px" />
            <Spacer gap={0}>
              <Text color="black" weight={400} size="31px">
                The #1 Fastest Platform for Selling Clothes on <div className="wordCycle">{currentPlatform}</div>
                { false && "Sell clothes faster with automatic descriptions and pricing." }
              </Text>
              <Space px="15px" />
              <div data-tooltip-id="customComponentTooltip">
                <Text color="dark-gray" weight={400} size="16px">
                  Add a photo and Resell will do the rest. <img src={process.env.PUBLIC_URL + "/assets/info.png"} style={{ height: "16px", width: "16px" }}></img>
                </Text>
              </div>
                <Tooltip id="customComponentTooltip" place={ isPortrait ? "bottom" : "right" } style={{ maxWidth: "200px", whiteSpace: "pre-wrap", zIndex: 4000 }}>
                 Resell uses cutting-edge AI models to generate everything you need to sell clothes online (description, price, and over 15 more fields). Just upload a photo of your item and click "Generate" to get started.
                </Tooltip>
            </Spacer>
            <Space px="32px" />
            { !image && (
              <Spacer gap={20}>
                <PhotoOptions userId={user?.userId} setImage={setImage} setFileType={setFileType} />
                <Text color="dark-gray" weight={400} size="20px">
                  Sites Supported
                </Text>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch", width: "120%", transform: "translateX(-10%)"}}>
                  <img src={process.env.PUBLIC_URL + "/assets/depop-logo.png"} style={{ width: "105px", height: "auto" }} />
                  <img src={process.env.PUBLIC_URL + "/assets/mercari-logo.png"} style={{ width: "105px", height: "25px" }} />
                  <img src={process.env.PUBLIC_URL + "/assets/poshmark-logo.png"} style={{ width: "105px", height: "22px" }} />

                </div>
              </Spacer>
            )}
            { image && (
              <>
                <PhotoAndDelete imageUrl={URL.createObjectURL(image)} onDelete={() => setImage(null)} />
                <Space px="32px" />
                <PhotoInput setBrand={setBrand} isRare={isRare} setIsRare={setIsRare} />
                <Space px="40px" />
                <Spacer gap={0}>
                  <WideButton onClick={generate} color="blue" text="Generate" />
                </Spacer>
                <Space px="24px" />
                <Text color="light-gray" weight={400} size="14px">
                  { user?.subscriptionTier != "Plus" && (
                    <div style={{ display: 'inline' }}>
                      You have {user?.generationsLeft ?? "2"}x free generations left. 
                      <div
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                      >
                        { !user?.email && (
                          <Login setUser={setUser} onSuccess={() => navigate("/profile")}>
                            Need more? Buy credits
                          </Login>
                        )}
                        { user?.email && (
                          <div onClick={() => navigate("/profile")}>
                            Need more? Buy credits
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Text>
                <Space px="100px" />
              </>
            )}
          </div>
        </Spacer>
      )}
      { status == Status.GENERATING && (
        <Spacer gap={0}>
          <div style={{ maxWidth: "min(60vw, 320px)" }}>
            <Space px="320px" />
            <LoadingSpinner />
            <Space px="24px" />
            {secondsElapsed < 30 && (
              <Spacer gap={20}>
                <Text color="light-gray" size="16px" weight={400}>
                  We’re generating the information for this product.
                </Text>
                <Text color="light-gray" size="16px" weight={400}>
                  Hold tight—it shouldn’t take longer than 30s. If it does, refresh and try again.
                </Text>
              </Spacer>
            )}
            { secondsElapsed >= 30 && (
              <Spacer gap={20}>
                <Text color="light-gray" size="16px" weight={400}>
                  Hmm, our backend seems to be taking a while.
                </Text>
                <Text color="light-gray" size="16px" weight={400}>
                  Feel free to keep waiting, but you might wanna reload and try again.
                </Text>
              </Spacer>
            )}
            <Space px="24px" />
            <Text color="light-gray" size="16px" weight={400}>
              Time elapsed: {secondsElapsed}s
            </Text>
          </div>
        </Spacer>
      )}
      { status == Status.LOGIN && (
        <Spacer gap={0}>
          <div style={{ maxWidth: "min(60vw, 300px)" }}>
            <Space px="360px" />
            <Spacer gap={40}>
              <Text color="light-gray" size="16px" weight={400}>
                Your generation is ready! To view it, sign in with Google.
              </Text>
              <GoogleLoginButton setUser={setUser} onSuccess={() => {
                if (user?.generationsLeft && user?.generationsLeft <= 0 && user?.subscriptionTier != "Plus") setStatus(Status.GENERATIONS_EXCEEDED);
                else navigate(`/${user?.lastGeneration}/list`);
              }} />
            </Spacer>
          </div>
        </Spacer>
      )}
      { status == Status.GENERATIONS_EXCEEDED && (
        <Spacer gap={0}>
          <div style={{ maxWidth: "min(80vw, 560px)" }}>
            <Space px="28px" />
            <Text color="light-gray" size="16px" weight={400}>
              You’re out of generations. To continue generating descriptions, please <div style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/profile")}>subscribe to a cheap plan</div>.
            </Text>
          </div>
        </Spacer>
      )}
      <BottomBar setPrivacyModalOpen={setPrivacyModalOpen} setTermsModalOpen={setTermsModalOpen} />
      <TermsModal setModalOpen={setTermsModalOpen} modalOpen={termsModalOpen} />
      <PrivacyModal setModalOpen={setPrivacyModalOpen} modalOpen={privacyModalOpen} />
      <FeedbackModal setModalOpen={setFeedbackModalOpen} modalOpen={feedbackModalOpen} setSuccessMessage={setSuccessMessage} />
      <ToastContainer />
      <Analytics />
    </div>
  )
};

export default LandingPage;
