import React, { useState } from "react";

const PasswordInput = ({ setPassword }) => {
  const [passwordShown, setPasswordShown] = useState<boolean>(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={passwordShown ? 'text' : 'password'}
        onChange={(e) => setPassword(e.currentTarget.value)}
        style={{         
          width: "200px",
          height: "20px",
          borderRadius: "8px",
          padding: "5px",
          border: "1px solid #475569"
        }}
      />
      <img
        onClick={() => setPasswordShown(!passwordShown)}
        src={process.env.PUBLIC_URL + "/assets/" + (passwordShown ? "view.png" : "hide.png")}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          right: "7px",
          top: "7px",
          width: "20px"
        }}
      />
    </div>
  )
}

export default PasswordInput;