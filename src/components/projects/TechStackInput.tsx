'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { TECH_STACK_OPTIONS } from '@/data/mockProjects';
import { cn } from '@/lib/utils';

interface TechStackInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export function TechStackInput({
  selectedTags,
  onChange,
  maxTags = 15,
  placeholder = '+ Add tech stack (e.g. React, Next.js, Python)...',
}: TechStackInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputValue.trim().toLowerCase());
    }, 120);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const filteredSuggestions = useMemo(() => {
    if (!debouncedQuery) {
      return TECH_STACK_OPTIONS.filter((tech) => !selectedTags.includes(tech)).slice(0, 6);
    }
    return TECH_STACK_OPTIONS.filter(
      (tech) =>
        tech.toLowerCase().includes(debouncedQuery) && !selectedTags.includes(tech)
    ).slice(0, 8);
  }, [debouncedQuery, selectedTags]);

  const exactMatchExists = useMemo(() => {
    if (!inputValue.trim()) return false;
    const trimmed = inputValue.trim().toLowerCase();
    return (
      TECH_STACK_OPTIONS.some((t) => t.toLowerCase() === trimmed) ||
      selectedTags.some((t) => t.toLowerCase() === trimmed)
    );
  }, [inputValue, selectedTags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim();
    if (!cleanTag || selectedTags.length >= maxTags) return;

    if (!selectedTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      onChange([...selectedTags, cleanTag]);
    }

    setInputValue('');
    setDebouncedQuery('');
    setIsOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const totalItems =
        filteredSuggestions.length + (!exactMatchExists && inputValue.trim() ? 1 : 0);
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const totalItems =
        filteredSuggestions.length + (!exactMatchExists && inputValue.trim() ? 1 : 0);
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen && inputValue.trim()) {
        handleAddTag(inputValue);
        return;
      }

      const showCustomOption = !exactMatchExists && inputValue.trim().length > 0;
      if (showCustomOption && highlightedIndex === filteredSuggestions.length) {
        handleAddTag(inputValue);
      } else if (filteredSuggestions[highlightedIndex]) {
        handleAddTag(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full">
      <div
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
        className={cn(
          'flex flex-wrap items-center gap-1.5 p-2 rounded-md bg-zinc-950/80 border transition-colors min-h-[38px] cursor-text',
          isOpen
            ? 'border-zinc-600 ring-1 ring-zinc-600'
            : 'border-zinc-800 hover:border-zinc-700'
        )}
      >
        {selectedTags.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-200 border border-zinc-750"
          >
            <span>{tech}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tech);
              }}
              className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {selectedTags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : '+ Add...'}
            className="flex-1 min-w-[100px] h-6 px-1 text-xs bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md bg-[#121316] border border-zinc-800 shadow-xl p-1.5 max-h-48 overflow-y-auto">
          <div className="space-y-0.5">
            {filteredSuggestions.map((suggestion, idx) => {
              const isHighlighted = highlightedIndex === idx;
              return (
                <div
                  key={suggestion}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTag(suggestion);
                  }}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors',
                    isHighlighted
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-850'
                  )}
                >
                  <span>{suggestion}</span>
                  <Plus className="w-3 h-3 text-zinc-500" />
                </div>
              );
            })}

            {!exactMatchExists && inputValue.trim().length > 0 && (
              <div
                onMouseEnter={() => setHighlightedIndex(filteredSuggestions.length)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTag(inputValue);
                }}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors border border-dashed',
                  highlightedIndex === filteredSuggestions.length
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                    : 'text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                )}
              >
                <span>Add "{inputValue.trim()}"</span>
                <span className="text-[10px] text-zinc-500">Enter</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
