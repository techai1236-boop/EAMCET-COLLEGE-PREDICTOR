import collegesJson from './collegesData.json';
import { Category, CollegeCutoffRecord, Gender } from '../types';

export const COLLEGES_DATA: CollegeCutoffRecord[] = collegesJson as CollegeCutoffRecord[];

export interface CollegeOption {
  code: string;
  name: string;
  place: string;
  distCode: string;
  coEducation: string;
  collegeType: string;
}

export interface BranchOption {
  code: string;
  name: string;
}

// Extract unique colleges
export const UNIQUE_COLLEGES: CollegeOption[] = (() => {
  const map = new Map<string, CollegeOption>();
  for (const c of COLLEGES_DATA) {
    if (!map.has(c.instCode)) {
      map.set(c.instCode, {
        code: c.instCode,
        name: c.instituteName,
        place: c.place,
        distCode: c.distCode,
        coEducation: c.coEducation,
        collegeType: c.collegeType,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

// Extract unique branches
export const UNIQUE_BRANCHES: BranchOption[] = (() => {
  const map = new Map<string, BranchOption>();
  for (const c of COLLEGES_DATA) {
    if (!map.has(c.branchCode)) {
      map.set(c.branchCode, {
        code: c.branchCode,
        name: c.branchName,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
})();

export const CATEGORIES_LIST: { code: Category; label: string; description: string }[] = [
  { code: 'OC', label: 'OC (Open Category / General)', description: 'Unreserved general merit category' },
  { code: 'BC_A', label: 'BC-A (Backward Class Group A)', description: 'Aboriginal tribes, vimukta jatis, nomadic' },
  { code: 'BC_B', label: 'BC-B (Backward Class Group B)', description: 'Vocational groups' },
  { code: 'BC_C', label: 'BC-C (Backward Class Group C)', description: 'Scheduled Caste converts to Christianity' },
  { code: 'BC_D', label: 'BC-D (Backward Class Group D)', description: 'Other classes' },
  { code: 'BC_E', label: 'BC-E (Backward Class Group E)', description: 'Socially & educationally backward Muslims' },
  { code: 'SC_I', label: 'SC-I (Scheduled Caste Sub-group I)', description: 'SC categorisation group I' },
  { code: 'SC_II', label: 'SC-II (Scheduled Caste Sub-group II)', description: 'SC categorisation group II' },
  { code: 'SC_III', label: 'SC-III (Scheduled Caste Sub-group III)', description: 'SC categorisation group III' },
  { code: 'ST', label: 'ST (Scheduled Tribe)', description: 'Scheduled Tribes' },
  { code: 'EWS', label: 'EWS (Economically Weaker Section)', description: 'Economically Weaker Section 10% quota' },
];

/**
 * Get accurate closing rank for given record, category and gender according to official Telangana EAPCET rules:
 * 1. Male candidates can only enter COED colleges via BOYS (general open) quota, and cannot enter GIRLS-only institutions.
 * 2. Female candidates are eligible for both GIRLS quota and BOYS (general unreserved) quota in COED colleges,
 *    so the effective cutoff is the maximum (most lenient) eligible closing rank.
 * 3. Reserved category candidates (BC, SC, ST, EWS) can also take Open Category (OC / Merit) seats if eligible.
 */
export function getClosingRank(
  record: CollegeCutoffRecord,
  category: Category,
  gender: Gender
): number | null {
  // If college is strictly GIRLS-only and candidate is male, cannot be admitted
  if (record.coEducation === 'GIRLS' && gender === 'BOYS') {
    return null;
  }

  const eligibleRanks: number[] = [];

  // 1. Direct Category & Gender quota
  const catGenderKey = `${category}_${gender}` as keyof CollegeCutoffRecord['cutoffs'];
  const catGenderRank = record.cutoffs[catGenderKey];
  if (typeof catGenderRank === 'number' && catGenderRank > 0) {
    eligibleRanks.push(catGenderRank);
  }

  // 2. In COED colleges, female students can also secure seats in the BOYS (General Open) quota
  if (gender === 'GIRLS' && record.coEducation !== 'GIRLS') {
    const catBoysKey = `${category}_BOYS` as keyof CollegeCutoffRecord['cutoffs'];
    const catBoysRank = record.cutoffs[catBoysKey];
    if (typeof catBoysRank === 'number' && catBoysRank > 0) {
      eligibleRanks.push(catBoysRank);
    }
  }

  // 3. Reserved category candidates can also secure Open Category (OC merit) seats
  if (category !== 'OC') {
    const ocGenderKey = `OC_${gender}` as keyof CollegeCutoffRecord['cutoffs'];
    const ocGenderRank = record.cutoffs[ocGenderKey];
    if (typeof ocGenderRank === 'number' && ocGenderRank > 0) {
      eligibleRanks.push(ocGenderRank);
    }

    if (gender === 'GIRLS' && record.coEducation !== 'GIRLS') {
      const ocBoysRank = record.cutoffs.OC_BOYS;
      if (typeof ocBoysRank === 'number' && ocBoysRank > 0) {
        eligibleRanks.push(ocBoysRank);
      }
    }
  }

  if (eligibleRanks.length === 0) {
    return null;
  }

  // Effective closing rank: The most lenient (highest rank number) among eligible pools
  return Math.max(...eligibleRanks);
}
