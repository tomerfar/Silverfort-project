// client/src/ToastNotification.tsx

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  duration?: number; // Time in ms (default: 3000ms)
  onClose: () => void;
}

// Global styles injector for Keyframes
const injectKeyframes = () => {
  if (document.getElementById("toast-keyframes")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "toast-keyframes";

  // Define keyframes for slide-up entry and slide-down exit
  styleSheet.innerHTML = `
    @keyframes slideInUp {
      from {
        transform: translate(-50%, 100px);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
    @keyframes slideOutDown {
      from {
        transform: translate(-50%, 0);
        opacity: 1;
      }
      to {
        transform: translate(-50%, 100px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

/**
 * Displays a temporary, non-blocking notification (toast) with animation.
 */
const ToastNotification: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    injectKeyframes();

    // 1. Set timer for the initial delay (duration - exit_animation_time)
    // We assume exit animation is 0.5s
    const exitDelay = duration - 500;

    const preExitTimer = setTimeout(() => {
      // Start fade out animation by adding the exit class
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
    <div id="toast-notification" style={styles.container}>
      {message}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    bottom: "60px", // *הגבהה: מ-40px ל-60px*
    left: "50%",
    // **הגדרות אנימציה**: משתמשים ב-slideInUp Keyframe
    animation: "slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",

    // סגנון כללי
    backgroundColor: "#61dafb", // React Blue for a friendly notification
    color: "#282c34",
    padding: "12px 25px",
    borderRadius: "10px",
    zIndex: 2000,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default ToastNotification;
