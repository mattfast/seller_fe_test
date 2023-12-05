import React from "react";


const TextInput = ({ query, setQuery, placeholder }: {
  query: string,
  setQuery: (s: string) => void,
  placeholder?: string
}) => {

  return (
    <input
      type="text"
      placeholder={ placeholder ?? undefined}
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
  )
}

export default TextInput;