import fs from 'fs';

// Helper to create cutoff object
export function makeCutoffs(ocB, ocG, bcaB, bcaG, bcbB, bcbG, bccB, bccG, bcdB, bcdG, bceB, bceG, sc1B, sc1G, sc2B, sc2G, sc3B, sc3G, stB, stG, ewsB, ewsG) {
  const parseVal = (v) => (v === 'NA' || v === null || v === undefined) ? null : Number(v);
  return {
    OC_BOYS: parseVal(ocB),
    OC_GIRLS: parseVal(ocG),
    BC_A_BOYS: parseVal(bcaB),
    BC_A_GIRLS: parseVal(bcaG),
    BC_B_BOYS: parseVal(bcbB),
    BC_B_GIRLS: parseVal(bcbG),
    BC_C_BOYS: parseVal(bccB),
    BC_C_GIRLS: parseVal(bccG),
    BC_D_BOYS: parseVal(bcdB),
    BC_D_GIRLS: parseVal(bcdG),
    BC_E_BOYS: parseVal(bceB),
    BC_E_GIRLS: parseVal(bceG),
    SC_I_BOYS: parseVal(sc1B),
    SC_I_GIRLS: parseVal(sc1G),
    SC_II_BOYS: parseVal(sc2B),
    SC_II_GIRLS: parseVal(sc2G),
    SC_III_BOYS: parseVal(sc3B),
    SC_III_GIRLS: parseVal(sc3G),
    ST_BOYS: parseVal(stB),
    ST_GIRLS: parseVal(stG),
    EWS_BOYS: parseVal(ewsB),
    EWS_GIRLS: parseVal(ewsG),
  };
}
