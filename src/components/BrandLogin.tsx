import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip'
import { useCookies } from 'react-cookie';

import Spacer from './base/Spacer';
import Text from './base/Text';
import TextInput from './base/TextInput';
import Space from './base/Space';
import PasswordInput from './base/PasswordInput';
import LoadingSpinner from './base/Spinner';

export enum BrandLoginStatus {
  INITIAL,
  INPUT,
  LOADING,
  TWO_FACTOR,
  CONNECTED,
}

const BrandLogin = ({ brand, initialStatus, setConnected, setModalOpen }: {
  brand: string,
  setModalOpen: (b: boolean) => void,
  setConnected?: (b: boolean) => void,
  initialStatus?: BrandLoginStatus
}) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [secondAgree, setSecondAgree] = useState<boolean>(brand == "poshmark");
  const [twoFactor, setTwoFactor] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<BrandLoginStatus>(initialStatus ?? BrandLoginStatus.INITIAL);

  const brandLogin = async () => {
    if (username.length < 2 || password.length < 2) {
      setErrorMessage("Please enter a valid username and password.");
      return;
    } else if (!agree || !secondAgree) {
      setErrorMessage("To proceed, you must select all boxes above.");
      return;
    } else {
      setErrorMessage("");
    }

    setStatus(BrandLoginStatus.LOADING);
    const response = await fetch(`${process.env.REACT_APP_BE_URL}/add-account-info`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'site': brand,
        'username': username,
        'password': password
      })
    })

    if (response.status != 200) {
      setErrorMessage("We encountered an error connecting your account. Please verify that your email + password are correct.");
      return;
    }

    const response2 = await fetch(`${process.env.REACT_APP_BE_URL}/login-with-credentials`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'site': brand,
        'username': username,
        'password': password
      })
    });

    const response2Json = await response2.json();

    console.log(response2Json);
  }

  const verifyTwoFactor = async () => {
    setStatus(BrandLoginStatus.LOADING);

    fetch(`${process.env.REACT_APP_BE_URL}/add-two-factor`, {
      method: "POST",
      headers: {
        'auth-token': cookies['user-id'],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'site': brand,
        'two_factor_code': twoFactor
      })
    })
  }
  
  useEffect(() => {
    async function checkStatus() {

      if (status == BrandLoginStatus.INPUT || status == BrandLoginStatus.INITIAL) {
        const response = await fetch(`${process.env.REACT_APP_BE_URL}/get-account-info`, {
          method: "POST",
          headers: {
            'auth-token': cookies['user-id'],
            'Content-Type': "application/json"
          },
          body: JSON.stringify({
            "site": brand
          })
        });
        const respJson = await response.json();

        if (respJson["connected"]) {
          setStatus(BrandLoginStatus.CONNECTED);
          setConnected && setConnected(true);
        }
      } else {

        while (status === BrandLoginStatus.LOADING) {
          await new Promise(r => setTimeout(r, 500));
          const response = await fetch(`${process.env.REACT_APP_BE_URL}/get-account-info`, {
            method: "POST",
            headers: {
              'auth-token': cookies['user-id'],
              'Content-Type': "application/json"
            },
            body: JSON.stringify({
              "site": brand
            })
          });

          const respJson = await response.json();
          console.log(respJson);

          if (respJson["connected"]) {
            setStatus(BrandLoginStatus.CONNECTED);
            setConnected && setConnected(true);
            break;
          } else if (respJson["two_factor"]) {
            setStatus(BrandLoginStatus.TWO_FACTOR);
            break;
          } else if (respJson["error"]) {
            setErrorMessage("We encountered an error connecting your account. Please verify that your email + password are correct. If you're still having trouble, let us know!");
            break;
          }
        }
      }
    }

    checkStatus();
  }, [status])

  return (
    <Spacer gap={12}>
      <img src={process.env.PUBLIC_URL + `/assets/${brand}-logo.png`} style={{ maxWidth: '200px', height: '40px' }} />
      { status === BrandLoginStatus.INITIAL && (
        <>
          <Space px="24px" />
          <div style={{
            borderRadius: "4px",
            background: "#D648B7",
            cursor: "pointer",
            width: "192px",
            height: "38px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }} onClick={() => setStatus(BrandLoginStatus.INPUT)}>
            <Text size="16px" weight={700} color="white">
              Connect Account
            </Text>
          </div>
        </>
      )}
      { status === BrandLoginStatus.INPUT && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", alignContent: "start", maxWidth: "250px" }}>
          <Spacer gap={5}>
            <Text size="18px" weight={700} color="black">Link Account</Text>
            <Text size="14px" weight={400} color="black">Don't have an account? <div style={{ cursor: 'pointer', color: "#2a60ae", display: "inline"}} onClick={() => window.open("https://www.depop.com/signup/", "_blank")}>Sign up</div></Text>
          </Spacer>
          <Space px="12px" />
          <Text size="12px" weight={400} color="dark-gray" align="left">Email</Text>
          <TextInput query={username} setQuery={setUsername} />
          <Space px="12px" />
          <Text size="12px" weight={400} color="dark-gray" align="left">Password</Text>
          <PasswordInput setPassword={setPassword}/>
          <Text size="12px" weight={400} color="dark-gray">
            <div
              style={{ cursor: 'pointer', color: "#2a60ae"}}
              data-tooltip-id="customComponentTooltip"
              onClick={ brand == "poshmark" ? () => window.open("https://poshmark.com/user/account-info", "_blank") : brand == "mercari" ? () => window.open("https://www.mercari.com/mypage/email_password/", "_blank") : undefined}
            >
              Don't have a password? {brand !== "depop" && "Set one here"}
            </div>
            { brand == "depop" && (
              <Tooltip id="customComponentTooltip" place={ "bottom" } style={{ maxWidth: "200px", whiteSpace: "pre-wrap", zIndex: 4000 }}>
                If you log in to Depop via Google or Apple, you have to add a password to link your account. You can easily do this by opening the Depop app, and going to Settings &gt; Profile &gt; Password.
              </Tooltip>
            )}
          </Text>
          <Space px="24px" />
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <Text color="dark-gray" size="12px" weight={500}>
              I agree to the <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => setModalOpen(true)}>Resell Terms and Conditions</div> of linking my account.
            </Text>
          </div>
          { brand == "mercari" && (
            <>
              <Space px="12px" />
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#d6f4fe",
                borderRadius: "8px",
                padding: "5px"
              }}>
                <input
                  type="checkbox"
                  checked={secondAgree}
                  onChange={() => setSecondAgree(!secondAgree)}
                />
                <Text color="dark-gray" size="12px" weight={500}>
                  On Mercari, I have added an address <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => window.open("https://www.mercari.com/mypage/deliver_address/", "_blank")}>here</div> and a card <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => window.open("https://www.mercari.com/mypage/card/", "_blank")}>here</div>. (Mercari requires these to link accounts.)
                </Text>
              </div>
            </>
          )}
          { brand == "depop" && (
            <>
              <Space px="12px" />
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#d6f4fe",
                borderRadius: "8px",
                padding: "5px"
              }}>
                <input
                  type="checkbox"
                  checked={secondAgree}
                  onChange={() => setSecondAgree(!secondAgree)}
                />
                <Text color="dark-gray" size="12px" weight={500}>
                  On Depop, I have added an address <div style={{ cursor: 'pointer', color: '#2973EC', display: "inline" }} onClick={() => window.open("https://www.depop.com/products/create/", "_blank")}>on the listing page</div>. (Depop requires this to link accounts.)
                </Text>
              </div>
            </>
          )}
          <Space px="12px" />
          {errorMessage && (
            <>
              <Text color="red" size="12px" weight={500}>
                {errorMessage}
              </Text>
              <Space px="6px" />
            </>
          )}
          <Spacer gap={10}>
            <div style={{
              borderRadius: "4px",
              background: "#D648B7",
              cursor: "pointer",
              width: "192px",
              height: "38px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }} onClick={brandLogin}>
              <Text size="16px" weight={700} color="white">
                Connect Account
              </Text>
            </div>
            <Text color="black" size="12px" weight={500}>
              NOTE: We only use your account to create listings. We will never view, create, edit, or delete anything else.
            </Text>
          </Spacer>
        </div>
      )}
      { status == BrandLoginStatus.LOADING && (
        <Spacer gap={20}>
          <Text size="18px" weight={700} color="black">Link Account</Text>
          <Spacer gap={5}>
            <LoadingSpinner />
            <Text color="dark-gray" weight={400} size="14px">
              Connecting account. This usually takes around 10 seconds.
            </Text>
          </Spacer>
        </Spacer>
      )}
      { status === BrandLoginStatus.TWO_FACTOR && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", alignContent: "start" }}>
          <Spacer gap={5}>
            <Text size="18px" weight={700} color="black">Link Account</Text>
            <Text size="14px" weight={400} color="black">You will receive an email with a two-factor authentication code.</Text>
            <Space px="16px" />
            <Text size="16px" weight={400} color="dark-gray" align="left">Two-factor code</Text>
            <TextInput query={twoFactor} setQuery={setTwoFactor} />
          </Spacer>
          <Space px="12px" />
          <Spacer gap={0}>
            <div style={{
              borderRadius: "4px",
              background: "#D648B7",
              cursor: "pointer",
              width: "192px",
              height: "38px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }} onClick={verifyTwoFactor}>
              <Text size="16px" weight={700} color="white">
                Verify Code
              </Text>
            </div>
          </Spacer>
        </div>
      )}
      { status === BrandLoginStatus.CONNECTED && (
        <>
          <Space px="24px" />
          <div style={{
            borderRadius: "4px",
            background: "#D648B7",
            cursor: "pointer",
            width: "192px",
            height: "38px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: "0.5"
          }}>
            <Text size="16px" weight={700} color="white">
              Connected
            </Text>
          </div>
        </>
      )}
    </Spacer>
  );
};

export default BrandLogin;

