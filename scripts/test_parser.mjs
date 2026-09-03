import fs from 'fs';

// Parser function that parses a raw row from the uploaded PDF:
export function parseRow(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('TGEAPCET') || trimmed.startsWith('Inst') || trimmed.includes('Last rank statement') || trimmed.includes('of 35') || trimmed.startsWith('Disclaimer:')) {
    return null;
  }

  // A row ends with Affiliated To (which may be multi-word, e.g., 'ANURAG UNIVERSITY', 'CONSTITUENT COLLEGE', 'SR UNIVERSITY', 'JNTUH', 'OU', 'KU', etc.)
  // Preceding that are 22 numbers or 'NA' tokens.
  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 25) return null;

  // Find where the 22 cutoff numbers/NAs start from the back
  // The last 1 or 2 tokens might be affiliation. Let's find the 22 consecutive rank tokens.
  let cutoffEndIdx = -1;
  for (let i = tokens.length - 1; i >= 22; i--) {
    // Check if tokens[i-21 ... i] are all numbers or "NA"
    let allValid = true;
    for (let j = i - 21; j <= i; j++) {
      if (!/^\d+$/.test(tokens[j]) && tokens[j] !== 'NA') {
        allValid = false;
        break;
      }
    }
    if (allValid) {
      cutoffEndIdx = i;
      break;
    }
  }

  if (cutoffEndIdx === -1) {
    console.error("Could not find 22 cutoff tokens in line:", trimmed);
    return null;
  }

  const cutoffStartIdx = cutoffEndIdx - 21;
  const cutoffTokens = tokens.slice(cutoffStartIdx, cutoffEndIdx + 1);
  const affiliatedTo = tokens.slice(cutoffEndIdx + 1).join(' ');

  const beforeCutoffs = tokens.slice(0, cutoffStartIdx);
  const instCode = beforeCutoffs[0];
  
  // Find Dist Code or Co Education (COED / GIRLS)
  const coedIdx = beforeCutoffs.findIndex(t => t === 'COED' || t === 'GIRLS');
  if (coedIdx === -1) {
    console.error("Could not find COED/GIRLS in line:", trimmed);
    return null;
  }

  const coEducation = beforeCutoffs[coedIdx];
  const distCode = beforeCutoffs[coedIdx - 1];
  const collegeType = beforeCutoffs[coedIdx + 1]; // PVT, UNIV, GOV, SF
  const branchCode = beforeCutoffs[coedIdx + 2];
  const branchName = beforeCutoffs.slice(coedIdx + 3).join(' ');

  // Place is before distCode. Let's see: instCode is at 0. Institute Name is between 1 and placeIdx.
  const place = beforeCutoffs[coedIdx - 2];
  const instituteName = beforeCutoffs.slice(1, coedIdx - 2).join(' ');

  const cutoffs = {
    OC_BOYS: cutoffTokens[0] === 'NA' ? null : parseInt(cutoffTokens[0], 10),
    OC_GIRLS: cutoffTokens[1] === 'NA' ? null : parseInt(cutoffTokens[1], 10),
    BC_A_BOYS: cutoffTokens[2] === 'NA' ? null : parseInt(cutoffTokens[2], 10),
    BC_A_GIRLS: cutoffTokens[3] === 'NA' ? null : parseInt(cutoffTokens[3], 10),
    BC_B_BOYS: cutoffTokens[4] === 'NA' ? null : parseInt(cutoffTokens[4], 10),
    BC_B_GIRLS: cutoffTokens[5] === 'NA' ? null : parseInt(cutoffTokens[5], 10),
    BC_C_BOYS: cutoffTokens[6] === 'NA' ? null : parseInt(cutoffTokens[6], 10),
    BC_C_GIRLS: cutoffTokens[7] === 'NA' ? null : parseInt(cutoffTokens[7], 10),
    BC_D_BOYS: cutoffTokens[8] === 'NA' ? null : parseInt(cutoffTokens[8], 10),
    BC_D_GIRLS: cutoffTokens[9] === 'NA' ? null : parseInt(cutoffTokens[9], 10),
    BC_E_BOYS: cutoffTokens[10] === 'NA' ? null : parseInt(cutoffTokens[10], 10),
    BC_E_GIRLS: cutoffTokens[11] === 'NA' ? null : parseInt(cutoffTokens[11], 10),
    SC_I_BOYS: cutoffTokens[12] === 'NA' ? null : parseInt(cutoffTokens[12], 10),
    SC_I_GIRLS: cutoffTokens[13] === 'NA' ? null : parseInt(cutoffTokens[13], 10),
    SC_II_BOYS: cutoffTokens[14] === 'NA' ? null : parseInt(cutoffTokens[14], 10),
    SC_II_GIRLS: cutoffTokens[15] === 'NA' ? null : parseInt(cutoffTokens[15], 10),
    SC_III_BOYS: cutoffTokens[16] === 'NA' ? null : parseInt(cutoffTokens[16], 10),
    SC_III_GIRLS: cutoffTokens[17] === 'NA' ? null : parseInt(cutoffTokens[17], 10),
    ST_BOYS: cutoffTokens[18] === 'NA' ? null : parseInt(cutoffTokens[18], 10),
    ST_GIRLS: cutoffTokens[19] === 'NA' ? null : parseInt(cutoffTokens[19], 10),
    EWS_BOYS: cutoffTokens[20] === 'NA' ? null : parseInt(cutoffTokens[20], 10),
    EWS_GIRLS: cutoffTokens[21] === 'NA' ? null : parseInt(cutoffTokens[21], 10),
  };

  return {
    id: `${instCode}-${branchCode}`,
    instCode,
    instituteName,
    place,
    distCode,
    coEducation,
    collegeType,
    branchCode,
    branchName,
    affiliatedTo,
    cutoffs,
  };
}

// Test sample row
const sample = "AARM AAR MAHAVEER ENGINEERING COLLEGE BANDLAGUDA HYD COED PVT CSE COMPUTER SCIENCE AND ENGINEERING 24147 24147 41502 41502 34085 36425 24147 24147 31767 31767 24369 37487 24147 138549 56135 56135 51882 51882 61347 70506 33632 33632 JNTUH";
const res = parseRow(sample);
console.log("Sample test result:", JSON.stringify(res, null, 2));
