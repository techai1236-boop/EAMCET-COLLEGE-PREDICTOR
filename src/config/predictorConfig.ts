import { ChanceCategory } from '../types';

export interface ChanceThresholdConfig {
  highThresholdMultiplier: number; // e.g., 1.0 - student rank <= cutoff => HIGH
  moderateThresholdMultiplier: number; // e.g., 1.15 - student rank <= cutoff * 1.15 => MODERATE
  borderlineThresholdMultiplier: number; // e.g., 1.30 - student rank <= cutoff * 1.30 => LOW
}

export const DEFAULT_THRESHOLDS: ChanceThresholdConfig = {
  highThresholdMultiplier: 1.0, // If student rank is better than or equal to previous closing rank
  moderateThresholdMultiplier: 1.15, // Up to 15% above closing rank
  borderlineThresholdMultiplier: 1.30, // 15% to 30% above closing rank
};

export interface ChanceDetails {
  key: ChanceCategory;
  label: string;
  description: string;
  badgeClass: string;
  color: string;
}

export const CHANCE_CONFIG: Record<ChanceCategory, ChanceDetails> = {
  HIGH: {
    key: 'HIGH',
    label: 'High Chance',
    description: 'Your rank is better than or equal to the previous-year closing rank.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-600/20',
    color: '#059669',
  },
  MODERATE: {
    key: 'MODERATE',
    label: 'Moderate Chance',
    description: 'Your rank is within 15% above the previous-year closing rank.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-600/20',
    color: '#d97706',
  },
  LOW: {
    key: 'LOW',
    label: 'Low Chance',
    description: 'Your rank is between 15% and 30% above the closing rank (Borderline).',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-300 ring-orange-600/20',
    color: '#ea580c',
  },
  VERY_LOW: {
    key: 'VERY_LOW',
    label: 'Very Low Chance',
    description: 'Your rank exceeds 30% above the closing rank (High competition).',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-600/20',
    color: '#e11d48',
  },
};

export function calculateChance(
  studentRank: number,
  closingRank: number,
  thresholds: ChanceThresholdConfig = DEFAULT_THRESHOLDS
): ChanceCategory {
  // If closing rank is not defined or non-positive
  if (!closingRank || closingRank <= 0 || Number.isNaN(closingRank)) {
    return 'VERY_LOW';
  }

  // If student rank is invalid or <= 0, rank 1 is best rank
  const sanitizedStudentRank = Math.max(1, studentRank || 1);

  // In competitive admissions: Lower rank number = better rank!
  // Example 1: studentRank 1,500 <= closingRank 2,000 -> HIGH chance
  // Example 2: studentRank 2,000 <= closingRank 2,000 * 1.0 -> HIGH chance
  // Example 3: studentRank 2,200 <= closingRank 2,000 * 1.15 (2,300) -> MODERATE chance (within 15%)
  // Example 4: studentRank 2,500 <= closingRank 2,000 * 1.30 (2,600) -> LOW chance (within 30%)
  // Example 5: studentRank 5,000 > 2,600 -> VERY_LOW chance (exceeds 30%)
  if (sanitizedStudentRank <= closingRank * thresholds.highThresholdMultiplier) {
    return 'HIGH';
  } else if (sanitizedStudentRank <= closingRank * thresholds.moderateThresholdMultiplier) {
    return 'MODERATE';
  } else if (sanitizedStudentRank <= closingRank * thresholds.borderlineThresholdMultiplier) {
    return 'LOW';
  } else {
    return 'VERY_LOW';
  }
}
