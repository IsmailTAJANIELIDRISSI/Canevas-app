import React, { useState, useRef } from "react";
import { Button, Card, CardHeader, Typography, Input } from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import bddngp from './bddngp.json'; // Adjust the path as necessary
import ExcelJS from 'exceljs';
export function ExcelToPdfConverter() {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [value, setValue] = useState("[0%]");
  const [fileName, setFileName] = useState();
  const [exclusionFile, setExclusionFile] = useState(null);
  const [exclusionFileName, setExclusionFileName] = useState("");
  const [value2, setValue2] = useState("1/3");
  const [loading,setLoading]=useState(false)
  const [loadingDownload,setLoadingDownload]=useState(false)

  const [exclusionWaybills, setExclusionWaybills] = useState([]);
  const handleFileChange = (event) => {
    
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name)
    setValue("1/3")
   
    setTimeout(() => {
      setValue("1/3");
      console.log(25);

      setTimeout(() => {
        setValue("[75%]");
        setTimeout(() => {
          setValue("100%");

        }, 1000);
      }, 1000);
    }, 1000);
  };
  const handleExclusionFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setExclusionFile(uploadedFile);
    setExclusionFileName(uploadedFile.name)
    console.log("hhhh");
    
    setValue2("1/3")
    const reader = new FileReader();
    reader.readAsArrayBuffer(uploadedFile);

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const waybills = jsonData.slice(0).map(row => row[0]);
      console.log(waybills);
      setExclusionWaybills(waybills);
    };
    
   
    setTimeout(() => {
      setValue2("1/3");
      console.log(25);

      setTimeout(() => {
        setValue2("[75%]");
        setTimeout(() => {
          setValue2("100%");

        }, 1000);
      }, 1000);
    }, 1000);
  };
  const handleSliceExcel = async () => {
    
    if (!file) {
      return alert('Please select an Excel file');
    }
    setLoading(true)
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      const header = [
        'Identifiant unique du fichier', "N° ordre de l'article", "Nombre Contenants", 
        "Type Contenant", "Marque (N° Envoi)", "Code NGP(à 10 chiffres)", 
        "Désignation commerciale", "Pays d'origine", "Indicateur de Paiement", 
        "Indicateur Occasion", "Valeur", "Devise", "Quantité Article", 
        "Unité de mesure", "Poids net Article", "Quantité normalisée", 
        "Code Référence Accord Article", "Code Référence Franchise", 
        "Nom et Prénom", "CIN", "Carton or bag N°", "HAWB"
      ];
  
      // Create a dictionary for quick lookup, ensuring the first occurrence is used
      const ngpMap = {};
      for (const item of bddngp.Feuil1) {
        const key = item["Désignation commerciale"].toLowerCase();
        if (!ngpMap[key]) {
          ngpMap[key] = item["Code NGP(à 10 chiffres)"];
        }
      }
  
      const slicedSheets = [];
      let currentSheet = [];
      let sheetCount = 0;
      let newdata = [];
      let wayb = 0;
      let desc = 0;
  
      for (let i = 5; i < jsonData.length-1; i++) {
        const row = jsonData[i];
        const waybillNumber = row[1];
        const description = row[2];
        let pieces = Number(row[3]);
        let total = Number(row[4]);
        let weight = Number(row[10]);
  
        // Ensure description is defined and convert to lowercase
        const ngpCode = description ? (ngpMap[description.toLowerCase()] || 'ngp') : 'ngp';
  
        for (let j = i + 1; j < jsonData.length; j++) {
          const nextRow = jsonData[j];
          const ngpCodee = nextRow[2] ? (ngpMap[nextRow[2].toLowerCase()] || 'ngp') : 'ngp';
          if (waybillNumber === nextRow[1]) {
            if (ngpCode === ngpCodee) {
              pieces += Number(nextRow[3]);
              total += Number(nextRow[4]);
              weight += Number(nextRow[10]);
            }  
          } else {
            break;
          }
        }
  
        // Check if a row with the same waybill number and NGP code already exists
        let rowExists = false;
        for (let k = 0; k < newdata.length; k++) {
          const existingRow = newdata[k][0];
          if (existingRow[3] === waybillNumber && existingRow[4] === ngpCode) {
            rowExists = true;
            break;
          }
        }
        if (!rowExists && !exclusionWaybills.includes(waybillNumber)) {
          newdata.push([
              [i - 4, '', '000', waybillNumber, ngpCode, description, 'CN', 'SP', 'NON', total, 'MAD', pieces, '002', weight, pieces, '', '', row[6], '', row[11], row[12]]
          ]);
        }
      
      }
  
      let cpt = 1;
      for (let i = 0; i < newdata.length; i++) {
        const row = newdata[i][0];
        newdata[i][0][0] = cpt;
        cpt++;
        if (currentSheet.length === 0) {
          currentSheet.push(header);
          currentSheet.push(["MASTER 1 LE 12 JUIN", row[0], 3709, 216, row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
        } else {
          currentSheet.push(["", ...row]);
        }
      }
      slicedSheets.push(currentSheet);
      currentSheet = [];
  
      sheetCount++;
      let c = 0;
      for (let i = 0; i < newdata.length; i++) {
        const row = newdata[i][0];
        c++;
        newdata[i][0][0] = c;
        
        const name = newdata[i][0][17];
  
        if (currentSheet.length === 0) {
          currentSheet.push(header);
          sheetCount += 0;
          currentSheet.push([`sheet${sheetCount}`, 1, '', 216, row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
        } else {
          let cof = 0
          for (let j = i+1; j < newdata.length; j++){
            if (name ==newdata[j][0][17]){
              cof++;
            }
            else{
              break
            }
          }
          if (cof > (1000 - currentSheet.length-1) || currentSheet.length == 1001 ){
            slicedSheets.push(currentSheet);
            currentSheet = [];
            c = 1;
            currentSheet.push(header);
            sheetCount += 1;
            currentSheet.push([`sheet${sheetCount}`, 1, '', 216, row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
            continue
          }
          currentSheet.push(['', ...row]);
        }
        
      }
  
      if (currentSheet.length > 0) {
        slicedSheets.push(currentSheet);
      }
      setLoading(false)
      setSheets(slicedSheets.map((sheet, index) => ({
        data: sheet,
        name: sheet.length > 1600 ? "GLOBAL" : `Sheet ${index}`,
      })));
    };
    
  };
  const handleLoad=async ()=>{
    
  }
  const handleDownloadExcel = async () => {
    if (sheets.length === 0) {
      return alert('Please slice the Excel file first');
    }
    setLoadingDownload(true)
    
    const workbook = new ExcelJS.Workbook();
    const sheetOptions = {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    };
  
    sheets.forEach((sheet) => {
      const worksheet = workbook.addWorksheet(sheet.name, sheetOptions);
  
      // Add headers
      worksheet.addRow(sheet.data[0]); // Assuming first row is header
  
      // Add data rows
      for (let i = 1; i < sheet.data.length; i++) {
        worksheet.addRow(sheet.data[i]);
      }
  
      // Style headers
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell((cell) => {
          if (rowNumber === 1) { // Only style the first row (headers)
            cell.font = { bold: true, size: 12 };
          } else {
            cell.font = { size: 10 }; // Font size 8 for data cells
          }
          cell.alignment = { horizontal: 'center', vertical: 'center' };
          cell.border={top: {style:'thin', color: {argb:'000000'}},
          left: {style:'thin', color: {argb:'000000'}},
          bottom: {style:'thin', color: {argb:'000000'}},
          right: {style:'thin', color: {argb:'000000'}}}
        });
      });
  
      // Auto-width columns
      worksheet.columns.forEach((column) => {
        let maxWidth = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellWidth = cell.value ? cell.value.toString().length : 6;
          if (cellWidth > maxWidth) {
            maxWidth = cellWidth;
          }
        });
        column.width = maxWidth < 20 ? 20 : maxWidth; 
      });
    });
  
    // Generate and save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'sliced_data.xlsx');
    setLoadingDownload(false)
  };
  const removeFile=()=>{
    setFile(null)
    setFileName("")
    setValue("[0%]")
    console.log("hhh");
  }
  const removeExclusionFile=()=>{
    setExclusionFile(null)
    setExclusionFileName("")
    setValue2("[0%]")
    console.log("hhh");
  }

  return (
    <Card>
    <div className="mt-12 mb-6 p-4  gap-12">
      <div className="flex flex-row gap-4">
        

        <div className="flex items-center flex-col justify-center mx-auto w-2/3">
          <label htmlFor="dropzone-file-main" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> the main file</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, CSV</p>
            </div>
            <input id="dropzone-file-main" type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
          </label>
         
          
        </div>
        <div className="flex items-center justify-center mx-auto w-2/3">
          <label htmlFor="dropzone-file-exclusion" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> the exclusion file</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, CSV</p>
            </div>
            <input id="dropzone-file-exclusion" type="file" accept=".xlsx" className="hidden" onChange={handleExclusionFileChange} />
          </label>
        </div>
      </div>

        
      
    </div>
    <div>

          {
            (value === "100%") && <div className="mb-5 rounded-md bg-gray-100 py-4 px-8 mx-3">
              <div className="flex items-center justify-between ">
                <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                  {fileName}
                </span>
                <button className="text-[#07074D]" onClick={removeFile}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                      fill="currentColor"
                      />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          }
          {
            (file && value !== "100%") &&
            <div className="rounded-md bg-gray-100 mb-5  py-4 px-8 mx-3">
              <div className="flex items-center justify-between">
                <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                  {fileName}
                </span>
                <button className="text-[#07074D]" onClick={removeFile}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                      fill="currentColor"
                      />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                <div
                  className={`absolute left-0 right-0 h-full w-${value} rounded-lg bg-[#6A64F1]`}                  
                ></div>
              </div>
            </div>
          }
          {
            (value2 === "100%") && <div className="mb-5 rounded-md bg-gray-100 py-4 px-8 mx-3">
              <div className="flex items-center justify-between ">
                <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                  {exclusionFileName}
                </span>
                <button className="text-[#07074D]" onClick={removeExclusionFile}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                      fill="currentColor"
                      />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          }
           {
            (exclusionFile && value2 !== "100%") &&
            <div className="rounded-md bg-gray-100 mb-5  py-4 px-8 mx-3">
              <div className="flex items-center justify-between">
                <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                  {exclusionFileName}
                </span>
                <button className="text-[#07074D]" onClick={removeExclusionFile}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                      fill="currentColor"
                      />
                  </svg>
                </button>
              </div>
              <div className="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                <div
                className={`absolute left-0 right-0 h-full w-${value2} rounded-lg bg-[#6A64F1]`}></div>
              </div>
            </div>
          } 
         
          </div>

          <div className="flex flex-row gap-12 mx-4 mb-4">
          <Button onClick={handleSliceExcel} disabled={!file} className="w-[100%]">
              {loading ? (
                <div className="flex items-center justify-center "> 
                  <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
                  <div className="ml-2">Slicing...</div>
                </div>
              ) : (
                "Slice Excel"
              )}
         </Button>  
  
            <Button onClick={handleDownloadExcel} disabled={sheets.length === 0} className="w-[100%]">
              
              {loadingDownload ? (
                <div className="flex items-center justify-center "> 
                  <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
                  <div className="ml-2">Downloading...</div>
                </div>
              ) : (
                "Download Sliced Excel"
              )}
            </Button>
          </div>
      
  
      
  
      
  
      
  
      
      {/* {sheets.length > 0 && (
        <div>
          <Typography variant="h6">Sliced Sheets:</Typography>
          <ul>
            {sheets.map((sheet) => (
              <li key={sheet.name}>{sheet.name}</li>
            ))}
          </ul>
        </div>
      )} */}
  </Card>
  
  );
}

export default ExcelToPdfConverter;