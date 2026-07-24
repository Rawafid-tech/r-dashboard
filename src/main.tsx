import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/cairo/wght.css";
import "@/styles/global.css";
import "@/i18n/config";
import { AppProviders } from "@/app/providers";
import App from "@/app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
