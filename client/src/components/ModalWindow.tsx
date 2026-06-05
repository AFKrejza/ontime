import { useState } from "react";
interface ModalProps {
  title?: string;
  description: string;
  onCancel: () => void;
  onConfirm: (inputValue: string) => void;
  confirmBtnText?: string;
  textInput?: boolean;
  requiredConfirmWord?: string;
}

export default function ModalWindow({
  title = "Are you absolutely sure?",
  description,
  onCancel,
  onConfirm,
  confirmBtnText = "Confirm",
  textInput = false,
  requiredConfirmWord,
}: ModalProps) {
  const [input, setInput] = useState("");

  const isConfirmDisabled = requiredConfirmWord
    ? input.toLowerCase() !== requiredConfirmWord.toLowerCase()
    : false;

  return (
    <div className="modalOverlay">
      <div className="modalCard">
        <div className="modalIcon">⚠️</div>
        <h2>{title}</h2>
        <p>{description}</p>
        {textInput && (
          <div style={{ marginBottom: "1rem", width: "100%" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="textInput deviceCodeInput"
            ></input>
          </div>
        )}
        <div className="modalButtonGroup">
          <button className="modalCancelButton" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="modalConfirmButton"
            onClick={() => onConfirm(input)}
            disabled={isConfirmDisabled}
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
