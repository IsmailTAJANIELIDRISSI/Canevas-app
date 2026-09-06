require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const ExcelJS = require("exceljs");
const { convertExcelToPdf } = require("./converter");

const app = express();
const PORT = 3000;
const PDFDocument = require("pdfkit");

const filePath = "../tyaybi_front/src/pages/dashboard/clients/bddngp.json";
const filePath2 = "../taibi_front/src/pages/dashboard/clients/num.json";
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
const consoFontPath = path.join(__dirname, "fonts", "Consolas.ttf"); // Update this path as necessary

// ─── Daily MAWB extraction logs (grouped by LTA reference) ───────────────────
const LOGS_DIR = path.join(__dirname, "logs");
fs.mkdirSync(LOGS_DIR, { recursive: true });

function dailyLogFileName() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}.logs`;
}

function appendLtaLog(ref, lines) {
  if (!lines.length) return;
  const filePath = path.join(LOGS_DIR, dailyLogFileName());
  const timestamp = new Date().toISOString();
  const block = `\n[${timestamp}] LTA ref ${ref} :\n${lines.join("\n")}\n`;
  fs.appendFileSync(filePath, block);
}

// Configure multer to handle file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xls" && ext !== ".xlsx") {
      return cb(new Error("Only Excel files are allowed"));
    }
    cb(null, true);
  },
});

// Upload and convert Excel to PDF
app.post("/upload", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file was uploaded.");
    }

    // Log the uploaded file information

    // Extract totalPrice and totalDDP from the request body
    const { totalPrice, totalDDP } = req.body;

    // Validate totalPrice and totalDDP
    if (!totalPrice || !totalDDP) {
      return res.status(400).send("Total price and total DDP are required.");
    }

    // Call function to convert uploaded Excel file to PDF
    const pdfBuffer = await convertExcelToPdf(
      req.file.path,
      totalPrice,
      totalDDP,
    );

    // Remove the uploaded Excel file after conversion
    fs.unlinkSync(req.file.path);

    // Set content type and send the PDF as attachment
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="output.pdf"');
    res.send(Buffer.from(pdfBuffer, "binary"));
  } catch (error) {
    console.error("Error converting Excel to PDF:", error.message); // Log the error message
    res.status(500).send(`Error converting Excel to PDF: ${error.message}`);
  }
});

// CRUD operations on JSON data
app.get("/data", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
    } else {
      try {
        const jsonData = JSON.parse(data);
        const limitedData = jsonData.Feuil1.slice(0, 100000000000); // Adjust to your data structure
        res.send(limitedData);
      } catch (error) {
        res.status(500).send("Error parsing JSON data");
      }
    }
  });
});

// Filter duplicates by Désignation commerciale (case insensitive)
app.get("/data/filterDuplicates", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      return res.status(500).send("Error parsing JSON data");
    }

    const designationMap = new Map();

    jsonData.Feuil1.forEach((item) => {
      const designationLower = item["Désignation commerciale"]?.toLowerCase();
      if (designationLower) {
        if (designationMap.has(designationLower)) {
          designationMap.get(designationLower).push(item);
        } else {
          designationMap.set(designationLower, [item]);
        }
      }
    });

    const duplicateItems = [];
    designationMap.forEach((items) => {
      if (items.length > 1) {
        duplicateItems.push(...items);
      }
    });

    res.send(duplicateItems);
  });
});

app.post("/data", (req, res) => {
  const newItem = req.body;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      return res.status(500).send("Error parsing JSON data");
    }

    jsonData.Feuil1.push(newItem);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).send("Error writing file");
      }

      res.send("File updated successfully");
    });
  });
});

app.delete("/data", (req, res) => {
  fs.writeFile(
    filePath,
    JSON.stringify({ Feuil1: [] }, null, 2),
    "utf8",
    (err) => {
      if (err) {
        res.status(500).send("Error clearing file");
      } else {
        res.send("File cleared successfully");
      }
    },
  );
});

app.get("/data/filter", (req, res) => {
  const { designationCommerciale } = req.query;

  if (!designationCommerciale) {
    return res
      .status(400)
      .send("designationCommerciale query parameter is required");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (error) {
      return res.status(500).send("Error parsing JSON data");
    }

    const filteredData = jsonData.Feuil1.filter(
      (item) =>
        item["Désignation commerciale"] &&
        item["Désignation commerciale"]
          .toLowerCase()
          .includes(designationCommerciale.toLowerCase()),
    );

    res.send(filteredData);
  });
});

app.delete("/data/delete", (req, res) => {
  const { designationCommerciale, codeNGP } = req.body;

  if (!designationCommerciale || !codeNGP) {
    return res
      .status(400)
      .send("Both designationCommerciale and codeNGP fields are required");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let jsonData = JSON.parse(data);
    const originalLength = jsonData.Feuil1.length;
    jsonData.Feuil1 = jsonData.Feuil1.filter(
      (item) =>
        !(
          item["Désignation commerciale"] === designationCommerciale &&
          item["Code NGP(à 10 chiffres)"] === parseInt(codeNGP)
        ),
    );

    if (jsonData.Feuil1.length === originalLength) {
      return res.status(404).send("No matching entry found");
    }

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).send("Error writing file");
      }

      res.send("Entry deleted successfully");
    });
  });
});

app.put("/data/update", (req, res) => {
  const { designationCommerciale, codeNGP, updatedData } = req.body;

  if (!designationCommerciale || !codeNGP || !updatedData) {
    return res
      .status(400)
      .send(
        "Both designationCommerciale, codeNGP and updatedData fields are required",
      );
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    let jsonData = JSON.parse(data);
    let entryFound = false;

    jsonData.Feuil1 = jsonData.Feuil1.map((item) => {
      if (
        item["Désignation commerciale"] === designationCommerciale &&
        item["Code NGP(à 10 chiffres)"] === parseInt(codeNGP)
      ) {
        entryFound = true;
        return updatedData;
      }
      return item;
    });

    if (!entryFound) {
      return res.status(404).send("No matching entry found to update");
    }

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).send("Error writing file");
      }

      res.send("Entry updated successfully");
    });
  });
});
app.post("/uploadJsonData", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file was uploaded.");
    }

    // Read the Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0]; // Assuming data is in the first sheet

    const newRows = [];
    worksheet.eachRow((row, rowNumber) => {
      const [designationCommerciale, codeNGP] = row.values.slice(1); // Skip the first empty cell
      if (designationCommerciale && codeNGP) {
        newRows.push({
          "Désignation commerciale": designationCommerciale,
          "Code NGP(à 10 chiffres)": parseInt(codeNGP),
        });
      }
    });

    // Read the existing JSON file
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    jsonData.Feuil1.push(...newRows);

    // Write the updated JSON data back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");

    // Remove the uploaded Excel file
    fs.unlinkSync(req.file.path);

    res.send("Excel data successfully added to JSON file");
  } catch (error) {
    console.error("Error processing Excel file:", error.message); // Log the error message
    res.status(500).send(`Error processing Excel file: ${error.message}`);
  }
});
// Exchange rate proxy (avoids CORS when fetching from browser)
// Priority: 1) BAM (Bank Al-Maghrib, official ADII rate)
//           2) frankfurter.dev blended (covers most major currencies)
//           3) openexchangerates.org cross-rate via USD (covers everything else)
const OXR_APP_ID = "2da90db00995499ea8ff537a94caf80c";
app.get("/exchange-rate", async (req, res) => {
  const { from } = req.query;
  if (!from) return res.status(400).json({ error: "from is required" });
  const currency = from.toUpperCase().trim();
  try {
    const base = encodeURIComponent(currency);

    // 1st attempt: BAM (official Moroccan customs rate)
    let r = await fetch(
      `https://api.frankfurter.dev/v2/rate/${base}/MAD?providers=BAM`,
    );
    let data = r.ok ? await r.json() : null;
    if (data?.rate) return res.json({ rates: { MAD: data.rate } });

    // 2nd attempt: frankfurter.dev blended
    r = await fetch(`https://api.frankfurter.dev/v2/rate/${base}/MAD`);
    data = r.ok ? await r.json() : null;
    if (data?.rate) return res.json({ rates: { MAD: data.rate } });

    // 3rd attempt: openexchangerates.org cross-rate (USD base → FROM + MAD)
    r = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${OXR_APP_ID}&symbols=${encodeURIComponent(currency)},MAD`,
    );
    if (r.ok) {
      const oxr = await r.json();
      const fromRate = oxr.rates?.[currency];
      const madRate = oxr.rates?.MAD;
      if (fromRate && madRate) {
        return res.json({ rates: { MAD: madRate / fromRate } });
      }
    }

    res.status(502).json({ error: `MAD rate not found for ${currency}` });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ─── MAWB PDF Metadata Extraction ─────────────────────────────────────────────

const GEMINI_MODEL_FALLBACKS = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash", "gemini-2.0-flash"];

const KNOWN_CURRENCY_RE =
  /\b(CNY|USD|HKD|EUR|GBP|JPY|CHF|SGD|AUD|CAD|MYR|THB|AED|SAR|KWD|QAR|TWD|NZD|ZAR)\b/i;

/**
 * Extract currency and total prepaid from PDF text (best-effort regex).
 * Returns { mawbCurrency: string|null, fretValue: string|null }
 */
function extractMetaFromPdfText(text) {
  let mawbCurrency = null;
  let fretValue = null;

  // Currency: look near "Currency" label or anywhere in text
  const currencyLabelIdx = text.search(/\bcurrency\b/i);
  const searchWindow =
    currencyLabelIdx >= 0
      ? text.slice(currencyLabelIdx, currencyLabelIdx + 120)
      : text;
  const codeMatch = searchWindow.match(KNOWN_CURRENCY_RE);
  if (codeMatch) {
    mawbCurrency = codeMatch[1].toUpperCase();
  }

  // Total Prepaid: label followed by decimal number
  // Matches: "Total Prepaid 12345.67" or "Total Prepaid\n12345.67"
  const prepaidMatch = text.match(
    /total\s+prepaid[^\n]{0,80}\n?[^\n]{0,40}?(\d[\d ,.]*\.\d{2})/i,
  );
  if (prepaidMatch) {
    // Strip spaces and commas
    fretValue = prepaidMatch[1].replace(/[\s,]/g, "");
  }

  return { mawbCurrency, fretValue };
}

// ── Gemini retry helpers ──────────────────────────────────────────────────────

const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_DEFAULT_RETRY_MS = 5000;
const GEMINI_MAX_RETRY_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini 429 errors include "retryDelay":"21.2s" (or "Please retry in 21.2s") —
// extract that so we wait roughly as long as Google asks (plus a small buffer),
// but cap it at GEMINI_MAX_RETRY_MS so a single LTA doesn't stall the scan too long.
function parseGeminiRetryDelayMs(message) {
  const m =
    String(message).match(/retryDelay["\s:]+(\d+(?:\.\d+)?)s/i) ||
    String(message).match(/retry in (\d+(?:\.\d+)?)s/i);
  if (!m) return null;
  return Math.min(Math.ceil(parseFloat(m[1]) * 1000) + 1000, GEMINI_MAX_RETRY_MS);
}

// 429 (quota) and 503 (overloaded) are transient — worth retrying after a delay.
function isRetryableGeminiError(message) {
  return /RESOURCE_EXHAUSTED|UNAVAILABLE|429|503/.test(String(message));
}

/**
 * Gemini Vision fallback — sends the raw PDF bytes to Gemini and asks for
 * currency + total prepaid only. Used when regex extraction couldn't find
 * one or both fields (scanned PDF or layout pdf-parse couldn't flatten).
 * Retries each model up to GEMINI_MAX_ATTEMPTS times on 429/503 errors,
 * waiting the delay Google requests (or a default backoff) between tries.
 * Returns { mawbCurrency, fretValue } — either may be null.
 */
async function supplementCurrencyFretViaVision(pdfBuffer, log = console.log) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    log("[mawb-extract] GEMINI_API_KEY absent — skipping vision fallback");
    return { mawbCurrency: null, fretValue: null };
  }

  let genai;
  try {
    genai = require("@google/genai");
  } catch {
    log("[mawb-extract] @google/genai not installed — skipping vision fallback");
    return { mawbCurrency: null, fretValue: null };
  }

  // Safety net: a real one-page MAWB is small (well under 1 MB). Anything
  // large is a manifest/multi-page doc that would overflow Gemini's token
  // limit — skip it rather than burn quota on guaranteed failures.
  const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB
  if (pdfBuffer.length > MAX_PDF_BYTES) {
    log(`[mawb-extract] PDF too large for vision (${(pdfBuffer.length / 1048576).toFixed(1)} MB > 4 MB) — skipping vision fallback`);
    return { mawbCurrency: null, fretValue: null };
  }

  const client = new genai.GoogleGenAI({ apiKey });
  const pdfBase64 = pdfBuffer.toString("base64");

  const prompt = `This is an Air Waybill (MAWB). Extract exactly two values:
1. CURRENCY — the 3-letter ISO code in the "Currency" column (e.g. CNY, USD, TWD, HKD).
2. TOTAL PREPAID — the numeric amount in the "Total Prepaid" box at the bottom of the form.
   STRICT RULES for the number:
   - Strip any currency code prefix (e.g. "TWD575,770.00" -> "575770.00").
   - Remove ALL thousands-separator commas (e.g. "575,770.00" -> "575770.00").
   - KEEP the decimal point and exactly 2 decimal places (e.g. "575770.00", NOT "57577000").
   - If the box is blank or shows zero, return null.

Respond ONLY in this exact JSON (no markdown):
{"currency": "TWD", "total_prepaid": "575770.00"}`;

  for (const modelName of GEMINI_MODEL_FALLBACKS) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
      try {
        log(`[mawb-extract] calling Gemini Vision (${modelName}), attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}...`);
        const response = await client.models.generateContent({
          model: modelName,
          contents: [
            {
              parts: [
                { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
                { text: prompt },
              ],
            },
          ],
        });

        let responseText = "";
        if (response && typeof response.text === "string" && response.text) {
          responseText = response.text;
        } else if (response?.candidates?.[0]?.content?.parts) {
          responseText = response.candidates[0].content.parts
            .filter((p) => !p.thought)
            .map((p) => p.text || "")
            .join("\n");
        }

        responseText = responseText.trim();
        log(`[mawb-extract] Gemini ${modelName} raw response: ${responseText.slice(0, 300)}`);
        if (responseText.startsWith("```")) {
          const start = responseText.indexOf("{");
          const end = responseText.lastIndexOf("}") + 1;
          responseText = start !== -1 ? responseText.slice(start, end) : responseText;
        }

        const parsed = JSON.parse(responseText);
        let fretValue = parsed.total_prepaid != null ? String(parsed.total_prepaid).replace(/,/g, "") : null;
        // Guard against Gemini dropping the decimal point (e.g. "57577000" instead of "575770.00")
        if (fretValue && /^\d+$/.test(fretValue) && fretValue.length >= 5) {
          fretValue = `${fretValue.slice(0, -2)}.${fretValue.slice(-2)}`;
        }

        log(`[mawb-extract] Gemini ${modelName} parsed: currency=${parsed.currency ?? "null"} total_prepaid=${fretValue ?? "null"}`);
        return {
          mawbCurrency: parsed.currency || null,
          fretValue: fretValue || null,
        };
      } catch (e) {
        log(`[mawb-extract] Gemini ${modelName} attempt ${attempt}/${GEMINI_MAX_ATTEMPTS} failed: ${e.message}`);
        if (attempt < GEMINI_MAX_ATTEMPTS && isRetryableGeminiError(e.message)) {
          const delayMs = parseGeminiRetryDelayMs(e.message) ?? GEMINI_DEFAULT_RETRY_MS * attempt;
          log(`[mawb-extract] waiting ${Math.round(delayMs / 1000)}s before retrying ${modelName}...`);
          await sleep(delayMs);
          continue;
        }
        break; // give up on this model, try the next fallback
      }
    }
  }

  return { mawbCurrency: null, fretValue: null };
}

/**
 * Extract currency + fret from MAWB PDF (accepts base64 or buffer).
 * Returns { mawbCurrency, fretValue, method } — any field may be null.
 */
async function extractMawbMeta(pdfInput, log = console.log) {
  const { PDFParse } = require("pdf-parse");

  // Convert base64 to buffer if needed
  const buf = Buffer.isBuffer(pdfInput)
    ? pdfInput
    : Buffer.from(pdfInput, "base64");

  let mawbCurrency = null;
  let fretValue = null;
  let method = "text-extraction";

  try {
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    await parser.destroy();
    const text = String(result.text || "");
    const textLen = text.replace(/\s/g, "").length;
    log(`[mawb-extract] pdf-parse extracted ${text.length} chars (${textLen} non-whitespace)`);

    if (textLen < 50) {
      method = "scanned-pdf";
      log("[mawb-extract] looks like a scanned PDF (< 50 non-whitespace chars)");
    } else {
      ({ mawbCurrency, fretValue } = extractMetaFromPdfText(text));
      log(`[mawb-extract] regex result: currency=${mawbCurrency ?? "null"} fret=${fretValue ?? "null"}`);
    }
  } catch (e) {
    log(`[mawb-extract] extractMawbMeta error: ${e.message}`);
    method = "error";
  }

  // Fall back to Gemini Vision if regex couldn't find one or both fields
  if (!mawbCurrency || !fretValue) {
    log(`[mawb-extract] missing field(s) (currency=${mawbCurrency ?? "null"}, fret=${fretValue ?? "null"}) — trying Gemini Vision`);
    const vision = await supplementCurrencyFretViaVision(buf, log);
    // Vision reads the actual Currency box; the regex only sees pdf-parse's
    // flattened text and can grab the wrong 3-letter code (e.g. AED before
    // the real HKD). So when Vision returns a currency, trust it over regex.
    if (vision.mawbCurrency) {
      if (mawbCurrency && mawbCurrency !== vision.mawbCurrency) {
        log(`[mawb-extract] currency override: regex=${mawbCurrency} → vision=${vision.mawbCurrency}`);
      }
      mawbCurrency = vision.mawbCurrency;
    }
    if (!fretValue && vision.fretValue) fretValue = vision.fretValue;
    if (vision.mawbCurrency || vision.fretValue) {
      method = method === "text-extraction" ? "text+vision" : "vision";
    }
  }

  log(`[mawb-extract] final: currency=${mawbCurrency ?? "null"} fret=${fretValue ?? "null"} method=${method}`);
  return { mawbCurrency, fretValue, method };
}

// Endpoint: extract currency + fret from uploaded PDF
app.post("/lta/extract-mawb-meta", async (req, res) => {
  const { pdfB64 } = req.body;
  if (!pdfB64) {
    return res.status(400).json({ error: "pdfB64 required" });
  }

  try {
    const result = await extractMawbMeta(pdfB64);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LTA PARTAGE scan endpoint
app.post("/lta/scan", async (req, res) => {
  const { partagePath, refs } = req.body;
  if (!partagePath || !refs || !Array.isArray(refs)) {
    return res
      .status(400)
      .json({ error: "partagePath and refs[] are required" });
  }

  const results = [];

  for (const ref of refs) {
    const trimmedRef = ref.trim();
    if (!trimmedRef) continue;

    // Search for folder matching "MAWB {ref}" (case-insensitive, ignoring spaces)
    // Searches partagePath directly first, then one level of subdirectories
    // (to support root paths like \\server\PARTAGE that contain type subfolders
    //  e.g. ALIEXPRESS/, TEMU HKG/, TEMU SPEEDAF/ each containing MAWB folders)
    let folderPath = null;
    function findMawbFolder(searchPath, targetKey) {
      try {
        const entries = fs.readdirSync(searchPath, { withFileTypes: true });
        const match = entries.find(
          (e) =>
            e.isDirectory() &&
            e.name.toLowerCase().replace(/\s+/g, "") === targetKey,
        );
        return match ? path.join(searchPath, match.name) : null;
      } catch {
        return null;
      }
    }
    try {
      const targetKey = `mawb${trimmedRef.toLowerCase().replace(/\s+/g, "")}`;
      // 1. Try direct children of partagePath
      folderPath = findMawbFolder(partagePath, targetKey);
      // 2. If not found, search one level deeper (type subfolders)
      if (!folderPath) {
        const topEntries = fs.readdirSync(partagePath, { withFileTypes: true });
        for (const entry of topEntries) {
          if (!entry.isDirectory()) continue;
          const subPath = path.join(partagePath, entry.name);
          folderPath = findMawbFolder(subPath, targetKey);
          if (folderPath) break;
        }
      }
    } catch (e) {
      results.push({
        ref: trimmedRef,
        found: false,
        error: "Cannot read PARTAGE folder: " + e.message,
      });
      continue;
    }

    if (!folderPath) {
      results.push({ ref: trimmedRef, found: false });
      continue;
    }

    try {
      const files = fs.readdirSync(folderPath);
      const xlsxFile = files.find((f) => /\.(xlsx|xls)$/i.test(f));

      // Classify PDFs: a "manifest" PDF is the big goods listing; the MAWB
      // (air waybill) is the one-page form that actually holds currency/fret.
      const isManifest = (f) => /manifest/i.test(f);
      const pdfFiles = files.filter((f) => /\.pdf$/i.test(f));
      const mawbPdf = pdfFiles.find((f) => !isManifest(f)) || null;
      // For preview/email use the real MAWB if present, otherwise any PDF.
      const pdfFile = mawbPdf || pdfFiles[0] || null;

      const manifestB64 = xlsxFile
        ? fs.readFileSync(path.join(folderPath, xlsxFile)).toString("base64")
        : null;
      const manifestSrcPath = xlsxFile ? path.join(folderPath, xlsxFile) : null;
      const pdfSrcPath = pdfFile ? path.join(folderPath, pdfFile) : null;
      const pdfB64 = pdfFile
        ? fs.readFileSync(path.join(folderPath, pdfFile)).toString("base64")
        : null;

      // Extract currency + fret — ONLY from a real MAWB air waybill, never the
      // manifest (huge, and it doesn't contain the air-waybill totals anyway).
      let mawbCurrency = null, fretValue = null;
      const logLines = [];
      const log = (msg) => {
        console.log(msg);
        logLines.push(msg);
      };
      if (mawbPdf) {
        const extractB64 = fs.readFileSync(path.join(folderPath, mawbPdf)).toString("base64");
        log(`[mawb-extract] === LTA ${trimmedRef} — extracting from "${mawbPdf}" ===`);
        try {
          const meta = await extractMawbMeta(extractB64, log);
          mawbCurrency = meta.mawbCurrency;
          fretValue = meta.fretValue;
        } catch (e) {
          log(`[mawb-extract] LTA ${trimmedRef} extraction threw: ${e.message}`);
        }
      } else if (pdfFile) {
        log(`[mawb-extract] === LTA ${trimmedRef} — only a manifest PDF ("${pdfFile}") found, no MAWB air waybill; skipping extraction (enter fret/devise manually) ===`);
      } else {
        log(`[mawb-extract] === LTA ${trimmedRef} — no PDF found in folder ===`);
      }
      appendLtaLog(trimmedRef, logLines);

      // Warnings so the UI can tell the user what's missing
      const warnings = [];
      // Missing manifest Excel is critical — the DUM slicing needs it.
      if (!xlsxFile) {
        warnings.push(
          `Aucun manifeste Excel (.xlsx) dans le dossier${mawbPdf ? " (le MAWB PDF existe)" : ""}. Le découpage est impossible sans le manifeste.`,
        );
      }
      if (!pdfFile) {
        warnings.push("Aucun PDF dans le dossier.");
      } else if (!mawbPdf) {
        warnings.push(
          `Aucun MAWB (LTA) trouvé — seulement le manifeste "${pdfFile}". Saisissez le fret et la devise manuellement.`,
        );
      }
      const warning = warnings.length ? warnings.join(" ") : null;

      results.push({
        ref: trimmedRef,
        found: true,
        manifestB64,
        manifestName: xlsxFile || null,
        manifestSrcPath,
        manifestMissing: !xlsxFile,
        pdfSrcPath,
        pdfB64,
        pdfName: pdfFile || null,
        mawbMissing: !mawbPdf,
        warning,
        mawbCurrency,
        fretValue,
      });
    } catch (e) {
      results.push({
        ref: trimmedRef,
        found: true,
        error: "Error reading folder files: " + e.message,
      });
    }
  }

  res.json({ results });
});

// ─── Helpers (ported from frontend acheminements logic) ──────────────────────

const THIN_BORDER_XL = {
  top: { style: "thin", color: { argb: "000000" } },
  left: { style: "thin", color: { argb: "000000" } },
  bottom: { style: "thin", color: { argb: "000000" } },
  right: { style: "thin", color: { argb: "000000" } },
};

function autoWidthXL(worksheet) {
  worksheet.columns.forEach((col) => {
    let max = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const w = cell.value ? cell.value.toString().length : 6;
      if (w > max) max = w;
    });
    col.width = max < 20 ? 20 : max;
  });
}

function styleSheetXL(worksheet) {
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = { bold: rowNumber === 1, size: rowNumber === 1 ? 12 : 10 };
      cell.alignment = { horizontal: "center", vertical: "center" };
      cell.border = THIN_BORDER_XL;
    });
  });
}

function addSheetToWorkbookXL(workbook, sheetData, sheetName) {
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", xSplit: 0, ySplit: 1 }],
  });
  ws.addRow(sheetData[0].slice(0, 20));
  for (let i = 1; i < sheetData.length - 1; i++) {
    ws.addRow([
      sheetData[i][0],
      sheetData[i][1],
      sheetData[i][2],
      sheetData[i][3],
      sheetData[i][4],
      sheetData[i][5],
      sheetData[i][6],
      sheetData[i][7],
      sheetData[i][8],
      sheetData[i][9],
      sheetData[i][10],
      sheetData[i][11],
      sheetData[i][12],
      sheetData[i][13],
      sheetData[i][14],
      sheetData[i][15],
      sheetData[i][16],
      sheetData[i][17],
      sheetData[i][18],
      sheetData[i][18],
    ]);
  }
  styleSheetXL(ws);
  autoWidthXL(ws);
}

function buildSummaryDataXL(sliceResult) {
  const { sheets, mawbValue, parvaleur, poidbrut, position } = sliceResult;
  const totalPoidNet = sheets[0].totals.weight;
  const totalValeur = sheets[0].totals.value;

  const summaryData = [
    [
      "Sheet Name",
      "Total Pieces",
      "Total Value",
      "Total poid net",
      "Total poid brute",
      "Total freight",
      "total position",
      "Assurance",
      "Carton",
    ],
  ];

  sheets.forEach((sheet, index) => {
    const uniqueCartons = new Set();
    sheet.data.forEach((row, idx) => {
      if (idx > 0 && row[20]) uniqueCartons.add(row[20]);
    });
    const uniqueWaybills = new Set(
      sheet.data
        .slice(1)
        .map((row) =>
          typeof row[4] === "string"
            ? row[4].replace(mawbValue + " ", "").trim()
            : "",
        )
        .filter((v) => v !== ""),
    );
    const uniqueWaybillCount = index === 0 ? position : uniqueWaybills.size;
    const w = sheet.totals.weight;
    const w1 =
      index === 0
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

  // Adjust last sheet so totals are exact
  const adjust = (col) => {
    const total = parseFloat(summaryData[1][col]);
    const roundedSum = summaryData
      .slice(2, -1)
      .reduce((a, r) => a + parseFloat(r[col]), 0);
    summaryData[summaryData.length - 1][col] = total - roundedSum;
  };
  const adjustBrute = (col) => {
    const total = parseFloat(summaryData[1][col]);
    const roundedSum = summaryData
      .slice(2, -1)
      .reduce((a, r) => a + parseFloat(r[col]), 0);
    summaryData[summaryData.length - 1][col] = parseFloat(
      (total - roundedSum).toFixed(2),
    );
  };
  if (summaryData.length > 2) {
    adjust(2);
    adjust(3);
    adjustBrute(4);
    adjust(5);
    adjust(6);
    adjust(7);
    adjust(8);
  }
  return summaryData;
}

async function buildSummaryWorkbookXL(sliceResult) {
  const summaryData = buildSummaryDataXL(sliceResult);
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Summary", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 1 }],
  });
  ws.addRows(summaryData);
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell((cell) => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { horizontal: "center", vertical: "center" };
      cell.border = THIN_BORDER_XL;
    });
  });
  autoWidthXL(ws);
  return workbook.xlsx.writeBuffer();
}

async function buildGeneratedExcelXL(sliceResult, ref) {
  const summaryData = buildSummaryDataXL(sliceResult);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Summary");
  const border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  const addSep = (row) => {
    worksheet.mergeCells(`A${row}:F${row}`);
    worksheet.getCell(`A${row}`).border = { bottom: { style: "double" } };
  };

  const leftLabels = ["P", "V", "P,NET", "P,BRUT"];
  const rightLabels = ["Fret", "Ass", "N, COLIS"];
  const leftMap = { P: 6, V: 2, "P,NET": 3, "P,BRUT": 4 };
  const rightMap = { Fret: 5, Ass: 7, "N, COLIS": 8 };

  worksheet.mergeCells("C1");
  worksheet.getCell("C1").value = ref || "";
  worksheet.getCell("C1").border = border;
  worksheet.getCell("C1").font = { bold: true };

  leftLabels.forEach((lbl, i) => {
    worksheet.getCell(`A${i + 3}`).value = lbl;
    worksheet.getCell(`A${i + 3}`).border = border;
    worksheet.getCell(`A${i + 3}`).font = { bold: true };
    worksheet.getCell(`B${i + 3}`).value = summaryData[1][leftMap[lbl]];
    worksheet.getCell(`B${i + 3}`).border = border;
    worksheet.getCell(`B${i + 3}`).alignment = { horizontal: "right" };
  });
  rightLabels.forEach((lbl, i) => {
    worksheet.getCell(`E${i + 3}`).value = lbl;
    worksheet.getCell(`E${i + 3}`).border = border;
    worksheet.getCell(`E${i + 3}`).font = { bold: true };
    worksheet.getCell(`F${i + 3}`).value = summaryData[1][rightMap[lbl]];
    worksheet.getCell(`F${i + 3}`).border = border;
    worksheet.getCell(`F${i + 3}`).alignment = { horizontal: "right" };
  });
  worksheet.getCell("A8").value = "FOURNISSEUR";
  worksheet.getCell("A8").border = border;
  worksheet.getCell("A8").font = { bold: true };
  worksheet.mergeCells("B8:C8");
  worksheet.getCell("B8").border = border;
  worksheet.getCell("A9").value = "MANIFEST";
  worksheet.getCell("A9").border = border;
  worksheet.getCell("A9").font = { bold: true };
  worksheet.mergeCells("B9:C9");
  worksheet.getCell("B9").border = border;
  addSep(10);

  const dumSheets = sliceResult.sheets.filter((s) => s.name !== "GLOBAL");
  dumSheets.forEach((_, i) => {
    const rowStart = 11 + i * 7;
    const hasData = i + 2 < summaryData.length;
    const sd = hasData ? summaryData[i + 2] : null;

    worksheet.getCell(`C${rowStart}`).value = `DUM ${i + 1}`;
    worksheet.getCell(`C${rowStart}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getCell(`C${rowStart}`).border = border;
    worksheet.getCell(`C${rowStart}`).alignment = { horizontal: "center" };
    worksheet.getCell(`C${rowStart}`).font = { bold: true };

    leftLabels.forEach((lbl, idx) => {
      worksheet.getCell(`A${rowStart + idx + 1}`).value = lbl;
      worksheet.getCell(`A${rowStart + idx + 1}`).border = border;
      worksheet.getCell(`A${rowStart + idx + 1}`).font = { bold: true };
      worksheet.getCell(`B${rowStart + idx + 1}`).value = sd
        ? sd[leftMap[lbl]]
        : "";
      worksheet.getCell(`B${rowStart + idx + 1}`).border = border;
      worksheet.getCell(`B${rowStart + idx + 1}`).alignment = {
        horizontal: "right",
      };
    });
    rightLabels.forEach((lbl, idx) => {
      worksheet.getCell(`E${rowStart + idx + 1}`).value = lbl;
      worksheet.getCell(`E${rowStart + idx + 1}`).border = border;
      worksheet.getCell(`E${rowStart + idx + 1}`).font = { bold: true };
      worksheet.getCell(`F${rowStart + idx + 1}`).value = sd
        ? sd[rightMap[lbl]]
        : "";
      worksheet.getCell(`F${rowStart + idx + 1}`).border = border;
      worksheet.getCell(`F${rowStart + idx + 1}`).alignment = {
        horizontal: "right",
      };
    });
    worksheet.mergeCells(`C${rowStart + 1}:C${rowStart + 4}`);
    addSep(rowStart + 6);
  });

  worksheet.getColumn("A").width = 13;
  worksheet.getColumn("B").width = 9.5;
  worksheet.getColumn("C").width = 15;
  worksheet.getColumn("D").hidden = true;
  worksheet.getColumn("E").width = 8;
  worksheet.getColumn("F").width = 8;

  return workbook.xlsx.writeBuffer();
}

async function sheetRowsToPdf(rows, totalPrice, totalDDP) {
  const { PDFDocument, rgb } = require("pdf-lib");
  const fk = require("@pdf-lib/fontkit");
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fk);
  const fontBytes = fs.readFileSync(
    path.join(__dirname, "fonts", "NotoSans-Regular.ttf"),
  );
  const font = await pdfDoc.embedFont(fontBytes);

  // Match converter.js exactly (800×600, fontSize 2)
  // smallerWidthColumns from converter.js (1-indexed) → 0-indexed:
  // [1,2,3,4,8,9,10,11,12,13,14,15,16,17,18,20] → [0,1,2,3,7,8,9,10,11,12,13,14,15,16,17,19]
  const smallerColsSet = new Set([
    0, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19,
  ]);
  const defaultCellWidth = 50;
  const smallerCellWidth = 30;
  const fontSize = 2;
  const cellPadding = 2;
  const tableTopPadding = 20;
  const tableLeftPadding = 10;
  const headerRowHeight = 20;
  const dataRowHeight = fontSize + 2 * cellPadding;
  const spaceBetweenTableAndTotals = 20;
  const minimumSpaceForTotals = 30;
  const pageWidth = 800,
    pageHeight = 600;

  // Drop the appended totals row (last row) and HAWB column (last col, index 21)
  const dataRows = rows.slice(0, rows.length - 1).map((r) => r.slice(0, 21));
  const colWidths = (dataRows[0] || []).map((_, i) =>
    smallerColsSet.has(i) ? smallerCellWidth : defaultCellWidth,
  );

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - tableTopPadding;

  function truncate(text, maxWidth) {
    let t = text;
    while (
      t.length > 0 &&
      font.widthOfTextAtSize(t, fontSize) > maxWidth - 2 * cellPadding
    ) {
      t = t.slice(0, -1);
    }
    return t;
  }

  // Header row
  const headerRow = dataRows[0] || [];
  let xPos = tableLeftPadding;
  headerRow.forEach((cell, ci) => {
    const cellText = cell != null ? String(cell).trim() : "";
    const cellWidth = colWidths[ci] ?? smallerCellWidth;
    page.drawRectangle({
      x: xPos,
      y: y - headerRowHeight,
      width: cellWidth,
      height: headerRowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    const truncated = truncate(cellText, cellWidth);
    if (truncated) {
      const tw = font.widthOfTextAtSize(truncated, fontSize);
      page.drawText(truncated, {
        x: xPos + (cellWidth - tw) / 2,
        y: y - headerRowHeight + (headerRowHeight - fontSize) / 2,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
    xPos += cellWidth;
  });
  y -= headerRowHeight;

  // Data rows
  for (let ri = 1; ri < dataRows.length; ri++) {
    const row = dataRows[ri];
    let maxH = 0;
    let x = tableLeftPadding;
    row.forEach((cell, ci) => {
      // Falsy check matches converter.js: cell.value ? ... : ""
      // This means 0 renders as blank in PDF (same as old behavior)
      const cellText = cell ? String(cell).trim() : "";
      const cellWidth = colWidths[ci] ?? smallerCellWidth;
      maxH = Math.max(maxH, dataRowHeight);
      page.drawRectangle({
        x,
        y: y - dataRowHeight,
        width: cellWidth,
        height: dataRowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });
      const truncated = truncate(cellText, cellWidth);
      if (truncated) {
        page.drawText(truncated, {
          x: x + cellPadding,
          y: y - dataRowHeight + cellPadding,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
      x += cellWidth;
    });
    y -= maxH;
    if (y <= tableTopPadding) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - tableTopPadding;
    }
  }

  // Totals footer (same as converter.js)
  if (y < tableTopPadding + minimumSpaceForTotals) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - tableTopPadding;
  }
  y -= spaceBetweenTableAndTotals;
  if (totalPrice != null) {
    page.drawText(`Total Value DDP: ${totalPrice}`, {
      x: tableLeftPadding,
      y,
      size: 4,
      font,
      color: rgb(0, 0, 0),
    });
  }
  if (totalDDP != null) {
    page.drawText(`Freight Included: ${totalDDP}`, {
      x: tableLeftPadding,
      y: y - fontSize - 5,
      size: 4,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}

// ─── Generate all files for one LTA and write them to folderPath ──────────────
// Body: { sliceResult, ref, folderPath }
app.post("/lta/generate-and-save", async (req, res) => {
  const { sliceResult, ref, folderPath, manifestSrcPath, manifestName, pdfSrcPath, pdfName } = req.body;
  if (!sliceResult || !ref || !folderPath) {
    return res
      .status(400)
      .json({ error: "sliceResult, ref and folderPath are required" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    fs.mkdirSync(folderPath, { recursive: true });
  } catch (e) {
    send({ type: "error", message: `Cannot create folder: ${e.message}` });
    return res.end();
  }

  const saved = [];
  const errors = [];
  const dumSheets = sliceResult.sheets.filter((s) => s.name !== "GLOBAL");
  const manifestExtra = manifestSrcPath && manifestName ? 1 : 0;
  const pdfExtra = pdfSrcPath && pdfName ? 1 : 0;
  const total = 2 + dumSheets.length * 2 + manifestExtra + pdfExtra;
  let done = 0;

  const write = (name, buf) => {
    try {
      fs.writeFileSync(path.join(folderPath, name), buf);
      saved.push(name);
    } catch (e) {
      errors.push({ name, error: e.message });
    }
  };

  try {
    // 0. manifest Excel — copy directly from PARTAGE source path
    if (manifestSrcPath && manifestName) {
      try {
        fs.copyFileSync(manifestSrcPath, path.join(folderPath, manifestName));
        saved.push(manifestName);
      } catch (e) {
        errors.push({ name: manifestName, error: e.message });
      }
      send({ type: "progress", step: manifestName, done: ++done, total });
    }

    // 0b. MAWB PDF — copy directly from PARTAGE source path
    if (pdfSrcPath && pdfName) {
      try {
        fs.copyFileSync(pdfSrcPath, path.join(folderPath, pdfName));
        saved.push(pdfName);
      } catch (e) {
        errors.push({ name: pdfName, error: e.message });
      }
      send({ type: "progress", step: pdfName, done: ++done, total });
    }

    // 1. summary_file.xlsx
    const summaryBuf = await buildSummaryWorkbookXL(sliceResult);
    write("summary_file.xlsx", Buffer.from(summaryBuf));
    send({ type: "progress", step: "summary_file.xlsx", done: ++done, total });

    // 2. generated_excel.xlsx
    const genBuf = await buildGeneratedExcelXL(sliceResult, ref);
    write("generated_excel.xlsx", Buffer.from(genBuf));
    send({
      type: "progress",
      step: "generated_excel.xlsx",
      done: ++done,
      total,
    });

    // 3. Per-DUM xlsx + pdf (skip GLOBAL)
    for (const sheet of dumSheets) {
      // xlsx
      const wb = new ExcelJS.Workbook();
      addSheetToWorkbookXL(wb, sheet.data, sheet.name);
      const xlsBuf = await wb.xlsx.writeBuffer();
      write(`${sheet.name}.xlsx`, Buffer.from(xlsBuf));
      send({
        type: "progress",
        step: `${sheet.name}.xlsx`,
        done: ++done,
        total,
      });

      // pdf
      try {
        const sheetTotalPrice = parseFloat(sheet.totals.value).toFixed(2);
        const sheetTotalDDP =
          sliceResult.totalvaluee > 0
            ? Math.round(
                (sliceResult.parvaleur / sliceResult.totalvaluee) *
                  sheet.totals.value,
              )
            : 0;
        const pdfBytes = await sheetRowsToPdf(
          sheet.data,
          sheetTotalPrice,
          sheetTotalDDP,
        );
        write(`${sheet.name}.pdf`, Buffer.from(pdfBytes));
      } catch (e) {
        errors.push({ name: `${sheet.name}.pdf`, error: e.message });
      }
      send({
        type: "progress",
        step: `${sheet.name}.pdf`,
        done: ++done,
        total,
      });
    }
  } catch (e) {
    send({ type: "error", message: e.message, saved, errors });
    return res.end();
  }

  send({ type: "done", saved, errors, total: saved.length });
  res.end();
});

// ─── Open Outlook draft — reads already-saved files from the output folder ──
const EMAIL_TO = "OUSSAMA.FARIS@medafrica-log.com; imad.amoudi@medafrica-log.com; nouhaila.elallali@medafrica-log.com; nouhaila.orfane@medafrica-log.com; hamza.kninis@medafrica-log.com";
const { exec } = require("child_process");

app.post("/lta/open-email-draft", (req, res) => {
  const { ref, savedFolderPath } = req.body;
  if (!ref || !savedFolderPath) {
    return res.status(400).json({ error: "ref and savedFolderPath are required" });
  }

  // Verify folder exists before unlocking the button
  if (!fs.existsSync(savedFolderPath)) {
    return res.status(400).json({ error: `Dossier introuvable: ${savedFolderPath}. Sauvegardez d'abord les fichiers.` });
  }

  // Respond immediately so the button unlocks right away
  res.json({ ok: true });

  // Open Outlook in background — no file generation needed
  setImmediate(async () => {
    try {
      // Attach every real file in the MAWB folder, but skip Office temp/lock
      // files (~$foo.xlsx, ~.xlsx) and dotfiles - those can't be attached and
      // a failed Attachments.Add can destabilize the draft (Display crash).
      const attachments = fs
        .readdirSync(savedFolderPath, { withFileTypes: true })
        .filter((e) => e.isFile() && !/^~/.test(e.name) && !e.name.startsWith("."))
        .map((e) => path.join(savedFolderPath, e.name));

      if (!attachments.length) {
        console.error(`[email-draft] no attachments found in ${savedFolderPath}`);
        return;
      }
      console.log(`[email-draft] attaching ${attachments.length} file(s) for MAWB ${ref}`);

      const attachLines = attachments
        .map((p) => {
          const esc = p.replace(/\\/g, "\\\\").replace(/"/g, '`"');
          return `try { $mail.Attachments.Add("${esc}") | Out-Null } catch { Write-Host "skip: ${esc}" }`;
        })
        .join("\n");

      // Ref variants to search the mailbox with: with and without leading zero
      const refZero = ref;                       // e.g. 072-74366504
      const refNoZero = ref.replace(/^0+/, "");  // e.g. 72-74366504

      const psScript = [
        `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`,
        `Write-Host "[email-draft] LTA ${ref} - searching mailbox (variants: '${refZero}', '${refNoZero}')"`,
        `$outlook = New-Object -ComObject Outlook.Application`,
        `$ns = $outlook.GetNamespace("MAPI")`,
        `$mail = $outlook.CreateItem(0)`,
        `$mail.To = "${EMAIL_TO}"`,
        ``,
        `# Find the acheminement email for this LTA. The ref may be in the subject`,
        `# OR only in an attachment filename (e.g. "MAWB ${refZero}.pdf"), which is`,
        `# how Abdelhak TACHRIFY's mail carries it. Prefer his; reuse the subject.`,
        `$script:subjectFound = $null`,
        `$script:fallbackSubject = $null`,
        `$script:foldersScanned = 0`,
        `$script:candidates = 0`,
        `function Find-Achem($folder) {`,
        `  if ($script:subjectFound) { return }`,
        `  $script:foldersScanned++`,
        `  try {`,
        `    $items = $folder.Items`,
        `    try { $items.Sort("[ReceivedTime]", $true) } catch {}`,
        `    $res = $items.Restrict("@SQL=urn:schemas:httpmail:subject LIKE '%Acheminement%'")`,
        `    foreach ($m in $res) {`,
        `      try {`,
        `        $subj = $m.Subject`,
        `        $hasRefSubj = ($subj -like '*${refZero}*') -or ($subj -like '*${refNoZero}*')`,
        `        $hasRefAtt = $false`,
        `        try {`,
        `          for ($i = 1; $i -le $m.Attachments.Count; $i++) {`,
        `            $fn = $m.Attachments.Item($i).FileName`,
        `            if (($fn -like '*${refZero}*') -or ($fn -like '*${refNoZero}*')) { $hasRefAtt = $true; break }`,
        `          }`,
        `        } catch {}`,
        `        if ($hasRefSubj -or $hasRefAtt) {`,
        `          $script:candidates++`,
        `          $isAbdelhak = ($m.SenderName -like '*tachrify*') -or ($m.SenderName -like '*abdelhak*') -or ($m.SenderEmailAddress -like '*tachrify*')`,
        `          Write-Host ("[email-draft]   candidate in '" + $folder.Name + "' | from='" + $m.SenderName + "' | refSubj=" + $hasRefSubj + " refAtt=" + $hasRefAtt + " abdelhak=" + $isAbdelhak + " | subj='" + $subj + "'")`,
        `          if ($isAbdelhak) { $script:subjectFound = $subj; Write-Host "[email-draft]   MATCH: Abdelhak acheminement for this LTA"; break }`,
        `          elseif (-not $script:fallbackSubject) { $script:fallbackSubject = $subj }`,
        `        }`,
        `      } catch {}`,
        `    }`,
        `  } catch { Write-Host ("[email-draft]   (skip folder '" + $folder.Name + "': " + $_.Exception.Message + ")") }`,
        `  if (-not $script:subjectFound) {`,
        `    foreach ($sub in $folder.Folders) { Find-Achem $sub; if ($script:subjectFound) { break } }`,
        `  }`,
        `}`,
        `try { Find-Achem $ns.GetDefaultFolder(6) } catch { Write-Host ("[email-draft] search error: " + $_.Exception.Message) }`,
        `$chosen = $null`,
        `if ($script:subjectFound) { $chosen = $script:subjectFound } elseif ($script:fallbackSubject) { $chosen = $script:fallbackSubject }`,
        `Write-Host ("[email-draft] scanned " + $script:foldersScanned + " folder(s), " + $script:candidates + " candidate(s)")`,
        `if ($chosen) {`,
        `  if ($chosen -match '//\\s*(.+)$') { $chosen = $matches[1].Trim() }`,
        `  $mail.Subject = $chosen`,
        `  Write-Host ("[email-draft] FINAL subject: " + $mail.Subject)`,
        `} else {`,
        `  $mail.Subject = "Canevas de MAWB ${ref}"`,
        `  Write-Host "[email-draft] FINAL subject (fallback): Canevas de MAWB ${ref}"`,
        `}`,
        ``,
        attachLines,
        `try { $mail.Save() } catch {}`,
        `try {`,
        `  $mail.Display()`,
        `  Write-Host "[email-draft] draft displayed"`,
        `} catch {`,
        `  Write-Host ("[email-draft] Display failed once: " + $_.Exception.Message + " - retrying via inspector")`,
        `  Start-Sleep -Milliseconds 800`,
        `  try {`,
        `    $mail.GetInspector.Display()`,
        `    Write-Host "[email-draft] draft displayed (inspector retry)"`,
        `  } catch {`,
        `    Write-Host ("[email-draft] Display failed again: " + $_.Exception.Message + " - draft saved to Drafts")`,
        `  }`,
        `}`,
      ].join("\n");

      const scriptPath = path.join(os.tmpdir(), `open_draft_${ref}_${Date.now()}.ps1`);
      // UTF-8 BOM: Windows PowerShell 5.1 reads BOM-less files as ANSI (cp1252),
      // which mangles any non-ASCII (accented paths, em-dashes) and breaks parsing.
      fs.writeFileSync(scriptPath, String.fromCharCode(0xFEFF) + psScript, "utf8");

      exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (err, stdout, stderr) => {
        const out = [];
        if (stdout && stdout.trim()) out.push(stdout.trim());
        if (stderr && stderr.trim()) out.push("[stderr] " + stderr.trim());
        if (err) out.push("[exec error] " + err.message);
        const text = out.join("\n");
        if (text) console.log(text);
        appendLtaLog(ref, [`[email-draft] === LTA ${ref} — open draft ===`, text || "(no PowerShell output)"]);
        setTimeout(() => { try { fs.unlinkSync(scriptPath); } catch {} }, 15000);
      });
    } catch (e) {
      console.error("[email-draft] error:", e.message);
    }
  });
});

// Returns the user's Desktop/Canevas path
app.get("/lta/desktop-path", (req, res) => {
  const desktopPath = path.join(os.homedir(), "Desktop", "Canevas");
  res.json({ desktopPath });
});

// Save sliced DUM files (xlsx + pdf) into the LTA PARTAGE folder
// Body: { folderPath: string, files: [{ name: string, contentB64: string }] }
app.post("/lta/save-results", (req, res) => {
  const { folderPath, files } = req.body;
  if (!folderPath || !Array.isArray(files) || files.length === 0) {
    return res
      .status(400)
      .json({ error: "folderPath and files[] are required" });
  }
  const saved = [];
  const errors = [];
  try {
    fs.mkdirSync(folderPath, { recursive: true });
  } catch (e) {
    return res
      .status(500)
      .json({ error: `Cannot create folder: ${e.message}` });
  }
  for (const file of files) {
    try {
      const dest = path.join(folderPath, file.name);
      fs.writeFileSync(dest, Buffer.from(file.contentB64, "base64"));
      saved.push(file.name);
    } catch (e) {
      errors.push({ name: file.name, error: e.message });
    }
  }
  res.json({ saved, errors });
});

// Convert a DUM sheet (rows[][]) to PDF and return base64
// Body: { rows: any[][], sheetName?: string, totalPrice?: string, totalDDP?: number }
app.post("/lta/sheet-to-pdf", async (req, res) => {
  const { rows, totalPrice, totalDDP } = req.body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows[] is required" });
  }
  try {
    const pdfBytes = await sheetRowsToPdf(
      rows,
      totalPrice ?? null,
      totalDDP ?? null,
    );
    res.json({ pdfB64: Buffer.from(pdfBytes).toString("base64") });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
