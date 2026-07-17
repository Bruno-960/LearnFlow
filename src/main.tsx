import { createRoot } from "react-dom/client";
import App from './app/App';
import "./styles/index.css";


createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/learnflow-sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent("learnflow:pwa-update-ready"));
            }
          });
        });

        const checkForUpdates = () => {
          registration.update().catch((error) => {
            console.warn("Nao foi possivel verificar atualizacoes do LearnFlow.", error);
          });
        };

        checkForUpdates();
        window.setInterval(checkForUpdates, 30 * 60 * 1000);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdates();
        });
      })
      .catch((error) => {
        console.warn("Nao foi possivel registrar o service worker do LearnFlow.", error);
      });
  });
}
