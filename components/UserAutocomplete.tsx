"use client";

import { useState, useEffect, useRef } from "react";

type UserOption = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type UserAutocompleteProps = {
  selectedUser: { id: string; name: string } | null;
  onSelectUser: (user: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

export default function UserAutocomplete({
  selectedUser,
  onSelectUser,
  placeholder = "Search for a user...",
  className = "",
  id,
}: UserAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<UserOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update input value when selected user changes
  useEffect(() => {
    setInputValue(selectedUser?.name || "");
  }, [selectedUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/users/search?name=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      }
    } catch (error) {
      console.error("Error fetching user suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Clear selected user if input is cleared
    if (newValue === "") {
      onSelectUser({ id: "", name: "" });
    }

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: UserOption) => {
    setInputValue(suggestion.name);
    onSelectUser({ id: suggestion.id, name: suggestion.name });
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-500"></div>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-4 py-2 text-left text-sm transition ${
                index === selectedIndex
                  ? "bg-indigo-500/20 text-indigo-100"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {suggestion.avatarUrl && (
                  <img 
                    src={suggestion.avatarUrl} 
                    alt={suggestion.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                )}
                <span>{suggestion.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
