"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    height: 36,
    padding: "0 12px",
    borderRadius: 6,
    fontSize: 14,
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  };

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
}
