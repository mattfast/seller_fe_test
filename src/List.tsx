import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Analytics } from '@vercel/analytics/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip'
//import ConfettiExplosion from 'react-confetti-explosion';

import { UserType, Generation } from "./LandingPage";
import { uploadToS3 } from './utils';

import Spacer from "./components/base/Spacer";
import Space from "./components/base/Space";
import Text from "./components/base/Text";
import Divider from "./components/base/Divider";

import AppHeader from "./components/AppHeader";
import PrivacyModal from "./components/PrivacyModal";
import TermsModal from "./components/TermsModal";
import BottomBar from "./components/BottomBar";
import FeedbackModal from "./components/FeedbackModal";
import ConnectTermsModal from "./components/ConnectTermsModal";
import AdditionalPhotos from "./components/AdditionalPhotos";
import PaymentOption from "./components/PaymentOption";
import DisplayGeneration from "./components/DisplayGeneration";
import WideButton from "./components/WideButton";
import BrandSelection from "./components/BrandSelection";
import LoadingSpinner from "./components/base/Spinner";
import ExtraListingInfo from "./components/ExtraListingInfo";

export enum ListStatus {
  GENERATION,
  EXTRA_INFO,
  CONNECT_MARKETPLACE,
  SUBSCRIBE,
  LOADING,
  CONGRATULATIONS,
}

const List = () => {
  let { id } = useParams();

  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [searchParams, setSearchParams] = useSearchParams();

  const [images, setImages] = useState<Blob[]>([]);
  const [status, setStatus] = useState<ListStatus>(ListStatus.GENERATION);
  const [brandList, setBrandList] = useState<string[]>([]);
  const [editedFields, setEditedFields] = useState<any>({});
  const [links, setLinks] = useState<string[]>([]);
  const [brandErrors, setBrandErrors] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [connectTermsModalOpen, setConnectTermsModalOpen] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<ReactNode | null>(null);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
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

        if (response.status == 200 && respJson['listings_left'] != 0) {
          setStatus(ListStatus.LOADING);
          await listItem();
          setStatus(ListStatus.CONGRATULATIONS);
        } else if (respJson['listings_left'] == 0) {
          setStatus(ListStatus.SUBSCRIBE);
        } else {
          /* TODO: set error message */
        }
      }
    }

    verifySubscription();
  }, [searchParams])

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
        navigate("/")
      }

      const respJson = await response.json();
      setUser({
        userId: respJson["user_id"],
        email: respJson["email"] ?? undefined,
        subscriptionTier: respJson["subscription_tier"] ?? undefined,
        generationsLeft: respJson["generations_left"] ?? undefined,
        listingsLeft: respJson["listings_left"] ?? undefined,
      });

      respJson["cookie"] && setCookie("user-id", respJson["cookie"]);
    }
    
    retrieveUser();
  }, [cookies])

  const getGeneration = async () => {
    const resp = await fetch(`${process.env.REACT_APP_BE_URL}/retrieve-generation`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'generation_id': id
      })
    });

    const respJson = await resp.json();

    setGeneration({
      generationId: respJson["generation_id"],
      userId: respJson["user_id"],
      generatedFields: respJson["generated_fields"],
      listingUrls: respJson["listing_urls"] ?? undefined,
      size: respJson["size"] ?? undefined,
      payInfo: respJson["pay_info"] ?? undefined
    });

    return respJson;
  }

  useEffect(() => {
    async function retrieveGeneration() {
      if (id) {
        getGeneration();
      } else {
        navigate("/")
      }
    }
    
    retrieveGeneration();
  }, [cookies])

  const uploadPhotos = async () => {

    let imageUrls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const fileName = await uploadToS3(images[i], id!, undefined, String(i+1));
      fileName && imageUrls.push(fileName);
    }
    await fetch(`${process.env.REACT_APP_BE_URL}/add-generation-images`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'image_urls': imageUrls,
        'generation_id': id
      })
    });
  }

  const listItem = async () => {
    for (let i = 0; i < brandList.length; i++) {
      fetch(`${process.env.REACT_APP_BE_URL}/post-to-site`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'generation_id': id,
          'site': brandList[i],
        })
      });
    }

    let links: string[] = [];
    let brandErrors: string[] = [];
    for (let i = 0; i < brandList.length; i++) {
      while (true) {
        const response = await fetch(`${process.env.REACT_APP_BE_URL}/get-post`, {
          method: "POST",
          headers: {
            'auth-token': cookies['user-id'],
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'generation_id': id,
            'site': brandList[i],
          })
        });

        const respJson = await response.json();

        console.log(respJson);

        if (respJson["completed"] && respJson["link"]) {
          links.push(respJson["link"]);
          break;
        } else if (respJson["completed"] && !respJson["link"]) {
          brandErrors.push(brandList[i]);
          break;
        }
      }
    }

    setLinks(links);
    setBrandErrors(brandErrors);
    await new Promise(r => setTimeout(r, 100));
  }

  const updateGeneratedFields = async () => {
    await fetch(`${process.env.REACT_APP_BE_URL}/update-generated-fields`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'generation_id': id,
        'new_generated_fields': editedFields 
      })
    });
  }

  const nextPage = async () => {
    setLoading(true);
    setErrorMessage(null);
    if (status == ListStatus.GENERATION) {
      if (Object.keys(editedFields).length > 0) {
        console.log(editedFields);
        await updateGeneratedFields();
      }
      setStatus(ListStatus.EXTRA_INFO);
    } else if (status == ListStatus.EXTRA_INFO) {
      await getGeneration();
      await new Promise(r => setTimeout(r, 100));
      if (generation?.payInfo === undefined || generation.size === undefined) {
        setErrorMessage("Please select both a shipping method and size.");
        setLoading(false);
        return;
      }
      await uploadPhotos();
      setStatus(ListStatus.CONNECT_MARKETPLACE);
    } else if (status == ListStatus.CONNECT_MARKETPLACE) {
      if (user?.subscriptionTier == "Free" || user?.listingsLeft == 0) {
        setStatus(ListStatus.SUBSCRIBE);
      } else {
        await listItem();
        if (links.length == 0) setErrorMessage("We're having some trouble reaching the selected platforms. Try again in a minute!");
        else setStatus(ListStatus.CONGRATULATIONS);
      }
    }
    setLoading(false);
  }

  return (
    <>
      <AppHeader user={user} setUser={setUser} setFeedbackModalOpen={setFeedbackModalOpen} isPortrait={isPortrait}  />
      <Space px="90px" />
      { status == ListStatus.GENERATION && (
        <div>
          <Space px="40px" />
          { generation && (<DisplayGeneration setEditedFields={setEditedFields} generation={generation?.generatedFields} user={user} nextPage={nextPage} setFeedbackModalOpen={setFeedbackModalOpen} listingUrls={generation?.listingUrls} />)}
          <Space px="100px" />
        </div>
      )}
      { status == ListStatus.EXTRA_INFO && (
        <Spacer gap={73}>
          <Spacer gap={23}>
            <Text color="black" weight={400} size="50px">
              We just need a few pieces of info
            </Text>
            <Text color="dark-gray" weight={400} size="16px">
              It’ll take you less than 20 seconds
            </Text>
            <ExtraListingInfo generation_id={id} />
            <Divider />
            <Spacer gap={11}>
              <Spacer gap={5}>
                <Text size="25px" weight={400} color="black">
                  Add up to 5 additional photos
                </Text>
                <Text size="16px" weight={400} color="dark-gray">
                  It’s not required, but it could make your listing better.
                </Text>
              </Spacer>
              <AdditionalPhotos images={images} setImages={setImages} existingImages={generation?.generatedFields["image_urls"] ?? []}/>
            </Spacer>
          </Spacer>
          { !loading && <WideButton color="blue" text="Continue" onClick={nextPage}/> }
          { loading && <LoadingSpinner /> }
          <Space px="100px" />
        </Spacer>
      )}
      { status == ListStatus.CONNECT_MARKETPLACE && (
        <Spacer gap={93}>
          <Spacer gap={23}>
            <Text color="black" weight={400} size="50px">
              Connect a Marketplace
            </Text>
            <Text color="dark-gray" weight={400} size="16px">
              Connect at least one of the following marketplaces to sell your item
            </Text>
          </Spacer>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "60px",
          }}>
            <BrandSelection brand="depop" brandList={brandList} setBrandList={setBrandList} setModalOpen={setConnectTermsModalOpen}/>
            <BrandSelection brand="mercari" brandList={brandList} setBrandList={setBrandList} setModalOpen={setConnectTermsModalOpen}/>
            <BrandSelection brand="poshmark" brandList={brandList} setBrandList={setBrandList} setModalOpen={setConnectTermsModalOpen}/>
          </div>
          { !loading && <WideButton color="blue" text={`List Item on ${brandList.length} Marketplace${brandList.length !== 1 ? "s" : ""}`} onClick={nextPage} greyedOut={brandList.length == 0}/> }
          { loading && (
            <Spacer gap={20}>
              <LoadingSpinner />
              <Text color="dark-gray" weight={400} size="16px">
                Creating your listing{brandList.length > 1 && "s"}! Sit tight, this will take around 10s.
              </Text>
            </Spacer>
          )}
          <Space px="100px" />
        </Spacer>
      )}
      { status == ListStatus.SUBSCRIBE && (
        <Spacer gap={93}>
          <Spacer gap={23}>
            <div style={{ maxWidth: "min(560px, 80vw"}}>
              <Text color="black" weight={400} size="50px">
                { user?.subscriptionTier == "Free" && "Subscribe to Resell" }
                { user?.subscriptionTier == "Standard" && "Upgrade to Plus" }
              </Text>
            </div>
            <Spacer gap={0}>
              <div style={{ maxWidth: "min(560px, 80vw"}}>
                <Text color="dark-gray" weight={400} size="16px">
                  { user?.subscriptionTier == "Free" && "Almost there! Automatic listing is available to Standard and Plus accounts." }
                  { user?.subscriptionTier == "Standard" && "You've run out of listings on the Standard tier." }
                </Text>
                <Text color="dark-gray" weight={400} size="16px">
                  { user?.subscriptionTier == "Free" && "Subscribe below and start making money!" }
                  { user?.subscriptionTier == "Standard" && "Upgrade to Plus for unlimited!" }
                </Text>
              </div>
            </Spacer>

            <Spacer gap={9}>
              <div style={{ display: "flex", width: "min(560px, 80vw)", justifyContent: "space-between" }}>
                <Text color="light-gray" weight={500} size="14px">
                  PLANS
                </Text>
                <Text color="light-gray" weight={500} size="14px">
                { user?.subscriptionTier == "Free" && "0 free listings" }
                { user?.subscriptionTier == "Standard" && "0/50 listings left" }
                </Text>
              </div>
              <Spacer gap={9}>
                <PaymentOption name="Free" currentPlan={user?.subscriptionTier} generations={2} listings={0} price={0} from={`/${id}/list`} expiring="" />
                <PaymentOption name="Standard" currentPlan={user?.subscriptionTier} generations={50} price={4.99} from={`/${id}/list`} expiring="" vendooPrice={19.99} />
                <PaymentOption name="Plus" currentPlan={user?.subscriptionTier} generations="Unlimited" price={8.99} from={`/${id}/list`} expiring="" vendooPrice={149.99} />
              </Spacer>
            </Spacer>
          </Spacer>
        </Spacer>
      )}
      { status == ListStatus.LOADING && (
        <>
          <Space px="30vh" />
          <Spacer gap={23}>
            <LoadingSpinner />
            <Text color="dark-gray" weight={400} size="24px">
              Creating your listing! Sit tight, this will take around 10s.
            </Text>
          </Spacer>
        </>
      )}
      { status == ListStatus.CONGRATULATIONS && (
        <>
          <Space px="30vh" />
          <Spacer gap={23}>
            <Text color="black" weight={400} size="50px">
              Congratulations! You listed your {user?.listingsLeft === 50 || user?.listingsLeft === -1 && "first "}item!
            </Text>
            <Spacer gap={5}>
              <Text color="dark-gray" weight={400} size="24px">
                View it here:
              </Text>
              {
                links.map(l => (<Text color="dark-gray" weight={400} size="24px">
                  <div style={{ cursor: 'pointer', color: '#2973EC' }} onClick={() => window.open(l, "_blank")}>{l}</div>
                </Text>)
              )}
            </Spacer>
            <Text color="dark-gray" weight={400} size="24px">
              Track its status on the <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => navigate("/manage")}>Item Management</div> page.
            </Text>
            {brandErrors.length > 0 && (
              <Text color="dark-gray" weight={400} size="24px">
                We unfortunately encountered issues with { brandErrors.map((b, i) => {
                  return b.slice(0,1).toUpperCase() + b.slice(1) + (i < brandErrors.length - 1 ? " and " : "");
                })}. You can try posting again on the <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => navigate("/manage")}>Item Management</div> page.
              </Text>
            )}
            
          </Spacer>
        </>
      )}
      <BottomBar setPrivacyModalOpen={setPrivacyModalOpen} setTermsModalOpen={setTermsModalOpen} />
      <ConnectTermsModal setModalOpen={setConnectTermsModalOpen} modalOpen={connectTermsModalOpen} brand="Depop"/>
      <TermsModal setModalOpen={setTermsModalOpen} modalOpen={termsModalOpen} />
      <PrivacyModal setModalOpen={setPrivacyModalOpen} modalOpen={privacyModalOpen} />
      <FeedbackModal setModalOpen={setFeedbackModalOpen} modalOpen={feedbackModalOpen} setSuccessMessage={setSuccessMessage} />
      <ToastContainer />
      <Analytics />
    </>
  )
};

export default List;
