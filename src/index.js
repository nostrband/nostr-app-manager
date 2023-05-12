import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeProvider from 'react-bootstrap/ThemeProvider'
import { IntlProvider } from "./IntlProvider";

import './index.scss';
import App from './App';
import About from './About';
import reportWebVitals from './reportWebVitals';

const HTTP = new QueryClient();

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/about",
    element: <About />
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={HTTP}>
      <IntlProvider>
	<ThemeProvider>
          <RouterProvider router={router} />
	</ThemeProvider>
      </IntlProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
