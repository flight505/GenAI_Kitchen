/**
 * Unoform Validation Panel Component
 * Interactive checklist for validating generated images
 */

import React, { useState, useEffect } from 'react';
import { UnoformStyle, ValidationResult } from '../../types/unoform-styles';
import { UnoformValidator } from '../../utils/unoformValidation';
import { 
  CheckIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  LightBulbIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface UnoformValidationPanelProps {
  style: UnoformStyle;
  imageUrl?: string;
  onValidationComplete?: (result: ValidationResult) => void;
  showInlineGuide?: boolean;
}

export function UnoformValidationPanel({
  style,
  imageUrl,
  onValidationComplete,
  showInlineGuide = true
}: UnoformValidationPanelProps) {
  const [validator] = useState(() => new UnoformValidator(style));
  const [checklist, setChecklist] = useState(validator.getChecklist());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'mustHave' | 'shouldHave' | 'mustNotHave'>('mustHave');

  // Update checklist when style changes
  useEffect(() => {
    const newValidator = new UnoformValidator(style);
    setChecklist(newValidator.getChecklist());
    setValidationResult(null);
  }, [style]);

  // Handle checkbox change
  const handleCheckChange = (category: 'mustHave' | 'shouldHave' | 'mustNotHave', index: number) => {
    const newChecklist = { ...checklist };
    newChecklist[category][index].checked = !newChecklist[category][index].checked;
    setChecklist(newChecklist);
  };

  // Perform validation
  const performValidation = () => {
    const checkedItems: string[] = [];
    
    // Collect checked items
    Object.entries(checklist).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.checked) {
          checkedItems.push(item.description);
        }
      });
    });

    const result = validator.validateManual(checkedItems);
    setValidationResult(result);
    onValidationComplete?.(result);
  };

  // Reset checklist
  const resetChecklist = () => {
    validator.resetChecklist();
    setChecklist(validator.getChecklist());
    setValidationResult(null);
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get score emoji
  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 50) return '🤔';
    return '😕';
  };

  const tabCounts = {
    mustHave: checklist.mustHave.filter(item => item.checked).length,
    shouldHave: checklist.shouldHave.filter(item => item.checked).length,
    mustNotHave: checklist.mustNotHave.filter(item => item.checked).length
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-unoform-gray-dark flex items-center gap-2">
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          Style Validation Checklist
        </h3>
        
        <button
          onClick={resetChecklist}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Quick Tips */}
      {showInlineGuide && (
        <div className="mb-4">
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-sm text-unoform-gold hover:text-unoform-gold/80 flex items-center gap-1"
          >
            <LightBulbIcon className="w-4 h-4" />
            {showTips ? 'Hide' : 'Show'} Quick Tips
          </button>
          
          {showTips && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                What to look for:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validator.getQuickTips().map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('mustHave')}
          className={`
            px-4 py-2 text-sm font-medium transition-colors relative
            ${activeTab === 'mustHave' 
              ? 'text-green-700 border-b-2 border-green-700' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          Must Have
          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
            {tabCounts.mustHave}/{checklist.mustHave.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('shouldHave')}
          className={`
            px-4 py-2 text-sm font-medium transition-colors relative
            ${activeTab === 'shouldHave' 
              ? 'text-blue-700 border-b-2 border-blue-700' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          Should Have
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
            {tabCounts.shouldHave}/{checklist.shouldHave.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('mustNotHave')}
          className={`
            px-4 py-2 text-sm font-medium transition-colors relative
            ${activeTab === 'mustNotHave' 
              ? 'text-red-700 border-b-2 border-red-700' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          Must NOT Have
          <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
            {tabCounts.mustNotHave}/{checklist.mustNotHave.length}
          </span>
        </button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {checklist[activeTab].map((item, index) => (
          <label
            key={index}
            className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleCheckChange(activeTab, index)}
              className="mt-1 rounded border-gray-300 text-unoform-gold focus:ring-unoform-gold"
            />
            <span className="text-sm text-gray-700 flex-1">
              {item.description}
            </span>
            {activeTab === 'mustHave' && !item.checked && (
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5" />
            )}
            {activeTab === 'mustNotHave' && item.checked && (
              <XMarkIcon className="w-4 h-4 text-red-500 mt-0.5" />
            )}
          </label>
        ))}
      </div>

      {/* Validate Button */}
      <button
        onClick={performValidation}
        className="w-full btn-default mb-4"
      >
        Validate Design
      </button>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Score Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold mb-1">
              <span className={getScoreColor(validationResult.score)}>
                {validationResult.score}/100
              </span>
              <span className="ml-2 text-2xl">{getScoreEmoji(validationResult.score)}</span>
            </div>
            <p className="text-sm text-gray-600">
              {validationResult.isValid ? 'Valid Design' : 'Needs Improvement'}
            </p>
          </div>

          {/* Critical Issues */}
          {validationResult.violations.filter(v => v.severity === 'critical').length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Critical Issues
              </h4>
              <ul className="space-y-1">
                {validationResult.violations
                  .filter(v => v.severity === 'critical')
                  .map((violation, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      • {violation.message}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                <LightBulbIcon className="w-4 h-4" />
                Suggestions
              </h4>
              <ul className="space-y-1">
                {validationResult.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-blue-700">
                    {suggestion.includes(':') ? (
                      <>
                        <span className="font-medium">{suggestion.split(':')[0]}:</span>
                        {suggestion.split(':')[1]}
                      </>
                    ) : (
                      `• ${suggestion}`
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {validationResult.score >= 90 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-1">
                <CheckIcon className="w-4 h-4" />
                Excellent Work!
              </h4>
              <p className="text-sm text-green-700">
                Your design perfectly captures the {style} style. 
                Consider saving this as a reference or trying variations with different materials.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}