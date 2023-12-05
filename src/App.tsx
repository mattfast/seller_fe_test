import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import LandingPage from "./LandingPage";
import Profile from "./Profile";
import List from "./List";
import Manage from "./Manage";

const App = () => { 
  return (
    <MantineProvider theme={{ /* your theme settings */ }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <LandingPage /> } />
          <Route path="/profile" element={ <Profile /> } />
          <Route path="/:id/list" element={ <List /> } />
          <Route path="/manage" element={ <Manage /> } />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
};

export default App;
