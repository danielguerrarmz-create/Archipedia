import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// base "./" so the built demo can live under any sub-path of the portfolio site
export default defineConfig({ plugins: [react()], base: "./" });
