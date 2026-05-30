import { useNavigate } from "react-router-dom";
// @ts-ignore
import backIconPng from "../assets/back.png";

interface BackButtonProps {
  toPage?: string;
}
export default function BackButton({ toPage }: BackButtonProps) {
  const navigate = useNavigate();

  function handleBack() {
    if (toPage) {
      navigate(toPage);
    } else {
      navigate(-1);
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        width: "43px",
        height: "43px",
        padding: "0",
        backgroundColor: "#ffffff",
        //color: "#ffffff",
        border: "5px solid #ffffff",
        outline: "2px solid rgba(255, 255, 255, 0.9)",
        borderRadius: "50%",
        boxShadow: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "30px",
        transition: "transform 0.2s, background-color 0.2s, outline-width 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.outline = "4px solid rgba(255, 255, 255, 0.9)";
        e.currentTarget.style.transform = "scale(1.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.outline = "2px solid rgba(255, 255, 255, 0.8)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src={backIconPng}
        alt="Back"
        style={{ width: "34px", height: "34px", objectFit: "contain" }}
      />
    </button>
  );
}
