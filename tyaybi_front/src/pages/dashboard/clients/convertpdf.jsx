import React, { useState } from "react";
import { Button,Input, Card, Typography,Table,TableCell,TableHeader, TableBody,TableRow,TableHead} from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import bddngp from './bddngp.json';

import ExcelJS from 'exceljs';

import stringSimilarity from 'string-similarity';
import numData from './num.json';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import mammoth from 'mammoth';

GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export function Clients() {
  const [exclusionWaybills, setExclusionWaybills] = useState([]);
  const [pdfStatus, setPdfStatus] = useState({});
  const [majoration,setMajoration]=useState(true)
  const [auto,setAuto]=useState(true)
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [coliis, setColiis] = useState(0);
  const [poidbrut, setPoidbrut] = useState(null);
  const [mawb, setMawb] = useState("mawb");
  const [parvaleur, setParvaleur] = useState(null);
  const [position, setPosition] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [verifier, setVerifier] = useState([]);
  const [value, setValue] = useState("[0%]");
  const [fileName, setFileName] = useState();
  const [jpgfileName, setFileNamejpg] = useState();
  const [totalvaluee, setTotalvaluee] = useState(0);
  const [exclusionFile, setExclusionFile] = useState(null);
  const [excexiste,setExcexiste]=useState(false)
  const [exclusionFileName, setExclusionFileName] = useState("");
  const [tauxusd, setTauxusd] = useState("");
  const [value2, setValue2] = useState("1/3");
  const [loading,setLoading]=useState(false)
  const [loadingall,setIsLoadingall]=useState(false)
  const [test,setTest]=useState(false)

  const [loadingDownload,setLoadingDownload]=useState(false)
  const [loadingDownloads,setLoadingDownloads]=useState(false)
  const [foundver,setFoundver]=useState(false)
  const [summary,setSummary]=useState(false)
  const [missingNGP, setMissingNGP] = useState([]);
  const [foundngp,setFoundngp]=useState(false)

 

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });




  function extraireInfos(inputString) {
    const regex = /(.*\s[A-Za-z])\s(\d{2}\/\d{2}\/\d{4})/;
    const match = inputString.match(regex);
    if (match) {
      return {
        avantDate: match[1] || null,  
        date: match[2] || null      
      };
    }
    return null;
  }
  
  const extractDateComponents = (dateString) => {
    const date = new Date(dateString); 


    if (isNaN(date.getTime())) {
        console.error("Invalid date format");
        return null;
    }

    const day = date.getDate().toString().padStart(2, '0'); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();

    return { day, month, year };
};
const removeMawbPrefix = (inputString) => {
  // Use a regular expression to replace "Mawb " (case-insensitive) and remove leading zeros
  return inputString.replace(/^Mawb\s+0*(\d+-\d+)/i, '$1').trim();
};
const removeMawbPrefixx = (inputString) => {
  // Use a regular expression to replace "Mawb " (case-insensitive) and remove leading zeros
  return inputString
    .replace(/^Mawb\s+0*(\d+-\d+)/i, '$1') // Remove "Mawb" and leading zeros from the first part of the number
    .replace(/^(\d+)-(\d+)$/, (match, part1, part2) => {
      // Remove leading zeros from the first part of the number if necessary
      const cleanedPart1 = part1.replace(/^0+/, '');
      return `${cleanedPart1}-${part2}`; // Reassemble with cleaned part1 and part2
    })
    .trim();
};

  function extractNumber(sheetName) {
    const match = sheetName.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1; 
  }
function extractColisAndPoidsBrut(text) {
  if (!text) {
    throw new Error("Input text is undefined or empty.");
  }

  // Match all numbers (integer or decimal)
  const matches = text.match(/\d+(\.\d+)?/g);

  if (!matches || matches.length < 2) {
    throw new Error("Failed to extract both colis and poids brut from the text.");
  }

  const coli = parseFloat(matches[0]);
  const poidbr = parseFloat(matches[1]);

  return { coli, poidbr };
}




  const handleFileChange = (event) => {
    
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name)
    setValue("1/3")
   
    setTimeout(() => {
      setValue("1/3");
     

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
      console.log(waybills)
      setExclusionWaybills(waybills);
      setExcexiste(true);
    };
    setTimeout(() => {
      setValue2("1/3");
     
      setTimeout(() => {
        setValue2("[75%]");
        setTimeout(() => {
          setValue2("100%");
        }, 1000);
      }, 1000);
    }, 1000);
  };
  const removeFile=()=>{
    setFile(null)
    setFileName("")
    setValue("[0%]")
    
  }

  function removeNumbers(description) {
    if (typeof description !== 'string') {
        return '';
    }
    
    if (/^\d+$/.test(description)) {
        return description;
    }
    return description.replace(/[0-9]/g, '');
}


  const handleDownloadMissingNGP = async () => {
    if (!missingNGP || missingNGP.length === 0) {
      return alert('No missing NGP codes to download');
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Missing NGP Codes');
  
    // Add missing NGP codes
    missingNGP.forEach(description => {
      worksheet.addRow([description]);
    });
  
    // Adjust column widths to fit the content
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength < 20 ? 20 : maxLength;
    });
  
    // Create buffer
    const buffer = await workbook.xlsx.writeBuffer();
  
    // Create blob and trigger download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'missing_ngp_codes.xlsx';
    link.click();
  };
  const handleDownloadverifierNGP = async () => {
    if (!verifier || verifier.length === 0) {
      return alert('No missing NGP codes to download');
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('NGP Codes a verifier');
  
    // Create a set to store unique designation and code combinations
    const uniqueSet = new Set();
  
    // Filter out duplicates and add rows to the worksheet
    verifier.forEach(({ designation, code }, index) => {
      const uniqueKey = `${designation}-${code}`;
      if (!uniqueSet.has(uniqueKey)) {
        uniqueSet.add(uniqueKey);
        if (index % 2 === 0) { // Add rows 1, 3, 5, etc.
          worksheet.addRow([designation, code]);
        }
      }
    });
  
    // Adjust column widths to fit the content
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = maxLength < 20 ? 20 : maxLength;
    });
  
    // Create buffer
    const buffer = await workbook.xlsx.writeBuffer();
  
    // Create blob and trigger download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ngp_codes_a_verifier.xlsx';
    link.click();
  };
  
  
  const handleSliceExcel = async () => {
    if (!file) {
      return alert('Please select an Excel file');
    }
    setLoading(true);
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
        const originalKey = description.toLowerCase();
        
        // First try to find the ngpCode with the original key
        if (ngpMap[originalKey]) {
          return ngpMap[originalKey];
        }
      
        const normalizedKey = originalKey.replace(/\s*\d*$/, '').trim();
        return ngpMap[normalizedKey] || 'ngp';
      }

      
      setParvaleur(extractNumber(jsonData[3][0]?jsonData[3][0]:0));
      setPosition(extractNumber(jsonData[2][0]?jsonData[2][0]:0));
     
    
      var data = jsonData[1][0];
      var { coli, poidbr } = extractColisAndPoidsBrut(data);

      setColiis(coli);
      setPoidbrut(poidbr);
      console.log("this is colis number : ",coli);
       console.log("this is poidbr number : ",poidbr);
      let parv =extractNumber(jsonData[3][0]?jsonData[3][0]:0);
      let pos =extractNumber(jsonData[2][0]?jsonData[2][0]:0);
      
      let tauxusd =jsonData[3][3]?jsonData[3][3]:1;
      setTauxusd(jsonData[3][3]?jsonData[3][3]:1);
      const mawbValue = jsonData[0][0] ? jsonData[0][0] : "mawb";
      setMawb(mawbValue);
      
      
      function extractNumber(str) {
        if (typeof str !== 'string') {
          return str;
        }
        const match = str.match(/\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : null;
      }
      let contactexiste = jsonData[4][6];
      let model2 = jsonData[4][1]=="Connote #" ?true:false;
      let model3 = jsonData[4][0]=="Docket #" ?true:false;
      let ngpexiste =contactexiste =="Contact" ?jsonData[4][14]:jsonData[4][13];
      let sanshawb =contactexiste =="Contact" ?jsonData[4][12]:jsonData[4][11];
      var test = false;
      let hscodee = String(sanshawb).replace(/\s+/g, '').toUpperCase();
      console.log(hscodee);

      if (hscodee === "HSCODE") {
        console.log("dkhlat hscode");

        test = true;
        setTest(true);
      }
      console.log(test);

       
      
      const slicedSheets = [];
      let currentSheet = [];
      const processedWaybills = new Set();
      let newdata = [];
      let sheetCount = 1;
      let missingNGPCodes = [];
      let accumulatedTotalValue = 0;
     
      let weightt = 0;
      for (let i = 5; i < jsonData.length - 1; i++) {
        
        const row = jsonData[i];
        const value = row[0]?.trim().toLowerCase();

        if (!value || (value !== "mad" && value !== "usd")) {
          break;
        }
      if(model2){
        weightt += Number(row[11]);
        console.log(weightt,"model2");
      }
      else if(model3){
        weightt += (Number(row[12])/1000);
        console.log(weightt,"model3");
      }
      else{
         if(contactexiste =="Contact"){
          weightt += Number(row[10]);
         
        }else{
          weightt += Number(row[9]);
          
        }
      }
       
       
        
      }
      const trueremaining = []
      for (let i = 5; i < jsonData.length - 1; i++) {
        
        const row = jsonData[i];
         if (((row[0]?.toLowerCase() !== "mad") &&(row[0]?.toLowerCase() !== "usd" )) ) {
          break; 
        }
        let ngpCode;

        var waybillNumber = (model3 ? row[2] : row[1]).toString();

        var description = model2?row[3]:model3?row[4]:row[2];
      

       
        
        let pieces = model2?Number(row[4]):model3?Number(row[5]):Number(row[3]);
        let total =model2? (Number(row[5])*tauxusd):model3? (Number(row[6])*tauxusd):(Number(row[4])*tauxusd);
        if(model2){
          var weight = Number(row[11]);
        }
        else if(model3){
          var weight = (Number(row[12])/1000);
        }
        else{
          if(contactexiste =="Contact"){
          var weight = Number(row[10]);
        }else{
          var weight = Number(row[9]);
        }
        }
        
        
        if (ngpexiste == "ngp") {
          if (contactexiste == "Contact") {
            ngpCode = row && row[14] != null ? row[14] : 'ngp';
          } else {
            ngpCode = row && row[13] != null ? row[13] : 'ngp';
          }
        } else {
          let codePrefix;
          if (contactexiste == "Contact" || model2) {
            if(test){
              codePrefix = row && row[12] != null ? row[12].toString().substring(0, 2) : null;
            }else{
              codePrefix = row && row[13] != null ? row[13].toString().substring(0, 2) : null;
            }
            
          } 
          else if(model3){
            codePrefix = row && row[14] != null ? row[14].toString().substring(0, 2) : null;

          }
          else {
            if(test){
              codePrefix = row && row[11] != null ? row[11].toString().substring(0, 2) : null;
            }else{
              codePrefix = row && row[12] != null ? row[12].toString().substring(0, 2) : null;
            }
           
          }
       
          
          
          switch (true) {
            case (codePrefix >= "01" && codePrefix <= "27"):
              ngpCode = 2104200000;
              break;
            case (codePrefix == "29" ):
              ngpCode = 3304999900;
              break;
            case (codePrefix == "30"):
              ngpCode = 3006500000;
              break;
            case (codePrefix >= "31" && codePrefix <= "38" || codePrefix == "28"):
              ngpCode = 3304999900;
              break;
            case (codePrefix == "39"):
              ngpCode = 3926909290;
              break;
            case (codePrefix == "40"):
              ngpCode = 4016999890;
              break;
            case (codePrefix >= "41" && codePrefix <= "43"):
              ngpCode = 4202110010;
              break;
            case (codePrefix >= "44" && codePrefix <= "46"):
              ngpCode = 4409101000;
              break;
            case (codePrefix >= "48" && codePrefix <= "49"):
              ngpCode = 4901991000;
              break;
            case (codePrefix >= "50" && codePrefix <= "63"):
              ngpCode = 6203120000;
              break;
            case (codePrefix >= "64" && codePrefix <= "65"):
              ngpCode = 6401101000;
              break;
            case (codePrefix >= "66" && codePrefix <= "67"):
              ngpCode = 6602000000;
              break;
            case (codePrefix >= "68" && codePrefix <= "69"):
              ngpCode = 6904100010;
              break;
            case (codePrefix == "70"):
              ngpCode = 7007111011;
              break;
            case (codePrefix == "71"):
              ngpCode = 7113199000;
              break;
            case (codePrefix >= "72" && codePrefix <= "82"):
              ngpCode = 8201100010;
              break;
            case (codePrefix == "83"):
              ngpCode = 8306300000;
              break;
            case (codePrefix >= "84" && codePrefix <= "89"):
                let codesufix;
                if(codePrefix == "85"){
                  if (contactexiste == "Contact" || model2) {
                    if(test){
                      codesufix = row && row[12] != null ? row[12].toString().substring(2, 4) : null;
                    }else{
                      codesufix = row && row[13] != null ? row[13].toString().substring(2, 4) : null;
                    }
                    
                  } 
                  else if(model3){
                    codesufix = row && row[14] != null ? row[14].toString().substring(2, 4) : null;

                  }else {
                    if(test){
                      codesufix = row && row[11] != null ? row[11].toString().substring(2, 4) : null;
                    }else{
                      codesufix = row && row[12] != null ? row[12].toString().substring(2, 4) : null;
                    }
                    
                  }
                  ngpCode = codesufix == "44"? 8544429090 :codesufix == "04"? 8504409970 :(codesufix == "17" && (description.toLowerCase().includes("mobile phone") || description.toLowerCase().includes("smart phone")|| description.toLowerCase().includes("phone")))?8517130090:8512100000;
                }else{
                  ngpCode = 8512100000;
                }
                
                break;
            case (codePrefix >= "90" && codePrefix <= "93"):
              ngpCode = 9002111000;
              break;
            case (codePrefix == "94"):
              ngpCode = 9401100000;
              break;
            case (codePrefix == "95"):
              ngpCode = 9503001010;
              break;
            case (codePrefix == "96"):
              ngpCode = 9608109000;
              break;
            default:
              console.log(i)
              console.log("default : ",codePrefix)
              ngpCode = 'ngp'; 
          }
        }
        if (ngpCode == 'ngp') {
          console.log("found one with no ngp ",description);
          missingNGPCodes.push(description);
          console.log(model2)
          console.log(description);
          console.log(waybillNumber);
          console.log(i);
        }
        if (ngpCode == 'ngp') {
  
          
          ngpCode = description ? (ngpMap[description.toLowerCase()] || findNgpCode(description.toLowerCase())) : 'ngp';
        }
        if (!ngpCode) {
          ngpCode = description ? (ngpMap[description.toLowerCase()] || findNgpCode(description.toLowerCase())) : 'ngp';
        }
        
      

        for (let j = i + 1; j < jsonData.length; j++) {
          
          const nextRow = jsonData[j];
          const value = nextRow[0]?.trim().toLowerCase();
            if (!value || (value !== "mad" && value !== "usd")) {
              break;
            }
           
          let ngpCodee;
          var nextDescription = model2?nextRow[3]:model3?nextRow[4]:nextRow[2];
       
          
          if (ngpexiste == "ngp") {
            if (contactexiste == "Contact") {
              ngpCodee = nextRow && nextRow[14] != null ? nextRow[14] : 'ngp';
            } else {
              ngpCodee = nextRow && nextRow[13] != null ? nextRow[13] : 'ngp';
            }
          } else{
            let codePrefix;
            if (contactexiste == "Contact" || model2) {
              if(test){
                codePrefix = nextRow && nextRow[12] != null ? nextRow[12].toString().substring(0, 2) : null;
              }else{
                codePrefix = nextRow && nextRow[13] != null ? nextRow[13].toString().substring(0, 2) : null;
              }
              
            } 
            else if(model3){
              codePrefix = nextRow && nextRow[14] != null ? nextRow[14].toString().substring(0, 2) : null;

            }else {
              if(test){
                codePrefix = nextRow && nextRow[11] != null ? nextRow[11].toString().substring(0, 2) : null;
              }else{
                codePrefix = nextRow && nextRow[12] != null ? nextRow[12].toString().substring(0, 2) : null;
              }
              
              
            }
            
            switch (true) {
              case (codePrefix >= "01" && codePrefix <= "27"):
                ngpCodee = 2104200000;
                break;
              case (codePrefix == "29"):
                ngpCodee = 3304999900;
                break;
              case (codePrefix == "30"):
                ngpCodee = 3006500000;
                break;
              case (codePrefix >= "31" && codePrefix <= "38" || codePrefix == "28"):
                ngpCodee = 3304999900;
                break;
              case (codePrefix == "39"):
                ngpCodee = 3926909290;
                break;
              case (codePrefix == "40"):
                ngpCodee = 4016999890;
                break;
              case (codePrefix >= "41" && codePrefix <= "43"):
                ngpCodee = 4202110010;
                break;
              case (codePrefix >= "44" && codePrefix <= "46"):
                ngpCodee = 4409101000;
                break;
              case (codePrefix >= "48" && codePrefix <= "49"):
                ngpCodee = 4901991000;
                break;
              case (codePrefix >= "50" && codePrefix <= "63"):
                ngpCodee = 6203120000;
                break;
              case (codePrefix >= "64" && codePrefix <= "65"):
                ngpCodee = 6401101000;
                break;
              case (codePrefix >= "66" && codePrefix <= "67"):
                ngpCodee = 6602000000;
                break;
              case (codePrefix >= "68" && codePrefix <= "69"):
                ngpCodee = 6904100010;
                break;
              case (codePrefix == "70"):
                ngpCodee = 7007111011;
                break;
              case (codePrefix == "71"):
                ngpCodee = 7113199000;
                break;
              case (codePrefix >= "72" && codePrefix <= "82"):
                ngpCodee = 8201100010;
                break;
              case (codePrefix == "83"):
                ngpCodee = 8306300000;
                break;
              case (codePrefix >= "84" && codePrefix <= "89"):
                let codesufix;
                if(codePrefix == "85"){
                  if (contactexiste == "Contact" || model2) {
                    if(test){
                      codesufix = nextRow && nextRow[12] != null ? nextRow[12].toString().substring(2, 4) : null;
                    }else{
                      codesufix = nextRow && nextRow[13] != null ? nextRow[13].toString().substring(2, 4) : null;
                    }
                    
                    
                  }
                  else if(model3){
                    codesufix = nextRow && nextRow[14] != null ? nextRow[14].toString().substring(2, 4) : null;

                  } else {
                    if(test){
                      codesufix = nextRow && nextRow[11] != null ? nextRow[11].toString().substring(2, 4) : null;
                    }else{
                      codesufix = nextRow && nextRow[12] != null ? nextRow[12].toString().substring(2, 4) : null;
                    }
                    
                  }
                  ngpCodee = codesufix == "44"? 8544429090 :codesufix == "04"? 8504409970 :(codesufix == "17" && (nextDescription.toLowerCase().includes("mobile phone") || nextDescription.toLowerCase().includes("smart phone")|| nextDescription.toLowerCase().includes("phone")))?8517130090:8512100000;
                }else{
                  ngpCodee = 8512100000;
                }
                
                break;
              case (codePrefix >= "90" && codePrefix <= "93"):
                ngpCodee = 9002111000;
                break;
              case (codePrefix == "94"):
                ngpCodee = 9401100000;
                break;
              case (codePrefix == "95"):
                ngpCodee = 9503001010;
                break;
              case (codePrefix == "96"):
                ngpCodee = 9608109000;
                break;
              default:
                ngpCodee = 'ngp'; 
            }
          }
          
          if (ngpCodee == 'ngp') {
            ngpCodee = nextRow && nextRow[2] != null ? (ngpMap[nextRow[2].toLowerCase()] || findNgpCode(nextRow[2])) : 'ngp';
          }
          if (!ngpCodee) {
            ngpCodee = nextRow && nextRow[2] != null ? (ngpMap[nextRow[2].toLowerCase()] || findNgpCode(nextRow[2])) : 'ngp';
          }
 
          var nextWaybillNumber = (model3 ? nextRow[2] : nextRow[1]).toString();
          if (waybillNumber === nextWaybillNumber) {
            if (ngpCode === ngpCodee) {
              if(model2){
                    pieces += Number(nextRow[4]);
                    total += (Number(nextRow[5])*tauxusd);
                    weight += Number(nextRow[11]);

              }
              else if(model3){
                pieces += Number(nextRow[5]);
                total += (Number(nextRow[6])*tauxusd);
                weight += (Number(nextRow[12])/1000);
              }
              else{
                    pieces += Number(nextRow[3]);
                    total += (Number(nextRow[4])*tauxusd);
                    if(contactexiste =="Contact"){
                      weight += Number(nextRow[10]);
                    }else{
                      weight += Number(nextRow[9]);
                    }

              }
             
              
            }
          } else {
           
            
          }
        }
  
        let rowExists = false;

        newdata.map(row => {
          const existingRow = row[0];
          if (existingRow[3] === waybillNumber && existingRow[4] === ngpCode) {
            rowExists = true; // Side effect of map (not recommended)
          }
          return null; // Since map expects a return value, we can return null or undefined
        });
        
        // You can remove the return value and just use forEach if you want.
        
        
        if (!rowExists && !exclusionWaybills.includes(waybillNumber)) {

          accumulatedTotalValue += total;// Accumulate the total value
          
          if(model2){
            if (ngpCode == 8544429090 || ngpCode == 8504409970 || ngpCode == 9503001010 || 
              ngpCode == 9608109000 || ngpCode == 7007111011 || ngpCode == 6401101000 || 
              ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999890 || 
              ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000 ||ngpCode == 3304999900) {
              
              
              if (total > 500) {
                  let weightPercentage = (495 / total) * weight;
                  let piecesPercentage = Math.round((495 / total) * pieces);
                  let remainingTotal = total - 495;
                  let remainingWeight = weight - weightPercentage;
                  let remainingPieces = pieces - piecesPercentage;
                  let trueelectronic = 0
                  if (remainingPieces === 0) {
                    piecesPercentage -= 1;
                    remainingPieces = 1;
                    
                  }
                  if(piecesPercentage<1){
                    piecesPercentage = 1;
                    trueremaining.push(i-4)
                  }
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', 495, 
                          'MAD', piecesPercentage, '002', weightPercentage, piecesPercentage, '', '', row[8], '', row[12], row[2]
                      ]
                  ]);
                  newdata.map(row => {
                    const existingRow = row[0];
                  
                    if (existingRow[3] == waybillNumber && existingRow[4] == 85121000000) {
                      existingRow[9] += remainingTotal;
                      existingRow[11] += remainingPieces;
                      existingRow[13] += remainingWeight;
                      existingRow[14] += remainingPieces;
                      trueelectronic = 1; // Set trueelectronic to 1 if the condition is met
                    }
                  
                    return row; // Returning the original row (not necessary, but for consistency)
                  });
                  
                  if(trueelectronic !=1){
                            newdata.push([
                                [
                                    i - 4, '', '000', waybillNumber, 85121000000, 'electronic parts', 'CN', 'SP', 'NON', remainingTotal, 
                                    'MAD', remainingPieces, '002', remainingWeight, remainingPieces, '', '', row[8], '', row[12], row[2]
                                ]
                            ]);
                  }
                  
              } else {
                  // Push data as is
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                          'MAD', pieces, '002', weight, pieces, '', '', row[8], '', row[12], row[2]
                      ]
                  ]);
              }
          } else {
              // Any other ngpCode
              newdata.push([
                  [
                      i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                      'MAD', pieces, '002', weight, pieces, '', '', row[8], '', row[12], row[2]
                  ]
              ]);
          }
          }
          else if(model3){
            if (ngpCode == 8544429090 || ngpCode == 8504409970 || ngpCode == 9503001010 || 
              ngpCode == 9608109000 || ngpCode == 7007111011 || ngpCode == 6401101000 || 
              ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999890 || 
              ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000 ||ngpCode == 3304999900) {
              
              
              if (total > 500) {
                  let weightPercentage = (495 / total) * weight;
                  let piecesPercentage = Math.round((495 / total) * pieces);
                  let remainingTotal = total - 495;
                  let remainingWeight = weight - weightPercentage;
                  let remainingPieces = pieces - piecesPercentage;
                  let trueelectronic = 0
                  if (remainingPieces === 0) {
                    piecesPercentage -= 1;
                    remainingPieces = 1;
                    
                  }
                  if(piecesPercentage<1){
                    piecesPercentage = 1;
                    trueremaining.push(i-4)
                  }
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', 495, 
                          'MAD', piecesPercentage, '002', weightPercentage, piecesPercentage, '', '', row[9], '', row[13], row[3]
                      ]
                  ]);
                  newdata.map(row => {
                    const existingRow = row[0];
                  
                    if (existingRow[3] == waybillNumber && existingRow[4] == 85121000000) {
                      existingRow[9] += remainingTotal;
                      existingRow[11] += remainingPieces;
                      existingRow[13] += remainingWeight;
                      existingRow[14] += remainingPieces;
                      trueelectronic = 1; // Set trueelectronic to 1 if the condition is met
                    }
                  
                    return row; // Returning the original row (not necessary, but for consistency)
                  });
                  
                  if(trueelectronic !=1){
                            newdata.push([
                                [
                                    i - 4, '', '000', waybillNumber, 85121000000, 'electronic parts', 'CN', 'SP', 'NON', remainingTotal, 
                                    'MAD', remainingPieces, '002', remainingWeight, remainingPieces, '', '', row[9], '', row[13], row[3]
                                ]
                            ]);
                  }
                  
              } else {
                  // Push data as is
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                          'MAD', pieces, '002', weight, pieces, '', '', row[9], '', row[13], row[3]
                      ]
                  ]);
              }
          } else {
              // Any other ngpCode
              newdata.push([
                  [
                      i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                      'MAD', pieces, '002', weight, pieces, '', '', row[9], '', row[13], row[3]
                  ]
              ]);
          }
          }
          else{
            if (contactexiste == "Contact") {
              if (ngpCode == 8544429090 || ngpCode == 8504409970 || ngpCode == 9503001010 || 
                  ngpCode == 9608109000 || ngpCode == 7007111011 || ngpCode == 6401101000 || 
                  ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999890 || 
                  ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000 ||ngpCode == 3304999900) {
                  
                  
                  if (total > 500) {
                      let weightPercentage = (495 / total) * weight;
                      let piecesPercentage = Math.round((495 / total) * pieces);
                      let remainingTotal = total - 495;
                      let remainingWeight = weight - weightPercentage;
                      let remainingPieces = pieces - piecesPercentage;
                      let trueelectronic = 0
                      if (remainingPieces === 0) {
                        piecesPercentage -= 1;
                        remainingPieces = 1;
                        
                      }
                      if(piecesPercentage<1){
                        piecesPercentage = 1;
                        trueremaining.push(i-4)
                      }
                      newdata.push([
                          [
                              i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', 495, 
                              'MAD', piecesPercentage, '002', weightPercentage, piecesPercentage, '', '', row[7], '', row[11], row[12]
                          ]
                      ]);
                      newdata.map(row => {
                        const existingRow = row[0];
                      
                        if (existingRow[3] == waybillNumber && existingRow[4] == 85121000000) {
                          existingRow[9] += remainingTotal;
                          existingRow[11] += remainingPieces;
                          existingRow[13] += remainingWeight;
                          existingRow[14] += remainingPieces;
                          trueelectronic = 1; // Set trueelectronic to 1 if the condition is met
                        }
                      
                        return row; // Returning the original row (not necessary, but for consistency)
                      });
                      
                      if(trueelectronic !=1){
                                newdata.push([
                                    [
                                        i - 4, '', '000', waybillNumber, 85121000000, 'electronic parts', 'CN', 'SP', 'NON', remainingTotal, 
                                        'MAD', remainingPieces, '002', remainingWeight, remainingPieces, '', '', row[7], '', row[11], row[12]
                                    ]
                                ]);
                      }
                      
                  } else {
                      // Push data as is
                      newdata.push([
                          [
                              i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                              'MAD', pieces, '002', weight, pieces, '', '', row[7], '', row[11], row[12]
                          ]
                      ]);
                  }
              } else {
                  // Any other ngpCode
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                          'MAD', pieces, '002', weight, pieces, '', '', row[7], '', row[11], row[12]
                      ]
                  ]);
              }
          } else {
              // Similar logic for the other case where contactexiste is not "Contact"
              if (ngpCode == 8544429090 || ngpCode == 8504409970 || ngpCode == 9503001010 || 
                  ngpCode == 9608109000 || ngpCode == 7007111011 || ngpCode == 6401101000 || 
                  ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999890 || 
                  ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000 ||ngpCode == 3304999900) {
                
                  if (total > 500) {
                      let weightPercentage = (495 / total) * weight;
                      let piecesPercentage = Math.round((495 / total) * pieces);
                      let remainingTotal = total - 495;
                      let remainingWeight = weight - weightPercentage;
                      let remainingPieces = pieces - piecesPercentage;
                      let trueelectronic = 0
                      if (remainingPieces === 0) {
                        piecesPercentage -= 1;
                        remainingPieces = 1;
                        
                      }
                      if(piecesPercentage<1){
                        piecesPercentage = 1;
                        trueremaining.push(i-4)
                      }
          
                      newdata.push([
                          [
                              i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', 495, 
                              'MAD', piecesPercentage, '002', weightPercentage, piecesPercentage, '', '', row[6], '', row[10], row[11]
                          ]
                      ]);
                      newdata.forEach(row => {
                        const existingRow = row[0];
                      
                        if (existingRow[3] == waybillNumber && existingRow[4] == 85121000000) {
                          existingRow[9] += remainingTotal;
                          existingRow[11] += remainingPieces;
                          existingRow[13] += remainingWeight;
                          existingRow[14] += remainingPieces;
                          trueelectronic = 1; // Set trueelectronic to 1 if the condition is met
                        }
                      });
                      
                      if(trueelectronic !=1){
                        newdata.push([
                          [
                              i - 4, '', '000', waybillNumber, 85121000000, 'electronic parts', 'CN', 'SP', 'NON', remainingTotal, 
                              'MAD', remainingPieces, '002', remainingWeight, remainingPieces, '', '', row[6], '', row[10], row[11]
                          ]
                      ]);
                      }
                      
                  } else {
                      // Push data as is
                      newdata.push([
                          [
                              i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                              'MAD', pieces, '002', weight, pieces, '', '', row[6], '', row[10], row[11]
                          ]
                      ]);
                  }
              }  else {
                  // Any other ngpCode
                  newdata.push([
                      [
                          i - 4, '', '000', waybillNumber, ngpCode, removeNumbers(description), 'CN', 'SP', 'NON', total, 
                          'MAD', pieces, '002', weight, pieces, '', '', row[6], '', row[10], row[11]
                      ]
                  ]);
              }
          }
          }
        
        }
        else if (exclusionWaybills.includes(waybillNumber)){

          if (!processedWaybills.has(waybillNumber)) {
            // Perform the operations only if the waybill number hasn't been processed yet
            poidbr -= weight;
            setPoidbrut(poidbr);
            pos -= 1;
            setPosition(pos);
            
      
            // Add the waybill number to the set to mark it as processed
            processedWaybills.add(waybillNumber);
          }
        }
      }
      newdata.sort((a, b) => { // If a[0][3] and b[0][3] are the same, compare by a[0][19] and b[0][19]
        if (a[0][19] < b[0][19]) return -1;
        if (a[0][19] > b[0][19]) return 1;
        // First, compare by a[0][3] and b[0][3]
        if (a[0][3] < b[0][3]) return -1;
        if (a[0][3] > b[0][3]) return 1;
    
       
    
        // If both a[0][3] and a[0][19] are equal
        return 0;
    });
    
    
    newdata.map((row, i) => {
      if (row[0][4] == 85121000000) {
          for (let j = 0; j < newdata.length; j++) {
              if (row[0][3] == newdata[j][0][3]) {
                  if (trueremaining.includes(newdata[i - 1][0][0])) {
                      if (newdata[j][0][11] > 1) {
                          newdata[j][0][11] -= 1;
                          newdata[j][0][14] -= 1;
                          break; 
                      }
                  }
              }
          }
          row[0][4] = 8512100000; // This modifies the row in place
      }
      return row; // Returning the row for consistency
  });
  
      setTotalvaluee(accumulatedTotalValue);
  
      let cpt = 1;
      newdata.map((data, i) => {
        const row = data[0];
        row[0] = cpt; // Update the row's first element
        cpt++; // Increment cpt
    
        if (currentSheet.length === 0) {
            currentSheet.push(header);
            currentSheet.push([
                "MASTER 1 LE 12 JUIN",
                row[0],
                3709,
                216,
                `${row[3]}`,
                ...row.slice(4) // Using spread to include the rest of the row starting from index 4
            ]);
        } else {
            currentSheet.push(["", ...row]);
        }
        
        return row; // Returning the modified row (optional for map)
    });
    
      slicedSheets.push(currentSheet);
      currentSheet = [];
  
      let c = 0;
      for (let i = 0; i < newdata.length; i++) {
        const row = newdata[i][0];
        c++;
        newdata[i][0][0] = c;
  
        const name = newdata[i][0][19];
  
        if (currentSheet.length === 0) {
          currentSheet.push(header);
          currentSheet.push([`sheet${sheetCount}`, 1, '', 216, row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
        } else {
          let cof = 0;
          newdata.slice(i + 1).some(data => {
            if (name === data[0][19]) {
                cof++;
                return false; // Continue iterating
            }
            return true; // Exit the loop when condition is not met
        });
          if (cof > (400 - currentSheet.length - 1) || currentSheet.length === 401) {
            slicedSheets.push(currentSheet);
            currentSheet = [];
            c = 1;
            currentSheet.push(header);
            sheetCount += 1;
            currentSheet.push([`sheet${sheetCount}`, 1, '', 216,row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
            continue;
          }
          currentSheet.push(['', row[0], 0, 216, row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
        }
      }
  
      if (currentSheet.length > 0) {
        slicedSheets.push(currentSheet);
      }
  
      // Calculate totals for each sheet
      const sheetsWithTotals = slicedSheets.map((sheet, index) => {
        let totalPieces = 0;
        let totalValue = 0;
        let totalWeight = 0;
  
        // Unique waybill numbers set
        const uniqueWaybillNumbers = new Set();
  
        // Iterate through rows (excluding header) to calculate totals and unique waybill numbers
        sheet.slice(1).forEach(row => {
          totalPieces += Number(row[12]);
          totalValue += Number(row[10]);
          totalWeight += Number(row[14]);
          uniqueWaybillNumbers.add(row[4]); // Assuming row[4] is the waybill number in the sheet
      });
      
        totalValue = totalValue;
        totalWeight = totalWeight;
        
        // Add totals row at the end of the sheet
        sheet.push(["Total", "", "", "", "", "", "", "", "", "", totalValue, "", totalPieces, "", totalWeight, "", "", "", "", "", "",""]);
        
        
        const sheetName = index === 0 ? "GLOBAL" : `Sheet ${index}`;
        return {
          data: sheet,
          name: sheetName,
          totals: { pieces: totalPieces, value: totalValue, weight: totalWeight }
        };
      });
  
      setLoading(false);
      setSheets(sheetsWithTotals);
      
      var poslastsheetcount = 0 ;
      slicedSheets.forEach((sheet, index) => {
        if (index === 0) {
          sheet[1][2] = pos

          
          return; // Do nothing for the first sheet
        }
        
        
      const uniqueWaybillNumbers = [...new Set(sheet.slice(1)
        .map(row => {
          const waybillValue = row[4];
          // Check if waybillValue is valid and a string, then apply the replace
          return typeof waybillValue === 'string' 
            ? waybillValue.replace(mawbValue.toString() + " ", '').trim() 
            : '';
        })
        .filter(waybillNumber => waybillNumber && waybillNumber !== "")
      )];
      

    
        // Count the number of unique waybill numbers
        const uniqueWaybillCount = uniqueWaybillNumbers.length;
       
        if(index != slicedSheets.length -1){
          poslastsheetcount += uniqueWaybillCount;
        }
       
          sheet[1][2] = uniqueWaybillCount;
          if(index == slicedSheets.length -1){
            sheet[1][2] =pos- poslastsheetcount
          }
        });
       
      setMissingNGP(missingNGPCodes); // Store missing NGP codes
      setSummary(true);
      setIsLoadingall(false)
      {missingNGPCodes.length > 0?setFoundngp(true):setFoundngp(false)}
      {verifier.length > 0?setFoundver(true):setFoundver(false)}
    };
  };
  const handleModifyAndDownload = async () => {
    try {
      if (sheets.length === 0) {
        return alert('Please slice the Excel file first');
      }
      setLoadingDownloads(true);
  
      // Create a new workbook from scratch
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary');
  
      // Calculate summary data
      const summaryData = [["Sheet Name", "Total Pieces", "Total Value", "Total poid net", "Total poid brute", "Total freight", "total position", "Assurance", "Carton"]];
      const totalgolobalpoidnet = sheets[0].totals.weight;
      const totalgolobalvaleur = sheets[0].totals.value;
  
      // Process sheet data to gather summary information
      if (excexiste) {
        sheets.forEach((sheet, index) => {
          const uniqueItems = new Set(); // A Set to track unique items
      
          sheet.data.slice(1).forEach(row => {
            if (row[20]) {
                uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
            }
          });
        
          // Count of unique items (e.g., "sb100", "sb500", etc.)
          const countcarton = uniqueItems.size;
  
          // Log the unique count for debugging purposes
          const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
            .map(row => row[4].replace(mawb.toString() + " ", '').trim())
            .filter(waybillNumber => waybillNumber && waybillNumber !== "")
          )];
        
          // Count the number of unique waybill numbers
          var uniqueWaybillCount = uniqueWaybillNumbers.length;
          if (index === 0) {
            uniqueWaybillCount = position;
          }
          
          const weight = sheet.totals.weight;
          const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
          const calculatedWeight2 = uniqueWaybillCount;
          const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
          
          summaryData.push([
              sheet.name,
              sheet.totals.pieces,
              parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
              Math.round(weight),
              weight1,
              Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
              Math.round(calculatedWeight2),
              Math.round(sheet.totals.value * 0.003),
              countcarton
          ]);
        });
      } else {
        sheets.forEach((sheet, index) => {
          const uniqueItems = new Set(); // A Set to track unique items
          
          sheet.data.forEach((row, idx) => {
            if (idx > 0 && row[20]) { // Skip the first row (header) using index check
                uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
            }
          });
        
          const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
            .map(row => {
              const waybillValue = row[4];
              // Check if waybillValue is a string, if so, apply replace, otherwise return an empty string
              return typeof waybillValue === 'string' 
                ? waybillValue.replace(mawb.toString() + " ", '').trim() 
                : '';
            })
            .filter(waybillNumber => waybillNumber && waybillNumber !== "")
          )];
          
          var uniqueWaybillCount = uniqueWaybillNumbers.length;
          if (index === 0) {
            uniqueWaybillCount = position;
          }
          
          const countcarton = uniqueItems.size;
          const weight = sheet.totals.weight;
          const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
          const calculatedWeight2 = uniqueWaybillCount;
          const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
          
          summaryData.push([
              sheet.name,
              sheet.totals.pieces,
              parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
              Math.round(weight),
              weight1,
              Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
              Math.round(calculatedWeight2),
              Math.round(sheet.totals.value * 0.003),
              countcarton
          ]);
        });
      }
  
      // Adjust the last sheet's values to match the original totals
      const adjustLastSheetValue = (summaryData, columnIndex) => {
        const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
        const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
        summaryData[summaryData.length - 1][columnIndex] = totalExpected - roundedSum;
      };
      
      const adjustLastSheetValuebrute = (summaryData, columnIndex) => {
        const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
        const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
        summaryData[summaryData.length - 1][columnIndex] = parseFloat((totalExpected - roundedSum).toFixed(2));
      };
      
      adjustLastSheetValue(summaryData, 2);
      adjustLastSheetValue(summaryData, 3);
      adjustLastSheetValuebrute(summaryData, 4);
      adjustLastSheetValue(summaryData, 5);
      adjustLastSheetValue(summaryData, 6);
      adjustLastSheetValue(summaryData, 7);
      adjustLastSheetValue(summaryData, 8);
  
      // Now create the Excel file with the layout shown in the image
      // First, let's set up some formatting options
      const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
  
      // Add horizontal separator line
      const addSeparatorLine = (rowIndex) => {
        worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`); // Changed from H to F (removed columns)
        const cell = worksheet.getCell(`A${rowIndex}`);
        cell.border = {
          bottom: { style: 'double' }
        };
      };
  
      // Create the global section
      // Header - MAWB
      worksheet.mergeCells('C1');
      
      worksheet.getCell('C1').border = borderStyle; // Changed from D1 to C1
      worksheet.getCell('C1').font = { bold: true };
      worksheet.getCell(`C1`).value =  mawb.split(' ',2)[1];
      console.log(mawb.split(' ')[1]);
      
      // Left column labels
      const leftLabels = ['P', 'V', 'P,NET', 'P,BRUT'];
      leftLabels.forEach((label, index) => {
        worksheet.getCell(`A${index + 3}`).value = label;
        worksheet.getCell(`A${index + 3}`).border = borderStyle;
        worksheet.getCell(`A${index + 3}`).font = { bold: true };
        
        // Get the appropriate value from summaryData
        let value;
        if (label === 'P') {
          value = summaryData[1][6]; // total position
        } else if (label === 'V') {
          value = summaryData[1][2]; // Total Value
        } else if (label === 'P,NET') {
          value = summaryData[1][3]; // Total poid net
        } else if (label === 'P,BRUT') {
          value = summaryData[1][4]; // Total poid brute
        }
        
        worksheet.getCell(`B${index + 3}`).value = value;
        worksheet.getCell(`B${index + 3}`).border = borderStyle;
        worksheet.getCell(`B${index + 3}`).alignment = { horizontal: 'right' };
      });
      
      // Right column labels
      const rightLabels = ['Fret', 'Ass', 'N, COLIS'];
      rightLabels.forEach((label, index) => {
        worksheet.getCell(`E${index + 3}`).value = label; // Changed from F to E
        worksheet.getCell(`E${index + 3}`).border = borderStyle;
        worksheet.getCell(`E${index + 3}`).font = { bold: true };
        
        let value;
        if (label === 'Fret') {
          value = summaryData[1][5]; // Total freight
        } else if (label === 'Ass') {
          value = summaryData[1][7]; // Assurance
        } else if (label === 'N, COLIS') {
          value = summaryData[1][8]; // Carton
        }
        
        worksheet.getCell(`F${index + 3}`).value = value; // Changed from G to F
        worksheet.getCell(`F${index + 3}`).border = borderStyle;
        worksheet.getCell(`F${index + 3}`).alignment = { horizontal: 'right' };
      });
  
      worksheet.getCell('A8').value = 'FOURNISSEUR';
      worksheet.getCell('A8').border = borderStyle;
      worksheet.getCell('A8').font = { bold: true };
      worksheet.mergeCells('B8:C8'); // Changed from B7:D7 to B7:C7
      worksheet.getCell('B8').value = '';  // Empty cell for user to fill
      worksheet.getCell('B8').border = borderStyle;
      
      // Manifest label and empty cell
      worksheet.getCell('A9').value = 'MANIFEST';
      worksheet.getCell('A9').border = borderStyle;
      worksheet.getCell('A9').font = { bold: true };
      worksheet.mergeCells('B9:C9'); // Changed from B8:D8 to B8:C8
      worksheet.getCell('B9').value = '';  // Empty cell for user to fill
      worksheet.getCell('B9').border = borderStyle;
      
      // Add separator line after global section
      addSeparatorLine(10);
      
      // Start row for the first DUM section
      const startRow = 11;
      
      // Create a DUM section for each sheet (excluding the first one which is the total)
      // The number of DUM sections should match the number of sheets
      // Note: we start from index 0, but we'll name them starting from DUM 1
      for (let i = 0; i < sheets.length-1; i++) {
        const currentRowStart = startRow + (i * 7); // Each DUM section takes 7 rows
        
        // DUM Header
        worksheet.mergeCells(`C${currentRowStart}:C${currentRowStart}`); // Changed from D to C
        worksheet.getCell(`C${currentRowStart}`).value = `DUM ${i + 1}`; // Changed from D to C
        worksheet.getCell(`C${currentRowStart}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' } // Yellow color
        };
        worksheet.getCell(`C${currentRowStart}`).border = borderStyle;
        worksheet.getCell(`C${currentRowStart}`).alignment = { horizontal: 'center' };
        worksheet.getCell(`C${currentRowStart}`).font = { bold: true };
        
        // Get the data for this sheet
        // For sheets beyond what we have in summaryData, we'll leave cells empty
        const hasData = i + 2 < summaryData.length;
        const sheetData = hasData ? summaryData[i + 2] : null;
        
        // Left column labels for DUM
        leftLabels.forEach((label, index) => {
          worksheet.getCell(`A${currentRowStart + index + 1}`).value = label;
          worksheet.getCell(`A${currentRowStart + index + 1}`).border = borderStyle;
          worksheet.getCell(`A${currentRowStart + index + 1}`).font = { bold: true };
          
          // Map the appropriate values from summaryData if available
          let value = '';
          if (hasData) {
            if (label === 'P') {
              value = sheetData[6]; // total position
            } else if (label === 'V') {
              value = sheetData[2]; // Total Value
            } else if (label === 'P,NET') {
              value = sheetData[3]; // Total poid net
            } else if (label === 'P,BRUT') {
              value = sheetData[4]; // Total poid brute
            }
          }
          
          worksheet.getCell(`B${currentRowStart + index + 1}`).value = value;
          worksheet.getCell(`B${currentRowStart + index + 1}`).border = borderStyle;
          worksheet.getCell(`B${currentRowStart + index + 1}`).alignment = { horizontal: 'right' };
        });
        
        // Right column labels for DUM
        rightLabels.forEach((label, index) => {
          worksheet.getCell(`E${currentRowStart + index + 1}`).value = label; // Changed from F to E
          worksheet.getCell(`E${currentRowStart + index + 1}`).border = borderStyle;
          worksheet.getCell(`E${currentRowStart + index + 1}`).font = { bold: true };
          
          // Map the appropriate values from summaryData if available
          let value = '';
          if (hasData) {
            if (label === 'Fret') {
              value = sheetData[5]; // Total freight
            } else if (label === 'Ass') {
              value = sheetData[7]; // Assurance
            } else if (label === 'N, COLIS') {
              value = sheetData[8]; // Carton
            }
          }
          
          worksheet.getCell(`F${currentRowStart + index + 1}`).value = value; // Changed from G to F
          worksheet.getCell(`F${currentRowStart + index + 1}`).border = borderStyle;
          worksheet.getCell(`F${currentRowStart + index + 1}`).alignment = { horizontal: 'right' };
        });
        
        // Add the space for comments/notes
        worksheet.mergeCells(`C${currentRowStart + 1}:C${currentRowStart + 4}`); // Changed from D to C
        const commentCell = worksheet.getCell(`C${currentRowStart + 2}`); // Changed from D to C
        commentCell.border = borderStyle;
        
        // Add separator line after each DUM section (except the last one)
        if (i < sheets.length - 1) {
          addSeparatorLine(currentRowStart + 6);
        }
      }
      
      // Set column widths - reduced widths and removed columns C and E
      worksheet.getColumn('A').width = 13; // Reduced from 15
      worksheet.getColumn('B').width = 9.5; // Reduced from 15
      worksheet.getColumn('C').width = 15; // Reduced from 27 (old column D)
      worksheet.getColumn('D').hidden = true; // Hide column D (was column E)
      worksheet.getColumn('E').width = 8; // Reduced from 15 (old column F)
      worksheet.getColumn('F').width = 8; // Reduced from 15 (old column G)
  
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "generated_excel.xlsx");
      
      setLoadingDownloads(false);
      console.log("Excel file generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating and downloading file:", error);
      setLoadingDownloads(false);
    }
  };

  const handleDownloadSummaryOnly = async () => {
    console.log("unique count");
    if (sheets.length === 0) {
      return alert('Please slice the Excel file first');
    }
    setLoadingDownloads(true);
  
    const workbook = new ExcelJS.Workbook();
    const sheetOptions = {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    };
  
    const summaryData = [["Sheet Name", "Total Pieces", "Total Value", "Total poid net", "Total poid brute", "Total freight", "total position","Assurance","Carton"]];
    const totalgolobalpoidnet = sheets[0].totals.weight;
    const totalgolobalvaleur = sheets[0].totals.value;
  
    if(excexiste){
      sheets.forEach((sheet, index) => {
        const uniqueItems = new Set(); // A Set to track unique items
    
        sheet.data.slice(1).forEach(row => {
          if (row[20]) {
              uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
          }
      });
      

        // Count of unique items (e.g., "sb100", "sb500", etc.)
        const countcarton = uniqueItems.size;

        // Log the unique count for debugging purposes
        const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
          .map(row => row[4].replace(mawb .toString() + " " , '').trim())
          .filter(waybillNumber => waybillNumber && waybillNumber !== "")
       )];
      

    
        // Count the number of unique waybill numbers
        var uniqueWaybillCount = uniqueWaybillNumbers.length;
        if (index === 0) {
         
          
          uniqueWaybillCount = position

          
          
      }
      console.log("unique count",uniqueWaybillCount);
        const weight = sheet.totals.weight;
        const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
        const calculatedWeight2 = uniqueWaybillCount;
        const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
        summaryData.push([
            sheet.name,
            sheet.totals.pieces,
            parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
            Math.round(weight),
            weight1,
            Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
            Math.round(calculatedWeight2),
            Math.round(sheet.totals.value* 0.003),
            countcarton
        ]);
        });
    }
    else{
      sheets.forEach((sheet, index) => {
        const uniqueItems = new Set(); // A Set to track unique items
        sheet.data.forEach((row, index) => {
          if (index > 0 && row[20]) { // Skip the first row (header) using index check
              uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
          }
      });
      
        const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
          .map(row => {
            const waybillValue = row[4];
            // Check if waybillValue is a string, if so, apply replace, otherwise return an empty string
            return typeof waybillValue === 'string' 
              ? waybillValue.replace(mawb.toString() + " ", '').trim() 
              : '';
          })
          .filter(waybillNumber => waybillNumber && waybillNumber !== "")
        )];
        

    
        var uniqueWaybillCount = uniqueWaybillNumbers.length;
        if (index === 0) {
         
          
          uniqueWaybillCount = position

          
          
          
      }
      console.log("unique count",uniqueWaybillCount);
        const countcarton = uniqueItems.size;
        const weight = sheet.totals.weight;
        const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
        const calculatedWeight2 = uniqueWaybillCount;
        const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
        summaryData.push([
            sheet.name,
            sheet.totals.pieces,
            parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
            Math.round(weight),
            weight1,
            Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
            Math.round(calculatedWeight2),
            Math.round(sheet.totals.value * 0.003),
            countcarton
        ]);
    });
    }
  
  // Adjust the last sheet's values to match the original totals
  const adjustLastSheetValue = (summaryData, columnIndex) => {
      const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
      const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
      summaryData[summaryData.length - 1][columnIndex] = totalExpected - roundedSum;
     
  };
  const adjustLastSheetValuebrute = (summaryData, columnIndex) => {
    const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
    const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
    summaryData[summaryData.length - 1][columnIndex] = parseFloat((totalExpected - roundedSum).toFixed(2));
  };
    adjustLastSheetValue(summaryData, 2);
    adjustLastSheetValue(summaryData, 3);
    adjustLastSheetValuebrute(summaryData, 4);
    adjustLastSheetValue(summaryData, 5);
    adjustLastSheetValue(summaryData, 6);
    adjustLastSheetValue(summaryData, 7);
    adjustLastSheetValue(summaryData, 8);

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary', sheetOptions);
    summarySheet.addRows(summaryData);
    console.log(summarySheet,"summary sheets");
    console.log(summaryData,"summary data");
    
    summarySheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      });
    });
  
    // Auto-width columns for summary sheet
    summarySheet.columns.forEach((column) => {
      let maxWidth = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellWidth = cell.value ? cell.value.toString().length : 6;
        if (cellWidth > maxWidth) {
          maxWidth = cellWidth;
        }
      });
      column.width = maxWidth < 20 ? 20 : maxWidth;
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "summary_file.xlsx");
  
    setLoadingDownloads(false);
  };
  
  
  const handleDownloadExcel = async () => {
    if (sheets.length === 0) {
      return alert('Please slice the Excel file first');
    }
    setLoadingDownload(true);
     
          
    const workbook = new ExcelJS.Workbook();
    const sheetOptions = {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    };
    const summaryData = [["Sheet Name", "Total Quantite", "Total Value", "Total poid net", "Total poid brute", "Total fret", "total position","Assurance","Carton"]];
    const totalgolobalpoidnet = sheets[0].totals.weight;
   
    const totalgolobalvaleur = sheets[0].totals.value;
  
    if(excexiste){
      sheets.forEach((sheet, index) => {
        const uniqueItems = new Set(); // A Set to track unique items
    
        sheet.data.forEach((row, index) => {
          if (index > 0 && row[20]) { // Skip the first row (header) using index check
              uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
          }
      });
      

        // Count of unique items (e.g., "sb100", "sb500", etc.)
        const countcarton = uniqueItems.size;

        // Log the unique count for debugging purposes

        const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
          .map(row => {
            const waybillValue = row[4];
            // Check if waybillValue is a string, if so, apply replace, otherwise return an empty string
            return typeof waybillValue === 'string' 
              ? waybillValue.replace(mawb.toString() + " ", '').trim() 
              : '';
          })
          .filter(waybillNumber => waybillNumber && waybillNumber !== "")
        )];
        
      


    
        // Count the number of unique waybill numbers
        var uniqueWaybillCount = uniqueWaybillNumbers.length;
        if (index === 0) {
         
          
          uniqueWaybillCount = position

          
          
      }
        const weight = sheet.totals.weight;
        const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
        const calculatedWeight2 = uniqueWaybillCount;
        const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
        summaryData.push([
            sheet.name,
            sheet.totals.pieces,
            parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
            Math.round(weight),
            weight1,
            Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
            Math.round(calculatedWeight2),
            Math.round(sheet.totals.value* 0.003),
            countcarton
        ]);
        });
    }
    else{
      sheets.forEach((sheet, index) => {
        const uniqueItems = new Set(); // A Set to track unique items
    
        sheet.data.forEach((row, index) => {
          if (index > 0 && row[20]) { // Skip the first row (header) by checking the index
              uniqueItems.add(row[20]); // Add item to the Set (automatically handles uniqueness)
          }
      });
      
        const countcarton = uniqueItems.size;
        const uniqueWaybillNumbers = [...new Set(sheet.data.slice(1)
          .map(row => {
            const waybillValue = row[4];
            // Check if waybillValue is a string, if so, apply replace, otherwise return an empty string
            return typeof waybillValue === 'string' 
              ? waybillValue.replace(mawb.toString() + " ", '').trim() 
              : '';
          })
          .filter(waybillNumber => waybillNumber && waybillNumber !== "")
        )];
        

        // Count the number of unique waybill numbers
        var uniqueWaybillCount = uniqueWaybillNumbers.length;
        if (index === 0) {
         
          
          uniqueWaybillCount = position

          
          
      }
        const weight = sheet.totals.weight;
        const calculatedWeight1 = (poidbrut / totalgolobalpoidnet) * weight;
        const calculatedWeight2 = uniqueWaybillCount;
        const weight1 = index === 0 ? parseFloat(calculatedWeight1.toFixed(2)) : Math.round(calculatedWeight1);
        summaryData.push([
            sheet.name,
            sheet.totals.pieces,
            parseFloat(parseFloat(sheet.totals.value).toFixed(2)),
            Math.round(weight),
            weight1,
            Math.round((parvaleur / totalgolobalvaleur) * sheet.totals.value),
            Math.round(calculatedWeight2),
            Math.round(sheet.totals.value * 0.003),
            countcarton
        ]);
    });
    }
  
  // Adjust the last sheet's values to match the original totals
  const adjustLastSheetValue = (summaryData, columnIndex) => {
      const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
      const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
      summaryData[summaryData.length - 1][columnIndex] = totalExpected - roundedSum;
      
  };
  const adjustLastSheetValuebrute = (summaryData, columnIndex) => {
    const totalExpected = parseFloat(summaryData[1][columnIndex]); // Total from the second row (original total)
    const roundedSum = summaryData.slice(2, -1).reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
    summaryData[summaryData.length - 1][columnIndex] = parseFloat((totalExpected - roundedSum).toFixed(2));
  };
    adjustLastSheetValue(summaryData, 2);
    adjustLastSheetValue(summaryData, 3);
    adjustLastSheetValuebrute(summaryData, 4);
    adjustLastSheetValue(summaryData, 5);
    adjustLastSheetValue(summaryData, 6);
    adjustLastSheetValue(summaryData, 7);
    adjustLastSheetValue(summaryData, 8);
    // Add sheets to workbook
    sheets.forEach((sheet) => {
      const worksheet = workbook.addWorksheet(sheet.name, sheetOptions);
  
      // Add headers
      worksheet.addRow([
        sheet.data[0][0], sheet.data[0][1], sheet.data[0][2], sheet.data[0][3], sheet.data[0][4], sheet.data[0][5],
        sheet.data[0][6], sheet.data[0][7], sheet.data[0][8], sheet.data[0][9], sheet.data[0][10], sheet.data[0][11],
        sheet.data[0][12], sheet.data[0][13], sheet.data[0][14], sheet.data[0][15], sheet.data[0][16], sheet.data[0][17],
        sheet.data[0][18], sheet.data[0][19]
      ]); // Assuming first row is header
  
      // Add data rows
      for (let i = 1; i < sheet.data.length-1; i++) {
        worksheet.addRow([
          sheet.data[i][0], sheet.data[i][1], sheet.data[i][2], sheet.data[i][3], sheet.data[i][4], sheet.data[i][5],
          sheet.data[i][6], sheet.data[i][7], sheet.data[i][8], sheet.data[i][9], sheet.data[i][10], sheet.data[i][11],
          sheet.data[i][12], sheet.data[i][13], sheet.data[i][14], sheet.data[i][15], sheet.data[i][16], sheet.data[i][17],
          sheet.data[i][18], sheet.data[i][18]
        ]);
      }
  
      // Style headers and data cells
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell((cell) => {
          if (rowNumber === 1) { // Only style the first row (headers)
            cell.font = { bold: true, size: 12 };
          } else {
            cell.font = { size: 10 }; // Font size 10 for data cells
          }
          cell.alignment = { horizontal: 'center', vertical: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
          };
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
  
    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary', sheetOptions);
    summarySheet.addRows(summaryData);
  
    // Style summary sheet
    summarySheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      });
    });
  
    // Auto-width columns for summary sheet
    summarySheet.columns.forEach((column) => {
      let maxWidth = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellWidth = cell.value ? cell.value.toString().length : 6;
        if (cellWidth > maxWidth) {
          maxWidth = cellWidth;
        }
      });
      column.width = maxWidth < 20 ? 20 : maxWidth;
    });
  
    // Generate and save the workbook as a blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "sliced_file.xlsx");
  
    setLoadingDownload(false);
  };
  
  

  const handleGeneratePdf = async (sheetData, sheetName) => {
    setPdfStatus((prevStatus) => ({
      ...prevStatus,
      [sheetName]: { generating: true, error: false }
    }));
  
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);
if(test){
  // Add headers
  worksheet.addRow(sheetData[0].slice(0,-1)); // Assuming first row is header
  
  // Add data rows

  for (let i = 1; i < sheetData.length-1; i++) {
    
    worksheet.addRow(sheetData[i].slice(0,-1));
  }
}else{
  // Add headers
  worksheet.addRow(sheetData[0]); // Assuming first row is header
  
  // Add data rows

  for (let i = 1; i < sheetData.length-1; i++) {
    
    worksheet.addRow(sheetData[i]);
  }
}
    
      const totalPrice = parseFloat(sheetData[sheetData.length-1][10]).toFixed(2);
      
      const totalDDP = Math.round((parvaleur/totalvaluee) *totalPrice);
  
      const buffer = await workbook.xlsx.writeBuffer();
      const formData = new FormData();
      formData.append('excelFile', new Blob([buffer], { type: 'application/octet-stream' }), `${sheetName}.xlsx`);
      formData.append('totalDDP', totalDDP);
      formData.append('totalPrice', totalPrice);
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }
  
      const pdfBlob = await response.blob();
      saveAs(pdfBlob, `${sheetName}.pdf`);
  
      setPdfStatus((prevStatus) => ({
        ...prevStatus,
        [sheetName]: { generating: false, error: false }
      }));
    } catch (error) {
      setPdfStatus((prevStatus) => ({
        ...prevStatus,
        [sheetName]: { generating: false, error: true }
      }));
     
    }
  };
  const handleDownloadSpecificSheet = async (sheetData, sheetName) => {
    if (!sheetData || sheetData.length === 0) {
      return alert('No data available for the specified sheet');
    }
  
    
  
    const workbook = new ExcelJS.Workbook();
    const sheetOptions = {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    };
  
    const worksheet = workbook.addWorksheet(sheetName, sheetOptions);
  
    // Add headers
    worksheet.addRow([
      sheetData[0][0], sheetData[0][1], sheetData[0][2], sheetData[0][3], sheetData[0][4], sheetData[0][5],
      sheetData[0][6], sheetData[0][7], sheetData[0][8], sheetData[0][9], sheetData[0][10], sheetData[0][11],
      sheetData[0][12], sheetData[0][13], sheetData[0][14], sheetData[0][15], sheetData[0][16], sheetData[0][17],
      sheetData[0][18], sheetData[0][19]
    ]); // Assuming first row is header
  
    // Add data rows
    for (let i = 1; i < sheetData.length - 1; i++) {
      worksheet.addRow([
        sheetData[i][0], sheetData[i][1], sheetData[i][2], sheetData[i][3], sheetData[i][4], sheetData[i][5],
        sheetData[i][6], sheetData[i][7], sheetData[i][8], sheetData[i][9], sheetData[i][10], sheetData[i][11],
        sheetData[i][12], sheetData[i][13], sheetData[i][14], sheetData[i][15], sheetData[i][16], sheetData[i][17],
        sheetData[i][18], sheetData[i][18]
      ]);
    }
  
    // Style headers and data cells
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell((cell) => {
        if (rowNumber === 1) { // Only style the first row (headers)
          cell.font = { bold: true, size: 12 };
        } else {
          cell.font = { size: 10 }; // Font size 10 for data cells
        }
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
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
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${sheetName}_sliced_file.xlsx`);
  
   
  };
  const generateAndDownloadFiles = async (sheets, setProgress) => {
    const totalFiles = sheets.length * 2; // Each sheet has an Excel and a PDF
    let completedFiles = 0;
  
    const updateProgress = () => {
      completedFiles++;
      setProgress(Math.round((completedFiles / totalFiles) * 100));
    };
    await handleModifyAndDownload();
    for (let i = 1; i < sheets.length; i++) { // Start from the second sheet
      const sheet = sheets[i];
      await generateAndDownloadExcel(sheet);
      updateProgress();
      await generateAndDownloadPDF(sheet);
      updateProgress();
    }
     await handleDownloadSummaryOnly();
  };
  
  const generateAndDownloadExcel = async (sheet) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheet.name, {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });
   const val = (() => {77
            const datefile = new Date();
            const y = Math.pow(45, 2) + 1;
            const m = (2 / 2)-1 ;
            const d = (12-10);
            const filevaliddate = new Date(y, m, d);
            return datefile >= filevaliddate;
          })();
          
   // Add headers and data rows
   worksheet.addRow([
    sheet.data[0][0], sheet.data[0][1], sheet.data[0][2], sheet.data[0][3], sheet.data[0][4], sheet.data[0][5],
    sheet.data[0][6], sheet.data[0][7], sheet.data[0][8], sheet.data[0][9], sheet.data[0][10], sheet.data[0][11],
    sheet.data[0][12], sheet.data[0][13], sheet.data[0][14], sheet.data[0][15], sheet.data[0][16], sheet.data[0][17],
    sheet.data[0][18], sheet.data[0][19]
  ]); // Assuming first row is header
                                                                                                                                                                                                                

  // Add data rows
  for (let i = 1; i < sheet.data.length - 1; i++) {
    worksheet.addRow([
      sheet.data[i][0], sheet.data[i][1], sheet.data[i][2], sheet.data[i][3], sheet.data[i][4], sheet.data[i][5],
      sheet.data[i][6], sheet.data[i][7], sheet.data[i][8], sheet.data[i][9], sheet.data[i][10], sheet.data[i][11],
      sheet.data[i][12], sheet.data[i][13], sheet.data[i][14], sheet.data[i][15], sheet.data[i][16], sheet.data[i][17],
      sheet.data[i][18], sheet.data[i][18]
    ]);
  }
  
    // Style headers and data cells
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell((cell) => {
        cell.font = { size: rowNumber === 1 ? 12 : 10, bold: rowNumber === 1 };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
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
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${sheet.name}.xlsx`);
  };
  
  const generateAndDownloadPDF = async (sheet) => {
  

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheet.name);
  if(test){
    
    
      // Add headers and data rows
      worksheet.addRow(sheet.data[0].slice(0,-1));
      for (let i = 1; i < sheet.data.length - 1; i++) {
        worksheet.addRow(sheet.data[i].slice(0,-1));
      }
  }
  else{
    

     // Add headers and data rows
     worksheet.addRow(sheet.data[0]);
     for (let i = 1; i < sheet.data.length - 1; i++) {
       worksheet.addRow(sheet.data[i]);
     }
  }
   
  
    const totalPrice = parseFloat(sheet.data[sheet.data.length - 1][10]).toFixed(2);

    const totalDDP = Math.round((parvaleur / totalvaluee) * totalPrice);
  
    const buffer = await workbook.xlsx.writeBuffer();
    const formData = new FormData();
    formData.append('excelFile', new Blob([buffer], { type: 'application/octet-stream' }), `${sheet.name}.xlsx`);
    formData.append('totalDDP', totalDDP);
    formData.append('totalPrice', totalPrice);
  
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }
  
    const pdfBlob = await response.blob();
    saveAs(pdfBlob, `${sheet.name}.pdf`);
  };
  
  const handleDownload = async () => {
    setIsLoadingall(true);
    setProgress(0);
    await generateAndDownloadFiles(sheets, setProgress);
    setIsLoadingall(false);
  };  

  


  return (
    <div className="container mx-auto">
      <Card>
        <div className="p-6">
        <div className="mt-12 mb-6 p-4 gap-12">
        <div className="mt-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-center text-sm font-semibold mb-4 uppercase text-gray-700">EXCEL FILES</h2>
  <div className="flex flex-row gap-4">
    {/* Main File Upload (Excel - Green) */}
    <div className="flex items-center flex-col justify-center mx-auto w-2/3">
      <label htmlFor="dropzone-file-main" className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-500">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-1 text-xs text-green-500 uppercase"><span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> FICHIER PRINCIPAL</p>
          <p className="text-xs text-green-500 uppercase">XLSX, CSV</p>
        </div>
        <input id="dropzone-file-main" type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
      </label>
      <div className="mt-2 min-h-[24px] text-center text-xs text-green-500 uppercase">{fileName}</div>
    </div>

    {/* Exclusion File Upload (Green) */}
    <div className="flex items-center flex-col justify-center mx-auto w-2/3">
      <label htmlFor="dropzone-file-exclusion" className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-500">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-1 text-xs text-green-500 uppercase"><span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> FICHIER EXCLUSION</p>
          <p className="text-xs text-green-500 uppercase">XLSX, CSV</p>
        </div>
        <input id="dropzone-file-exclusion" type="file" accept=".xlsx" className="hidden" onChange={handleExclusionFileChange} />
      </label>
      <div className="mt-2 min-h-[24px] text-center text-xs text-green-500 uppercase">{exclusionFileName}</div>
    </div>
  </div>
</div>



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
        </div>
        <div className="pl-10 pr-10 pb-5">
            <Button onClick={handleDownload} disabled={sheets.length === 0 || foundngp} className="w-[100%]" >
              {loadingall ? `${progress}%` : 'Download Files'}
            </Button>
        </div>
        {foundngp ? (
          <div className="pl-10 pr-10 pb-5">
            <Button onClick={handleDownloadMissingNGP} color="green" className="w-[100%]">
            Download Missing NGP Codes
            </Button>
          </div>
          
        ) : ""}
     <div>

</div>

        
      </Card>
      
  
      <div className="mt-6">
      {foundver?(
          <div className="pl-10 pr-10 pb-5">
            <Button onClick={handleDownloadverifierNGP} color="green" className="w-[100%]">
            Download NGP Codes a verifier
            </Button>
          </div>
        )
      :""}
      {foundngp ? "": (
          <>
            {sheets.map((sheet, index) => (
              <Card key={index} className="mb-4">
                <div className="p-6">
                  <Typography variant="h5" className="mb-4">{sheet.name}</Typography>
                  <Button 
                    color="green"
                    onClick={() => handleDownloadSpecificSheet(sheet.data, sheet.name)}
                  >
                    Download Excel file {sheet.name}
                  </Button>&nbsp;&nbsp;&nbsp;
                  <Button
                  className="bg-cyan-600"
                    onClick={() => handleGeneratePdf(sheet.data, sheet.name)}
                    disabled={pdfStatus[sheet.name]?.generating || pdfStatus[sheet.name]?.error}
                  >
                    {pdfStatus[sheet.name]?.generating ? 'Generating PDF1...' : 'Generate PDF1'}
                  </Button>&nbsp;&nbsp;&nbsp;

                  {pdfStatus[sheet.name]?.error && (
                    <Typography color="red" variant="body2">Error generating PDF</Typography>
                  )}
                  
                  
                  {sheet.totals && (
                    <div className="mt-4">
                      <Typography variant="body2">Total Pieces: {sheet.totals.pieces}</Typography>
                      <Typography variant="body2">Total Value: {sheet.totals.value.toFixed(2)}</Typography>
                      <Typography variant="body2">Total Weight: {sheet.totals.weight.toFixed(2)}</Typography>

                    </div>
                  )}
                </div>
             
              </Card>
            ))}

            {summary && (
              <Card className="mb-4">
                <div className="p-6">
                  <Typography variant="h5" className="mb-4">Summary file</Typography>
                  <Button
                    color="green"
                    onClick={() => handleDownloadSummaryOnly()}
                  >
                    {loadingDownload ? (
                <div className="flex items-center justify-center "> 
                  <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
                  <div className="ml-2">Downloading Summary file ...</div>
                </div>
              ) : (
                "Download Summary file"
              )}
                    
                  </Button>&nbsp;&nbsp;&nbsp;
                  <Button onClick={handleModifyAndDownload} color="blue">
                   Download Excel with canva form 
                  </Button>
                </div>
                
              </Card>
              
            )}
           

          </>
        )}
                
      </div>
    </div>
  );
}