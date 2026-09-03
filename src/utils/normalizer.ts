import { Category, Gender } from '../types';

/**
 * Branch Normalization Engine
 * Handles variations in user input or data naming (e.g. CSM <-> AIM <-> CSE (AI & ML))
 */
export const BRANCH_ALIASES: Record<string, { standardCode: string; standardName: string; aliases: string[] }> = {
  CSM: {
    standardCode: 'CSM',
    standardName: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
    aliases: [
      'CSM',
      'AIM',
      'CSE(AIML)',
      'CSE(AI&ML)',
      'CSE (AI & ML)',
      'CSE (AI&ML)',
      'CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)',
      'CSE (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)',
      'COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)',
      'COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)',
      'AI & ML',
      'AI AND ML',
    ],
  },
  CSE: {
    standardCode: 'CSE',
    standardName: 'Computer Science and Engineering',
    aliases: [
      'CSE',
      'COMPUTER SCIENCE AND ENGINEERING',
      'COMPUTER SCIENCE & ENGINEERING',
    ],
  },
  CSD: {
    standardCode: 'CSD',
    standardName: 'Computer Science and Engineering (Data Science)',
    aliases: [
      'CSD',
      'CSE(DS)',
      'CSE (DS)',
      'CSE (DATA SCIENCE)',
      'COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)',
      'DATA SCIENCE',
    ],
  },
  CSC: {
    standardCode: 'CSC',
    standardName: 'Computer Science and Engineering (Cyber Security)',
    aliases: [
      'CSC',
      'CIC',
      'CSE(CS)',
      'CSE (CYBER SECURITY)',
      'COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)',
      'CYBER SECURITY',
    ],
  },
  CSO: {
    standardCode: 'CSO',
    standardName: 'Computer Science and Engineering (Internet of Things)',
    aliases: [
      'CSO',
      'CSE(IOT)',
      'CSE (IOT)',
      'IOT',
      'INTERNET OF THINGS',
      'COMPUTER SCIENCE AND ENGINEERING (IOT)',
    ],
  },
  CSB: {
    standardCode: 'CSB',
    standardName: 'Computer Science and Business Systems',
    aliases: [
      'CSB',
      'CSBS',
      'COMPUTER SCIENCE AND BUSINESS SYSTEMS',
      'COMPUTER SCIENCE AND BUSINESS SYSTEM',
    ],
  },
  AID: {
    standardCode: 'AID',
    standardName: 'Artificial Intelligence and Data Science',
    aliases: [
      'AID',
      'AI & DS',
      'AI AND DS',
      'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
      'ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
    ],
  },
  INF: {
    standardCode: 'INF',
    standardName: 'Information Technology',
    aliases: [
      'INF',
      'IT',
      'INFORMATION TECHNOLOGY',
    ],
  },
  ECE: {
    standardCode: 'ECE',
    standardName: 'Electronics and Communication Engineering',
    aliases: [
      'ECE',
      'ELECTRONICS AND COMMUNICATION ENGINEERING',
      'ELECTRONICS & COMMUNICATION ENGINEERING',
    ],
  },
  EEE: {
    standardCode: 'EEE',
    standardName: 'Electrical and Electronics Engineering',
    aliases: [
      'EEE',
      'ELECTRICAL AND ELECTRONICS ENGINEERING',
      'ELECTRICAL & ELECTRONICS ENGINEERING',
    ],
  },
  MEC: {
    standardCode: 'MEC',
    standardName: 'Mechanical Engineering',
    aliases: [
      'MEC',
      'MECH',
      'MECHANICAL ENGINEERING',
    ],
  },
  CIV: {
    standardCode: 'CIV',
    standardName: 'Civil Engineering',
    aliases: [
      'CIV',
      'CIVIL',
      'CIVIL ENGINEERING',
    ],
  },
  ANE: {
    standardCode: 'ANE',
    standardName: 'Aeronautical Engineering',
    aliases: [
      'ANE',
      'AERONAUTICAL ENGINEERING',
      'AEROSPACE ENGINEERING',
    ],
  },
  MIN: {
    standardCode: 'MIN',
    standardName: 'Mining Engineering',
    aliases: [
      'MIN',
      'MINING ENGINEERING',
    ],
  },
  CHE: {
    standardCode: 'CHE',
    standardName: 'Chemical Engineering',
    aliases: [
      'CHE',
      'CHEMICAL ENGINEERING',
    ],
  },
  BIO: {
    standardCode: 'BIO',
    standardName: 'Bio-Technology',
    aliases: [
      'BIO',
      'BME',
      'BIO-TECHNOLOGY',
      'BIOMEDICAL ENGINEERING',
    ],
  },
};

/**
 * Normalizes any branch code or string representation to a standard branch code.
 */
export function normalizeBranchCode(rawInput: string): string {
  if (!rawInput || rawInput === 'ALL') return 'ALL';
  const clean = rawInput.trim().toUpperCase();

  // Direct code match
  if (BRANCH_ALIASES[clean]) {
    return clean;
  }

  // Alias search
  for (const [code, info] of Object.entries(BRANCH_ALIASES)) {
    for (const alias of info.aliases) {
      if (alias.toUpperCase() === clean) {
        return code;
      }
    }
  }

  // Substring or keyword match
  if (clean.includes('ARTIFICIAL') && clean.includes('MACHINE')) return 'CSM';
  if (clean.includes('AI') && clean.includes('ML')) return 'CSM';
  if (clean.includes('DATA SCIENCE')) return 'CSD';
  if (clean.includes('CYBER')) return 'CSC';
  if (clean.includes('IOT') || clean.includes('INTERNET OF THINGS')) return 'CSO';
  if (clean.includes('BUSINESS')) return 'CSB';
  if (clean.includes('INFORMATION TECH') || clean === 'IT') return 'INF';
  if (clean.includes('ELECTRONICS') && clean.includes('COMMUNICATION')) return 'ECE';
  if (clean.includes('ELECTRICAL')) return 'EEE';
  if (clean.includes('MECHANICAL')) return 'MEC';
  if (clean.includes('CIVIL')) return 'CIV';
  if (clean.includes('AERONAUTICAL')) return 'ANE';
  if (clean.includes('MINING')) return 'MIN';
  if (clean.includes('CHEMICAL')) return 'CHE';
  if (clean.includes('COMPUTER SCIENCE')) return 'CSE';

  return clean;
}

/**
 * Checks if a candidate branch matches the target branch
 */
export function matchesBranch(candidateCode: string, candidateName: string, targetCode: string): boolean {
  if (!targetCode || targetCode === 'ALL') return true;
  const normTarget = normalizeBranchCode(targetCode);
  const normCandCode = normalizeBranchCode(candidateCode);
  const normCandName = normalizeBranchCode(candidateName);

  if (normCandCode === normTarget) return true;
  if (normCandName === normTarget) return true;

  // Check alias list
  const targetInfo = BRANCH_ALIASES[normTarget];
  if (targetInfo) {
    const candUpper = candidateCode.toUpperCase().trim();
    if (targetInfo.aliases.some((a) => a.toUpperCase() === candUpper)) return true;
  }

  return false;
}

/**
 * Normalizes category input
 */
export function normalizeCategory(rawCategory: string): Category {
  if (!rawCategory) return 'OC';
  const clean = rawCategory.trim().toUpperCase().replace(/[-\s]/g, '_');

  if (clean === 'OC' || clean === 'GENERAL' || clean === 'OPEN') return 'OC';
  if (clean === 'BC_A' || clean === 'BCA') return 'BC_A';
  if (clean === 'BC_B' || clean === 'BCB') return 'BC_B';
  if (clean === 'BC_C' || clean === 'BCC') return 'BC_C';
  if (clean === 'BC_D' || clean === 'BCD') return 'BC_D';
  if (clean === 'BC_E' || clean === 'BCE') return 'BC_E';
  if (clean === 'SC_I' || clean === 'SC_1' || clean === 'SC1') return 'SC_I';
  if (clean === 'SC_II' || clean === 'SC_2' || clean === 'SC2') return 'SC_II';
  if (clean === 'SC_III' || clean === 'SC_3' || clean === 'SC3') return 'SC_III';
  if (clean === 'SC') return 'SC_I'; // Default to SC_I if general SC
  if (clean === 'ST') return 'ST';
  if (clean === 'EWS') return 'EWS';

  return 'OC';
}

/**
 * Normalizes gender input
 */
export function normalizeGender(rawGender: string): Gender {
  if (!rawGender) return 'BOYS';
  const clean = rawGender.trim().toUpperCase();
  if (clean === 'GIRLS' || clean === 'FEMALE' || clean === 'F' || clean === 'WOMEN') {
    return 'GIRLS';
  }
  return 'BOYS'; // Default male / general open
}

/**
 * Parses rank input with robust handling of commas, whitespace, and formatting artifacts.
 * "1,24,972" -> 124972
 * "124972" -> 124972
 * " 12,500 " -> 12500
 */
export function parseRankInput(rawRank: string | number): number {
  if (typeof rawRank === 'number') {
    return Math.max(1, Math.floor(rawRank));
  }
  if (!rawRank) return 1;
  const cleaned = String(rawRank).replace(/,/g, '').replace(/\s+/g, '').trim();
  const parsed = parseInt(cleaned, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}
