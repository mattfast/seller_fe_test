import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  email?: string;  // Add other fields you expect in the token, if necessary
}

const GoogleLoginButton = ({ setUser, onSuccess }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user-id']);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  /*const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log('Login Success:', response);
      setAccessToken(response.access_token);
    },
    onError: () => console.log('Login Failed'),
    // Optionally, you can add other configuration options here
  });*/

  useEffect(() => {
    async function getUserInfo() {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      const respJson = await response.json();
      setEmail(respJson['email']);
    }
    
    if (accessToken) getUserInfo();
  }, [accessToken])

  useEffect(() => {
    async function loginOrCreateAccount() {
      const response = await fetch(`${process.env.REACT_APP_BE_URL}/email-login`, {
        method: "POST",
        headers: {
          'auth-token': cookies['user-id'],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'email': email
        })
      })

      const respJson = await response.json();
      if (response.status == 200) {
        setUser({
          userId: respJson["user_id"],
          email: respJson["email"] ?? undefined,
          subscriptionTier: respJson["subscription_tier"] ?? undefined,
          generationsLeft: respJson["generations_left"] ?? undefined,
          lastGeneration: respJson["last_generation"] ?? undefined,
        })
        onSuccess();
      }
    }

    if (email) loginOrCreateAccount();

  }, [email])

  return (
    <GoogleLogin onSuccess={(response) => {
      console.log('Login Success:', response);
      if (response.credential) {
        const decoded = jwtDecode<CustomJwtPayload>(response.credential);
        console.log("Decoded JWT:", decoded);
    
        // Accessing the email from the decoded token
        const userEmail = decoded.email;
        console.log("User Email:", userEmail);
        setEmail(userEmail ?? "");
      }
    }} />
  )
};

export default GoogleLoginButton;
