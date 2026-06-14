import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCw, RefreshCw } from "lucide-react";
import { ConnectorLoader } from "./motif/ConnectorLoader";

/*
 * AdvancedSearchBar — Concrete & Signal.
 * One debossed well (bg concrete-0, radius-lg hero / radius-md bar).
 * Image-upload: ghost camera + mono-caps "ADD IMAGE".
 * Search button: primary signal + stamp-press + ConnectorLoader while loading.
 * When query empty: secondary (concrete-100, ink text), NOT transparent-glass.
 * Drag-over: inset signal hairline + signal-tint wash + "DROP TO MATCH".
 * LensFrame retired — replaced with debossed well.
 */

interface AdvancedSearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (query: string, image?: string | null) => void;
  variant?: "default" | "hero" | "header" | "inline";
  showImageUpload?: boolean;
  disabled?: boolean;
  className?: string;
  animatedPlaceholders?: string[];
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  refreshButtonPosition?: "before" | "after";
  buttonText?: string;
  buttonStyle?: "default" | "transparent-when-empty";
  hasConnections?: boolean;
  isLoading?: boolean;
}

export function AdvancedSearchBar({
  placeholder = "",
  initialValue = "",
  onSearch,
  variant = "default",
  showImageUpload = true,
  disabled = false,
  className = "",
  animatedPlaceholders = [],
  showRefreshButton = false,
  onRefresh,
  refreshButtonPosition = "after",
  buttonText,
  buttonStyle = "default",
  hasConnections = false,
  isLoading = false,
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated placeholder
  useEffect(() => {
    if (animatedPlaceholders.length > 0 && !query) {
      const interval = setInterval(() => {
        setIsPlaceholderVisible(false);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % animatedPlaceholders.length);
          setIsPlaceholderVisible(true);
        }, 400);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animatedPlaceholders, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() || uploadedImage) {
      onSearch(query, uploadedImage);
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

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag-and-drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // Try URI from drag (e.g. from SearchResultCard)
      const uri = e.dataTransfer.getData("text/uri-list");
      if (uri) setUploadedImage(uri);
    }
  };

  const isHero = variant === "hero";
  const isHeader = variant === "header";
  const isInline = variant === "inline";

  const hasInput = !!(query.trim() || uploadedImage);

  // Well sizing
  const wellRadius = isHero ? "var(--radius-lg)" : "var(--radius-md)";
  const wellPaddingV = isHero ? 12 : isInline ? 8 : isHeader ? 3 : 6;
  const wellPaddingH = isHero ? 20 : isInline ? 16 : isHeader ? 8 : 12;
  const textSize = isHero ? 20 : isInline ? 16 : isHeader ? 12 : 15;
  const btnTextSize = isHero ? 16 : isInline ? 14 : isHeader ? 11 : 14;
  const btnHeight = isHero ? 44 : isInline ? 36 : isHeader ? 26 : 36;
  const iconSize = isHero ? 20 : isInline ? 16 : isHeader ? 12 : 16;

  // Drag-over signal wash
  const dragOverStyle = isDragOver
    ? {
        boxShadow: "var(--deboss), inset 0 0 0 2px var(--signal)",
        background: "var(--signal-tint)",
      }
    : {};

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: "var(--concrete-0)",
          boxShadow: "var(--deboss)",
          borderRadius: wellRadius,
          padding: `${wellPaddingV}px ${wellPaddingH}px`,
          position: "relative",
          transition:
            "box-shadow var(--dur-1) var(--ease-press), background var(--dur-1) var(--ease-press)",
          ...dragOverStyle,
        }}
        className={className}
      >
        {/* Drag overlay label */}
        {isDragOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: wellRadius,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <span
              className="mono-caps"
              style={{ color: "var(--signal)", fontSize: 13, letterSpacing: "0.14em" }}
            >
              DROP TO MATCH
            </span>
          </div>
        )}

        {/* Uploaded image preview */}
        {uploadedImage && (
          <div
            style={{
              marginBottom: isHero ? 12 : isInline ? 8 : 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  width: isHero ? 96 : isInline ? 48 : 28,
                  height: isHero ? 96 : isInline ? 48 : 28,
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  boxShadow: "var(--emboss)",
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Reference"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <button
                onClick={removeUploadedImage}
                type="button"
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 16,
                  height: 16,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--ink-900)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={9} style={{ color: "#fff" }} />
              </button>
              <span
                className="mono-caps"
                style={{
                  position: "absolute",
                  top: -9,
                  left: -2,
                  fontSize: 9,
                  background: "var(--ink-900)",
                  color: "#fff",
                  padding: "1px 4px",
                  borderRadius: 2,
                }}
              >
                {isHeader ? "Ref" : "Reference"}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: isHero ? 16 : 8 }}>
          {/* Left icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {showImageUpload && showRefreshButton && refreshButtonPosition === "before" && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh results"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0.4,
                  color: "var(--ink-700)",
                  display: "flex",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
              >
                <RotateCw size={iconSize} strokeWidth={1.5} />
              </button>
            )}

            {showImageUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="ADD IMAGE"
                aria-label="Add reference image"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  opacity: uploadedImage ? 1 : 0.4,
                  color: "var(--ink-700)",
                  transition: "opacity var(--dur-1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = uploadedImage ? "1" : "0.4"; }}
              >
                <Camera size={iconSize} strokeWidth={1.5} />
                {!isHeader && !uploadedImage && (
                  <span className="mono-caps" style={{ fontSize: 9 }}>
                    ADD IMAGE
                  </span>
                )}
              </button>
            )}

            {showImageUpload && showRefreshButton && refreshButtonPosition === "after" && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0.4,
                  color: "var(--ink-700)",
                  display: "flex",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
              >
                <RefreshCw size={iconSize} strokeWidth={1.5} />
              </button>
            )}

            {!showImageUpload && showRefreshButton && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0.4,
                  color: "var(--ink-700)",
                  display: "flex",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
              >
                <RefreshCw size={iconSize} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Text field */}
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={animatedPlaceholders.length === 0 ? placeholder : ""}
              disabled={disabled}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: textSize,
                color: animatedPlaceholders.length > 0 && !query ? "transparent" : "var(--ink-900)",
                padding: 0,
              }}
            />
            {/* Animated placeholder overlay */}
            {animatedPlaceholders.length > 0 && !query && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: isPlaceholderVisible ? 1 : 0,
                  transition: "opacity 400ms ease",
                  fontFamily: "var(--font-body)",
                  fontSize: textSize,
                  color: "var(--ink-400)",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {animatedPlaceholders[placeholderIndex]}
              </div>
            )}
          </div>

          {/* Search button — primary signal when has input, secondary when empty */}
          <button
            type="submit"
            disabled={disabled}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            style={{
              flexShrink: 0,
              height: btnHeight,
              padding: `0 ${isHero ? 28 : isInline ? 20 : 14}px`,
              borderRadius: "var(--radius-md)",
              background: hasInput ? "var(--signal)" : "var(--concrete-100)",
              color: hasInput ? "#fff" : "var(--ink-700)",
              boxShadow: isPressed ? "var(--deboss)" : "var(--emboss)",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              fontSize: btnTextSize,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: isPressed ? "translateY(1px) scale(0.99)" : "none",
              transition:
                "background var(--dur-1) var(--ease-press), box-shadow var(--dur-1) var(--ease-press), transform var(--dur-1) var(--ease-press), color var(--dur-1) var(--ease-press)",
              minWidth: isHero ? 100 : isHeader ? 56 : 72,
            }}
          >
            {isLoading ? (
              <ConnectorLoader size={isHero ? 40 : 28} light={hasInput} />
            ) : (
              buttonText || (hasConnections ? "Remix" : "Search")
            )}
          </button>
        </form>
      </div>
    </>
  );
}
