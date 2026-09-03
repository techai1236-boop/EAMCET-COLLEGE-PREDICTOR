import json
import os

# Build the complete college database accurately using the user's uploaded 35 pages of data
data = []

def add(code, name, place, dist, coed, ctype, bcode, bname, ranks, aff):
    c_list = ranks.split() if isinstance(ranks, str) else ranks
    # 22 ranks:
    keys = [
        "OC_BOYS", "OC_GIRLS", "BC_A_BOYS", "BC_A_GIRLS", "BC_B_BOYS", "BC_B_GIRLS",
        "BC_C_BOYS", "BC_C_GIRLS", "BC_D_BOYS", "BC_D_GIRLS", "BC_E_BOYS", "BC_E_GIRLS",
        "SC_I_BOYS", "SC_I_GIRLS", "SC_II_BOYS", "SC_II_GIRLS", "SC_III_BOYS", "SC_III_GIRLS",
        "ST_BOYS", "ST_GIRLS", "EWS_BOYS", "EWS_GIRLS"
    ]
    cutoffs = {}
    for i, k in enumerate(keys):
        v = c_list[i] if i < len(c_list) else "NA"
        cutoffs[k] = None if v == "NA" else int(v)
        
    data.append({
        "id": f"{code}-{bcode}",
        "instCode": code,
        "instituteName": name,
        "place": place,
        "distCode": dist,
        "coEducation": coed,
        "collegeType": ctype,
        "branchCode": bcode,
        "branchName": bname,
        "affiliatedTo": aff,
        "cutoffs": cutoffs
    })

# We will populate top premier institutions, university engineering colleges, autonomous colleges and all affiliated colleges from the dataset
print("Assembling complete dataset...")
