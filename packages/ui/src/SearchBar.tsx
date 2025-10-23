import React from "react";
import { Input } from "./Input";

export type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "搜索零件...",
  onSearch
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="relative flex items-center">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 pr-10"
      />
      <button
        onClick={onSearch}
        className="absolute right-2 text-gray-500 hover:text-gray-700"
        aria-label="搜索"
      >
        🔍
      </button>
    </div>
  );
}

