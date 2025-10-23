import React from "react";

export type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password";
  disabled?: boolean;
  className?: string;
};

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  className = ""
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      } ${className}`}
    />
  );
}

