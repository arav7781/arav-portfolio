import React, { ReactNode } from "react";
import "./GradientText.css";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  textShadow?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = "",
  colors = ["#FFFFFF", "#FF6EC7", "#6C5CE7", "#3A86FF", "#FFFFFF"],
  animationSpeed = 3,
  showBorder = false,
  textShadow = "0 2px 4px",
}) => {
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
    textShadow,
  };

  return (
    <span className={`animated-gradient-text ${className}`}>
      {showBorder && <span className="gradient-overlay" style={gradientStyle}></span>}
      <span className="text-content" style={gradientStyle}>{children}</span>
    </span>
  );
};

export default GradientText;
