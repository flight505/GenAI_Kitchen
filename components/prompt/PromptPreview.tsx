'use client';

import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  CubeIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface PromptToken {
  text: string;
  type: 'material' | 'style' | 'color' | 'feature' | 'brand' | 'hardware' | 'normal';
  start: number;
  end: number;
}


interface PromptPreviewProps {
  prompt: string;
  onPromptChange?: (prompt: string) => void;
  isEditable?: boolean;
  className?: string;
  metadata?: {
    style?: string;
    material?: string;
    worktop?: string;
    hardware?: string;
    backsplash?: string;
    appliances?: string;
  };
}

export default function PromptPreview({
  prompt,
  onPromptChange,
  isEditable = true,
  className = '',
  metadata
}: PromptPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [tokens, setTokens] = useState<PromptToken[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  // Tokenize prompt for syntax highlighting
  useEffect(() => {
    const tokenizePrompt = (text: string): PromptToken[] => {
      const tokens: PromptToken[] = [];
      const patterns = [
        { type: 'brand', regex: /\b(Unoform|Danish|Scandinavian|Nordic|Classic|Copenhagen|Shaker|Avantgarde)\b/gi },
        { type: 'material', regex: /\b(walnut|oak|ash|marble|granite|quartz|quartzite|wood|metal|glass|stone|laminate|birch|pine|bamboo|Belvedere|Taj Mahal|Mont Blanc|Calacatta|concrete|composite)\b/gi },
        { type: 'style', regex: /\b(modern|contemporary|minimalist|traditional|rustic|industrial|luxury|premium|elegant|sophisticated|floating|exposed|seamless|slatted)\b/gi },
        { type: 'color', regex: /\b(white|black|gray|grey|brown|beige|cream|blue|green|charcoal|sage|navy|warm|cool|dark|light|glacier|cream|olive|matte)\b/gi },
        { type: 'feature', regex: /\b(cabinets?|countertops?|worktops?|flooring|walls?|hardware|lighting|drawers?|fronts?|frames?|modules?|plinth|base|slats?|panels?|backsplash|island|peninsula)\b/gi },
        { type: 'hardware', regex: /\b(handleless|knobs?|pulls?|integrated|brass|steel|black metal)\b/gi }
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


  const getTokenColor = (type: PromptToken['type']) => {
    switch (type) {
      case 'brand': return 'text-[#C19A5B] font-semibold';
      case 'material': return 'text-blue-600 font-medium';
      case 'style': return 'text-purple-600';
      case 'color': return 'text-green-600';
      case 'feature': return 'text-orange-600';
      case 'hardware': return 'text-pink-600';
      default: return 'text-gray-800';
    }
  };

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'brand': return <SparklesIcon className="w-3 h-3" />;
      case 'material': return <CubeIcon className="w-3 h-3" />;
      case 'style': return <HomeIcon className="w-3 h-3" />;
      case 'color': return <SwatchIcon className="w-3 h-3" />;
      case 'hardware': return <WrenchScrewdriverIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  const characterCount = prompt.length;
  const tokenCount = prompt.split(/\s+/).filter(word => word.length > 0).length;

  // Calculate token types distribution
  const tokenDistribution = tokens.reduce((acc, token) => {
    if (token.type !== 'normal') {
      acc[token.type] = (acc[token.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#C19A5B]" />
              <h3 className="text-sm font-semibold text-gray-900">AI Prompt</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTokenDetails(!showTokenDetails)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-900">{tokenCount}</span>
                <span className="text-gray-500">tokens</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-900">{characterCount}</span>
                <span className="text-gray-500">chars</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            
            {/* History Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
              {isEditable && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Edit prompt"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
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
      </div>

      {/* Token Details Panel */}
      {showTokenDetails && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-4 text-xs">
            {Object.entries(tokenDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5">
                {getTokenIcon(type)}
                <span className={`font-medium ${getTokenColor(type as any)}`}>
                  {count} {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Pills */}
      {metadata && expanded && (
        <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {metadata.style && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-purple-200 shadow-sm">
                <HomeIcon className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-900">{metadata.style}</span>
              </div>
            )}
            {metadata.material && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-blue-200 shadow-sm">
                <CubeIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">{metadata.material}</span>
              </div>
            )}
            {metadata.worktop && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-green-200 shadow-sm">
                <SwatchIcon className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-900">{metadata.worktop}</span>
              </div>
            )}
            {metadata.hardware && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-pink-200 shadow-sm">
                <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-pink-600" />
                <span className="text-xs font-medium text-pink-900">{metadata.hardware}</span>
              </div>
            )}
            {metadata.backsplash && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-orange-200 shadow-sm">
                <HomeIcon className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-medium text-orange-900">{metadata.backsplash}</span>
              </div>
            )}
            {metadata.appliances && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-indigo-200 shadow-sm">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-900">{metadata.appliances}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`transition-all duration-300 ${expanded ? 'max-h-[600px]' : 'max-h-0'} overflow-hidden`}>
        <div className="p-5">
          {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C19A5B] focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              placeholder="Enter your kitchen design prompt..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-[#C19A5B] text-white rounded-lg hover:bg-[#C19A5B]/90 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-sm leading-relaxed font-mono">
                {tokens.map((token, index) => (
                  <span 
                    key={index} 
                    className={`${getTokenColor(token.type)} ${token.type !== 'normal' ? 'hover:bg-gray-200/50 rounded px-0.5 transition-colors cursor-default' : ''}`}
                    title={token.type !== 'normal' ? token.type : undefined}
                  >
                    {token.text}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Style Indicators */}
            <div className="mt-4 flex flex-wrap gap-2">
              {prompt.toLowerCase().includes('unoform') && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#C19A5B]/10 to-[#C19A5B]/5 rounded-full border border-[#C19A5B]/20">
                  <CheckIcon className="w-3.5 h-3.5 text-[#C19A5B]" />
                  <span className="text-[#C19A5B] font-medium text-xs">Unoform Brand</span>
                </div>
              )}
              {(prompt.toLowerCase().includes('classic') || prompt.toLowerCase().includes('copenhagen') || 
                prompt.toLowerCase().includes('shaker') || prompt.toLowerCase().includes('avantgarde')) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full border border-purple-200">
                  <HomeIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-purple-700 font-medium text-xs">Style Applied</span>
                </div>
              )}
              {prompt.toLowerCase().includes('worktop') && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 rounded-full border border-green-200">
                  <SwatchIcon className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700 font-medium text-xs">Worktop Specified</span>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Collapsed State Indicator */}
      {!expanded && (
        <div 
          className="px-5 py-3 bg-gray-50 border-t border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <ChevronDownIcon className="w-4 h-4" />
            <span>Show prompt content</span>
          </div>
        </div>
      )}
    </div>
  );
}