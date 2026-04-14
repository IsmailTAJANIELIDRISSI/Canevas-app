import React, { useState } from "react";
import { Button, Card, Typography } from "@material-tailwind/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import bddngp from './bddngp.json';
export function Newmodel() {
  const [fileName, setFileName] = useState("");
  const [missingNGP, setMissingNGP] = useState([]);
  const [ngpMissingRows, setNgpMissingRows] = useState([]);
  const [ngpData, setNgpData] = useState(null);
  const [originalFileBlob, setOriginalFileBlob] = useState(null);
  const ngpMap = {};
for (const item of bddngp.Feuil1) {
  // Normalize the designation by removing trailing numbers and spaces
  const key = item["Désignation commerciale"]
    .toLowerCase()
    .replace(/\s*\d*$/, '')
    .trim();

  if (!ngpMap[key]) {
    ngpMap[key] = item["Code NGP(à 10 chiffres)"];
  }
}

function findNgpCode(description) {
  const originalKey = description
    .replace(/\s*\d*$/, '')
    .trim()
    .toLowerCase();
  console.log(description.toLowerCase());
  if (ngpMap[originalKey]) {
    console.log(ngpMap[originalKey]);
    return ngpMap[originalKey];
  }

  const normalizedKey = originalKey.replace(/\s*\d*$/, '').trim();
  return ngpMap[normalizedKey] || 'ngp';
}

function applySwitch(code) {
  const prefix = code.substring(0, 2);
  switch (true) {
    case prefix >= "01" && prefix <= "27":
      return 2104200000
    case prefix === "29":
      return 3304100000;
    case prefix === "30":
      return 3006500000;
    case (prefix >= "31" && prefix <= "38") || prefix === "28":
      return 3304100000;
    case prefix === "39":
      return 3926909290;
    case prefix === "40":
      return 4016999800;
    case prefix >= "41" && prefix <= "43":
      return 4202110010;
    case prefix >= "44" && prefix <= "46":
      return 4409101000;
    case prefix >= "48" && prefix <= "49":
      return 4901991000;
    case prefix >= "50" && prefix <= "63":
      return 6203120000;
    case prefix >= "64" && prefix <= "65":
      return 6401101000;
    case prefix >= "66" && prefix <= "67":
      return 6602000000;
    case prefix >= "68" && prefix <= "69":
      return 6904100010;
    case prefix === "70":
      return 7007111011;
    case prefix === "71":
      return 7113199000;
    case prefix >= "72" && prefix <= "82":
      return 8201100010;
    case prefix === "83":
      return 8306300000;
    case prefix >= "84" && prefix <= "89":
      if (prefix === "85") {
        const suffix = code.substring(2, 4);
        return suffix === "44"
          ? 8544429090
          : suffix === "04"
          ? 8504409970
          : 8512100000;
      } else {
        return 8512100000;
      }
    case prefix >= "90" && prefix <= "93":
      return 9002111000;
    case prefix === "94":
      return 9401100000;
    case prefix === "95":
      return 9503001010;
    case prefix === "96":
      return 9608109000;
    default:
      return null;
  }
}

const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;
  setFileName(selectedFile.name);
  setOriginalFileBlob(selectedFile);

  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const workbook = XLSX.read(bstr, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let ngpValues = {};
    let missingLines = [];
    let missingProducts = [];
    console.log(jsonData[0][3][0]);
    let len = jsonData[0][3][0] == "V" || jsonData[0][3][0] == "V" ? 2 : 4;

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const description = row[2];
      if (!row[0]) break;
      if (row[0][0] != "U" && row[0][0] != "M") break;

      let cell = row[14] ? row[14] : description ? findNgpCode(description.toLowerCase()) : '';
      let ngpCode = "ngp";
      let code = cell.toString();
      let tempCode = applySwitch(code);

      if (tempCode === null) {
        const fallback = description ? findNgpCode(description.toLowerCase()) : 'ngp';

        if (fallback === 'ngp') {
          ngpCode = 'ngp';
          missingLines.push(i + 1);
          if (row[2]) missingProducts.push(row[2]);
        } else {
          const fallbackCode = fallback.toString();
          ngpCode = applySwitch(fallbackCode) ?? fallback;
        }
      } else {
        ngpCode = tempCode;
      }

      ngpValues[i] = ngpCode;
      if (ngpCode === "ngp") {
        missingLines.push(i + 1);
        if (row[2]) missingProducts.push(row[2]);
      }
    }

    setMissingNGP(missingLines);
    setNgpMissingRows(missingProducts);
    setNgpData(ngpValues);
  };

  reader.readAsBinaryString(selectedFile);
};


  const taxRates = {
    "3006500000": "23.3%",
    "3304100000": "23.3%",
    "3926909290": "42.5%",
    "4016999800": "56.3%",
    "4202110010": "56.3%",
    "4409101000": "70.7%",
    "4901991000": "56.3%",
    "6203120000": "56.3%",
    "6401101000": "56.3%",
    "6602000000": "23.3%",
    "6904100010": "56.3%",
    "7007111011": "56.3%",
    "7113199000": "23.3%",
    "8201100010": "56.3%",
    "8306300000": "56.3%",
    "8512100000": "23.3%",
    "8544429090": "56.3%",
    "8504409970": "41.3%",
    "9002111000": "23.3%",
    "9401100000": "56.3%",
    "9503001010": "23.3%",
    "9608109000": "56.3%",
    "2104200000": "56.3%"
  };
  
  const generateExcel = async () => {
    if (!originalFileBlob || !ngpData) return;
  
    const buffer = await originalFileBlob.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
  
    const worksheet = workbook.worksheets[0];
    worksheet.getRow(1).getCell(16).value = "Taux"
    Object.entries(ngpData).forEach(([rowIdx, ngpCode]) => {
      const rowNumber = parseInt(rowIdx) + 1;
      const row = worksheet.getRow(rowNumber);
  
      const ngpCell = row.getCell(15); // Column O
      ngpCell.value = ngpCode;
  
      const taxCell = row.getCell(16); // Column P
      if (taxRates[ngpCode]) {
        taxCell.value = taxRates[ngpCode]; // Assuming one tax rate per code
      } else {
        taxCell.value = ""; // Leave empty if no rate found
      }
  
      row.commit();
    });
  
    const blobBuffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([blobBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Modified_${fileName}`
    );
  };
  const handleDownloadNgp = () => {
    if (ngpMissingRows.length === 0) return;
  
    const ws = XLSX.utils.aoa_to_sheet([
      ...ngpMissingRows.map((product) => [product]),
    ]);
  
    // Hint: Set column width (adjust as needed)
    ws["!cols"] = [{ wch: 40 }]; // 30 characters wide
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Missing NGP");
  
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Missing_NGP_${fileName}`
    );
  };
  
  return (
    <Card className="p-6 mt-12">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-center text-sm font-semibold mb-4 uppercase text-gray-700">
          EXCEL FILES
        </h2>
        <div className="flex flex-row gap-4">
          <div className="flex items-center flex-col justify-center mx-auto w-2/3">
            <label
              htmlFor="dropzone-file-main"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-500"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <svg
                  className="w-8 h-8 mb-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-1 text-xs text-green-500 uppercase">
                  <span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> FICHIER PRINCIPAL
                </p>
                <p className="text-xs text-green-500 uppercase">XLSX, CSV</p>
              </div>
              <input
                id="dropzone-file-main"
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="mt-2 min-h-[24px] text-center text-xs text-green-500 uppercase">
              {fileName}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button color="green" onClick={generateExcel} className="uppercase">
            Générer Fichier Excel
          </Button>
          <Button
            color="red"
            onClick={handleDownloadNgp}
            disabled={ngpMissingRows.length === 0}
            className="ml-4 uppercase"
          >
            Télécharger lignes avec NGP manquant
          </Button>
          {missingNGP.length > 0 && (
            <Typography color="red" className="mt-2 text-sm">
              Des lignes avec code NGP manquant détectées. Corrigez-les avant de continuer. <br />
              Lignes affectées (colonne 2): {missingNGP.join(", ")}
            </Typography>
          )}
        </div>
      </div>
    </Card>
  );
}

export default Newmodel;
