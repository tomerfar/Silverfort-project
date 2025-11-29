import React, { useEffect } from "react";
import "./ToastNotification.css";

interface ToastProps {
  message: string;
  duration?: number; // Time in ms (default: 3000ms)
  onClose: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const exitDelay = duration - 500;

    const preExitTimer = setTimeout(() => {
      // Start fade out animation by applying the slideOutDown class directly via style property
      const element = document.getElementById("toast-notification");
      if (element) {
        element.style.animation = "slideOutDown 0.5s ease-out forwards";
      }
    }, exitDelay);

    // 2. Set timer for cleanup and actual closing
    const finalCloseTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(preExitTimer);
      clearTimeout(finalCloseTimer);
    };
  }, [duration, onClose]);

  return (
    <div id="toast-notification" className="toast-container">
      {message}
    </div>
  );
};

export default ToastNotification;
