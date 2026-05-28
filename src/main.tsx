
  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/learnflow-sw.js").catch((error) => {
        console.warn("Não foi possível registrar o service worker do LearnFlow.", error);
      });
    });
  }
  
