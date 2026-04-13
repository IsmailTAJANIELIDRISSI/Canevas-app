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

// LTA PARTAGE scan endpoint
app.post("/lta/scan", (req, res) => {
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
    let folderPath = null;
    try {
      const entries = fs.readdirSync(partagePath, { withFileTypes: true });
      const targetKey = `mawb${trimmedRef.toLowerCase().replace(/\s+/g, "")}`;
      const match = entries.find(
        (e) =>
          e.isDirectory() &&
          e.name.toLowerCase().replace(/\s+/g, "") === targetKey,
      );
      if (match) folderPath = path.join(partagePath, match.name);
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
      const pdfFile = files.find((f) => /\.pdf$/i.test(f));

      const manifestB64 = xlsxFile
        ? fs.readFileSync(path.join(folderPath, xlsxFile)).toString("base64")
        : null;
      const pdfB64 = pdfFile
        ? fs.readFileSync(path.join(folderPath, pdfFile)).toString("base64")
        : null;

      results.push({
        ref: trimmedRef,
        found: true,
        manifestB64,
        manifestName: xlsxFile || null,
        pdfB64,
        pdfName: pdfFile || null,
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
      "Total Quantite",
      "Total Value",
      "Total poid net",
      "Total poid brute",
      "Total fret",
      "Total position",
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

async function sheetRowsToPdf(rows) {
  const { PDFDocument, rgb } = require("pdf-lib");
  const fk = require("@pdf-lib/fontkit");
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fk);
  const fontBytes = fs.readFileSync(
    path.join(__dirname, "fonts", "NotoSans-Regular.ttf"),
  );
  const font = await pdfDoc.embedFont(fontBytes);

  const pageWidth = 1200,
    pageHeight = 800;
  const fontSize = 6,
    cellPad = 2;
  const rowH = fontSize + 2 * cellPad,
    headerH = 14;
  const marginLeft = 10,
    marginTop = 20;
  const colWidths = (rows[0] || []).map((_, i) =>
    i === 1 ? 160 : i === 2 ? 80 : 40,
  );

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const drawRow = (rowData, isHeader) => {
    let x = marginLeft;
    const h = isHeader ? headerH : rowH;
    if (y - h < marginTop) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - marginTop;
    }
    rowData.forEach((cell, ci) => {
      const w = colWidths[ci] ?? 40;
      page.drawRectangle({
        x,
        y: y - h,
        width: w,
        height: h,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.4,
      });
      const text = cell != null ? String(cell).trim().substring(0, 30) : "";
      if (text)
        page.drawText(text, {
          x: x + cellPad,
          y: y - h + cellPad,
          size: isHeader ? 7 : fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      x += w;
    });
    y -= h;
  };

  rows.forEach((row, i) => drawRow(row, i === 0));
  return pdfDoc.save();
}

// ─── Generate all files for one LTA and write them to folderPath ──────────────
// Body: { sliceResult, ref, folderPath }
app.post("/lta/generate-and-save", async (req, res) => {
  const { sliceResult, ref, folderPath } = req.body;
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
  const total = 2 + dumSheets.length * 2; // summary + generated_excel + (xlsx + pdf) per DUM
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
        const pdfBytes = await sheetRowsToPdf(sheet.data);
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
// Body: { rows: any[][], sheetName: string }
app.post("/lta/sheet-to-pdf", async (req, res) => {
  const { rows, sheetName } = req.body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows[] is required" });
  }
  try {
    const { PDFDocument, rgb } = require("pdf-lib");
    const fontkit = require("@pdf-lib/fontkit");

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const latinFontBytes = fs.readFileSync(
      path.join(__dirname, "fonts", "NotoSans-Regular.ttf"),
    );
    const latinFont = await pdfDoc.embedFont(latinFontBytes);

    const pageWidth = 1200;
    const pageHeight = 800;
    const fontSize = 6;
    const cellPad = 2;
    const rowH = fontSize + 2 * cellPad;
    const headerH = 14;
    const marginLeft = 10;
    const marginTop = 20;

    // Column widths: narrow for short cols, wider for description
    const colWidths = rows[0].map((_, i) =>
      i === 1 ? 160 : i === 2 ? 80 : 40,
    );

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - marginTop;

    const drawRow = (rowData, isHeader) => {
      let x = marginLeft;
      const h = isHeader ? headerH : rowH;
      if (y - h < marginTop) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - marginTop;
      }
      rowData.forEach((cell, ci) => {
        const w = colWidths[ci] ?? 40;
        page.drawRectangle({
          x,
          y: y - h,
          width: w,
          height: h,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.4,
        });
        const text = cell != null ? String(cell).trim().substring(0, 30) : "";
        if (text) {
          page.drawText(text, {
            x: x + cellPad,
            y: y - h + cellPad,
            size: isHeader ? 7 : fontSize,
            font: latinFont,
            color: rgb(0, 0, 0),
          });
        }
        x += w;
      });
      y -= h;
    };

    rows.forEach((row, i) => drawRow(row, i === 0));

    const pdfBytes = await pdfDoc.save();
    res.json({ pdfB64: Buffer.from(pdfBytes).toString("base64") });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
