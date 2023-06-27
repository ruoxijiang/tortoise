import React from 'react';
import {route} from "./router";
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {createRoot} from "react-dom/client";
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
const container =document.getElementById('root') as Element;
const root = createRoot(container);
root.render(
  <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <RouterProvider router={route} />
      </ThemeProvider>
  </React.StrictMode>,
);
