import React, { useEffect } from "react";
import "../scss/Alert.scss";

function Alert({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="custom-alert">
      <div className="custom-alert__content">
        <p>{message}</p>
        <button className="custom-alert__close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default Alert;
