import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./lib/fonts"; // self-hosted Fontsource faces
import "./index.css";
import "./styles/globals.css";
import "./styles/tokens.css"; // Concrete & Signal — imported LAST to win the cascade
import { initAnalytics } from "./lib/analytics";

initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);