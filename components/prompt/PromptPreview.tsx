'use client';

import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PromptToken {
  text: string;
  type: 'material' | 'style' | 'color' | 'feature' | 'brand' | 'normal';
  start: number;
  end: number;
}

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
}

const promptTemplates: PromptTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    template: 'Modern minimalist Scandinavian kitchen design with {cabinetStyle} cabinets in {cabinetFinish}, sleek {countertop} countertops, {flooring} flooring, {wallColor} walls, and {hardware} hardware. Clean lines, uncluttered aesthetic.',
    category: 'Style'
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    template: 'Luxurious premium kitchen featuring {cabinetStyle} cabinets with {cabinetFinish} finish, exquisite {countertop} countertops, high-end {flooring} flooring, sophisticated {wallColor} walls, and elegant {hardware} hardware.',
    category: 'Style'
  },
  {
    id: 'warm-cozy',
    name: 'Warm & Cozy',
    template: 'Warm and inviting kitchen with {cabinetStyle} cabinets in {cabinetFinish}, comfortable {countertop} countertops, welcoming {flooring} flooring, cozy {wallColor} walls, and charming {hardware} hardware.',
    category: 'Style'
  }
];

interface PromptPreviewProps {
  prompt: string;
  onPromptChange?: (prompt: string) => void;
  isEditable?: boolean;
  className?: string;
}

export default function PromptPreview({
  prompt,
  onPromptChange,
  isEditable = true,
  className = ''
}: PromptPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [tokens, setTokens] = useState<PromptToken[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // Tokenize prompt for syntax highlighting
  useEffect(() => {
    const tokenizePrompt = (text: string): PromptToken[] => {
      const tokens: PromptToken[] = [];
      const patterns = [
        { type: 'brand', regex: /\b(Unoform|Danish|Scandinavian)\b/gi },
        { type: 'material', regex: /\b(oak|marble|granite|quartz|wood|metal|glass|stone)\b/gi },
        { type: 'style', regex: /\b(modern|contemporary|minimalist|traditional|rustic|industrial)\b/gi },
        { type: 'color', regex: /\b(white|black|gray|grey|brown|beige|cream|blue|green)\b/gi },
        { type: 'feature', regex: /\b(cabinets?|countertops?|flooring|walls?|hardware|lighting)\b/gi }
      ];

      let lastEnd = 0;
      const allMatches: Array<{ match: RegExpExecArray; type: string }> = [];

      // Collect all matches
      patterns.forEach(({ type, regex }) => {
        let match;
        while ((match = regex.exec(text)) !== null) {
          allMatches.push({ match, type });
        }
      });

      // Sort by position
      allMatches.sort((a, b) => a.match.index - b.match.index);

      // Create tokens
      allMatches.forEach(({ match, type }) => {
        // Add normal text before this match
        if (match.index > lastEnd) {
          tokens.push({
            text: text.slice(lastEnd, match.index),
            type: 'normal',
            start: lastEnd,
            end: match.index
          });
        }

        // Add the matched token
        tokens.push({
          text: match[0],
          type: type as PromptToken['type'],
          start: match.index,
          end: match.index + match[0].length
        });

        lastEnd = match.index + match[0].length;
      });

      // Add remaining text
      if (lastEnd < text.length) {
        tokens.push({
          text: text.slice(lastEnd),
          type: 'normal',
          start: lastEnd,
          end: text.length
        });
      }

      return tokens;
    };

    setTokens(tokenizePrompt(prompt));
  }, [prompt]);

  // Load prompt history
  useEffect(() => {
    const history = localStorage.getItem('promptHistory');
    if (history) {
      setPromptHistory(JSON.parse(history).slice(0, 10));
    }
  }, []);

  const handleSave = () => {
    if (onPromptChange && editedPrompt !== prompt) {
      onPromptChange(editedPrompt);
      
      // Save to history
      const history = [editedPrompt, ...promptHistory.filter(p => p !== editedPrompt)].slice(0, 10);
      setPromptHistory(history);
      localStorage.setItem('promptHistory', JSON.stringify(history));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrompt(prompt);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (template: PromptTemplate) => {
    // This would need the actual kitchen selections to work properly
    // For now, just set the template as is
    setEditedPrompt(template.template);
    setShowTemplates(false);
  };

  const getTokenColor = (type: PromptToken['type']) => {
    switch (type) {
      case 'brand': return 'text-[#C19A5B] font-semibold';
      case 'material': return 'text-blue-600';
      case 'style': return 'text-purple-600';
      case 'color': return 'text-green-600';
      case 'feature': return 'text-orange-600';
      default: return 'text-gray-800';
    }
  };

  const characterCount = prompt.length;
  const tokenCount = prompt.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">Prompt Preview</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{characterCount} characters</span>
              <span>•</span>
              <span>{tokenCount} words</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Template Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                Templates
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              
              {showTemplates && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1">Style Templates</div>
                    {promptTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500 truncate">{template.template}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* History Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <ClockIcon className="w-4 h-4" />
                History
              </button>
              
              {showHistory && promptHistory.length > 0 && (
                <div className="absolute right-0 mt-1 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1">Recent Prompts</div>
                    {promptHistory.map((historyPrompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEditedPrompt(historyPrompt);
                          setShowHistory(false);
                          if (!isEditing) handleSave();
                        }}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        <div className="truncate">{historyPrompt}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C19A5B] focus:border-transparent resize-none"
              placeholder="Enter your prompt..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-[#C19A5B] text-white rounded hover:bg-[#C19A5B]/90"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm leading-relaxed">
              {tokens.map((token, index) => (
                <span key={index} className={getTokenColor(token.type)}>
                  {token.text}
                </span>
              ))}
            </div>
            
            {/* Unoform Tokens Indicator */}
            {prompt.toLowerCase().includes('unoform') && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-[#C19A5B]/10 rounded text-xs">
                <CheckIcon className="w-3 h-3 text-[#C19A5B]" />
                <span className="text-[#C19A5B] font-medium">Unoform style applied</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}