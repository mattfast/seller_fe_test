import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts';

import Text from './base/Text';

import "./PriceHistogram.css"

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const barWidth = 80; // Adjust based on your bar width
    const chartLeftPadding = 30; // Adjust based on your chart's left padding

    // Calculate position based on index
    const index = payload[0].payload.index; // Assuming each data item has an 'index' property
    const tooltipX = chartLeftPadding + (index * (barWidth)) + (barWidth / 2);
    const tooltipY = 10; // Adjust based on desired Y position
    
    return (
      <div className="custom-tooltip" style={{
        position: 'absolute',
        left: `${tooltipX}px`, // Adjust as needed
        top: `${tooltipY}px`, // Adjust as needed
        transform: 'translateX(-50%)',
        width: '80px'
      }}>
        <Text size="12px" weight={400} color="black">{label}</Text>
        <br />
        {payload[0].payload.urls.slice(0,3).map((url, i) => (
          <>
            <Text size="12px" weight={400} color="black"><a href={url} target="_blank" rel="noopener noreferrer">Example #{i + 1}</a></Text>
          </>
        ))}
        
      </div>
    );
  }

  return null;
};

const PriceHistogram = ({ data }) => {

  return (
    <>
      <Text size="18px" color="black" weight={600}>
        How Similar Items are Priced Online
      </Text>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis label={{ value: 'Price Range', position: 'insideBottom', dy: 20 }} dataKey="name" />
        <YAxis label={{ value: '# of Items', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip/>} />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </>
  );
};

export default PriceHistogram;
