import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "leaflet/dist/leaflet.css";
import './index.css'
import './i18n/config'; 
const container = document.getElementById("root")!;
const root = ReactDOM.createRoot(container);
root.render(<App />);