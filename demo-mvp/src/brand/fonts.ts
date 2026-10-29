/**
 * Self-hosted brand fonts (Fontsource) — replaces the Google Fonts @import.
 *
 * Concrete & Signal type system:
 *   editorial → Fraunces (variable, opsz)  — high-contrast old-style serif for
 *               hero/section display type. The "architecture monograph" voice
 *               that gives the all-grotesk shell its editorial character.
 *   display → Archivo (variable)        — Swiss neo-grotesque, sub-heads/wordmark
 *   body    → Hanken Grotesk (variable) — humane neo-grotesk, UI + prose
 *   mono    → Spline Sans Mono          — metadata / counts / IDs / coords
 */
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/archivo";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/spline-sans-mono/400.css";
import "@fontsource/spline-sans-mono/500.css";
