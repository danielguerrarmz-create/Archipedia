import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCw } from "lucide-react";
import { useLocation } from "wouter";
import { Node } from "./motif/Node";

/*
 * Header — compact bar variant (used on canvas).
 * variant="minimal" → back button only (debossed, no glass).
 * default → debossed search well + camera ghost button + Search (primary signal).
 */

const searchPlaceholders = [
  "1960s Brutalist Brazilian Architecture",
  "Polycarbonate Engineered Facades in Arid Climate Regions",
  "Cross-Laminated Timber High-Rise Construction Details",
  "Metabolist Movement Japanese Capsule Housing",
  "Passive Cooling Strategies in Tropical Courtyard Typologies",
  "Rammed Earth Wall Sections with Integrated Insulation",
  "Louis Kahn Travertine Detailing and Shadow Gaps",
  "Parametric ETFE Roof Systems for Sports Facilities",
  "Tadao Ando Concrete Formwork Patterns and Board Marks",
  "Post-War Scandinavian Brick Bond Variations",
  "Carlo Scarpa Brass-to-Concrete Joint Details",
  "Tensile Membrane Structures in Desert Climates",
];

interface HeaderProps {
  variant?: "default" | "minimal";
  onSearch?: (query: string, image: string | null) => void;
  onRefresh?: () => void;
  showRefresh?: boolean;
  initialQuery?: string;
  initialImage?: string | null;
}

export function Header({
  variant = "default",
  onSearch,
  onRefresh,
  showRefresh = false,
  initialQuery = "",
  initialImage = null,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  if (variant === "minimal") {
    return (
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "8px",
          zIndex: 50,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <button
          type="button"
          onClick={() => setLocation("/")}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            background: "var(--concrete-0)",
            boxShadow: "var(--emboss)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "4px 10px",
            cursor: "pointer",
            color: "var(--ink-700)",
            letterSpacing: "0.06em",
          }}
        >
          ← Back
        </button>
      </header>
    );
  }

  // Placeholder rotation
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setIsPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
        setIsPlaceholderVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, uploadedImage);
    } else {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery);
      if (uploadedImage) params.set("type", "image");
      const qs = params.toString();
      setLocation(qs ? `/canvas?${qs}` : "/canvas");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const hasInput = !!(searchQuery || uploadedImage);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        paddingTop: 6,
        zIndex: 50,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div
        style={{
          width: "50%",
          maxWidth: 600,
          minWidth: 320,
          background: "var(--concrete-0)",
          boxShadow: "var(--raised)",
          borderRadius: "var(--radius-md)",
          padding: "4px 8px",
        }}
      >
        {/* Uploaded image preview */}
        {uploadedImage && (
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  boxShadow: "var(--deboss)",
                }}
              >
                <img src={uploadedImage} alt="Reference" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button
                onClick={() => { setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                type="button"
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 14,
                  height: 14,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--ink-900)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={8} style={{ color: "#fff" }} />
              </button>
              <span
                className="mono-caps"
                style={{ position: "absolute", top: -8, left: -2, fontSize: 9, background: "var(--ink-900)", color: "#fff", padding: "1px 4px", borderRadius: 2 }}
              >
                Ref
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Left icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {showRefresh && onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh"
                style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.4, color: "var(--ink-700)", display: "flex" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
              >
                <RotateCw size={12} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload reference image"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: uploadedImage ? 1 : 0.35,
                color: "var(--ink-700)",
                display: "flex",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = uploadedImage ? "1" : "0.35"; }}
            >
              <Camera size={12} strokeWidth={1.5} />
            </button>
          </div>

          {/* Text input */}
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: searchQuery ? "var(--ink-900)" : "transparent",
                padding: 0,
              }}
            />
            {!searchQuery && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: isPlaceholderVisible ? 1 : 0,
                  transition: "opacity 400ms ease",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--ink-400)",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {searchPlaceholders[placeholderIndex]}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            style={{
              flexShrink: 0,
              height: 28,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              background: hasInput ? "var(--signal)" : "var(--concrete-100)",
              color: hasInput ? "#fff" : "var(--ink-700)",
              boxShadow: "var(--emboss)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              transition: "background var(--dur-1) var(--ease-press), color var(--dur-1) var(--ease-press)",
            }}
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
