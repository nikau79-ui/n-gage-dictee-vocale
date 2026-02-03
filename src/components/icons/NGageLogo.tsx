import React from "react";

const NGageLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width || 200}
      height={height || 60}
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* N- en Bleu Ardoise */}
      <text
        x="5"
        y="45"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="42"
        fontWeight="bold"
        className="logo-stroke"
      >
        N-
      </text>
      {/* Gage en Orange */}
      <text
        x="62"
        y="45"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="42"
        fontWeight="bold"
        className="logo-primary"
      >
        Gage
      </text>
    </svg>
  );
};

export default NGageLogo;
