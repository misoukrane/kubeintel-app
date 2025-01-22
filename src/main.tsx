import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { KubeconfigFilePicker } from "@/pages/kubeconfig-file-picker";
import "./global.css";
import Layout from "./layout";
import { Cluster } from "./pages/cluster";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KubeconfigFilePicker />} />
        <Route element={<Layout />} >
          <Route path="/cluster"  element={<Cluster />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
