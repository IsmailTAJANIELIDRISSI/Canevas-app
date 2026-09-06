/**
 * validateManifest.js
 * Structural + data-integrity validation for an airway-bill manifest (.xlsx)
 * BEFORE it is sliced into DUM outputs. Returns a structured result:
 *   { status: 'PASS' | 'WARNING' | 'BLOCKED', file, summary, issues[] }
 * It never transforms the file — it only reports problems.
 *
 * Row layout expected (0-indexed jsonData from sheet_to_json({header:1})):
 *   [0] MAWB <n>              [1] <N>Pcs <W>kg Currency:<CUR>
 *   [2] <P> Positions         [3] blank separator
 *   [4] column headers        [5..] data rows
 */
import * as XLSX from 'xlsx';

const EXPECTED_HEADERS = [
  'Currency', 'Waybill Number', 'Description of Goods', 'Pieces', 'Value',
  'Receiver City', 'Contact', 'Receiver Name', 'Company', 'Phone', 'Weight',
  'Carton or bag N°', 'hs Code',
];

const COL = {
  currency: 0, waybill: 1, desc: 2, pieces: 3, value: 4, city: 5,
  contact: 6, receiver: 7, company: 8, phone: 9, weight: 10, carton: 11, hs: 12,
};

const HEADER_ROW = 4; // 0-indexed → row 5 (where the slicer reads headers)
const MIN_ROWS = 6;
const MAX_EXAMPLES = 6; // cap examples per aggregated check to keep the UI readable

const str = (v) => (v == null ? '' : String(v).trim());
const isBlankRow = (row) => !row || row.every((c) => str(c) === '');
const hasAmbiguousComma = (v) => typeof v === 'string' && /,/.test(v.trim());

export function validateManifest(arrayBuffer, filename = 'manifest.xlsx') {
  const issues = [];
  const add = (severity, check, message, row, column) =>
    issues.push({ severity, check, message, ...(row != null ? { row } : {}), ...(column ? { column } : {}) });

  // ── Read the sheet ──────────────────────────────────────────────────────────
  let jsonData;
  try {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: null });
  } catch (e) {
    return {
      status: 'BLOCKED', file: filename, summary: {},
      issues: [{ severity: 'BLOCKER', check: 'file_unreadable', message: `Fichier illisible : ${e.message}` }],
    };
  }

  if (!jsonData || jsonData.length < MIN_ROWS) {
    return {
      status: 'BLOCKED', file: filename, summary: { data_rows: 0 },
      issues: [{ severity: 'BLOCKER', check: 'too_few_rows', message: 'Le fichier ne contient pas assez de lignes pour être un manifeste valide.' }],
    };
  }

  // ── A. Metadata rows (1–3) ──────────────────────────────────────────────────
  const mawbCell = str(jsonData[0]?.[0]);
  if (!/^MAWB\s+\S+/i.test(mawbCell)) {
    add('BLOCKER', 'mawb_line_invalid', `Ligne 1 (col A) : attendu « MAWB <numéro> », trouvé « ${mawbCell || '(vide)'} ».`, 1, 'A');
  }

  const pcsCell = str(jsonData[1]?.[0]);
  const pcsMatch = pcsCell.match(/(\d+)\s*Pcs\s+(\d+)\s*kg\s+Currency\s*:\s*([A-Za-z]{2,4})/i);
  let declaredPcs = null, declaredKg = null, declaredCurrency = null;
  if (!pcsMatch) {
    add('BLOCKER', 'summary_line_invalid', `Ligne 2 (col A) : attendu « <N>Pcs <W>kg Currency:<CUR> », trouvé « ${pcsCell || '(vide)'} ».`, 2, 'A');
  } else {
    declaredPcs = parseInt(pcsMatch[1], 10);
    declaredKg = parseFloat(pcsMatch[2]);
    declaredCurrency = pcsMatch[3].toUpperCase();
  }

  const posCell = str(jsonData[2]?.[0]);
  const posMatch = posCell.match(/(\d+)\s*Positions/i);
  let declaredPositions = null;
  if (!posMatch) {
    add('BLOCKER', 'positions_line_invalid', `Ligne 3 (col A) : attendu « <P> Positions », trouvé « ${posCell || '(vide)'} ».`, 3, 'A');
  } else {
    declaredPositions = parseInt(posMatch[1], 10);
  }

  // ── A. Locate the header row (must be row 5 for the slicer) ─────────────────
  let headerIdx = -1;
  for (let i = 2; i <= Math.min(6, jsonData.length - 1); i++) {
    const r = (jsonData[i] || []).map(str);
    if (r.includes('Waybill Number') && (r.includes('Description of Goods') || r.includes('Currency'))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    add('BLOCKER', 'headers_not_found',
      'Ligne d\'en-têtes introuvable (attendue en ligne 5, avec « Waybill Number », « Description of Goods »…). Structure du manifeste non reconnue.', 5);
    return finalize(filename, { declared_positions: declaredPositions, declared_pcs: declaredPcs, actual_distinct_waybills: null, actual_distinct_cartons: null, data_rows: 0 }, issues);
  }
  // The slicer reads headers at row 5 (index 4). If they're elsewhere, every
  // column read is shifted → one clear message instead of 13.
  if (headerIdx !== HEADER_ROW) {
    add('BLOCKER', 'structure_shifted',
      `En-têtes détectés en ligne ${headerIdx + 1} au lieu de la ligne 5 attendue. Une ligne est manquante ou en trop avant les en-têtes — le découpage lira les mauvaises lignes. Corrigez la structure à la source.`,
      headerIdx + 1);
  }

  const headerRow = (jsonData[headerIdx] || []).map((c) => str(c));
  let columnsOk = true;
  for (let c = 0; c < EXPECTED_HEADERS.length; c++) {
    if (headerRow[c] !== EXPECTED_HEADERS[c]) {
      columnsOk = false;
      add('BLOCKER', 'header_mismatch',
        `En-tête colonne ${c + 1} (ligne ${headerIdx + 1}) : attendu « ${EXPECTED_HEADERS[c]} », trouvé « ${headerRow[c] || '(vide)'} ». Colonne manquante, renommée ou décalée.`,
        headerIdx + 1, String.fromCharCode(65 + c));
    }
  }

  const dataStart = headerIdx + 1;

  // ── Locate data block ───────────────────────────────────────────────────────
  let lastNonBlank = dataStart - 1;
  for (let i = dataStart; i < jsonData.length; i++) {
    if (!isBlankRow(jsonData[i])) lastNonBlank = i;
  }

  const summary = {
    declared_positions: declaredPositions,
    actual_distinct_waybills: null,
    declared_pcs: declaredPcs,
    actual_distinct_cartons: null,
    data_rows: 0,
  };

  // Column names don't match — data columns are unreliable, don't run row checks.
  if (!columnsOk) return finalize(filename, summary, issues);

  // The slicer consumes rows until the first one whose currency isn't mad/usd
  // (that row and everything after are ignored). Mirror that here.
  let endIdx = lastNonBlank + 1;
  for (let i = dataStart; i <= lastNonBlank; i++) {
    const cur = str((jsonData[i] || [])[COL.currency]).toLowerCase();
    if (cur !== 'mad' && cur !== 'usd') { endIdx = i; break; }
  }
  summary.data_rows = Math.max(0, endIdx - dataStart);

  // If real data rows follow the stop point, the slicer would silently drop them.
  const tailEx = [];
  let tail = 0;
  for (let i = endIdx; i <= lastNonBlank; i++) {
    if (!isBlankRow(jsonData[i])) { tail++; if (tailEx.length < MAX_EXAMPLES) tailEx.push(i + 1); }
  }
  if (tail > 1) {
    const stopBlank = isBlankRow(jsonData[endIdx]);
    const why = stopBlank ? 'ligne vide' : `devise « ${str((jsonData[endIdx] || [])[COL.currency]) || '(vide)'} » non reconnue`;
    add('BLOCKER', 'data_truncated',
      `Le découpage s'arrêterait à la ligne ${endIdx + 1} (${why}), mais ${tail} ligne(s) de données suivent et seraient perdues. Ex : ligne ${tailEx.join(', ')}.`,
      endIdx + 1, 'A');
  }

  // ── B/C. Per-row checks (aggregated) + distinct sets ────────────────────────
  const waybills = new Set();
  const cartons = new Set();
  const seenRows = new Set();
  const wbFields = new Map();
  let weightSum = 0;

  const bucket = {};
  const flag = (check, row, found) => { (bucket[check] ||= []).push({ row, found }); };

  const dupRows = [];
  const wbInconsistent = new Set();

  for (let i = dataStart; i < endIdx; i++) {
    const row = jsonData[i] || [];
    const rn = i + 1;

    const currency = str(row[COL.currency]);
    const cur = currency.toLowerCase();
    if (declaredCurrency && currency.toUpperCase() !== declaredCurrency && cur !== 'usd') {
      flag('currency_mismatch', rn, currency);
    }

    const waybill = str(row[COL.waybill]);
    if (!waybill) flag('waybill_empty', rn, '(vide)');
    else waybills.add(waybill);

    const desc = str(row[COL.desc]);
    if (!desc) flag('desc_empty', rn, '(vide)');

    checkPositiveInt(row[COL.pieces], rn, 'pieces_invalid', flag);
    checkPositiveNum(row[COL.value], rn, 'value_invalid', flag);
    checkPositiveNum(row[COL.weight], rn, 'weight_invalid', flag);
    const wv = toNum(row[COL.weight]);
    if (wv != null && isFinite(wv)) weightSum += wv;

    const hs = str(row[COL.hs]);
    if (!/^\d{10}$/.test(hs)) flag('hs_code_invalid', rn, hs || '(vide)');

    const phone = str(row[COL.phone]);
    if (phone && !/^\d{9,10}$/.test(phone)) flag('phone_invalid', rn, phone);

    if (!str(row[COL.city])) flag('city_empty', rn, '(vide)');
    if (!str(row[COL.receiver])) flag('receiver_empty', rn, '(vide)');
    if (!str(row[COL.company])) flag('company_empty', rn, '(vide)');
    const carton = str(row[COL.carton]);
    if (!carton) flag('carton_empty', rn, '(vide)');
    else cartons.add(carton);

    for (const [key, label] of [[COL.pieces, 'Pieces'], [COL.value, 'Value'], [COL.weight, 'Weight'], [COL.hs, 'hs Code'], [COL.phone, 'Phone']]) {
      if (hasAmbiguousComma(row[key])) flag('ambiguous_number', rn, `${label}=« ${row[key]} »`);
    }

    const sig = [waybill, desc, str(row[COL.pieces]), str(row[COL.value]), str(row[COL.weight])].join('|');
    if (seenRows.has(sig)) dupRows.push(rn); else seenRows.add(sig);

    if (waybill) {
      const f = [str(row[COL.city]), str(row[COL.contact]), str(row[COL.receiver]), str(row[COL.company]), str(row[COL.phone]), carton].join('|');
      if (wbFields.has(waybill)) { if (wbFields.get(waybill) !== f) wbInconsistent.add(waybill); }
      else wbFields.set(waybill, f);
    }
  }

  summary.actual_distinct_waybills = waybills.size;
  summary.actual_distinct_cartons = cartons.size;

  // ── C. Cross-consistency (BLOCKERS) ─────────────────────────────────────────
  if (declaredPositions != null && declaredPositions !== waybills.size) {
    add('BLOCKER', 'positions_count_mismatch',
      `L'en-tête déclare ${declaredPositions} Positions, mais ${waybills.size} numéros de LTA (Waybill) distincts ont été trouvés dans les données. Le résumé du manifeste est incohérent — corrigez à la source.`,
      3, 'A');
  }
  if (declaredPcs != null && declaredPcs !== cartons.size) {
    add('BLOCKER', 'pcs_count_mismatch',
      `L'en-tête déclare ${declaredPcs} Pcs, mais ${cartons.size} « Carton or bag N° » distincts ont été trouvés dans les données.`,
      2, 'A');
  }

  // ── Field-level aggregation → WARNING, escalate to BLOCKER if systematic ────
  const LABELS = {
    currency_mismatch: 'Devise différente de celle déclarée',
    waybill_empty: 'Waybill Number vide', desc_empty: 'Description vide',
    pieces_invalid: 'Pieces non entier positif', value_invalid: 'Value non numérique/positive',
    weight_invalid: 'Weight non numérique/positive', hs_code_invalid: 'hs Code ≠ 10 chiffres',
    phone_invalid: 'Phone ≠ 9–10 chiffres', city_empty: 'Receiver City vide',
    receiver_empty: 'Receiver Name vide', company_empty: 'Company vide',
    carton_empty: 'Carton or bag N° vide', ambiguous_number: 'Nombre ambigu (virgule)',
  };
  const escalateAt = Math.max(10, Math.ceil(summary.data_rows * 0.1)); // >10% ⇒ systematic ⇒ BLOCKER
  for (const [check, list] of Object.entries(bucket)) {
    const sev = list.length > escalateAt ? 'BLOCKER' : 'WARNING';
    const examples = list.slice(0, MAX_EXAMPLES).map((e) => `ligne ${e.row} (« ${e.found} »)`).join(', ');
    const more = list.length > MAX_EXAMPLES ? `, … (+${list.length - MAX_EXAMPLES})` : '';
    add(sev, check, `${LABELS[check] || check} : ${list.length} ligne(s). Ex : ${examples}${more}.`);
  }

  // ── C. WARNINGS: duplicates, within-waybill, weight sanity ──────────────────
  if (dupRows.length) {
    const ex = dupRows.slice(0, MAX_EXAMPLES).join(', ');
    add('WARNING', 'duplicate_rows', `${dupRows.length} ligne(s) entièrement dupliquée(s) (même Waybill+Description+Pieces+Value+Weight). Ex : ligne ${ex}${dupRows.length > MAX_EXAMPLES ? ', …' : ''}.`);
  }
  if (wbInconsistent.size) {
    const ex = [...wbInconsistent].slice(0, MAX_EXAMPLES).join(', ');
    add('WARNING', 'waybill_inconsistent', `${wbInconsistent.size} Waybill(s) avec des champs destinataire/carton incohérents entre leurs lignes. Ex : ${ex}${wbInconsistent.size > MAX_EXAMPLES ? ', …' : ''}.`);
  }
  if (declaredKg && weightSum > 0) {
    const ratio = weightSum / declaredKg;
    if (ratio > 5 || ratio < 0.05) {
      add('WARNING', 'weight_sanity', `Somme des poids lignes (${weightSum.toFixed(1)} kg) vs poids déclaré (${declaredKg} kg) : ratio ${ratio.toFixed(2)}×, inhabituel. Vérifiez une éventuelle erreur d'unité ou des lignes dupliquées.`);
    }
  }

  return finalize(filename, summary, issues);
}

// ── helpers ────────────────────────────────────────────────────────────────────

function toNum(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  return NaN;
}

function checkPositiveInt(v, rn, check, flag) {
  if (typeof v === 'number') { if (!Number.isInteger(v) || v <= 0) flag(check, rn, v); return; }
  const s = str(v);
  if (!/^\d+$/.test(s) || parseInt(s, 10) <= 0) flag(check, rn, s || '(vide)');
}

function checkPositiveNum(v, rn, check, flag) {
  const n = toNum(v);
  if (n == null || isNaN(n) || n <= 0) flag(check, rn, str(v) || '(vide)');
}

function finalize(file, summary, issues) {
  const hasBlocker = issues.some((i) => i.severity === 'BLOCKER');
  const status = hasBlocker ? 'BLOCKED' : issues.length ? 'WARNING' : 'PASS';
  issues.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'BLOCKER' ? -1 : 1));
  return { status, file, summary, issues };
}
