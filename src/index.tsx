import React from 'react';
import ReactDOM from 'react-dom';
import {route} from "./router";
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
ReactDOM.render(
  <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <RouterProvider router={route} />
      </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
