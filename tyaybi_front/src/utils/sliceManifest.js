/**
 * sliceManifest.js
 * Pure slice algorithm extracted from convertpdf.jsx.
 * No React state — takes an ArrayBuffer, returns structured sheet data.
 */
import * as XLSX from 'xlsx';
import bddngp from '@/pages/dashboard/clients/bddngp.json';

// ─── helpers ─────────────────────────────────────────────────────────────────

function removeNumbers(description) {
  if (typeof description !== 'string') return '';
  if (/^\d+$/.test(description)) return description;
  return description.replace(/[0-9]/g, '');
}

function extractNumber(str) {
  if (typeof str !== 'string') return str;
  const match = str.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function extractColisAndPoidsBrut(text) {
  if (!text) throw new Error('Input text is undefined or empty.');
  const matches = text.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length < 2)
    throw new Error('Failed to extract both colis and poids brut from the text.');
  return { coli: parseFloat(matches[0]), poidbr: parseFloat(matches[1]) };
}

/**
 * Resolve NGP code for a single manifest row.
 * Shared between the "current row" pass and the "next row" aggregation pass.
 *
 * @param {Array}  row           - the raw jsonData row
 * @param {object} ctx           - { contactexiste, model2, model3, test, ngpexiste, ngpMap, findNgpCode }
 * @param {string} descriptionForFallback - description string to use when falling back to ngpMap
 */
function resolveNgpCode(row, ctx, descriptionForFallback) {
  const { contactexiste, model2, model3, test, ngpexiste, ngpMap, findNgpCode } = ctx;
  let ngpCode;

  if (ngpexiste === 'ngp') {
    if (contactexiste === 'Contact') {
      ngpCode = row[14] != null ? row[14] : 'ngp';
    } else {
      ngpCode = row[13] != null ? row[13] : 'ngp';
    }
  } else {
    let codePrefix;
    if (contactexiste === 'Contact' || model2) {
      codePrefix = test
        ? row[12]?.toString().substring(0, 2)
        : row[13]?.toString().substring(0, 2);
    } else if (model3) {
      codePrefix = row[14]?.toString().substring(0, 2);
    } else {
      codePrefix = test
        ? row[11]?.toString().substring(0, 2)
        : row[12]?.toString().substring(0, 2);
    }

    switch (true) {
      case codePrefix >= '01' && codePrefix <= '27':
        ngpCode = 2104200000; break;
      case codePrefix === '29':
        ngpCode = 3304999900; break;
      case codePrefix === '30':
        ngpCode = 3006500000; break;
      case (codePrefix >= '31' && codePrefix <= '38') || codePrefix === '28':
        ngpCode = 3304999900; break;
      case codePrefix === '39':
        ngpCode = 3926909290; break;
      case codePrefix === '40':
        ngpCode = 4016999890; break;
      case codePrefix >= '41' && codePrefix <= '43':
        ngpCode = 4202110010; break;
      case codePrefix >= '44' && codePrefix <= '46':
        ngpCode = 4409101000; break;
      case codePrefix >= '48' && codePrefix <= '49':
        ngpCode = 4901991000; break;
      case codePrefix >= '50' && codePrefix <= '63':
        ngpCode = 6203120000; break;
      case codePrefix >= '64' && codePrefix <= '65':
        ngpCode = 6401101000; break;
      case codePrefix >= '66' && codePrefix <= '67':
        ngpCode = 6602000000; break;
      case codePrefix >= '68' && codePrefix <= '69':
        ngpCode = 6904100010; break;
      case codePrefix === '70':
        ngpCode = 7007111011; break;
      case codePrefix === '71':
        ngpCode = 7113199000; break;
      case codePrefix >= '72' && codePrefix <= '82':
        ngpCode = 8201100010; break;
      case codePrefix === '83':
        ngpCode = 8306300000; break;
      case codePrefix >= '84' && codePrefix <= '89': {
        if (codePrefix === '85') {
          let codesufix;
          if (contactexiste === 'Contact' || model2) {
            codesufix = test
              ? row[12]?.toString().substring(2, 4)
              : row[13]?.toString().substring(2, 4);
          } else if (model3) {
            codesufix = row[14]?.toString().substring(2, 4);
          } else {
            codesufix = test
              ? row[11]?.toString().substring(2, 4)
              : row[12]?.toString().substring(2, 4);
          }
          const desc = descriptionForFallback?.toLowerCase() || '';
          ngpCode =
            codesufix === '44' ? 8544429090
            : codesufix === '04' ? 8504409970
            : (codesufix === '17' &&
               (desc.includes('mobile phone') || desc.includes('smart phone') || desc.includes('phone')))
              ? 8517130090
              : 8512100000;
        } else {
          ngpCode = 8512100000;
        }
        break;
      }
      case codePrefix >= '90' && codePrefix <= '93':
        ngpCode = 9002111000; break;
      case codePrefix === '94':
        ngpCode = 9401100000; break;
      case codePrefix === '95':
        ngpCode = 9503001010; break;
      case codePrefix === '96':
        ngpCode = 9608109000; break;
      default:
        ngpCode = 'ngp';
    }
  }

  // fallback to ngpMap
  if (ngpCode === 'ngp' || !ngpCode) {
    ngpCode = descriptionForFallback
      ? ngpMap[descriptionForFallback.toLowerCase()] || findNgpCode(descriptionForFallback.toLowerCase())
      : 'ngp';
  }

  return ngpCode;
}

const SPLIT_NGPS = new Set([
  8544429090, 8504409970, 9503001010, 9608109000, 7007111011,
  6401101000, 4409101000, 4202110010, 4016999890, 3926909290,
  3301120010, 6203120000, 4901991000, 3304999900,
]);

// ─── main export ─────────────────────────────────────────────────────────────

/**
 * Slice a manifest Excel file and return structured sheet data.
 *
 * @param {ArrayBuffer} arrayBuffer      - raw manifest .xlsx file bytes
 * @param {number|null} madValueOverride - Fret in MAD (user input × exchange rate). Overrides A4.
 * @param {string[]}    exclusionWaybills - waybill numbers to exclude (default: [])
 * @param {number|null} tauxusdOverride   - blocage: override USD→MAD rate from Badr (default: null = use D4)
 *
 * @returns {{
 *   sheets: Array<{ name: string, data: any[][], totals: { pieces, value, weight } }>,
 *   mawbValue: string,
 *   parvaleur: number,
 *   position: number,
 *   coliis: number,
 *   poidbrut: number,
 *   tauxusd: number,
 *   totalvaluee: number,
 *   test: boolean,
 *   missingNGP: string[],
 * }}
 */
export function sliceManifest(arrayBuffer, madValueOverride, exclusionWaybills = [], tauxusdOverride = null) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const header = [
    'Identifiant unique du fichier',
    "N° ordre de l'article",
    'Nombre Contenants',
    'Type Contenant',
    'Marque (N° Envoi)',
    'Code NGP(à 10 chiffres)',
    'Désignation commerciale',
    "Pays d'origine",
    'Indicateur de Paiement',
    'Indicateur Occasion',
    'Valeur',
    'Devise',
    'Quantité Article',
    'Unité de mesure',
    'Poids net Article',
    'Quantité normalisée',
    'Code Référence Accord Article',
    'Code Référence Franchise',
    'Nom et Prénom',
    'CIN',
    'Carton or bag N°',
    'HAWB',
  ];

  // Build NGP map from bddngp.json
  const ngpMap = {};
  for (const item of bddngp.Feuil1) {
    const key = item['Désignation commerciale']
      .toLowerCase()
      .replace(/\s*\d*$/, '')
      .trim();
    if (!ngpMap[key]) {
      ngpMap[key] = item['Code NGP(à 10 chiffres)'];
    }
  }

  function findNgpCode(description) {
    const originalKey = description.toLowerCase();
    if (ngpMap[originalKey]) return ngpMap[originalKey];
    const normalizedKey = originalKey.replace(/\s*\d*$/, '').trim();
    return ngpMap[normalizedKey] || 'ngp';
  }

  // ── Metadata from header rows ────────────────────────────────────────────
  const mawbValue = jsonData[0][0] ? jsonData[0][0] : 'mawb';
  const { coli, poidbr } = extractColisAndPoidsBrut(jsonData[1][0]);
  let pos = extractNumber(jsonData[2][0] ? jsonData[2][0] : 0);
  const parvaleur =
    (madValueOverride != null && madValueOverride > 0)
      ? madValueOverride
      : extractNumber(jsonData[3][0] ? jsonData[3][0] : 0);
  const tauxusd = tauxusdOverride != null && tauxusdOverride > 0
    ? tauxusdOverride
    : (jsonData[3][3] ? jsonData[3][3] : 1);

  // ── Model detection ──────────────────────────────────────────────────────
  const contactexiste = jsonData[4][6];
  const model2 = jsonData[4][1] === 'Connote #';
  const model3 = jsonData[4][0] === 'Docket #';
  const ngpexiste = contactexiste === 'Contact' ? jsonData[4][14] : jsonData[4][13];
  const sanshawb = contactexiste === 'Contact' ? jsonData[4][12] : jsonData[4][11];
  const test = String(sanshawb).replace(/\s+/g, '').toUpperCase() === 'HSCODE';

  const ctx = { contactexiste, model2, model3, test, ngpexiste, ngpMap, findNgpCode };

  // ── State ────────────────────────────────────────────────────────────────
  const slicedSheets = [];
  let currentSheet = [];
  const processedWaybills = new Set();
  let newdata = [];
  let sheetCount = 1;
  let missingNGPCodes = [];
  let accumulatedTotalValue = 0;
  let poidbr_mutable = poidbr;
  const trueremaining = [];

  // ── Main loop ────────────────────────────────────────────────────────────
  for (let i = 5; i < jsonData.length - 1; i++) {
    const row = jsonData[i];
    const currency = row[0]?.trim().toLowerCase();
    if (!currency || (currency !== 'mad' && currency !== 'usd')) break;

    const waybillNumber = (model3 ? row[2] : row[1]).toString();
    const description = model2 ? row[3] : model3 ? row[4] : row[2];
    let pieces = model2 ? Number(row[4]) : model3 ? Number(row[5]) : Number(row[3]);
    let total = model2
      ? Number(row[5]) * tauxusd
      : model3
      ? Number(row[6]) * tauxusd
      : Number(row[4]) * tauxusd;
    let weight = model2
      ? Number(row[11])
      : model3
      ? Number(row[12]) / 1000
      : contactexiste === 'Contact'
      ? Number(row[10])
      : Number(row[9]);

    // Resolve NGP code for this row
    let ngpCode = resolveNgpCode(row, ctx, description);
    if (ngpCode === 'ngp') missingNGPCodes.push(description);

    // ── Aggregation: look ahead for same waybill + same NGP ───────────────
    for (let j = i + 1; j < jsonData.length; j++) {
      const nextRow = jsonData[j];
      const nextCurrency = nextRow[0]?.trim().toLowerCase();
      if (!nextCurrency || (nextCurrency !== 'mad' && nextCurrency !== 'usd')) break;

      const nextWaybillNumber = (model3 ? nextRow[2] : nextRow[1]).toString();
      if (waybillNumber !== nextWaybillNumber) continue;

      const nextDescription = model2 ? nextRow[3] : model3 ? nextRow[4] : nextRow[2];
      const ngpCodee = resolveNgpCode(nextRow, ctx, nextDescription);

      if (ngpCode === ngpCodee) {
        if (model2) {
          pieces += Number(nextRow[4]);
          total += Number(nextRow[5]) * tauxusd;
          weight += Number(nextRow[11]);
        } else if (model3) {
          pieces += Number(nextRow[5]);
          total += Number(nextRow[6]) * tauxusd;
          weight += Number(nextRow[12]) / 1000;
        } else {
          pieces += Number(nextRow[3]);
          total += Number(nextRow[4]) * tauxusd;
          weight +=
            contactexiste === 'Contact' ? Number(nextRow[10]) : Number(nextRow[9]);
        }
      }
    }

    // ── rowExists check (skip duplicates) ─────────────────────────────────
    let rowExists = false;
    newdata.forEach(r => {
      if (r[0][3] === waybillNumber && r[0][4] === ngpCode) rowExists = true;
    });

    if (!rowExists && !exclusionWaybills.includes(waybillNumber)) {
      accumulatedTotalValue += total;

      // Build base trailing fields per model
      let trailFields; // [17, 18, 19, 20]
      if (model2) {
        trailFields = [row[8], '', row[12], row[2]];
      } else if (model3) {
        trailFields = [row[9], '', row[13], row[3]];
      } else if (contactexiste === 'Contact') {
        trailFields = [row[7], '', row[11], row[12]];
      } else {
        trailFields = [row[6], '', row[10], row[11]];
      }

      const buildRow = (val, pcs, wgt) => [
        i - 4, '', '000', waybillNumber, ngpCode,
        removeNumbers(description), 'CN', 'SP', 'NON',
        val, 'MAD', pcs, '002', wgt, pcs,
        '', '', ...trailFields,
      ];

      if (SPLIT_NGPS.has(ngpCode) && total > 500) {
        const weightPercentage = (495 / total) * weight;
        let piecesPercentage = Math.round((495 / total) * pieces);
        const remainingTotal = total - 495;
        const remainingWeight = weight - weightPercentage;
        let remainingPieces = pieces - piecesPercentage;

        if (remainingPieces === 0) {
          piecesPercentage -= 1;
          remainingPieces = 1;
        }
        if (piecesPercentage < 1) {
          piecesPercentage = 1;
          trueremaining.push(i - 4);
        }

        newdata.push([buildRow(495, piecesPercentage, weightPercentage)]);

        let trueelectronic = 0;
        newdata.forEach(r => {
          const er = r[0];
          if (er[3] === waybillNumber && er[4] === 85121000000) {
            er[9] += remainingTotal;
            er[11] += remainingPieces;
            er[13] += remainingWeight;
            er[14] += remainingPieces;
            trueelectronic = 1;
          }
        });

        if (trueelectronic !== 1) {
          newdata.push([[
            i - 4, '', '000', waybillNumber, 85121000000,
            'electronic parts', 'CN', 'SP', 'NON',
            remainingTotal, 'MAD', remainingPieces, '002',
            remainingWeight, remainingPieces, '', '', ...trailFields,
          ]]);
        }
      } else {
        newdata.push([buildRow(total, pieces, weight)]);
      }
    } else if (exclusionWaybills.includes(waybillNumber)) {
      if (!processedWaybills.has(waybillNumber)) {
        poidbr_mutable -= weight;
        pos -= 1;
        processedWaybills.add(waybillNumber);
      }
    }
  }

  // ── Sort: by carton (row[19]) then waybill (row[3]) ─────────────────────
  newdata.sort((a, b) => {
    if (a[0][19] < b[0][19]) return -1;
    if (a[0][19] > b[0][19]) return 1;
    if (a[0][3] < b[0][3]) return -1;
    if (a[0][3] > b[0][3]) return 1;
    return 0;
  });

  // ── Remap 85121000000 → 8512100000, adjust sibling pieces ────────────────
  newdata.forEach((rowWrapper, i) => {
    if (rowWrapper[0][4] === 85121000000) {
      for (let j = 0; j < newdata.length; j++) {
        if (rowWrapper[0][3] === newdata[j][0][3]) {
          if (i > 0 && trueremaining.includes(newdata[i - 1][0][0])) {
            if (newdata[j][0][11] > 1) {
              newdata[j][0][11] -= 1;
              newdata[j][0][14] -= 1;
              break;
            }
          }
        }
      }
      rowWrapper[0][4] = 8512100000;
    }
  });

  // ── Build GLOBAL sheet (sheet index 0) ──────────────────────────────────
  let cpt = 1;
  newdata.forEach(data => {
    const row = data[0];
    row[0] = cpt++;
    if (currentSheet.length === 0) {
      currentSheet.push(header);
      currentSheet.push([
        'MASTER 1 LE 12 JUIN', row[0], 3709, 216,
        `${row[3]}`, ...row.slice(4),
      ]);
    } else {
      currentSheet.push(['', ...row]);
    }
  });
  slicedSheets.push(currentSheet);
  currentSheet = [];

  // ── Build Canevas sheets (400 rows max each) ─────────────────────────────
  let c = 0;
  for (let i = 0; i < newdata.length; i++) {
    const row = newdata[i][0];
    c++;
    newdata[i][0][0] = c;

    const name = newdata[i][0][19]; // carton group

    if (currentSheet.length === 0) {
      currentSheet.push(header);
      currentSheet.push([
        `sheet${sheetCount}`, 1, '', 216,
        row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
        row[11], row[12], row[13], row[14], row[15], row[16], row[17],
        row[18], row[19], row[20],
      ]);
    } else {
      // Count how many more rows share the same carton group
      let cof = 0;
      newdata.slice(i + 1).some(d => {
        if (name === d[0][19]) { cof++; return false; }
        return true;
      });

      if (cof > 400 - currentSheet.length - 1 || currentSheet.length === 401) {
        slicedSheets.push(currentSheet);
        currentSheet = [];
        c = 1;
        sheetCount += 1;
        currentSheet.push(header);
        currentSheet.push([
          `sheet${sheetCount}`, 1, '', 216,
          row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
          row[11], row[12], row[13], row[14], row[15], row[16], row[17],
          row[18], row[19], row[20],
        ]);
        continue;
      }

      currentSheet.push([
        '', row[0], 0, 216,
        row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10],
        row[11], row[12], row[13], row[14], row[15], row[16], row[17],
        row[18], row[19], row[20],
      ]);
    }
  }
  if (currentSheet.length > 0) slicedSheets.push(currentSheet);

  // ── Compute totals + wrap into sheet objects ─────────────────────────────
  const sheetsWithTotals = slicedSheets.map((sheet, index) => {
    let totalPieces = 0, totalValue = 0, totalWeight = 0;
    sheet.slice(1).forEach(row => {
      totalPieces += Number(row[12]);
      totalValue  += Number(row[10]);
      totalWeight += Number(row[14]);
    });
    sheet.push([
      'Total', '', '', '', '', '', '', '', '', '',
      totalValue, '', totalPieces, '', totalWeight,
      '', '', '', '', '', '', '',
    ]);
    const sheetName = index === 0 ? 'GLOBAL' : `Sheet ${index}`;
    return { data: sheet, name: sheetName, totals: { pieces: totalPieces, value: totalValue, weight: totalWeight } };
  });

  // ── Write unique waybill counts into header rows ─────────────────────────
  let poslastsheetcount = 0;
  slicedSheets.forEach((sheet, index) => {
    if (index === 0) {
      sheet[1][2] = pos;
      return;
    }

    const uniqueWaybillNumbers = [...new Set(
      sheet.slice(1)
        .map(row => {
          const waybillValue = row[4];
          return typeof waybillValue === 'string'
            ? waybillValue.replace(mawbValue.toString() + ' ', '').trim()
            : '';
        })
        .filter(waybillNumber => waybillNumber && waybillNumber !== '')
    )];

    const uniqueWaybillCount = uniqueWaybillNumbers.length;

    if (index !== slicedSheets.length - 1) {
      poslastsheetcount += uniqueWaybillCount;
    }

    sheet[1][2] = uniqueWaybillCount;
    if (index === slicedSheets.length - 1) {
      sheet[1][2] = pos - poslastsheetcount;
    }
  });

  return {
    sheets: sheetsWithTotals,
    mawbValue,
    parvaleur,
    position: pos,
    coliis: coli,
    poidbrut: poidbr_mutable,
    tauxusd,
    totalvaluee: accumulatedTotalValue,
    test,
    missingNGP: missingNGPCodes,
  };
}
