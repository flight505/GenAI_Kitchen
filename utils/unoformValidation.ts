/**
 * Unoform Visual Validation Engine
 * Validates generated images against style requirements
 */

import {
  UnoformStyle,
  ValidationResult,
  StyleValidationRule,
  StyleDefinition
} from '../types/unoform-styles';
import { UNOFORM_STYLES } from '../constants/unoform-styles';

export class UnoformValidator {
  private style: StyleDefinition;
  private validationChecklist: Map<string, boolean> = new Map();

  constructor(style: UnoformStyle) {
    this.style = UNOFORM_STYLES[style];
    this.initializeChecklist();
  }

  /**
   * Initialize validation checklist
   */
  private initializeChecklist(): void {
    // Add all validation rules to checklist
    [...this.style.validation.mustHave, 
     ...this.style.validation.shouldHave,
     ...this.style.validation.mustNotHave].forEach(rule => {
      this.validationChecklist.set(rule.description, false);
    });
  }

  /**
   * Manual validation through user checklist
   */
  public validateManual(checkedItems: string[]): ValidationResult {
    // Update checklist with checked items
    checkedItems.forEach(item => {
      this.validationChecklist.set(item, true);
    });

    // Calculate violations
    const violations: ValidationResult['violations'] = [];
    
    // Check must-have violations (critical)
    this.style.validation.mustHave.forEach(rule => {
      if (!this.validationChecklist.get(rule.description)) {
        violations.push({
          rule,
          severity: 'critical',
          message: `Missing required element: ${rule.description}`
        });
      }
    });

    // Check must-not-have violations (critical)
    this.style.validation.mustNotHave.forEach(rule => {
      if (this.validationChecklist.get(rule.description)) {
        violations.push({
          rule,
          severity: 'critical',
          message: `Style violation: ${rule.description}`
        });
      }
    });

    // Check should-have violations (major)
    this.style.validation.shouldHave.forEach(rule => {
      if (!this.validationChecklist.get(rule.description)) {
        violations.push({
          rule,
          severity: 'major',
          message: `Missing recommended element: ${rule.description}`
        });
      }
    });

    // Calculate score
    const score = this.calculateScore(violations);

    // Generate suggestions
    const suggestions = this.generateSuggestions(violations);

    // Find missing elements
    const missingElements = violations
      .filter(v => v.severity === 'critical' && v.rule.category !== 'mustNotHave')
      .map(v => v.rule.keywords[0]);

    return {
      isValid: violations.filter(v => v.severity === 'critical').length === 0,
      score,
      violations,
      suggestions,
      missingElements
    };
  }

  /**
   * Automated validation based on image analysis (future enhancement)
   */
  public async validateImage(imageUrl: string): Promise<ValidationResult> {
    // Placeholder for future AI-based image analysis
    // Could integrate with vision APIs or custom models
    
    console.log('Image validation not yet implemented:', imageUrl);
    
    // Return manual validation for now
    return this.validateManual([]);
  }

  /**
   * Calculate validation score (0-100)
   */
  private calculateScore(violations: ValidationResult['violations']): number {
    let score = 100;

    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'major':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(violations: ValidationResult['violations']): string[] {
    const suggestions: string[] = [];

    // Group violations by type
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const majorViolations = violations.filter(v => v.severity === 'major');

    // Suggest fixes for critical issues first
    if (criticalViolations.length > 0) {
      suggestions.push('Critical issues to fix:');
      
      criticalViolations.forEach(violation => {
        if (violation.rule.category === 'mustHave') {
          const keywords = violation.rule.keywords.slice(0, 2).join(' or ');
          suggestions.push(`Add "${keywords}" to your prompt`);
        } else if (violation.rule.category === 'mustNotHave') {
          const keywords = violation.rule.keywords[0];
          suggestions.push(`Remove "${keywords}" from your design`);
        }
      });
    }

    // Suggest improvements for major issues
    if (majorViolations.length > 0 && criticalViolations.length === 0) {
      suggestions.push('Recommended improvements:');
      
      majorViolations.forEach(violation => {
        const keyword = violation.rule.keywords[0];
        suggestions.push(`Consider adding "${keyword}" for better authenticity`);
      });
    }

    // Add style-specific tips
    if (violations.length === 0) {
      suggestions.push('Excellent! Your design matches the style perfectly.');
      suggestions.push('Try variations with different materials or lighting.');
    }

    return suggestions;
  }

  /**
   * Get validation checklist for UI
   */
  public getChecklist(): {
    mustHave: Array<{ description: string; checked: boolean }>;
    shouldHave: Array<{ description: string; checked: boolean }>;
    mustNotHave: Array<{ description: string; checked: boolean }>;
  } {
    return {
      mustHave: this.style.validation.mustHave.map(rule => ({
        description: rule.description,
        checked: this.validationChecklist.get(rule.description) || false
      })),
      shouldHave: this.style.validation.shouldHave.map(rule => ({
        description: rule.description,
        checked: this.validationChecklist.get(rule.description) || false
      })),
      mustNotHave: this.style.validation.mustNotHave.map(rule => ({
        description: rule.description,
        checked: this.validationChecklist.get(rule.description) || false
      }))
    };
  }

  /**
   * Reset checklist
   */
  public resetChecklist(): void {
    this.validationChecklist.forEach((_, key) => {
      this.validationChecklist.set(key, false);
    });
  }

  /**
   * Get quick validation tips
   */
  public getQuickTips(): string[] {
    const tips: string[] = [];

    switch (this.style.id) {
      case 'classic':
        tips.push('Look for horizontal lines on drawer fronts');
        tips.push('Check for shadow gap under cabinets');
        tips.push('Ensure no handles are visible');
        break;
      case 'copenhagen':
        tips.push('Interior of drawers should be visible');
        tips.push('Look for gaps between cabinet modules');
        tips.push('Check for visible joinery at corners');
        break;
      case 'shaker':
        tips.push('Look for recessed panel in doors');
        tips.push('Check for visible frame around panels');
        tips.push('Ensure hardware is small and simple');
        break;
      case 'avantgarde':
        tips.push('Surfaces should be completely flat');
        tips.push('Look for precise grid pattern');
        tips.push('Ensure no hardware is visible');
        break;
    }

    return tips;
  }
}

/**
 * Batch validation for multiple images
 */
export class BatchValidator {
  private validators: Map<string, UnoformValidator> = new Map();

  /**
   * Validate multiple images with different styles
   */
  public async validateBatch(
    images: Array<{ url: string; style: UnoformStyle; checkedItems?: string[] }>
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const image of images) {
      // Get or create validator for style
      if (!this.validators.has(image.style)) {
        this.validators.set(image.style, new UnoformValidator(image.style));
      }

      const validator = this.validators.get(image.style)!;
      
      // Validate
      const result = image.checkedItems 
        ? validator.validateManual(image.checkedItems)
        : await validator.validateImage(image.url);

      results.set(image.url, result);
    }

    return results;
  }

  /**
   * Get aggregated statistics
   */
  public getStatistics(results: Map<string, ValidationResult>): {
    averageScore: number;
    passRate: number;
    commonViolations: string[];
    bestPerforming: string | null;
    worstPerforming: string | null;
  } {
    const scores: number[] = [];
    const violationCounts = new Map<string, number>();
    let bestScore = 0;
    let worstScore = 100;
    let bestUrl: string | null = null;
    let worstUrl: string | null = null;

    results.forEach((result, url) => {
      scores.push(result.score);
      
      // Track best/worst
      if (result.score > bestScore) {
        bestScore = result.score;
        bestUrl = url;
      }
      if (result.score < worstScore) {
        worstScore = result.score;
        worstUrl = url;
      }

      // Count violations
      result.violations.forEach(violation => {
        const key = violation.rule.description;
        violationCounts.set(key, (violationCounts.get(key) || 0) + 1);
      });
    });

    // Calculate statistics
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passRate = scores.filter(s => s >= 80).length / scores.length;

    // Find common violations
    const commonViolations = Array.from(violationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([violation]) => violation);

    return {
      averageScore,
      passRate,
      commonViolations,
      bestPerforming: bestUrl,
      worstPerforming: worstUrl
    };
  }
}

/**
 * Create validation report
 */
export function createValidationReport(
  style: UnoformStyle,
  validationResult: ValidationResult
): string {
  const validator = new UnoformValidator(style);
  const tips = validator.getQuickTips();
  
  let report = `# Unoform ${style.charAt(0).toUpperCase() + style.slice(1)} Style Validation Report\n\n`;
  
  report += `## Score: ${validationResult.score}/100\n`;
  report += `## Status: ${validationResult.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  if (validationResult.violations.length > 0) {
    report += `## Issues Found:\n`;
    
    const criticalViolations = validationResult.violations.filter(v => v.severity === 'critical');
    const majorViolations = validationResult.violations.filter(v => v.severity === 'major');
    
    if (criticalViolations.length > 0) {
      report += `\n### Critical Issues:\n`;
      criticalViolations.forEach(v => {
        report += `- ❌ ${v.message}\n`;
      });
    }
    
    if (majorViolations.length > 0) {
      report += `\n### Major Issues:\n`;
      majorViolations.forEach(v => {
        report += `- ⚠️  ${v.message}\n`;
      });
    }
  }
  
  report += `\n## Suggestions:\n`;
  validationResult.suggestions.forEach(suggestion => {
    report += `- ${suggestion}\n`;
  });
  
  report += `\n## Quick Validation Tips:\n`;
  tips.forEach(tip => {
    report += `- ${tip}\n`;
  });
  
  return report;
}