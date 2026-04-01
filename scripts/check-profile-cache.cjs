const p = require('../.cache/eci-2026/profiles.json');
const keys = Object.keys(p);

let withAffidavit = 0, nullAffidavit = 0, withCriminalOCR = 0;
let affidavitTypes = {};

for (const k of keys) {
  const v = p[k];
  if (v.affidavit && typeof v.affidavit === 'object') {
    withAffidavit++;
    const aKeys = Object.keys(v.affidavit);
    for (const ak of aKeys) {
      affidavitTypes[ak] = (affidavitTypes[ak] || 0) + 1;
    }
    if (v.affidavit.criminalCases !== undefined || v.affidavit.cases !== undefined) {
      withCriminalOCR++;
    }
  } else if (v.affidavit === null || v.affidavit === undefined) {
    nullAffidavit++;
  } else {
    console.log('Unexpected affidavit type:', typeof v.affidavit, String(v.affidavit).slice(0, 100));
  }
}

console.log('Total profiles:', keys.length);
console.log('With affidavit object:', withAffidavit);
console.log('Null/undefined affidavit:', nullAffidavit);
console.log('Affidavit with criminal data:', withCriminalOCR);
console.log('\nAffidavit field frequencies:', affidavitTypes);

// Find one with criminal data
for (const k of keys) {
  const v = p[k];
  if (v.affidavit && v.affidavit.criminalCases) {
    console.log('\nSample with criminal data:');
    console.log('Name:', v.labels && v.labels.Name);
    console.log('Criminal:', v.affidavit.criminalCases);
    break;
  }
}

// Show a sample affidavit with data
for (const k of keys) {
  const v = p[k];
  if (v.affidavit && typeof v.affidavit === 'object' && Object.keys(v.affidavit).length > 0) {
    console.log('\nFirst non-empty affidavit keys:', Object.keys(v.affidavit));
    console.log('Sample:', JSON.stringify(v.affidavit).slice(0, 500));
    break;
  }
}
