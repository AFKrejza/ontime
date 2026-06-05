import { useNavigate } from "react-router-dom";
// @ts-ignore
import backIconPng from "../assets/settings.png";

interface BackButtonProps {
  toPage?: string;
}
export default function SettingsButton({ toPage }: BackButtonProps) {
  const navigate = useNavigate();

  function handleSettingsPage() {
    if (toPage) {
      navigate(toPage);
    } else {
      navigate(-1);
    }
  }

  return (
    <button
      onClick={handleSettingsPage}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "38px",
        height: "38px",
        padding: "0",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        outline: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        boxShadow: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "30px",
        transition: "transform 0.2s, background-color 0.2s, outline-width 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
        e.currentTarget.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src={backIconPng}
        alt="Settings"
        style={{ width: "34px", height: "34px", objectFit: "contain" }}
      />
    </button>
  );
}
