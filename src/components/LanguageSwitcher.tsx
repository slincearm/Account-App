import { useState, useRef, useEffect, memo } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          padding: "0.5rem 0.75rem",
          color: "var(--text-primary)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.9rem"
        }}
        title="Change Language"
      >
        <Globe size={18} />
        <span className="hide-mobile">
          {currentLang?.flag}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            background: "var(--surface-dark)",
            border: "1px solid var(--glass-border)",
            borderRadius: "12px",
            padding: "0.5rem",
            minWidth: "180px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            zIndex: 1000
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem",
                background: currentLanguage === lang.code ? "rgba(139, 92, 246, 0.1)" : "transparent",
                border: "none",
                borderRadius: "8px",
                color: currentLanguage === lang.code ? "hsl(var(--color-primary))" : "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.9rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(LanguageSwitcher);
