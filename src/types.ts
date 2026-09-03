export type Category =
  | 'OC'
  | 'BC_A'
  | 'BC_B'
  | 'BC_C'
  | 'BC_D'
  | 'BC_E'
  | 'SC_I'
  | 'SC_II'
  | 'SC_III'
  | 'ST'
  | 'EWS';

export type Gender = 'BOYS' | 'GIRLS';

export type ChanceCategory = 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
export type ChanceLevel = ChanceCategory;

export interface CollegeCutoffRecord {
  id: string;
  instCode: string;
  instituteName: string;
  place: string;
  distCode: string;
  coEducation: 'COED' | 'GIRLS';
  collegeType: string;
  branchCode: string;
  branchName: string;
  affiliatedTo: string;
  cutoffs: {
    OC_BOYS: number | null;
    OC_GIRLS: number | null;
    BC_A_BOYS: number | null;
    BC_A_GIRLS: number | null;
    BC_B_BOYS: number | null;
    BC_B_GIRLS: number | null;
    BC_C_BOYS: number | null;
    BC_C_GIRLS: number | null;
    BC_D_BOYS: number | null;
    BC_D_GIRLS: number | null;
    BC_E_BOYS: number | null;
    BC_E_GIRLS: number | null;
    SC_I_BOYS: number | null;
    SC_I_GIRLS: number | null;
    SC_II_BOYS: number | null;
    SC_II_GIRLS: number | null;
    SC_III_BOYS: number | null;
    SC_III_GIRLS: number | null;
    ST_BOYS: number | null;
    ST_GIRLS: number | null;
    EWS_BOYS: number | null;
    EWS_GIRLS: number | null;
  };
}

export interface StudentInput {
  rank: number;
  category: Category;
  gender: Gender;
  preferredBranch: string;
  preferredCollege?: string;
}

export interface PredictionResult {
  record: CollegeCutoffRecord;
  closingRank: number;
  studentRank: number;
  chance: ChanceCategory;
  category: Category;
  gender: Gender;
}

export interface CounsellingPreference {
  id: string;
  record: CollegeCutoffRecord;
  closingRank: number;
  studentRank: number;
  chance: ChanceCategory;
  priority: number;
  addedAt: string;
}
