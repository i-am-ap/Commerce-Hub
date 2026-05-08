import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { store } from "@/app/store";
import App from "@/App";
import { initAnalytics } from "@/lib/analytics";
import "@/index.css";

initAnalytics();

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* <App /> */}
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        >
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);
