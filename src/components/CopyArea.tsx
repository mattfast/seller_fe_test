import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from 'react-tooltip'
import Select, { StylesConfig } from 'react-select';

import Text from "./base/Text";
import Spacer from "./base/Spacer";
import "./CopyArea.css";
import CopyIcon from "./CopyIcon";
import MultiselectOption from "./MultiselectOption";
import data from "../Options.json";

export const colourStyles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'white',
    width: 'min(570px, 78vw)',
    fontFamily: 'Switzer',
    padding: 'min(15px, 5vw)',
    color: "black"
  }),
  option: (styles) => ({
    ...styles,
    fontFamily: 'Switzer',
    color: "black"
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: "18px",
    color: "black"
  }),
  multiValue: (styles) => ({
    ...styles,
    fontFamily: 'Switzer',
    color: "black"
  })
};

const CopyArea = ({ category, text, frozen, onChange }: {
  category: string,
  text: any,
  frozen?: boolean,
  onChange?: (category: string, text: any) => void
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [currValue, setCurrValue] = useState<string>(String(text));

  const handleChangeDropdown = async (selectedOption) => {
    onChange && onChange(category, selectedOption.value.toLowerCase());
    
    await new Promise(r => setTimeout(r, 100));
    setCurrValue(selectedOption.value);
  };

  const handleChangeMultiselect = async (selectedOptions) => {
    const optionsList = selectedOptions.map(o => o.value.toLowerCase());
    onChange && onChange(category, selectedOptions.map(o => o.value.toLowerCase()));

    await new Promise(r => setTimeout(r, 100));
    setCurrValue(String(optionsList));
  }

  const handleChangeTextarea = async (currentText) => {
    onChange && onChange(category, currentText.toLowerCase());
    
    await new Promise(r => setTimeout(r, 100));
    setCurrValue(currentText);
  };

    // Function to adjust the height of textarea
  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight - 65}px`;
    }
  };

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      adjustTextareaHeight();
      textarea.addEventListener('input', adjustTextareaHeight);
      return () => {
          textarea.removeEventListener('input', adjustTextareaHeight);
      };
    }
  }, []);

  return (
    <Spacer gap={9}>
      <div className="copyTitleArea">
        <Text color="light-gray" weight={500} size="14px">
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            whiteSpace: "nowrap",
            flexDirection: "row",
          }}>
            {category.replace("_", " ").toUpperCase()}
            {Array.isArray(text) && " (TAGS)"}
            {category.toUpperCase() == "PRICE" && (
              <div style={{
                marginLeft: "5px",
                marginTop: "2px",
                cursor: "pointer"
              }}>
                <div data-tooltip-id="customComponentTooltip">
                  <Text color="light-gray" weight={500} size="10px">
                    (How is this calculated? <img src={process.env.PUBLIC_URL + "/assets/info.png"} style={{ height: "7px", width: "7px" }}/>)
                  </Text>
                </div>
                <Tooltip id="customComponentTooltip" style={{ maxWidth: "200px", whiteSpace: "pre-wrap" }}>
                  To determine price, we use various qualities (brand, rarity, material, wear, type) inferred from your image. We then query current online listings and calculate the median price among similar items.
                </Tooltip>
              </div>
            )}
          </div>
        </Text>
        <div className="copyButtonArea">
          <CopyIcon text={String(currValue)} />
          <Text color="blue" weight={600} size="14px">
            COPY
          </Text>
        </div>
      </div>
      { !Array.isArray(text) && (
        <>
          { data[category] && (
            <Select
              options={data[category].map(d => { return { label: d, value: d }})} 
              defaultValue={{ value: text, label: String(text)}}
              styles={colourStyles}
              onChange={handleChangeDropdown}
            /> 
          )}
          { !data[category] && (
            <textarea
              value={frozen ? text : undefined}
              defaultValue={!frozen ? text : undefined}
              className="copyTextArea"
              ref={textAreaRef}
              style={{
                textAlign: "left",
                fontFamily: "Switzer",
                fontSize: "18px",
                fontStyle: "normal",
                fontWeight: "400",
                color: "black"
              }}
              onChange={(e) => handleChangeTextarea(e.currentTarget.value)}
            /> 
          )}
        </>
      )}
      { Array.isArray(text) && (
        <>
          { data[category] && (
            <Select isMulti onChange={handleChangeMultiselect} options={data[category].map(d => { return { label: d, value: d }})} components={{ MultiValue: MultiselectOption }} defaultValue={text.map(t => { return {value: t, label: t }})} styles={colourStyles}/>
          )}
          { !data[category] && (
            <textarea rows={1} defaultValue={String(text)} className="copyTextArea" onChange={(e) => handleChangeTextarea(e.currentTarget.value)} style={{
              textAlign: "left",
              fontFamily: "Switzer",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: "400",
              color: "black"
            }}/> 
          )}
        </>
      )}
    </Spacer>
  )
};

export default CopyArea;
