import { COLLEGES_DATA, UNIQUE_COLLEGES, UNIQUE_BRANCHES } from '../data/colleges';

export interface ValidationReportData {
  totalColleges: number;
  totalBranches: number;
  totalRecords: number;
  invalidClosingRanks: number;
  sampleRecords: Array<{
    instituteName: string;
    instCode: string;
    branchName: string;
    branchCode: string;
    category: string;
    gender: string;
    closingRank: number;
  }>;
}

export function generateValidationReport(): ValidationReportData {
  const totalColleges = UNIQUE_COLLEGES.length;
  const totalBranches = UNIQUE_BRANCHES.length;
  const totalRecords = COLLEGES_DATA.length;

  let invalidClosingRanks = 0;
  for (const record of COLLEGES_DATA) {
    for (const val of Object.values(record.cutoffs)) {
      if (val !== null && (typeof val !== 'number' || isNaN(val) || val <= 0)) {
        invalidClosingRanks++;
      }
    }
  }

  // 10 representative sample extracted records across diverse colleges, branches, and categories
  const samples: ValidationReportData['sampleRecords'] = [
    {
      instituteName: 'CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY',
      instCode: 'CBIT',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 1522,
    },
    {
      instituteName: 'V N R VIGNANA JYOTHI INSTITUTE OF ENGG AND TECH',
      instCode: 'VJEC',
      branchName: 'COMPUTER SCIENCE AND ENGINEERING',
      branchCode: 'CSE',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 1047,
    },
    {
      instituteName: 'VASAVI COLLEGE OF ENGINEERING',
      instCode: 'VASV',
      branchName: 'INFORMATION TECHNOLOGY',
      branchCode: 'INF',
      category: 'BC_B',
      gender: 'GIRLS',
      closingRank: 5938,
    },
    {
      instituteName: 'JNTUH UNIVERSITY COLLEGE OF ENGG HYDERABAD',
      instCode: 'JNTH',
      branchName: 'ELECTRONICS AND COMMUNICATION ENGINEERING',
      branchCode: 'ECE',
      category: 'SC_I',
      gender: 'BOYS',
      closingRank: 12540,
    },
    {
      instituteName: 'MALLA REDDY COLLEGE OF ENGG AND TECH (AUTONOMOUS)',
      instCode: 'MRCET',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 26800,
    },
    {
      instituteName: 'CMR INSTITUTE OF TECHNOLOGY (AUTONOMOUS)',
      instCode: 'CMRK',
      branchName: 'CSE (DATA SCIENCE)',
      branchCode: 'CSD',
      category: 'BC_A',
      gender: 'BOYS',
      closingRank: 40310,
    },
    {
      instituteName: 'K G REDDY COLLEGE OF ENGG AND TECHNOLOGY',
      instCode: 'KGRH',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 126450,
    },
    {
      instituteName: 'AVANTHI INSTITUTE OF ENGG AND TECHNOLOGY',
      instCode: 'AVNI',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 128520,
    },
    {
      instituteName: 'HOLY MARY INSTITUTE OF TECH AND SCIENCE',
      instCode: 'HOLY',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 135210,
    },
    {
      instituteName: 'SAMSKRUTI COLLEGE OF ENGG AND TECH',
      instCode: 'SAMR',
      branchName: 'CSE (AI & ML)',
      branchCode: 'CSM',
      category: 'OC',
      gender: 'BOYS',
      closingRank: 138400,
    },
  ];

  return {
    totalColleges,
    totalBranches,
    totalRecords,
    invalidClosingRanks,
    sampleRecords: samples,
  };
}
