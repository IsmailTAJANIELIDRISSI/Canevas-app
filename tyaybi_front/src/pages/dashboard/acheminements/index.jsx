import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Input,
  Textarea,
  Spinner,
  Chip,
} from '@material-tailwind/react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { sliceManifest } from '@/utils/sliceManifest';

// ─── constants ────────────────────────────────────────────────────────────────


const SHEET_OPTIONS = {
  views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
};

const THIN_BORDER = {
  top:    { style: 'thin', color: { argb: '000000' } },
  left:   { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right:  { style: 'thin', color: { argb: '000000' } },
};

// ─── Excel download helpers ───────────────────────────────────────────────────

function autoWidth(worksheet) {
  worksheet.columns.forEach(col => {
    let max = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      const w = cell.value ? cell.value.toString().length : 6;
      if (w > max) max = w;
    });
    col.width = max < 20 ? 20 : max;
  });
}

function styleSheet(worksheet) {
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell(cell => {
      cell.font = { bold: rowNumber === 1, size: rowNumber === 1 ? 12 : 10 };
      cell.alignment = { horizontal: 'center', vertical: 'center' };
      cell.border = THIN_BORDER;
    });
  });
}

function addSheetToWorkbook(workbook, sheetData, sheetName) {
  const ws = workbook.addWorksheet(sheetName, SHEET_OPTIONS);
  // header row
  ws.addRow(sheetData[0].slice(0, 20));
  // data rows (exclude last totals row)
  for (let i = 1; i < sheetData.length - 1; i++) {
    ws.addRow([
      sheetData[i][0],  sheetData[i][1],  sheetData[i][2],  sheetData[i][3],
      sheetData[i][4],  sheetData[i][5],  sheetData[i][6],  sheetData[i][7],
      sheetData[i][8],  sheetData[i][9],  sheetData[i][10], sheetData[i][11],
      sheetData[i][12], sheetData[i][13], sheetData[i][14], sheetData[i][15],
      sheetData[i][16], sheetData[i][17], sheetData[i][18], sheetData[i][18], // col 19 mirrors 18
    ]);
  }
  styleSheet(ws);
  autoWidth(ws);
}

async function downloadSingleSheet(sheetData, sheetName) {
  const workbook = new ExcelJS.Workbook();
  addSheetToWorkbook(workbook, sheetData, sheetName);
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${sheetName}_sliced_file.xlsx`);
}

// ─── summary data builder (shared) ───────────────────────────────────────────

function buildSummaryData(sliceResult) {
  const { sheets, mawbValue, parvaleur, poidbrut, position } = sliceResult;
  const totalPoidNet = sheets[0].totals.weight;
  const totalValeur  = sheets[0].totals.value;

  const summaryData = [['Sheet Name', 'Total Quantite', 'Total Value', 'Total poid net', 'Total poid brute', 'Total fret', 'Total position', 'Assurance', 'Carton']];

  sheets.forEach((sheet, index) => {
    const uniqueCartons = new Set();
    sheet.data.forEach((row, idx) => { if (idx > 0 && row[20]) uniqueCartons.add(row[20]); });
    const uniqueWaybills = new Set(
      sheet.data.slice(1)
        .map(row => (typeof row[4] === 'string' ? row[4].replace(mawbValue + ' ', '').trim() : ''))
        .filter(v => v !== ''),
    );
    let uniqueWaybillCount = index === 0 ? position : uniqueWaybills.size;
    const w  = sheet.totals.weight;
    const w1 = index === 0
      ? parseFloat(((poidbrut / totalPoidNet) * w).toFixed(2))
      : Math.round((poidbrut / totalPoidNet) * w);
    summaryData.push([
      sheet.name,
      sheet.totals.pieces,
      parseFloat(sheet.totals.value.toFixed(2)),
      Math.round(w),
      w1,
      Math.round((parvaleur / totalValeur) * sheet.totals.value),
      Math.round(uniqueWaybillCount),
      Math.round(sheet.totals.value * 0.003),
      uniqueCartons.size,
    ]);
  });

  adjustLastSheetValues(summaryData);
  return summaryData;
}

function adjustLastSheetValues(summaryData) {
  const adjust = (col) => {
    const total = parseFloat(summaryData[1][col]);
    const roundedSum = summaryData.slice(2, -1).reduce((a, r) => a + parseFloat(r[col]), 0);
    summaryData[summaryData.length - 1][col] = total - roundedSum;
  };
  const adjustBrute = (col) => {
    const total = parseFloat(summaryData[1][col]);
    const roundedSum = summaryData.slice(2, -1).reduce((a, r) => a + parseFloat(r[col]), 0);
    summaryData[summaryData.length - 1][col] = parseFloat((total - roundedSum).toFixed(2));
  };
  adjust(2); adjust(3); adjustBrute(4); adjust(5); adjust(6); adjust(7); adjust(8);
}

async function buildSummaryWorkbookBuffer(sliceResult) {
  const summaryData = buildSummaryData(sliceResult);
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Summary', SHEET_OPTIONS);
  ws.addRows(summaryData);
  ws.eachRow({ includeEmpty: false }, row => {
    row.eachCell(cell => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { horizontal: 'center', vertical: 'center' };
      cell.border = THIN_BORDER;
    });
  });
  autoWidth(ws);
  return workbook.xlsx.writeBuffer();
}

async function buildSheetWorkbookBuffer(sheetData, sheetName) {
  const workbook = new ExcelJS.Workbook();
  addSheetToWorkbook(workbook, sheetData, sheetName);
  return workbook.xlsx.writeBuffer();
}

async function sheetToPdfB64(sheetData, totalPrice, totalDDP) {
  try {
    const res = await fetch('http://localhost:3000/lta/sheet-to-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: sheetData, totalPrice, totalDDP }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pdfB64 || null;
  } catch { return null; }
}

// Build the DUM declarations Excel (generated_excel) — mirrors the old Excelise tab output
async function buildGeneratedExcel(sliceResult, ref) {
  const summaryData = buildSummaryData(sliceResult);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Summary');

  const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  const addSep = (row) => {
    worksheet.mergeCells(`A${row}:F${row}`);
    worksheet.getCell(`A${row}`).border = { bottom: { style: 'double' } };
  };

  const leftLabels = ['P', 'V', 'P,NET', 'P,BRUT'];
  const rightLabels = ['Fret', 'Ass', 'N, COLIS'];
  const leftMap  = { P: 6, V: 2, 'P,NET': 3, 'P,BRUT': 4 };
  const rightMap = { Fret: 5, Ass: 7, 'N, COLIS': 8 };

  // Global section — C1 shows the MAWB reference number
  worksheet.mergeCells('C1');
  worksheet.getCell('C1').value = ref || '';
  worksheet.getCell('C1').border = border;
  worksheet.getCell('C1').font = { bold: true };
  leftLabels.forEach((lbl, i) => {
    worksheet.getCell(`A${i+3}`).value = lbl;
    worksheet.getCell(`A${i+3}`).border = border;
    worksheet.getCell(`A${i+3}`).font = { bold: true };
    worksheet.getCell(`B${i+3}`).value = summaryData[1][leftMap[lbl]];
    worksheet.getCell(`B${i+3}`).border = border;
    worksheet.getCell(`B${i+3}`).alignment = { horizontal: 'right' };
  });
  rightLabels.forEach((lbl, i) => {
    worksheet.getCell(`E${i+3}`).value = lbl;
    worksheet.getCell(`E${i+3}`).border = border;
    worksheet.getCell(`E${i+3}`).font = { bold: true };
    worksheet.getCell(`F${i+3}`).value = summaryData[1][rightMap[lbl]];
    worksheet.getCell(`F${i+3}`).border = border;
    worksheet.getCell(`F${i+3}`).alignment = { horizontal: 'right' };
  });
  worksheet.getCell('A8').value = 'FOURNISSEUR'; worksheet.getCell('A8').border = border; worksheet.getCell('A8').font = { bold: true };
  worksheet.mergeCells('B8:C8'); worksheet.getCell('B8').border = border;
  worksheet.getCell('A9').value = 'MANIFEST'; worksheet.getCell('A9').border = border; worksheet.getCell('A9').font = { bold: true };
  worksheet.mergeCells('B9:C9'); worksheet.getCell('B9').border = border;
  addSep(10);

  // Per-DUM sections (skip GLOBAL)
  const dumSheets = sliceResult.sheets.filter(s => s.name !== 'GLOBAL');
  dumSheets.forEach((_, i) => {
    const rowStart = 11 + i * 7;
    const hasData = i + 2 < summaryData.length;
    const sd = hasData ? summaryData[i + 2] : null;

    worksheet.getCell(`C${rowStart}`).value = `DUM ${i + 1}`;
    worksheet.getCell(`C${rowStart}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    worksheet.getCell(`C${rowStart}`).border = border;
    worksheet.getCell(`C${rowStart}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`C${rowStart}`).font = { bold: true };

    leftLabels.forEach((lbl, idx) => {
      worksheet.getCell(`A${rowStart+idx+1}`).value = lbl; worksheet.getCell(`A${rowStart+idx+1}`).border = border; worksheet.getCell(`A${rowStart+idx+1}`).font = { bold: true };
      worksheet.getCell(`B${rowStart+idx+1}`).value = sd ? sd[leftMap[lbl]] : ''; worksheet.getCell(`B${rowStart+idx+1}`).border = border; worksheet.getCell(`B${rowStart+idx+1}`).alignment = { horizontal: 'right' };
    });
    rightLabels.forEach((lbl, idx) => {
      worksheet.getCell(`E${rowStart+idx+1}`).value = lbl; worksheet.getCell(`E${rowStart+idx+1}`).border = border; worksheet.getCell(`E${rowStart+idx+1}`).font = { bold: true };
      worksheet.getCell(`F${rowStart+idx+1}`).value = sd ? sd[rightMap[lbl]] : ''; worksheet.getCell(`F${rowStart+idx+1}`).border = border; worksheet.getCell(`F${rowStart+idx+1}`).alignment = { horizontal: 'right' };
    });
    worksheet.mergeCells(`C${rowStart+1}:C${rowStart+4}`);
    worksheet.getCell(`C${rowStart+2}`).border = border;
    addSep(rowStart + 6);
  });

  worksheet.getColumn('A').width = 13; worksheet.getColumn('B').width = 9.5;
  worksheet.getColumn('C').width = 15; worksheet.getColumn('D').hidden = true;
  worksheet.getColumn('E').width = 8;  worksheet.getColumn('F').width = 8;

  return workbook.xlsx.writeBuffer();
}

// ─── SSE stream reader ───────────────────────────────────────────────────────
// Async generator that yields parsed SSE data objects from a fetch Response.
async function* readSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try { yield JSON.parse(line.slice(6)); } catch {}
      }
    }
  }
  if (buf.startsWith('data: ')) {
    try { yield JSON.parse(buf.slice(6)); } catch {}
  }
}

// Build list of all output files (summary, generated_excel, per-DUM xlsx+pdf — no GLOBAL)
async function buildAllFiles(sliceResult, ref, onProgress) {
  const dumSheets = sliceResult.sheets.filter(s => s.name !== 'GLOBAL');
  const total = dumSheets.length + 2; // +summary +generated_excel
  const files = []; // { name, data: ArrayBuffer|Uint8Array }

  const summaryBuf = await buildSummaryWorkbookBuffer(sliceResult);
  files.push({ name: 'summary_file.xlsx', data: summaryBuf });

  const genBuf = await buildGeneratedExcel(sliceResult, ref);
  files.push({ name: 'generated_excel.xlsx', data: genBuf });

  onProgress?.(0, total);

  for (let i = 0; i < dumSheets.length; i++) {
    const sheet = dumSheets[i];
    const xlsBuf = await buildSheetWorkbookBuffer(sheet.data, sheet.name);
    files.push({ name: `${sheet.name}.xlsx`, data: xlsBuf });
    const sheetTotalPrice = parseFloat(sheet.totals.value).toFixed(2);
    const sheetTotalDDP = sliceResult.totalvaluee > 0
      ? Math.round((sliceResult.parvaleur / sliceResult.totalvaluee) * sheet.totals.value)
      : 0;
    const pdfB64 = await sheetToPdfB64(sheet.data, sheetTotalPrice, sheetTotalDDP);
    if (pdfB64) {
      const pdfBytes = Uint8Array.from(atob(pdfB64), c => c.charCodeAt(0));
      files.push({ name: `${sheet.name}.pdf`, data: pdfBytes });
    }
    onProgress?.(i + 1, total);
  }
  return files;
}

// Download as a real folder using File System Access API (Chrome/Edge)
// Falls back to ZIP if not supported or user cancels
async function downloadToFolder(sliceResult, ref, onProgress) {
  const files = await buildAllFiles(sliceResult, ref, onProgress);

  // Try File System Access API — creates actual folder, no extraction needed
  if ('showDirectoryPicker' in window) {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const subDir = await dirHandle.getDirectoryHandle(ref, { create: true });
      for (const file of files) {
        const fh = await subDir.getFileHandle(file.name, { create: true });
        const writable = await fh.createWritable();
        await writable.write(file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data));
        await writable.close();
      }
      return { method: 'folder' };
    } catch (e) {
      if (e.name === 'AbortError') return { method: 'cancelled' };
      // fall through to ZIP on other errors
    }
  }

  // Fallback: ZIP
  const zip = new JSZip();
  const folder = zip.folder(ref);
  for (const file of files) folder.file(file.name, file.data);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${ref}.zip`);
  return { method: 'zip' };
}

// Safe base64 encoder that avoids call-stack overflow on large buffers
function toBase64(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

// Save all files directly into the LTA PARTAGE folder via backend
async function saveToFolder(sliceResult, folderPath, ref, onProgress) {
  const files = await buildAllFiles(sliceResult, ref, onProgress);

  const payload = files.map(f => ({
    name: f.name,
    contentB64: toBase64(f.data),
  }));

  const res = await fetch('http://localhost:3000/lta/save-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderPath, files: payload }),
  });
  return res.json();
}

async function downloadSummaryOnly(sliceResult) {
  const buf = await buildSummaryWorkbookBuffer(sliceResult);
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'summary_file.xlsx');
}

// ─── exchange rate ────────────────────────────────────────────────────────────

async function fetchExchangeRate(currency) {
  try {
    const res = await fetch(`http://localhost:3000/exchange-rate?from=${currency}`);
    if (!res.ok) throw new Error('non-ok');
    const data = await res.json();
    return data.rates?.MAD || null;
  } catch {
    return null;
  }
}

// ─── card initial state ───────────────────────────────────────────────────────

function makeCard(ref) {
  return {
    ref,
    status: 'idle',         // idle | loading | ready | processing | done | error
    manifestB64: null,
    manifestName: null,
    manifestSrcPath: null,
    pdfB64: null,
    pdfName: null,
    pdfBlobUrl: null,
    fret: '',
    currency: 'CNY',
    rate: null,
    rateFetching: false,
    madValue: null,
    sliceResult: null,
    error: null,
    blocage: false,
    blocageUsdRate: '',
    blocageHawbs: '',
  };
}

// ─── component ────────────────────────────────────────────────────────────────

export default function Acheminements() {
  const [partagePath, setPartagePath] = useState(
    () => localStorage.getItem('partagePath') || '',
  );
  const [ltaInput, setLtaInput] = useState('');
  const [cards, setCards] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null); // { card, done, total }
  const rateTimers = useRef({});

  // Persist path
  useEffect(() => {
    localStorage.setItem('partagePath', partagePath);
  }, [partagePath]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      cards.forEach(c => { if (c.pdfBlobUrl) URL.revokeObjectURL(c.pdfBlobUrl); });
    };
  }, []); // eslint-disable-line

  // ── bulk download ────────────────────────────────────────────────────────

  const handleBulkDownloadAll = async () => {
    const readyCards = cards.filter(c => c.sliceResult != null);
    if (!readyCards.length) return;
    try {
      setBulkDownloading(true);
      const pathRes = await fetch('http://localhost:3000/lta/desktop-path');
      const { desktopPath } = await pathRes.json();
      for (let i = 0; i < readyCards.length; i++) {
        const card = readyCards[i];
        setBulkProgress({ card: card.ref, done: i, total: readyCards.length, dumDone: 0, dumTotal: null });
        const folderPath = `${desktopPath}\\MAWB ${card.ref}`;
        const res = await fetch('http://localhost:3000/lta/generate-and-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sliceResult: card.sliceResult, ref: card.ref, folderPath, manifestSrcPath: card.manifestSrcPath, manifestName: card.manifestName }),
        });
        for await (const event of readSSE(res)) {
          if (event.type === 'progress') {
            setBulkProgress(prev => ({ ...prev, dumDone: event.done, dumTotal: event.total }));
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      }
    } catch (e) {
      alert(`Erreur: ${e.message}`);
    } finally {
      setBulkDownloading(false);
      setBulkProgress(null);
    }
  };

  // ── helpers ──────────────────────────────────────────────────────────────

  const updateCard = useCallback((ref, patch) => {
    setCards(prev => prev.map(c => c.ref === ref ? { ...c, ...patch } : c));
  }, []);

  // ── scan ─────────────────────────────────────────────────────────────────

  const handleScan = async () => {
    const refs = ltaInput
      .split(/[\n,]+/)
      .map(r => r.trim())
      .filter(Boolean);
    if (!refs.length) return;
    if (!partagePath) return alert('Veuillez renseigner le chemin PARTAGE.');

    setScanning(true);

    try {
      const res = await fetch('http://localhost:3000/lta/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partagePath, refs }),
      });
      const { results } = await res.json();

      const newCards = results.map(r => {
        const card = makeCard(r.ref);
        if (!r.found) {
          return { ...card, status: 'error', error: 'Dossier MAWB introuvable.' };
        }
        // Build blob URL from PDF base64
        let pdfBlobUrl = null;
        if (r.pdfB64) {
          const bytes = Uint8Array.from(atob(r.pdfB64), c => c.charCodeAt(0));
          const blob  = new Blob([bytes], { type: 'application/pdf' });
          pdfBlobUrl  = URL.createObjectURL(blob);
        }
        
        // Auto-fill currency and fret from extracted metadata (if available)
        const extractedCurrency = r.mawbCurrency || 'HKD';  // default to HKD
        const extractedFret = r.fretValue || '';
        
        return {
          ...card,
          status: 'ready',
          manifestB64: r.manifestB64,
          manifestName: r.manifestName,
          manifestSrcPath: r.manifestSrcPath || null,
          pdfB64: r.pdfB64,
          pdfName: r.pdfName,
          pdfBlobUrl,
          currency: extractedCurrency,
          fret: extractedFret,
        };
      });

      setCards(newCards);
      
      // Auto-fetch exchange rates for cards with extracted fret values
      setTimeout(() => {
        newCards.forEach(async (c) => {
          if (c.fret && !isNaN(parseFloat(c.fret)) && c.currency && /^[A-Z]{3}$/.test(c.currency)) {
            const rate = await fetchExchangeRate(c.currency);
            const mad = rate ? parseFloat(c.fret) * rate : null;
            updateCard(c.ref, { rate, madValue: mad });
          }
        });
      }, 100);
    } catch (err) {
      alert(`Erreur scan: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  // ── exchange rate (debounced per card) ───────────────────────────────────

  const handleFretChange = (ref, value, currency) => {
    updateCard(ref, { fret: value, rate: null, madValue: null });
    clearTimeout(rateTimers.current[ref]);
    if (!value || isNaN(parseFloat(value))) return;

    updateCard(ref, { rateFetching: true });
    rateTimers.current[ref] = setTimeout(async () => {
      const rate = await fetchExchangeRate(currency);
      const mad  = rate ? parseFloat(value) * rate : null;
      updateCard(ref, { rate, madValue: mad, rateFetching: false });
    }, 600);
  };

  const handleCurrencyChange = (ref, currency, currentFret) => {
    const upper = currency.toUpperCase().trim();
    updateCard(ref, { currency: upper, rate: null, madValue: null });
    clearTimeout(rateTimers.current[ref]);
    // only fetch when user has typed/selected a valid 3-letter ISO code
    if (!/^[A-Z]{3}$/.test(upper)) return;
    if (!currentFret || isNaN(parseFloat(currentFret))) return;

    updateCard(ref, { rateFetching: true });
    rateTimers.current[ref] = setTimeout(async () => {
      const rate = await fetchExchangeRate(upper);
      const mad  = rate ? parseFloat(currentFret) * rate : null;
      updateCard(ref, { rate, madValue: mad, rateFetching: false });
    }, 200);
  };

  // ── execute (slice) ──────────────────────────────────────────────────────

  const handleSliceAll = async () => {
    const pending = cards.filter(c => c.manifestB64 && c.status !== 'processing');
    for (const card of pending) {
      await handleExecute(card);
    }
  };

  const handleExecute = async (card) => {
    if (!card.manifestB64) return;
    if (!card.madValue && card.madValue !== 0) {
      return alert('Veuillez entrer la valeur Fret et attendre le taux de change.');
    }
    if (card.blocage) {
      // blocageUsdRate is optional — only validate if the user actually entered something
      if (card.blocageUsdRate && isNaN(parseFloat(card.blocageUsdRate))) {
        return alert('Mode BLOCAGE : taux USD→MAD invalide.');
      }
    }

    updateCard(card.ref, { status: 'processing', error: null });

    try {
      const bytes = Uint8Array.from(atob(card.manifestB64), c => c.charCodeAt(0));
      const exclusionWaybills = card.blocage
        ? card.blocageHawbs.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
        : [];
      const tauxusdOverride = card.blocage && card.blocageUsdRate ? parseFloat(card.blocageUsdRate) : null;
      const sliceResult = sliceManifest(bytes.buffer, card.madValue, exclusionWaybills, tauxusdOverride);
      updateCard(card.ref, { status: 'done', sliceResult });
    } catch (err) {
      updateCard(card.ref, { status: 'error', error: err.message });
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      {/* ── Config section ── */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Acheminements — Traitement LTA
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div>
            <Typography variant="small" className="mb-1 font-semibold text-blue-gray-700">
              Chemin dossier PARTAGE
            </Typography>
            <Input
              label="Ex: \\\\SERVER\\PARTAGE\\LTA"
              value={partagePath}
              onChange={e => setPartagePath(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Typography variant="small" className="mb-1 font-semibold text-blue-gray-700">
              Références LTA (une par ligne ou séparées par virgule)
            </Typography>
            <Textarea
              label="Ex: 89001234, 89001235"
              value={ltaInput}
              onChange={e => setLtaInput(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Button
              color="blue"
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-2"
            >
              {scanning && <Spinner className="h-4 w-4" />}
              {scanning ? 'Recherche...' : 'Charger les dossiers'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── LTA Cards ── */}
      {cards.map(card => (
        <LtaCard
          key={card.ref}
          card={card}
          partagePath={partagePath}
          onFretChange={(val) => handleFretChange(card.ref, val, card.currency)}
          onCurrencyChange={(cur) => handleCurrencyChange(card.ref, cur, card.fret)}
          onBlocageChange={(patch) => updateCard(card.ref, patch)}
          onExecute={() => handleExecute(card)}
        />
      ))}

      {/* ── Action Bar — bottom (visible once any manifest is loaded) ── */}
      {cards.some(c => c.manifestB64) && (
        <Card className="border border-blue-gray-100 shadow-sm sticky bottom-4">
          <CardBody className="flex flex-wrap items-center gap-3 py-4 px-6">
            <Button
              color="green"
              disabled={cards.some(c => c.status === 'processing')}
              onClick={handleSliceAll}
              className="flex items-center gap-2"
            >
              {cards.some(c => c.status === 'processing') && <Spinner className="h-4 w-4" />}
              {`▶ Découper tous (${cards.filter(c => c.manifestB64).length} LTA)`}
            </Button>
            {cards.some(c => c.sliceResult) && (
              <Button
                color="indigo"
                disabled={bulkDownloading}
                onClick={handleBulkDownloadAll}
                className="flex items-center gap-2"
              >
                {bulkDownloading && <Spinner className="h-4 w-4" />}
                {bulkDownloading
                  ? `${bulkProgress?.card ?? ''} — LTA ${(bulkProgress?.done ?? 0) + 1}/${bulkProgress?.total ?? '?'} · fichier ${bulkProgress?.dumDone ?? 0}/${bulkProgress?.dumTotal ?? '?'}…`
                  : `⬇ Enregistrer tout — Bureau/Canevas (${cards.filter(c => c.sliceResult).length} LTA)`}
              </Button>
            )}
            {cards.some(c => c.sliceResult) && !bulkDownloading && (
              <Typography variant="small" className="text-blue-gray-400 text-xs">
                Enregistre dans Bureau\Canevas\MAWB &lt;réf&gt;\
              </Typography>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ─── LTA Card sub-component ───────────────────────────────────────────────────

function LtaCard({ card, onFretChange, onCurrencyChange, onExecute, onBlocageChange, partagePath }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingIdx, setDownloadingIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { saved, errors }
  const [progress, setProgress] = useState(null); // { done, total }

  const handleDownloadAll = async () => {
    if (!card.sliceResult) return;
    setDownloading(true);
    setProgress(null);
    try {
      await downloadToFolder(card.sliceResult, card.ref, (done, total) => setProgress({ done, total }));
    } finally {
      setDownloading(false);
      setProgress(null);
    }
  };

  const handleDownloadSummary = async () => {
    if (!card.sliceResult) return;
    setDownloading(true);
    try {
      await downloadSummaryOnly(card.sliceResult);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToFolder = async () => {
    if (!card.sliceResult || !partagePath) return;
    const folderPath = partagePath.replace(/[\\/]+$/, '') + '\\MAWB ' + card.ref;
    setSaving(true);
    setSaveResult(null);
    setProgress(null);
    try {
      const res = await fetch('http://localhost:3000/lta/generate-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliceResult: card.sliceResult, ref: card.ref, folderPath, manifestSrcPath: card.manifestSrcPath, manifestName: card.manifestName }),
      });
      let result = null;
      for await (const event of readSSE(res)) {
        if (event.type === 'progress') {
          setProgress({ done: event.done, total: event.total });
        } else if (event.type === 'done') {
          result = event;
        } else if (event.type === 'error') {
          throw new Error(event.message);
        }
      }
      setSaveResult(result);
    } catch (e) {
      setSaveResult({ saved: [], errors: [{ name: '—', error: e.message }] });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const handleDownloadSheet = async (sheetData, sheetName, idx) => {
    setDownloadingIdx(idx);
    try {
      await downloadSingleSheet(sheetData, sheetName);
    } finally {
      setDownloadingIdx(null);
    }
  };

  const statusColor = {
    idle: 'blue-gray',
    loading: 'amber',
    ready: 'blue',
    processing: 'amber',
    done: 'green',
    error: 'red',
  }[card.status] || 'blue-gray';

  const statusLabel = {
    idle: 'En attente',
    loading: 'Chargement...',
    ready: 'Prêt',
    processing: 'Traitement...',
    done: 'Terminé',
    error: 'Erreur',
  }[card.status] || card.status;

  return (
    <Card className="border border-blue-gray-100">
      <CardBody className="flex flex-col gap-3 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <Typography variant="h6" color="blue-gray">
            LTA — {card.ref}
          </Typography>
          <Chip value={statusLabel} color={statusColor} size="sm" variant="ghost" />
        </div>

        {card.status === 'error' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {card.error}
          </div>
        )}

        {(card.status === 'ready' || card.status === 'done') && (
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 3fr' }}>
            {/* ── LEFT column: converter + results ── */}
            <div className="flex flex-col gap-4">
              {/* Manifest info */}
              <Typography variant="small" className="text-blue-gray-500">
                Manifest : {card.manifestName ?? '—'}
              </Typography>

              {/* Fret + Currency — stacked vertically */}
              <div className="flex flex-col gap-3">
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-blue-gray-600">
                    Valeur Fret
                  </Typography>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={card.fret}
                    onChange={e => onFretChange(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-blue-gray-300 px-3 py-2 text-sm text-blue-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Typography variant="small" className="mb-1 font-medium text-blue-gray-600">
                    Devise
                  </Typography>
                  <input
                    type="text"
                    value={card.currency}
                    onChange={e => onCurrencyChange(e.target.value)}
                    placeholder="CNY"
                    maxLength={3}
                    className="w-full rounded-lg border border-blue-gray-300 px-3 py-2 text-sm text-blue-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white uppercase"
                  />
                </div>

                {/* BLOCAGE toggle */}
                {card.status !== 'done' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={card.blocage}
                      onChange={e => onBlocageChange({ blocage: e.target.checked })}
                      className="h-4 w-4 rounded border-blue-gray-400 accent-red-600"
                    />
                    <span className="text-sm font-semibold text-red-700">Mode BLOCAGE</span>
                  </label>
                )}

                {/* BLOCAGE inputs — only shown when checked */}
                {card.blocage && card.status !== 'done' && (
                  <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div>
                      <Typography variant="small" className="mb-1 font-medium text-red-700">
                        Taux USD → MAD (Badr) <span className="font-normal text-red-400">(optionnel)</span>
                      </Typography>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={card.blocageUsdRate}
                        onChange={e => onBlocageChange({ blocageUsdRate: e.target.value })}
                        placeholder="Ex : 10.12"
                        className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-blue-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400 bg-white"
                      />
                    </div>
                    <div>
                      <Typography variant="small" className="mb-1 font-medium text-red-700">
                        HAWB bloqués (un par ligne)
                      </Typography>
                      <textarea
                        rows={5}
                        value={card.blocageHawbs}
                        onChange={e => onBlocageChange({ blocageHawbs: e.target.value })}
                        placeholder={"MA052205392R\nMA052190902R\nMA052198716R"}
                        className="w-full rounded-lg border border-red-300 px-3 py-2 text-xs font-mono text-blue-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400 bg-white resize-y"
                      />
                      {card.blocageHawbs && (
                        <p className="mt-1 text-xs text-red-600">
                          {card.blocageHawbs.split(/[\n,]+/).filter(s => s.trim()).length} HAWB(s) saisis
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Live rate */}
              <div className="text-sm">
                {card.rateFetching && (
                  <span className="flex items-center gap-1 text-blue-gray-500">
                    <Spinner className="h-3 w-3" /> Chargement du taux...
                  </span>
                )}
                {!card.rateFetching && card.rate != null && (
                  <span className="text-blue-gray-700">
                    1 {card.currency} = {card.rate.toFixed(4)} MAD
                    {card.madValue != null && (
                      <span className="ml-3 font-bold text-blue-800">
                        → {card.madValue.toFixed(2)} MAD
                      </span>
                    )}
                  </span>
                )}
                {!card.rateFetching && card.rate == null && card.fret && (
                  <span className="text-red-500">Taux indisponible</span>
                )}
              </div>

              {/* Execute button */}
              {card.status !== 'done' && (
                <Button
                  color="green"
                  size="sm"
                  onClick={onExecute}
                  disabled={card.status === 'processing' || !card.madValue}
                  className="flex items-center gap-2 w-fit"
                >
                  {card.status === 'processing' && <Spinner className="h-4 w-4" />}
                  {card.status === 'processing' ? 'Traitement...' : 'Exécuter le découpage'}
                </Button>
              )}

              {/* Download section — shown after slice */}
              {card.status === 'done' && card.sliceResult && (
                <div className="flex flex-col gap-3 border-t border-blue-gray-100 pt-3">
                  <Typography variant="small" className="font-semibold text-blue-gray-700">
                    Téléchargements — {card.sliceResult.sheets.length} feuille(s)
                    {card.sliceResult.missingNGP?.length > 0 && (
                      <span className="ml-2 text-orange-600">
                        ⚠ {card.sliceResult.missingNGP.length} NGP manquant(s)
                      </span>
                    )}
                  </Typography>

                  {/* Per-sheet buttons */}
                  <div className="flex flex-wrap gap-2">
                    {card.sliceResult.sheets
                      .filter(sheet => sheet.name !== 'GLOBAL')
                      .map((sheet, idx) => (
                      <Button
                        key={sheet.name}
                        size="sm"
                        variant="outlined"
                        color="blue"
                        disabled={downloadingIdx === idx}
                        onClick={() => handleDownloadSheet(sheet.data, sheet.name, idx)}
                        className="flex items-center gap-1"
                      >
                        {downloadingIdx === idx && <Spinner className="h-3 w-3" />}
                        {sheet.name} ↓
                      </Button>
                    ))}
                  </div>

                  {/* Bulk action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      color="blue-gray"
                      disabled={downloading}
                      onClick={handleDownloadAll}
                      className="flex items-center gap-2"
                    >
                      {downloading && <Spinner className="h-4 w-4" />}
                      {downloading && progress
                        ? `ZIP en cours… (${progress.done}/${progress.total})`
                        : 'Tout télécharger (.zip)'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="blue-gray"
                      disabled={downloading || saving}
                      onClick={handleDownloadSummary}
                    >
                      Résumé uniquement
                    </Button>
                    <Button
                      size="sm"
                      color="teal"
                      disabled={saving || downloading}
                      onClick={handleSaveToFolder}
                      className="flex items-center gap-2"
                    >
                      {saving && <Spinner className="h-4 w-4" />}
                      {saving && progress
                        ? `Sauvegarde… (${progress.done}/${progress.total})`
                        : 'Sauvegarder dans dossier'}
                    </Button>
                  </div>

                  {/* Save result feedback */}
                  {saveResult && (
                    <div className={`rounded-lg p-3 text-sm border ${
                      saveResult.errors?.length
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      {saveResult.saved?.length > 0 && (
                        <div>✓ {saveResult.saved.length} fichier(s) sauvegardé(s) dans le dossier LTA</div>
                      )}
                      {saveResult.errors?.map((e, i) => (
                        <div key={i}>✗ {e.name}: {e.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT column: PDF preview ── */}
            <div className="flex flex-col gap-1">
              {card.pdfBlobUrl ? (
                <>
                  <Typography variant="small" className="font-semibold text-blue-gray-700">
                    Aperçu MAWB — {card.pdfName}
                  </Typography>
                  <iframe
                    src={card.pdfBlobUrl}
                    title={`MAWB PDF ${card.ref}`}
                    className="w-full rounded border border-blue-gray-200"
                    style={{ height: '620px' }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-40 rounded border border-dashed border-blue-gray-200 text-blue-gray-400 text-sm">
                  Pas d'aperçu disponible
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
