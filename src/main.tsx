import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { KubeconfigFilePicker } from "./pages/kubeconfig-file-picker";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KubeconfigFilePicker />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
