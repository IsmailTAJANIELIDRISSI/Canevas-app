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

// Standard/AliExpress column→index map (data read by index; identical for both).
const STD_COL = {
  currency: 0, waybill: 1, desc: 2, pieces: 3, value: 4, city: 5,
  contact: 6, receiver: 7, company: 8, phone: 9, weight: 10, carton: 11, hs: 12,
};

// Accepted header layouts. Each schema carries its own header names AND its own
// column→index map, because some layouts shift the data columns (e.g. Connote has
// an extra "Sender Ref." at index 2 that pushes Value→5, Weight→11, HS Code→13).
const SCHEMAS = [
  {
    name: 'Standard (TEMU)',
    headers: [
      'Currency', 'Waybill Number', 'Description of Goods', 'Pieces', 'Value',
      'Receiver City', 'Contact', 'Receiver Name', 'Company', 'Phone', 'Weight',
      'Carton or bag N°', 'hs Code',
    ],
    col: STD_COL,
  },
  {
    name: 'AliExpress',
    headers: [
      'Currency', 'Waybill Number', 'Description of Goods', 'Pieces', 'Value',
      'Receiver City', 'Contact', 'Receiver Name', 'Shipper Company', 'Phone', 'Weight',
      'Carton or bag N°', 'HSCODE', 'HAWB',
    ],
    col: STD_COL,
    // AliExpress phones use international format (e.g. 00212622511266), not the
    // 9–10 digit local form — don't validate phone length for this schema.
    checkPhone: false,
  },
  {
    // AliExpress variant: Standard layout but "Tel destinataire" / "HSCODE".
    name: 'AliExpress (Tel destinataire)',
    headers: [
      'Currency', 'Waybill Number', 'Description of Goods', 'Pieces', 'Value',
      'Receiver City', 'Contact', 'Receiver Name', 'Company', 'Tel destinataire', 'Weight',
      'Carton or bag N°', 'HSCODE',
    ],
    col: STD_COL,
    checkPhone: false,
  },
  {
    name: 'Connote',
    headers: [
      'Currency', 'Connote #', 'Sender Ref.', 'Piece Goods Descriptions', 'Piece', 'Value',
      'Receiver Town', 'Contact', 'Receiver', 'Sender', 'Phone', 'Weight', 'Bag Number', 'HS Code',
    ],
    col: {
      currency: 0, waybill: 1, desc: 3, pieces: 4, value: 5, city: 6,
      contact: 7, receiver: 8, company: 9, phone: 10, weight: 11, carton: 12, hs: 13,
    },
  },
];

const HEADER_ROW = 4; // 0-indexed → row 5 (where the slicer reads headers)
const MIN_ROWS = 6;
const MAX_EXAMPLES = 6; // cap examples per aggregated check to keep the UI readable

const str = (v) => (v == null ? '' : String(v).trim());
const isBlankRow = (row) => !row || row.every((c) => str(c) === '');

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

  // Headers are compared after normalization: collapse internal whitespace runs
  // and ignore case, so " Pieces " / "PIECES" / "hs  code" are accepted as-is.
  const normH = (s) => str(s).replace(/\s+/g, ' ').toLowerCase();

  // ── A. Locate the header row (must be row 5 for the slicer) ─────────────────
  // Detect by columns common to every schema: "Currency" + "Value".
  let headerIdx = -1;
  for (let i = 2; i <= Math.min(6, jsonData.length - 1); i++) {
    const r = (jsonData[i] || []).map(normH);
    if (r.includes('currency') && r.includes('value')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    add('BLOCKER', 'headers_not_found',
      'Ligne d\'en-têtes introuvable (attendue en ligne 5, avec « Currency », « Value »…). Structure du manifeste non reconnue.', 5);
    return finalize(filename, { declared_positions: declaredPositions, declared_pcs: declaredPcs, actual_distinct_waybills: null, actual_distinct_cartons: null, data_rows: 0 }, issues);
  }
  // The slicer reads headers at row 5 (index 4). If they're elsewhere, every
  // column read is shifted → one clear message instead of 13.
  if (headerIdx !== HEADER_ROW) {
    add('BLOCKER', 'structure_shifted',
      `En-têtes détectés en ligne ${headerIdx + 1} au lieu de la ligne 5 attendue. Une ligne est manquante ou en trop avant les en-têtes — le découpage lira les mauvaises lignes. Corrigez la structure à la source.`,
      headerIdx + 1);
  }

  // ── A. Header columns — accept any known schema (normalized, per-cell) ──────
  const headerRow = (jsonData[headerIdx] || []).map((c) => str(c));

  const evalSchema = (schema) => {
    const norm = schema.headers.map(normH);
    const mismatches = [];
    let matched = 0;
    for (let c = 0; c < norm.length; c++) {
      if (normH(headerRow[c]) === norm[c]) matched++;
      else mismatches.push({ c, expected: schema.headers[c], found: headerRow[c] });
    }
    const extra = [];
    for (let c = schema.headers.length; c < headerRow.length; c++) {
      if (str(headerRow[c])) extra.push(c);
    }
    return { schema, matched, mismatches, extra };
  };

  const evals = SCHEMAS.map(evalSchema);
  const matching = evals.find((e) => e.mismatches.length === 0);
  let columnsOk = true;
  const activeSchema = matching ? matching.schema : null;
  if (matching) {
    // Leading columns match this schema → proceed. Extra trailing columns: WARN.
    for (const c of matching.extra) {
      add('WARNING', 'extra_column',
        `Cellule ${colLetter(c)}${headerIdx + 1} : colonne supplémentaire « ${headerRow[c]} » au-delà du format ${matching.schema.name}.`,
        headerIdx + 1, colLetter(c));
    }
  } else {
    columnsOk = false;
    // Report per-cell mismatches against the closest schema for relevant messages.
    const best = evals.slice().sort((a, b) => b.matched - a.matched)[0];
    const others = SCHEMAS.map((s) => s.name).join(' / ');
    for (const m of best.mismatches) {
      add('BLOCKER', 'header_mismatch',
        `Cellule ${colLetter(m.c)}${headerIdx + 1} : attendu « ${m.expected} » (format ${best.schema.name}), trouvé « ${m.found || '(vide)'} ». Colonne manquante, renommée, décalée ou dans le mauvais ordre. Formats acceptés : ${others}.`,
        headerIdx + 1, colLetter(m.c));
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

  // Column→index map for the matched schema (Connote shifts data columns).
  const C = activeSchema.col;

  // The slicer consumes rows until the first one whose currency isn't mad/usd
  // (that row and everything after are ignored). Mirror that here.
  let endIdx = lastNonBlank + 1;
  for (let i = dataStart; i <= lastNonBlank; i++) {
    const cur = str((jsonData[i] || [])[C.currency]).toLowerCase();
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
    const why = stopBlank ? 'ligne vide' : `devise « ${str((jsonData[endIdx] || [])[C.currency]) || '(vide)'} » non reconnue`;
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

  const malformed = []; // {cell, label, raw} — genuinely illegible numeric cells
  const dupRows = [];
  const wbInconsistent = new Set();

  for (let i = dataStart; i < endIdx; i++) {
    const row = jsonData[i] || [];
    const rn = i + 1;

    const currency = str(row[C.currency]);
    const cur = currency.toLowerCase();
    if (declaredCurrency && currency.toUpperCase() !== declaredCurrency && cur !== 'usd') {
      flag('currency_mismatch', rn, currency);
    }

    const waybill = str(row[C.waybill]);
    if (!waybill) flag('waybill_empty', rn, '(vide)');
    else waybills.add(waybill);

    const desc = str(row[C.desc]);
    if (!desc) flag('desc_empty', rn, '(vide)');

    // Numeric cells: genuinely malformed values (garbage like "#*****", or
    // multi-separator like "11,5,451145") → collected for a hard BLOCKER with
    // the exact cell ref. Empty / zero / non-integer → softer per-column flags.
    checkNumericCell(row[C.pieces], rn, C.pieces, 'Pieces', true, flag, malformed);
    checkNumericCell(row[C.value], rn, C.value, 'Value', false, flag, malformed);
    checkNumericCell(row[C.weight], rn, C.weight, 'Weight', false, flag, malformed);
    const wv = toNum(row[C.weight]);
    if (wv != null && isFinite(wv)) weightSum += wv;

    const hs = str(row[C.hs]);
    if (!/^\d{10}$/.test(hs)) flag('hs_code_invalid', rn, hs || '(vide)');

    const phone = str(row[C.phone]);
    if (activeSchema.checkPhone !== false && phone && !/^\d{9,10}$/.test(phone)) {
      flag('phone_invalid', rn, phone);
    }

    if (!str(row[C.city])) flag('city_empty', rn, '(vide)');
    if (!str(row[C.receiver])) flag('receiver_empty', rn, '(vide)');
    if (!str(row[C.company])) flag('company_empty', rn, '(vide)');
    const carton = str(row[C.carton]);
    if (!carton) flag('carton_empty', rn, '(vide)');
    else cartons.add(carton);

    const sig = [waybill, desc, str(row[C.pieces]), str(row[C.value]), str(row[C.weight])].join('|');
    if (seenRows.has(sig)) dupRows.push(rn); else seenRows.add(sig);

    if (waybill) {
      const f = [str(row[C.city]), str(row[C.contact]), str(row[C.receiver]), str(row[C.company]), str(row[C.phone]), carton].join('|');
      if (wbFields.has(waybill)) { if (wbFields.get(waybill) !== f) wbInconsistent.add(waybill); }
      else wbFields.set(waybill, f);
    }
  }

  summary.actual_distinct_waybills = waybills.size;
  summary.actual_distinct_cartons = cartons.size;

  // ── Malformed numeric cells (garbage / multi-separator) → BLOCKER ───────────
  if (malformed.length) {
    const ex = malformed.slice(0, MAX_EXAMPLES).map((m) => `${m.cell} (${m.label} « ${m.raw} »)`).join(', ');
    const more = malformed.length > MAX_EXAMPLES ? `, … (+${malformed.length - MAX_EXAMPLES})` : '';
    add('BLOCKER', 'malformed_number',
      `${malformed.length} cellule(s) numérique(s) illisible(s) — ni un nombre valide (ex. « 11,5,451145 », « #**** »). Corrigez : ${ex}${more}.`);
  }

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
    carton_empty: 'Carton or bag N° vide',
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

// 0-based column index → spreadsheet letter (0→A, 25→Z, 26→AA, …)
function colLetter(c) {
  let s = '';
  let n = c + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Parse a numeric cell, accepting a SINGLE decimal separator (comma OR dot) and
// optional spaces as thousands separators. "7,03" → 7.03, "1 234,5" → 1234.5.
// Multiple separators ("11,5,451145") or symbols ("#***") → NaN.
function toNum(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/\s/g, '');
  if (/^-?\d+([.,]\d+)?$/.test(s)) return parseFloat(s.replace(',', '.'));
  return NaN;
}

// Status of a numeric cell: 'ok' | 'empty' | 'nonpositive' | 'malformed'
function numCellStatus(v) {
  if (v == null || String(v).trim() === '') return 'empty';
  const n = toNum(v);
  if (n == null || isNaN(n)) return 'malformed';
  return n > 0 ? 'ok' : 'nonpositive';
}

// Status of an integer cell: 'ok' | 'empty' | 'nonpositive' | 'noninteger' | 'malformed'
function intCellStatus(v) {
  if (v == null || String(v).trim() === '') return 'empty';
  const n = toNum(v);
  if (n == null || isNaN(n)) return 'malformed';
  if (!Number.isInteger(n)) return 'noninteger';
  return n > 0 ? 'ok' : 'nonpositive';
}

// Malformed (garbage / multi-separator) → collected for a hard BLOCKER with the
// exact cell ref. Empty / zero / non-integer → softer per-column WARNING flags.
function checkNumericCell(v, rn, colIdx, label, mustBeInt, flag, malformed) {
  const status = mustBeInt ? intCellStatus(v) : numCellStatus(v);
  if (status === 'ok') return;
  if (status === 'malformed') {
    malformed.push({ cell: `${colLetter(colIdx)}${rn}`, label, raw: str(v) });
    return;
  }
  const check = mustBeInt ? 'pieces_invalid' : (label === 'Value' ? 'value_invalid' : 'weight_invalid');
  flag(check, rn, str(v) || '(vide)');
}

function finalize(file, summary, issues) {
  const hasBlocker = issues.some((i) => i.severity === 'BLOCKER');
  const status = hasBlocker ? 'BLOCKED' : issues.length ? 'WARNING' : 'PASS';
  issues.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'BLOCKER' ? -1 : 1));
  return { status, file, summary, issues };
}
