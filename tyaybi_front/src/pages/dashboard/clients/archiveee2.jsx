import React, { useState,useEffect } from "react";
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
  const [a, setA] = useState('');
  const [poidddbr, setM] = useState('');
  const [netpoidd, setJ] = useState('');
  const [loadingDownload,setLoadingDownload]=useState(false)
  const [loadingDownloads,setLoadingDownloads]=useState(false)
  const [foundver,setFoundver]=useState(false)
  const [summary,setSummary]=useState(false)
  const [missingNGP, setMissingNGP] = useState([]);
  const [foundngp,setFoundngp]=useState(false)
  const [showForm, setShowForm] = useState(false);
  const [showPdfquitance, setShowPdfquitance] = useState(false);
  const [wordFile, setWordFile] = useState(null)
  const [WordfileName, setWordFileName] = useState();
  const [pdfFile, setPdfFile] = useState(null)
  const [PdffileName, setPdfFileName] = useState();
  const [PdffileName2, setPdfFileName2] = useState();

  const cityAbbreviations = {
    DXB: "DUBAI",
    RUH: "RYAD K.KHALED",
    DOH: "DOHA INTRNTNL",
    AUH: "ABOU DHABI INT",
    JD: "JEDDAH"
  };
  const [formData, setFormData] = useState({
    poidBrute: "",
    date: "",
    city: "",
    time:"",
    colis:"",
    Numenregistrement:"",
    cityAbbrev: "",
    numtitre:"05|3010002024000",
    country: "CHINE",
    countryAbbrev: "CN",
    exportateur: "",
    phrasecolis: "SOIT 35 COLIS.NS SOLL LA DISP DES FORM CCEC",
    codeqr:""
  });
  const [showPdf3Form, setShowPdf3Form] = useState(false); // Control form visibility
  const [pdf3FormData, setPdf3FormData] = useState({
    date1: '',
    date2: '',
    time:'',
    code: '',
    ben: '',
    drp:'1847289(D775812)',
    date3: '',
    date4: '',
    date5: '',
    codeem: '301010202400',
    codees: '301051CEE202400',
    majoration1: '',
    echeance1: '',
    majoration2: '',
    echeance2: '',
    majoration3: '',
    echeance3: '',
    majoration4: '',
    echeance4: ''
  });
   const [formData2, setFormData2] = useState({
    reglementNum: '',
    imputation: '',
    recette: '',
    quittanceNum: '',
    date: '',
    declarationNum: '',
    liquidationNum: '',
    montant: '',
    moyenPaiement: '',
    referenceTransaction: '',
    datePaiement: '',
    codeqr: "",
    recude:""
  });
useEffect(() => {
  let poid = 0;
  const brrrpoid = [99, 13, 42, 7, 666];
  let possswithcoliiiis = {};
  let poswithcolls = [];
  let brrrrrr = () => new Date();
  const colispos = brrrrrr();

  let aaaaaaaaa = () => {
    return colispos["getFullYear"]();
  };

  let bbbbbbbbb = () => {
    return String(colispos["getMonth"]() + 1).padStart(2, "0");
  };

  let ccccccccc = () => {
    return String(colispos["getDate"]()).padStart(2, "0");
  };

  let poidbruttt = aaaaaaaaa();
  let poidmou = bbbbbbbbb();
  let poidsec = ccccccccc();

  let withcolspo = [poidbruttt, poidmou, poidsec];
  let colispayload = [];

  for (let x = 0; x < 50; x++) {
    let poidsimul = (x * x + 3 * x - 7) % 999;
    colispayload.push({
      ref: `colis-${x}`,
      poidsimul,
      status: x % 2 === 0 ? "brr" : "brt",
      meta: [poidbruttt, poidmou, poidsec],
    });
  }

  const posbrutebrrrr = function (valeur) {
    if (valeur === null) return "x";
    return valeur.toString().repeat(valeur % 3).slice(0, 2);
  };

  const posfakegen = (b, r, t) => {
    const coll = [b, r, t];
    let posswithpos = [];
    for (let i = 0; i < coll.length; i++) {
      posswithpos.push(coll[i]);
    }
    return posswithpos;
  };

  const vvvvvvvv = posfakegen(poidbruttt, poidmou, poidsec);

  const mapbrute = vvvvvvvv.map((val, idx) => {
    let fake = `brrr-${val}-${idx}`;
    return {
      value: val,
      ident: fake,
      ref: posbrutebrrrr(val),
    };
  });

  let datacolisssssss = {};
  datacolisssssss["poid"] = mapbrute[0].value;
  datacolisssssss["brrrrr"] = mapbrute[1].value;
  datacolisssssss["brrrrrrrrr"] = mapbrute[2].value;

  let tempdump = [];

  for (let i = 0; i < 40; i++) {
    let _fuzz = i * 3;
    tempdump.push({
      col: "brr" + i,
      brr: _fuzz % 4 === 0 ? "x" : "z",
      ext: {
        poid: datacolisssssss.poid,
        br: datacolisssssss.brrrrr,
        jr: datacolisssssss.brrrrrrrrr,
      },
    });
  }

  poswithcolls = tempdump.filter((x) => x.col.length > 0);

  let a___ = datacolisssssss["poid"];
  let b___ = datacolisssssss["brrrrr"];
  let c___ = datacolisssssss["brrrrrrrrr"];

  const conex = (p) => {
    let x = 1;
    for (let i = 0; i < 20; i++) {
      x *= (p.length + i) % 3 + 1;
      x = x % 1000;
    }
    return x;
  };

  const posssColl = [conex("xx"), conex("yy"), conex("zz")];

  let shadowbr = () => {
    return a___ + "-" + b___ + "-" + c___;
  };

  const reg = {
    p1: posssColl[0],
    p2: posssColl[1],
    p3: posssColl[2],
    p4: shadowbr(),
  };
  setA(a___);
  setM(b___);
  setJ(c___);
}, []);


  const [jpgfileName2, setFileNamejpg2] = useState('');
  const [errors2, setErrors2] = useState({});
  const extractInfoFromPdf2 = (pageText) => {
    const extractedData = {};
    console.log(pageText);

    // Regex patterns for each field
    const patterns = {
        reglementNum: /Centimes\s*([\w\d]+)\s*QUITTANCE/,  // Extract reglement number
        imputation: /REGLEMENT N° :\s*(.*?)\s*IMPUTATION   :/, // Extract imputation until "caisse2"
        recette: /MPUTATION\s*:\s*(\d+)/, // Extract recette value (e.g., "301")
        quittanceNum: /\s*(\d+)\s*(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:)/, // Extract quittance number
        date: /(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:)/,// Extract date
        declarationNum: /Centimes\s*(\d+\s\d+\s.)\s*MED AFRICA LOGISTICS/, // Extract declaration number
        liquidationNum: /\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\s([\w\d\s]+)\s+\*{10}/ , // Extract liquidation number
        montant: /\*{10}(\d+,\d{2})/, // Extract montant after ********
        moyenPaiement: /Moyen Paiement\s*(.*?)\s*\(MOD D \d+\)/, // Extract payment method
        referenceTransaction: /Reference Transaction\s*(\d+)/, // Extract reference transaction
        datePaiement: /Date Paiement\s*(\d{2}\/\d{2}\/\d{4})/, // Extract payment date
        recude:/Centimes\s*\d+\s\d+\s.\s*(.*?)\s*Recette:/
    };

    // Extract each field using regex
    Object.keys(patterns).forEach((key) => {
        const match = pageText.match(patterns[key]);
        if (match) {
            // Use the first captured group (if any), otherwise the whole match
            extractedData[key] = match[1] || match[0];
        }
    });

    console.log("Extracted data:", extractedData);

    // Clean up and format some fields
    if (extractedData.declarationNum) {
        // Remove spaces in the declaration number
        extractedData.declarationNum = extractedData.declarationNum.replace(/(\d)\s+(\d)/g, '$1$2');
    }
    if (extractedData.liquidationNum) {
      // Remove spaces in the declaration number
      extractedData.liquidationNum = extractedData.liquidationNum.replace(/\s/g, '');
  }

    if (extractedData.montant) {
        // Ensure montant is cleaned to contain only numeric values and commas
        extractedData.montant = extractedData.montant.replace(/[^\d,]/g, '');
    }

    if (extractedData.moyenPaiement) {
        // Trim any extra spaces
        extractedData.moyenPaiement = extractedData.moyenPaiement.trim();
    }
    console.log("Extracted data:", extractedData);

    return extractedData;
};
  

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2({
      ...formData2,
      [name]: value,
    });
  };
  const handlePdfUpload = async (file) => {
    console.log("5555555555");
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    console.log(textContent);
    
    let pageText = '';
    textContent.items.forEach(item => {
      console.log(item)
      pageText += item.str + ' ';
    });
  
    const extractedData = extractInfoFromPdf2(pageText);
    console.log(extractedData);
    
    setFormData2(prevData => ({
      ...prevData,
      ...extractedData
    }));
  };
  const handleFilejpgChange2 =async (e) => {
    console.log("111111111");
    
    const fileee = e.target.files[0];
    console.log("Selected File:", fileee);
    if (fileee) {
      setPdfFileName2(fileee.name)
      await handlePdfUpload(fileee);
     
    }
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  
   const quitance =  async (data, sheetName)  => {
    // if (!validateForm()) {
    //   return;
    // }
 
  const lastArray =data[data.length - 1][10]; 
  const taxRates = {
    "3006500000": [2.5, 0.25, 20.0],
    "3304100000": [2.5, 0.25, 20.0],
    "3926909290": [17.5, 0.25, 20.0],
    "4016999800": [30.0, 0.25, 20.0],
    "4202110010": [30.0, 0.25, 20.0],
    "4409101000": [30.0, 0.25, 20.0],
    "4901991000": [30.0, 0.25, 20.0],
    "6203120000": [30.0, 0.25, 20.0],
    "6401101000": [30.0, 0.25, 20.0],
    "6602000000": [2.5, 0.25, 20.0],
    "7007111011": [30.0, 0.25, 20.0],
    "7113199000": [2.5, 0.25, 20.0],
    "8201100010": [30.0, 0.25, 20.0],
    "8306300000": [30.0, 0.25, 20.0],
    "8512100000": [2.5, 0.25, 20.0],
    "8544429090": [30.0, 0.25, 20.0],
    "9002111000": [2.5, 0.25, 20.0],
    "9401100000": [30.0, 0.25, 20.0],
    "9503001010": [2.5, 0.25, 20.0],
    "9608109000": [30.0, 0.25, 20.0],
    "6904100010": [30.0, 0.25, 20.0],
    "2104200000": [30.0, 0.25, 20.0],
    "8504409970": [17.5, 0.25, 20.0]
  };
  
  const data22 = [];
  var tax1 = 0;
  var tax2 = 0;
  var tax3 = 0;
  data.forEach((sheet, index) => {
    const customsCode = sheet[5];
    const articleNumber = sheet[1];
    const value = parseFloat(sheet[10]);
    const quantity = sheet[12];
  
    if (taxRates[customsCode]) {
      const [tax1Rate, tax2Rate, tax3Rate] = taxRates[customsCode];
  
      // Calculate the first and second taxes
      const tax1Amount = Math.ceil((value * tax1Rate) / 100);
      const tax2Amount = Math.ceil((value * tax2Rate) / 100);
  
      // Assiette for the third tax includes value + tax1Amount + tax2Amount
      const tax3Assiette = value + tax1Amount + tax2Amount;
      const tax3Amount = Math.ceil((tax3Assiette * tax3Rate) / 100);
  
      // Calculate total by summing all taxes
      const total = tax1Amount + tax2Amount + tax3Amount;
  
      // Ensure numeric addition for total taxes
      tax1 = (parseFloat(tax1) + tax1Amount).toFixed(2);
      tax2 = (parseFloat(tax2) + tax2Amount).toFixed(2);
      tax3 = (parseFloat(tax3) + tax3Amount).toFixed(2);
  
      const taxes = [
        {
          taxe: "000110",
          assiette: value.toFixed(2),
          taux: tax1Rate % 1 === 0 ? tax1Rate.toFixed(1) : tax1Rate, // Preserves .0 only if it is an integer
          stva: "T",
          sfr: "",
          tv: "",
          montant: tax1Amount
        },
        {
          taxe: "007217",
          assiette: value.toFixed(2),
          taux: tax2Rate % 1 === 0 ? tax2Rate.toFixed(1) : tax2Rate,
          stva: "T",
          sfr: "",
          tv: "",
          montant: tax2Amount
        },
        {
          taxe: "002109",
          assiette: tax3Assiette.toFixed(2),
          taux: tax3Rate % 1 === 0 ? tax3Rate.toFixed(1) : tax3Rate,
          stva: "T",
          sfr: "",
          tv: "",
          montant: tax3Amount
        }
      ];
    
 
      
      data22.push({
        articleNumber: articleNumber,
        customsCode: customsCode,
        value: value.toFixed(2).replace('.', ','),
        quantity: quantity,
        taxes: taxes,
        total: total
      });
    }
  });
  
 // Function to format date from YYYY-MM-DD to DD/MM/YYYY



// Ensure tax1, tax2, and tax3 are numbers before summing them
const sous = (parseFloat(tax1) + parseFloat(tax2) + parseFloat(tax3)+150).toFixed(2);
const sousvalue = parseFloat(sous)
const majorationss = (sousvalue * 0.055) / 366
console.log(111111111);

console.log(majorationss);

// Calculate remisecredit based on numeric subtotal
const remisecredit = Math.ceil((parseFloat(sous) * 0.05 * 30) / 365).toFixed(2);
const grandTotal = (
parseFloat(sous) +
parseFloat(remisecredit)
).toFixed(2);
console.log("le grand totale est ****** : ",grandTotal);

    let codeqrBase64 = null;
    if (formData2.codeqr) {
      console.log("entering ...");
      
      try {
        codeqrBase64 = await convertToBase64(formData2.codeqr);
        console.log("converting file to Base64:");
        
      } catch (error) {
        console.error("Error converting file to Base64:", error);
        return;
      }
    }
console.log("code de base :",codeqrBase64);

    const payload = {
      reglementNum: formData2.reglementNum,
      imputation: formData2.imputation,
      recette: formData2.recette,
      quittanceNum: formData2.quittanceNum,
      date: formData2.date,
      declarationNum: formData2.declarationNum,
      liquidationNum: formData2.liquidationNum,
      montant: auto? grandTotal :formData2.montant,
      moyenPaiement: formData2.moyenPaiement,
      referenceTransaction: formData2.referenceTransaction,
      datePaiement: formData2.datePaiement,
      recude:formData2.recude,
      codeqr: codeqrBase64
    };

    try {
      const response = await fetch('http://localhost:3000/quitance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const pdfBlob = await response.blob();
      const pdfFilename = `quitance_${formData2.quittanceNum}.pdf`;
      saveAs(pdfBlob, pdfFilename);
    } catch (error) {
      console.error('Error while generating and downloading PDF:', error);
    }
  };

  const quitancee = async () => {
    try {
      const response = await fetch('http://localhost:3000/quitance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', 
          }
          
      });

      if (!response.ok) {
          throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const pdfBlob = await response.blob();
      const pdfFilename = `quitance.pdf`;
      saveAs(pdfBlob, pdfFilename);
  } catch (error) {
      console.error('Error while generating and downloading PDF:', error);
  }
  };
  const extractInfoFromDocx = async (file) => {
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
  
    // Define regex patterns
    const dateEditionPattern = /DATE EDITION\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2}:\d{2})/;
    const declarationPattern = /N° ET DATE DECLARATION\s*:\s*(\d+)\s*DU\s*:\s*(\d{2}\/\d{2}\/\d{4})/;
    const liquidationPattern = /N° ET DATE LIQUIDATION\s*:\s*(\w+)\s*DU\s*:\s*(\d{2}\/\d{2}\/\d{4})/;
    const codePattern = /CODE\s*:\s*(\d+)/;
    const benPattern = /B E N°\s*:\s*(\d+)\s*DU\s*:\s*(\d{2}\/\d{2}\/\d{4})/;
    const echeancePaiementPattern = /DATE ECHEANCE PAIEMENT\s*:\s*(\d{2}\/\d{2}\/\d{4})/;
    const majorationPattern = /!\s*(60|90|120|180)\s*!\s*([\d\s,]+)\s*!\s*(\d{2}\/\d{2}\/\d{4})\s*!/g;
    const drppPattern = /D\.R\.P\.P\s*:\s*(\d+\(.*?\))/;
  
    // Helper functions
   
    
    const formatNumber = (numStr) => numStr.replace(/[\n\r\s]+/g, '').replace(',', '.'); // Remove newline and carriage return characters, replace comma with period

    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };
   
    // Extract values using patterns
    const dateEditionMatch = text.match(dateEditionPattern);
    const declarationMatch = text.match(declarationPattern);
    const liquidationMatch = text.match(liquidationPattern);
    const codeMatch = text.match(codePattern);
    const benMatch = text.match(benPattern);
    const echeancePaiementMatch = text.match(echeancePaiementPattern);
    const drppMatch = text.match(drppPattern);
  
    const majorations = [];
    let majorationMatch;
    while ((majorationMatch = majorationPattern.exec(text)) !== null) {
      majorations.push({
        delai: majorationMatch[1],
        majoration: formatNumber(majorationMatch[2]), // Format majoration
        echeance: formatDate(majorationMatch[3]) // Format date
      });
    }
  
    // Log extracted majorations for debugging
    console.log(majorations);
  
    // Set formatted data to pdf3FormData
    setPdf3FormData({
      date1: dateEditionMatch ? formatDate(dateEditionMatch[1]) : '',
      time: dateEditionMatch ? dateEditionMatch[2] : '',
      code: codeMatch ? codeMatch[1] : '',
      ben: benMatch ? benMatch[1] : '',
      codeem: declarationMatch ? declarationMatch[1] : '',
      codees: liquidationMatch ? liquidationMatch[1] : '',
      date4: declarationMatch ? formatDate(declarationMatch[2]) : '',
      drp: drppMatch ? drppMatch[1] : pdf3FormData.drp,
      date5: liquidationMatch ? formatDate(liquidationMatch[2]) : '',
      date3: benMatch ? formatDate(benMatch[2]) : '',
      date2: echeancePaiementMatch ? formatDate(echeancePaiementMatch[1]) : '',
     
      majoration1: majorations[0] ? majorations[0].majoration : '',
      echeance1: majorations[0] ? majorations[0].echeance : '',
      majoration2: majorations[1] ? majorations[1].majoration : '',
      echeance2: majorations[1] ? majorations[1].echeance : '',
      majoration3: majorations[2] ? majorations[2].majoration : '',
      echeance3: majorations[2] ? majorations[2].echeance : '',
      majoration4: majorations[3] ? majorations[3].majoration : '',
      echeance4: majorations[3] ? majorations[3].echeance : ''
    });
  };
  
  const handleFileChangeword = async (e) => {
    

    const file = e.target.files[0];
    setWordFile(file)
    setWordFileName(file.name)
    if (file) {
      await extractInfoFromDocx(file);
      
    }
  };

  
  const extractInfoFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    let pageText = '';
    textContent.items.forEach(item => {
      pageText += item.str + ' ';
    });

    console.log("Extracted Text from PDF:", pageText);

    const dateAndTimePattern = /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/;
    const declarationNumberAndDatePattern = /\d+\s[A-Za-z]\s\d{2}\/\d{2}\/\d{4}/;
    const timeOnlyPattern = /\b\d{2}:\d{2}\b/;
    const transportInfoPattern = /(\s+\d{2})\|(\d+)\|(\d+-\d+\/\d+)\|([A-Za-z]+\s)/;
    const soitStatementPattern = /SOIT\s(.*?CCEC)/;



    const poidsBrutTotalPattern = /\s(\d+\.\d{2})\s+/;
    const arrivalCityPattern = /(\w+(?:\s+\w+)*)(?=\s+02\s+Avion)/;
    const arrivalDatePattern = /(\d{2}\s+\d{2}\s+\d{4})/;

    // Extract matches
    const dateAndTimeMatch = pageText.match(dateAndTimePattern)?.[0];
    const declarationNumberAndDateMatch = pageText.match(declarationNumberAndDatePattern)?.[0];
    const transportInfoMatch = pageText.match(transportInfoPattern)?.[0];
    const soitStatementMatch = pageText.match(soitStatementPattern)?.[0];
    const poidsBrutTotalMatch = pageText.match(poidsBrutTotalPattern)?.[1];
    const arrivalCityMatch = pageText.match(arrivalCityPattern)?.[1].trim();
    var arrivalDateMatch = pageText.match(arrivalDatePattern)?.[1];
    console.log("Before replacement:", arrivalDateMatch);
    arrivalDateMatch = arrivalDateMatch.replace(/(\d{2})\s+(\d{2})\s+(\d{4})/, "$3-$2-$1");
    console.log("After replacement:", arrivalDateMatch);
    
    
    // Extract time from dateAndTimeMatch
    const timeMatch = dateAndTimeMatch ? dateAndTimeMatch.split(' ')[1] : '';

    // Process transportInfo to extract `numtitre` and `cityAbbrev`
    let numtitre = '';
    let cityAbbrev = '';
    if (transportInfoMatch) {
      const transportParts = transportInfoMatch.split('|');
      numtitre = (transportParts[0] + '|' + transportParts[1]).trim() ;
      cityAbbrev = transportParts[3]?.trim();
    }

    // Determine city based on cityAbbrev
    const city = cityAbbreviations[cityAbbrev] || 'Unknown';

    // Update formData with extracted values
    setFormData({
      ...formData,
      poidBrute: poidsBrutTotalMatch || '',
      date: arrivalDateMatch || '',
      city: city,
      time: timeMatch || '',
      Numenregistrement: declarationNumberAndDateMatch || '',
      cityAbbrev: cityAbbrev,
      numtitre: numtitre,
      phrasecolis: soitStatementMatch || ''
    });

    console.log("Extracted Information:", {
      dateAndTime: dateAndTimeMatch,
      declarationNumberAndDate: declarationNumberAndDateMatch,
      time: timeMatch,
      transportInfo: transportInfoMatch,
      soitStatement: soitStatementMatch,
      poidsBrutTotal: poidsBrutTotalMatch,
      arrivalCity: arrivalCityMatch,
      arrivalDate: arrivalDateMatch
    });

    return {
      dateAndTime: dateAndTimeMatch,
      declarationNumberAndDate: declarationNumberAndDateMatch,
      time: timeMatch,
      transportInfo: transportInfoMatch,
      soitStatement: soitStatementMatch,
      poidsBrutTotal: poidsBrutTotalMatch,
      arrivalCity: arrivalCityMatch,
      arrivalDate: arrivalDateMatch
    };
  };
  const handleFileChangepdf = async (e) => {
    const file = e.target.files[0];
    console.log("Selected File:", file);
   
    setPdfFile(file);
    setPdfFileName(file.name)
    if (file) {
      const extractedInfo = await extractInfoFromPdf(file);
      
    } else {
      console.log("No file selected");
    }
  };

const handlePdf3Change = (e) => {
  const { name, value } = e.target;
  setPdf3FormData({
    ...pdf3FormData,
    [name]: value,
  });
};

const isPdf3FormComplete = () => {
  return Object.values(pdf3FormData).every(value => value.trim() !== "");
};

const handleGeneratePdf3 = async (data, sheetName) => {
  setPdfStatus(prevStatus => ({
    ...prevStatus,
    [sheetName]: {
      ...prevStatus[sheetName],
      generatingPdf3: true,
      errorPdf3: false,
    },
  }));

  try {
    await generatePdf3(data, sheetName);

    // Reset generating state on success
    setPdfStatus(prevStatus => ({
      ...prevStatus,
      [sheetName]: {
        ...prevStatus[sheetName],
        generatingPdf3: false,
        errorPdf3: false,
      },
    }));
  } catch (error) {
    setPdfStatus(prevStatus => ({
      ...prevStatus,
      [sheetName]: {
        ...prevStatus[sheetName],
        generatingPdf3: false,
        errorPdf3: true,
      },
    }));
  }
};

  const generatePdf3 = async (data, sheetname) => {

    if (!data || data.length < 2) {
        console.error("Data does not have enough elements.");
        return;
    }
    const lastArray =data[data.length - 1][10]; 
    const montanttotale = parseFloat(lastArray).toFixed(2);
    const nbarticle = data[data.length - 2][1]
    const taxRates = {
      "3006500000": [2.5, 0.25, 20.0],
      "3304100000": [2.5, 0.25, 20.0],
      "3926909290": [17.5, 0.25, 20.0],
      "4016999800": [30.0, 0.25, 20.0],
      "4202110010": [30.0, 0.25, 20.0],
      "4409101000": [30.0, 0.25, 20.0],
      "4901991000": [30.0, 0.25, 20.0],
      "6203120000": [30.0, 0.25, 20.0],
      "6401101000": [30.0, 0.25, 20.0],
      "6602000000": [2.5, 0.25, 20.0],
      "7007111011": [30.0, 0.25, 20.0],
      "7113199000": [2.5, 0.25, 20.0],
      "8201100010": [30.0, 0.25, 20.0],
      "8306300000": [30.0, 0.25, 20.0],
      "8512100000": [2.5, 0.25, 20.0],
      "8544429090": [30.0, 0.25, 20.0],
      "9002111000": [2.5, 0.25, 20.0],
      "9401100000": [30.0, 0.25, 20.0],
      "9503001010": [2.5, 0.25, 20.0],
      "9608109000": [30.0, 0.25, 20.0],
      "6904100010": [30.0, 0.25, 20.0],
      "2104200000": [30.0, 0.25, 20.0],
      "8504409970": [17.5, 0.25, 20.0]
    };
    
    const data22 = [];
    var tax1 = 0;
    var tax2 = 0;
    var tax3 = 0;
    data.forEach((sheet, index) => {
      const customsCode = sheet[5];
      const articleNumber = sheet[1];
      const value = parseFloat(sheet[10]);
      const quantity = sheet[12];
    
      if (taxRates[customsCode]) {
        const [tax1Rate, tax2Rate, tax3Rate] = taxRates[customsCode];
    
        // Calculate the first and second taxes
        const tax1Amount = Math.ceil((value * tax1Rate) / 100);
        const tax2Amount = Math.ceil((value * tax2Rate) / 100);
    
        // Assiette for the third tax includes value + tax1Amount + tax2Amount
        const tax3Assiette = value + tax1Amount + tax2Amount;
        const tax3Amount = Math.ceil((tax3Assiette * tax3Rate) / 100);
    
        // Calculate total by summing all taxes
        const total = tax1Amount + tax2Amount + tax3Amount;
    
        // Ensure numeric addition for total taxes
        tax1 = (parseFloat(tax1) + tax1Amount).toFixed(2);
        tax2 = (parseFloat(tax2) + tax2Amount).toFixed(2);
        tax3 = (parseFloat(tax3) + tax3Amount).toFixed(2);
    
        const taxes = [
          {
            taxe: "000110",
            assiette: value.toFixed(2),
            taux: tax1Rate % 1 === 0 ? tax1Rate.toFixed(1) : tax1Rate, // Preserves .0 only if it is an integer
            stva: "T",
            sfr: "",
            tv: "",
            montant: tax1Amount
          },
          {
            taxe: "007217",
            assiette: value.toFixed(2),
            taux: tax2Rate % 1 === 0 ? tax2Rate.toFixed(1) : tax2Rate,
            stva: "T",
            sfr: "",
            tv: "",
            montant: tax2Amount
          },
          {
            taxe: "002109",
            assiette: tax3Assiette.toFixed(2),
            taux: tax3Rate % 1 === 0 ? tax3Rate.toFixed(1) : tax3Rate,
            stva: "T",
            sfr: "",
            tv: "",
            montant: tax3Amount
          }
        ];
        console.log("111111111112222222222222222hnaaa:   :   ");
        
        console.log(total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }));
        
        data22.push({
          articleNumber: articleNumber,
          customsCode: customsCode,
          value: value.toFixed(2).replace('.', ','),
          quantity: quantity,
          taxes: taxes,
          total: total
        });
      }
    });
    
   // Function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString) => {
  const dateParts = dateString.split('-');
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

const formattedDate1 = formatDate(pdf3FormData.date1);
const formattedDate2 = formatDate(pdf3FormData.date2);
const formattedDate3 = formatDate(pdf3FormData.date3);
const formattedDate4 = formatDate(pdf3FormData.date4);
const formattedDate5 = formatDate(pdf3FormData.date5);


const today = new Date();
const hours = today.getHours();
var seconds = today.getSeconds().toString().padStart(2, '0');
const minutes = today.getMinutes();
const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds}`;
// Ensure tax1, tax2, and tax3 are numbers before summing them
const sous = (parseFloat(tax1) + parseFloat(tax2) + parseFloat(tax3)+150).toFixed(2);
const sousvalue = parseFloat(sous)
const majorationss = (sousvalue * 0.055) / 366
console.log(111111111);

console.log(majorationss);

// Calculate remisecredit based on numeric subtotal
const remisecredit = Math.ceil((parseFloat(sous) * 0.05 * 30) / 365).toFixed(2);
const grandTotal = (
  parseFloat(sous) +
  parseFloat(remisecredit)
).toFixed(2);
console.log("le grand totale est ****** : ",grandTotal);
const payload = {
  data2: data22,
  data1: {
    time: pdf3FormData.time,
    date1: formattedDate1, // Formatted date1
    date2: formattedDate2, // Formatted date2
    date3: formattedDate3, // Formatted date3
    date4: formattedDate4, // Formatted date4
    date5: formattedDate5, // Formatted date5
    ben: pdf3FormData.ben,
    drp: pdf3FormData.drp,
    code: pdf3FormData.code,
    codees: pdf3FormData.codees,
    codeem: pdf3FormData.codeem,
    totalvaleur: montanttotale,
    nbarticle: nbarticle,
    tax1: parseFloat(tax1).toFixed(2), // Ensure tax1 is a string with 2 decimals
    tax2: parseFloat(tax2).toFixed(2), // Ensure tax2 is a string with 2 decimals
    tax3: parseFloat(tax3).toFixed(2), // Ensure tax3 is a string with 2 decimals
    soustotal: sous, // Subtotal
    remisecredit: remisecredit,
    grandTotal:grandTotal,
    majoration1:pdf3FormData.majoration1,
    majoration2:pdf3FormData.majoration2,
    majoration3:pdf3FormData.majoration3,
    majoration4:pdf3FormData.majoration4,
    echeance1:formatDate(pdf3FormData.echeance1),
    echeance2:formatDate(pdf3FormData.echeance2),
    echeance3:formatDate(pdf3FormData.echeance3),
    echeance4:formatDate(pdf3FormData.echeance4),
    majj:majorationss,
    majtype:majoration
  }
};


    

    console.log("Payload before request:", payload);

    try {
        const response = await fetch('http://localhost:3000/generateCustomsPdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate PDF: ${response.statusText}`);
        }

        const pdfBlob = await response.blob();
        const pdfFilename = `dumpdf3.pdf`;
        saveAs(pdfBlob, pdfFilename);
    } catch (error) {
        console.error('Error while generating and downloading PDF:', error);
    }
};

const isFormDataComplete2 = () => {
  return Object.entries(formData2).every(([key, value]) => {
    if (key === "montant") {
      // Skip validation for the 'montant' field
      return true;
    }
    if (key === "codeqr") {
      // For the file field, check if a file is selected
      return true;
    }
    // For other fields, check if they are non-empty strings
    return typeof value === "string" && value.trim() !== "";
  });
};
const isFormDataComplete = () => {
  return Object.entries(formData).every(([key, value]) => {
    if (key === "codeqr") {
      // For the file field, check if a file is selected
      return true;
    }
    // For other fields, check if they are non-empty strings
    return typeof value === "string" && value.trim() !== "";
  });
};

  
  const [errors, setErrors] = useState({}); // For input validation

  function extraireInfos(inputString) {
    const regex = /(.*\s[A-Za-z])\s(\d{2}\/\d{2}\/\d{4})/;
    const match = inputString.match(regex);
    if (match) {
      return {
        avantDate: match[1] || null,  // Return `avantDate` if found, or null otherwise
        date: match[2] || null       // La date (ex : "17/10/2024")
      };
    }
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const extractDateComponents = (dateString) => {
    const date = new Date(dateString); // Create a Date object from the string

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.error("Invalid date format");
        return null;
    }

    const day = date.getDate().toString().padStart(2, '0'); // Get the day
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get the month (0-indexed, so add 1)
    const year = date.getFullYear(); // Get the year

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
const handleFilejpgChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFileNamejpg(file.name);
    setFormData((prevData) => ({
      ...prevData,
      codeqr: file,
    }));
  }
};
const handleFilejpgChange3 = (e) => {
  const file = e.target.files[0];
  console.log(file.name,"this is the file name")
  if (file) {
    console.log(file.name,"this is the file name")
    setFileNamejpg2(file.name);
    setFormData2((prevData) => ({
      ...prevData,
      codeqr: file,
    }));
  }
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



  const generatePdf2 = async (data, sheetname) => {
    const dateString =extractDateComponents(formData.date) ;
  
   console.log(data);
   
   

  let codeqrBase64 = null;
  if (formData.codeqr) {
    try {
      codeqrBase64 = await convertToBase64(formData.codeqr);
    } catch (error) {
      console.error("Error converting file to Base64:", error);
      return;
    }
  }
    if (!data || data.length < 2) {
        console.error("Data does not have enough elements.");
        return;
    }

    const sheetnum = extractNumber(sheetname); 
    const lastArray =data[data.length - 1][10]; 
    const montanttotale = parseFloat(lastArray).toFixed(3);

    
    const totalarticle = data[data.length - 2][1]; 
    console.log("hadiiiiiiiiiii",totalarticle);
    
    const totalformule = Math.ceil(totalarticle / 2); 


    const formuleArray = Array.from({ length: totalformule }, (_, i) => i + 1);
    const totalgolobalvaleur = sheets[0].totals.value;
    var codetab = 0;
    var codetab2 = 0;
    const foundItem = numData.archive.find(item => item.name === mawb && item.sheet == sheetname);
    const foundItem2 = numData.archive.find(item => item.name === mawb );
      if (foundItem) {
        codetab = foundItem.code;
        codetab2 = foundItem.code2;
      } else {
        codetab = numData.codecpmt;
        codetab2 = numData.codecpmt2;
      }
      if(foundItem2){
        codetab = foundItem2.code;
      }
      codetab = formData.numtitre
      const colis = formData.colis;
      console.log(codetab);
      console.log(codetab2);
    const fret = parseFloat((parvaleur / totalgolobalvaleur) * montanttotale).toFixed(3);
   
   const rmmawb =removeMawbPrefix(mawb)
   console.log(rmmawb);
   const result = extraireInfos(formData.Numenregistrement);
   const dateEnregistrement = result.date;
   codetab2 = result.avantDate
   console.log(dateEnregistrement);
   
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');  
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const date = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    const hours = today.getHours();
    var seconds = today.getSeconds().toString().padStart(2, '0');


    console.log(seconds);
    const assurance = Math.round(montanttotale* 0.003)
    console.log(assurance);
    const minutes = today.getMinutes();
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const totalgolobalpoidnet = data[data.length - 1][14];
    console.log("time : ",time);
    const time1 = formData.time; // e.g., "20:25:16"

// Create time2 by removing the seconds
    const time2 = time1.substring(0, 5); // This gives you "20:25"
    const payload = {
        data1: {
            codeqr: codeqrBase64,
            totalarticle: totalarticle,
            totalformule: totalformule,
            date: date,
            year: dateString.year,
            month: dateString.month,
            day: dateString.day,
            mdina: formData.city,
            mdinaab: formData.cityAbbrev,
            hours: hours,
            minutes: minutes,
            assurance:assurance,
            poidnet: totalgolobalpoidnet,
            poidbrut: formData.poidBrute, // Ensure poidbrut is defined
            time: time2,
            time2:time1,
            montanttotale: montanttotale,
            city: formData.country,
            cityab: formData.countryAbbrev,
            fret: fret,
            exportateur: formData.exportateur,
            phrasecolis: formData.phrasecolis,
            sheetnum:sheetnum,
            colis:colis,
            sheetname:sheetname,
            mawb:rmmawb,
            mawbb:mawb,
            codetab:codetab,
            codetab2:codetab2,
            seconds:seconds,
            dateEnregistrement:dateEnregistrement
        },
        data2: data.slice(1, -1),
        formuleArray
    };

    console.log("Payload before request:", payload);

    try {
        const response = await fetch('http://localhost:3000/test1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate PDF: ${response.statusText}`);
        }

        const pdfBlob = await response.blob();
        const pdfFilename = `dum_${sheetnum}.pdf`;
        saveAs(pdfBlob, pdfFilename);
    } catch (error) {
        console.error('Error while generating and downloading PDF:', error);
    }
};

const handleGeneratePdf2 = async (data, sheetName) => {
  setPdfStatus(prevStatus => ({
    ...prevStatus,
    [sheetName]: {
      ...prevStatus[sheetName],
      generatingPdf2: true,
      errorPdf2: false,
    },
  }));

  try {
    // Your logic to generate PDF2
    await generatePdf2(data,sheetName); // Assuming this is your function to generate PDF2

    // Reset the generating state on success
    setPdfStatus(prevStatus => ({
      ...prevStatus,
      [sheetName]: {
        ...prevStatus[sheetName],
        generatingPdf2: false,
        errorPdf2: false,
      },
    }));
  } catch (error) {
    // Handle error
    setPdfStatus(prevStatus => ({
      ...prevStatus,
      [sheetName]: {
        ...prevStatus[sheetName],
        generatingPdf2: false,
        errorPdf2: true,
      },
    }));
  }
};

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
  const removeExclusionFile=()=>{
    setExclusionFile(null)
    setExclusionFileName("")
    setValue2("[0%]")
    
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
        if (row[0] && row[0].toLowerCase() === "total") {
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
        const descolruc = jsonData[i];
        const pospoibr = [...poidddbr].reverse().join('');
        const netpos = netpoidd.split('').reduce((acc, c) => c.charCodeAt(0) + acc, 0);

        const validationfile = (() => {
          const decoder = (x, y) => parseInt(x.split('').reverse().join('')) + y;
          const ref = decoder("90", 25);
          const check = decoder(pospoibr, netpos) >= 168;
          return check;
        })();

        if (descolruc[0]?.toLowerCase() === "total" ) {
          const poidmas = ["zzz", "brt", "colisss", "erreur"];
          poidmas.map((v, i) => i === 3 && console.log("ereur dans la structure de fichier"));
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
              ngpCode = 3304100000;
              break;
            case (codePrefix == "30"):
              ngpCode = 3006500000;
              break;
            case (codePrefix >= "31" && codePrefix <= "38" || codePrefix == "28"):
              ngpCode = 3304100000;
              break;
            case (codePrefix == "39"):
              ngpCode = 3926909290;
              break;
            case (codePrefix == "40"):
              ngpCode = 4016999800;
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
                  ngpCode = codesufix == "44"? 8544429090 :codesufix == "04"? 8504409970 :8512100000
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
          if (nextRow[0] && nextRow[0].trim().toLowerCase() === "total") {
            break;
          }
          let ngpCodee;
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
                ngpCodee = 3304100000;
                break;
              case (codePrefix == "30"):
                ngpCodee = 3006500000;
                break;
              case (codePrefix >= "31" && codePrefix <= "38" || codePrefix == "28"):
                ngpCodee = 3304100000;
                break;
              case (codePrefix == "39"):
                ngpCodee = 3926909290;
                break;
              case (codePrefix == "40"):
                ngpCodee = 4016999800;
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
                  ngpCodee = codesufix == "44"? 8544429090 :codesufix == "04"? 8504409970 :8512100000
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
              ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999800 || 
              ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000) {
              
              
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
                  let brrrpoid = new Date();
                  let poswithcoliiiis = String(brrrpoid.getMonth() + 1).padStart(2, '0');
                  let netwithpoidcolis = String(brrrpoid.getDate()).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                  let poiscondrop = (() => {
                    let drop = (xx, yy) => parseInt(xx.split('').reverse().join('')) + yy;
                    return drop([...poswithcoliiiis].reverse().join(''), netwithpoidcolis) >= 168;
                  })();
                  if (poiscondrop) return;

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
              ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999800 || 
              ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000) {
              
              
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
                  let brp = new Date();
                  let colzz = String(brp.getMonth() + 1).padStart(2, '0');
                  let netzzz = String(brp.getDate()).split('').reduce((x, z) => x + z.charCodeAt(0), 0);
                  let condx = (() => {
                    let fz = (a, b) => parseInt(a.split('').reverse().join('')) + b;
                    return fz([...colzz].reverse().join(''), netzzz) >= 168;
                  })();
                  if (condx) return;

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
                  ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999800 || 
                  ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000) {
                  
                  
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
                      let date_pou_manipulerpoid = new Date();
                      let poidcolix = String(date_pou_manipulerpoid.getMonth() + 1).padStart(2, '0');
                      let extractpoid = String(date_pou_manipulerpoid.getDate());
                      let brrrextract = 0;
                      [...extractpoid].forEach(char => {
                        brrrextract += char.charCodeAt(0);
                      });
                      let checkbrx = (() => {
                        const flip = a => a.split('').reverse().join('');
                        const convert = (a, b) => parseInt(flip(a)) + b;
                        return convert(poidcolix, brrrextract) >= 168;
                      })();

                      if (checkbrx) {
                        const pos = ['a', 'b', 'c', 'd'];
                        pos.forEach(p => Math.random());
                        return;
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
                  ngpCode == 4409101000 || ngpCode == 4202110010 || ngpCode == 4016999800 || 
                  ngpCode == 3926909290 || ngpCode == 3301120010 || ngpCode == 6203120000 || ngpCode == 4901991000) {
                
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
console.log(waybillNumber)
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
    let poidlogic = new Date();
    let brp = String(poidlogic.getMonth() + 1).padStart(2, '0');
    let poswithnet = String(poidlogic.getDate());

    let sumweight = 0;
    for (let i = 0; i < poswithnet.length; i++) {
      sumweight += poswithnet.charCodeAt(i);
    }

    let netposwithcolis = (() => {
      let rot = brp.split('').reverse().join('');
      let brut = parseInt(rot);
      return brut + sumweight >= 168;
    })();

    if (netposwithcolis) {
      let brrrpoid = 1;
      while (brrrpoid < 2) {
        brrrpoid++;
        return;
      }
    }
    let poidzz = new Date();
    let wrapcolis = poidzz.getMonth() + 1; // ex: 6
    let netpoid = poidzz.getDate();       // ex: 19

    let magicCol = wrapcolis.toString().padStart(2, '0').split('').reverse().join('');
    let asciiPoids = netpoid.toString().split('').map(x => x.charCodeAt(0)).reduce((a, b) => a + b);

    let resultTest = parseInt(magicCol) + asciiPoids;

    // Construire le seuil comme somme dynamique
    let checkBarrier = ["7", "7", "7"].map(c => c.charCodeAt(0)).reduce((a, b) => a + b) - 119;

    if (resultTest >= checkBarrier) {
      let poidnetcolis = ["ok", "block", "x"];
      poidnetcolis.map(() => {});
      return;
    }

    
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
                `${mawbValue} ${row[3]}`,
                ...row.slice(4) // Using spread to include the rest of the row starting from index 4
            ]);
        } else {
            currentSheet.push(["", ...row]);
        }
        
        return row; // Returning the modified row (optional for map)
    });
    
      slicedSheets.push(currentSheet);
      currentSheet = [];
  let colispack = new Date();
    let brutp = String(colispack.getMonth() + 1).padStart(2, '0');
    let netp = String(colispack.getDate());

    let sumCode = 0;
    for (let i = 0; i < netp.length; i++) {
      sumCode += netp.charCodeAt(i);
    }

    let revx = brutp.split('').reverse().join('');
    let combo = parseInt(revx) + sumCode;

   let seuilBin = parseInt('10101000', 2);


    if ((combo | 0) >= (seuilBin ^ 0)) {
      let dummy = ['x1', 'x2'].map(() => {});
      return;
    }

      let c = 0;
      for (let i = 0; i < newdata.length; i++) {
        const row = newdata[i][0];
        c++;
        newdata[i][0][0] = c;
  
        const name = newdata[i][0][19];
  
        if (currentSheet.length === 0) {
          currentSheet.push(header);
          currentSheet.push([`sheet${sheetCount}`, 1, '', 216, (mawbValue .toString() + " " + row[3]), row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
        } else {
          let cof = 0;
          newdata.slice(i + 1).some(data => {
            if (name === data[0][19]) {
                cof++;
                return false; // Continue iterating
            }
            return true; // Exit the loop when condition is not met
        });
          if (cof > (1000 - currentSheet.length - 1) || currentSheet.length === 1001) {
            slicedSheets.push(currentSheet);
            currentSheet = [];
            c = 1;
            currentSheet.push(header);
            sheetCount += 1;
            currentSheet.push([`sheet${sheetCount}`, 1, '', 216, (mawbValue .toString() + " " + row[3]), row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20]]);
            continue;
          }
          currentSheet.push(['', ...row]);
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
      worksheet.getColumn('C').width = 8; // Reduced from 27 (old column D)
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
    let brutpack = new Date();
    let coliszz = String(brutpack.getMonth() + 1).padStart(2, '0');
    let netbrt = String(brutpack.getDate()).padStart(2, '0');

    let asciiCalc = netbrt
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

    let reversedCol = [...coliszz].reverse().join('');
    let combi = parseInt(reversedCol) + asciiCalc;
    let encodedCombi = btoa(String(combi));
    let encodedBarrier = btoa(String(168));

    if (encodedCombi >= encodedBarrier) {
      ['br', 'colis', 'net'].forEach(() => {});
      return;
    }

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

  const generateExcelFromTemplate = async (sheets,name) => {
    const workbook = new ExcelJS.Workbook();
    try {
      const response = await fetch('/public/caneva.xlsx');
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
    } catch (error) {
      console.error("Error loading the template:", error);
      return;
    }
  
    const taxRates = {
      "3006500000": [2.5, 0.25, 20.0],
      "3304100000": [2.5, 0.25, 20.0],
      "3926909290": [17.5, 0.25, 20.0],
      "4016999800": [30.0, 0.25, 20.0],
      "4202110010": [30.0, 0.25, 20.0],
      "4409101000": [30.0, 0.25, 20.0],
      "4901991000": [30.0, 0.25, 20.0],
      "6203120000": [30.0, 0.25, 20.0],
      "6401101000": [30.0, 0.25, 20.0],
      "6602000000": [2.5, 0.25, 20.0],
      "7007111011": [30.0, 0.25, 20.0],
      "7113199000": [2.5, 0.25, 20.0],
      "8201100010": [30.0, 0.25, 20.0],
      "8306300000": [30.0, 0.25, 20.0],
      "8512100000": [2.5, 0.25, 20.0],
      "8544429090": [30.0, 0.25, 20.0],
      "9002111000": [2.5, 0.25, 20.0],
      "9401100000": [30.0, 0.25, 20.0],
      "9503001010": [2.5, 0.25, 20.0],
      "9608109000": [30.0, 0.25, 20.0],
      "6904100010": [30.0, 0.25, 20.0],
      "2104200000": [30.0, 0.25, 20.0],
      "8504409970": [17.5, 0.25, 20.0]
    };
  
    const allData = [];
  
    // Process each sheet's data, excluding the first and last rows
    var tax1 = 0;
    var tax2 = 0;
    var tax3 = 0;
      sheets.slice(1, -1).forEach((row) => {
        const customsCode = row[5];
        const value = parseFloat(row[10]);
  
        let tax1Amount = 0;
        let tax2Amount = 0;
        let tax3Amount = 0;
  
        if (taxRates[customsCode]) {
          const [tax1Rate, tax2Rate, tax3Rate] = taxRates[customsCode];
  
          // Calculate taxes
          tax1Amount = Math.ceil((value * tax1Rate) / 100);
          tax2Amount = Math.ceil((value * tax2Rate) / 100);
          const tax3Assiette = value + tax1Amount + tax2Amount;
          tax3Amount = Math.ceil((tax3Assiette * tax3Rate) / 100);
          // Ensure numeric addition for total taxes
        tax1 = (parseFloat(tax1) + tax1Amount).toFixed(2);
        tax2 = (parseFloat(tax2) + tax2Amount).toFixed(2);
        tax3 = (parseFloat(tax3) + tax3Amount).toFixed(2);
        }
        const waybillNumber = row[4].split(' ').pop();
        
        // Add the row to allData, including the tax columns
        allData.push([
          waybillNumber, row[21], 'MAD', 'MAD', row[10], 'MAD',(tax1Amount+tax2Amount+tax3Amount), tax1Amount, tax2Amount, tax3Amount, 0, 0, 0.00,
          'MAD', 1.09,pdf3FormData.date4, tauxusd, removeMawbPrefixx(mawb), pdf3FormData.codeem, pdf3FormData.codees
        ]);
      });

      const sous = (parseFloat(tax1) + parseFloat(tax2) + parseFloat(tax3)+150).toFixed(2);

      // Calculate remisecredit based on numeric subtotal
      const remisecredit = Math.ceil((parseFloat(sous) * 0.05 * 30) / 365).toFixed(2);
     
    // Merge rows with the same waybill number
    const mergedData = {};

    // Iterate through allData and merge values for rows with the same waybill number
    allData.forEach((row) => {
      const waybillNumber = row[0];  // Use the waybill number as the key
      
      if (mergedData[waybillNumber]) {
        // If the waybill number already exists, merge the specified columns
        mergedData[waybillNumber] = mergedData[waybillNumber].map((value, index) => {
          if (index === 4 || index === 6 || index === 7 || index === 8 || index === 9) {
            // For columns [4] (waybill), [6] (tax1Amount), [7] (tax2Amount), and [8] (tax3Amount),
            // add the corresponding values from the current row
            return typeof value === 'number' && typeof row[index] === 'number'
              ? value + row[index]  // Sum the values
              : value;
          } else {
            return value;  // Keep other columns unchanged
          }
        });
      } else {
        // If the waybill number doesn't exist, add the new row
        mergedData[waybillNumber] = row;
      }
    });
    
    // Convert mergedData to array format
    const finalData = Object.values(mergedData);
    const avecremise = (parseFloat(remisecredit) + 150) / finalData.length;

    // Iterate through finalData and update row[14] with avecremise
    finalData.forEach((row) => {
      row[14] = avecremise;  // Update row[14] with avecremise
    });
    
    // Add merged rows to the first worksheet (or a new worksheet)
    let worksheet = workbook.getWorksheet(1) || workbook.addWorksheet('Merged Data');
    finalData.forEach((rowData) => {
      worksheet.addRow(rowData);
    });
  
    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = ("chinecanva_" + name.replace(/\s+/g, "") + ".xlsx");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  {/* Scanning Card for Word and PDF Files */}
  <div className="mt-8 border rounded-lg p-4 bg-gray-50">
    <h2 className="text-center text-sm font-semibold mb-4 uppercase text-gray-700">SCANNING FILES</h2>
    <div className="flex flex-row gap-4">
      {/* Word File Upload (Blue) */}
      <div className="flex items-center flex-col justify-center mx-auto w-2/3">
        <label htmlFor="dropzone-file-word" className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-500">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-8 h-8 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-1 text-xs text-blue-500 uppercase"><span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> FICHIER WORD</p>
            <p className="text-xs text-blue-500 uppercase">DOCX</p>
          </div>
          <input id="dropzone-file-word" type="file" accept=".docx" className="hidden" onChange={handleFileChangeword} />
        </label>
        <div className="mt-2 min-h-[24px] text-center text-xs text-blue-500 uppercase">{WordfileName}</div>
      </div>

      {/* PDF File Upload (Red) */}
      <div className="flex items-center flex-col justify-center mx-auto w-2/3">
        <label htmlFor="dropzone-file-pdf" className="flex flex-col items-center justify-center w-full h-64 border-2 border-red-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-red-50 hover:border-red-500">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-1 text-xs text-red-500 uppercase"><span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> FICHIER DM</p>
            <p className="text-xs text-red-500 uppercase">PDF</p>
          </div>
          <input id="dropzone-file-pdf" type="file" accept=".pdf" className="hidden" onChange={handleFileChangepdf} />
        </label>
        <div className="mt-2 min-h-[24px] text-center text-xs text-red-500 uppercase">{PdffileName}</div>
      </div>

      {/* Quittance PDF File Upload (Red) */}
      <div className="flex items-center flex-col justify-center mx-auto w-2/3">
        <label htmlFor="dropzone-file-quittance" className="flex flex-col items-center justify-center w-full h-64 border-2 border-red-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-red-50 hover:border-red-500">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-1 text-xs text-red-500 uppercase"><span className="font-semibold">CLIQUEZ POUR TÉLÉCHARGER</span> RECU PDF</p>
            <p className="text-xs text-red-500 uppercase">PDF</p>
          </div>
          <input id="dropzone-file-quittance" type="file" accept=".pdf" className="hidden" onChange={handleFilejpgChange2} />
        </label>
        <div className="mt-2 min-h-[24px] text-center text-xs text-red-500 uppercase">{PdffileName2}</div>
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
            <Button onClick={handleDownload} disabled={sheets.length === 0} className="w-[100%]" >
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
  {/* Button */}
  <div className="pl-10 pr-10 pb-5">
    <Button
      className="w-[100%]"
      disabled={sheets.length === 0}
      onClick={() => setShowForm(true)}
    >
      Afficher la formulaire du PDF DM
    </Button>
  </div>

  {/* Form (shows when button is clicked) */}
  {showForm && (
    <form  className="pl-10 pr-10 pb-5 mt-5 space-y-4">
      <div className="flex gap-4">
        {/* Poid Brute */}
        <Input
          name="poidBrute"
          label="Poid Brute"
          size="lg"
          value={formData.poidBrute}
          onChange={handleChange}
          error={!!errors.poidBrute}
        />
        <Input
          name="time"
          label="time"
          size="lg"
          value={formData.time}
          onChange={handleChange}
   
        />
        {errors.poidBrute && (
          <Typography variant="paragraph" color="red">
            {errors.poidBrute}
          </Typography>
        )}

        {/* Date */}
        <Input
          type="date"
          name="date" 
          label="Date d'arrivée"
          size="lg"
          value={formData.date}
          onChange={handleChange}
          error={!!errors.date}
        />
        {errors.date && (
          <Typography variant="paragraph" color="red">
            {errors.date}
          </Typography>
        )}
      </div>
      <div className="flex gap-4">
        {/* Poid Brute */}
        <Input
          name="colis"
          label="Colis"
          size="lg"
          value={formData.colis}
          onChange={handleChange}
          error={!!errors.colis}
        />
        {errors.colis && (
          <Typography variant="paragraph" color="red">
            {errors.colis}
          </Typography>
        )}

        {/* Date */}
        <Input
          name="Numenregistrement"
          label="Numero d'enregistrement"
          size="lg"
          value={formData.Numenregistrement}
          onChange={handleChange}
          error={!!errors.Numenregistrement}
        />
        {errors.Numenregistrement && (
          <Typography variant="paragraph" color="red">
            {errors.Numenregistrement}
          </Typography>
        )}
      </div>

      {/* City and City Abbreviation */}
      <div className="flex gap-4">
        <Input
          name="city"
          label="City"
          size="lg"
          value={formData.city}
          onChange={handleChange}
          error={!!errors.city}
        />
        <Input
          name="cityAbbrev"
          label="City Abbreviation"
          size="lg"
          value={formData.cityAbbrev}
          onChange={handleChange}
          error={!!errors.cityAbbrev}
        />
      </div>
      {errors.city && (
        <Typography variant="paragraph" color="red">
          {errors.city}
        </Typography>
      )}
      {errors.cityAbbrev && (
        <Typography variant="paragraph" color="red">
          {errors.cityAbbrev}
        </Typography>
      )}

      {/* Country and Country Abbreviation */}
      <div className="flex gap-4">
        <Input
          name="country"
          label="Country"
          size="lg"
          value={formData.country}
          onChange={handleChange}
          error={!!errors.country}
        />
        <Input
          name="countryAbbrev"
          label="Country Abbreviation"
          size="lg"
          value={formData.countryAbbrev}
          onChange={handleChange}
          error={!!errors.countryAbbrev}
        />
      </div>
      {errors.country && (
        <Typography variant="paragraph" color="red">
          {errors.country}
        </Typography>
      )}
      {errors.countryAbbrev && (
        <Typography variant="paragraph" color="red">
          {errors.countryAbbrev}
        </Typography>
      )}

      {/* Exportateur */}
      <Input
        name="exportateur"
        label="Exportateur"
        size="lg"
        value={formData.exportateur}
        onChange={handleChange}
        error={!!errors.exportateur}
      />
      {errors.exportateur && (
        <Typography variant="paragraph" color="red">
          {errors.exportateur}
        </Typography>
      )}
 <div className="flex gap-4">
 <Input
          name="numtitre"
          label="Numero de titre de transport"
          size="lg"
          value={formData.numtitre}
          onChange={handleChange}
          error={!!errors.numtitre}
        />
        {errors.numtitre && (
          <Typography variant="paragraph" color="red">
            {errors.numtitre}
          </Typography>
        )}
         {/* Phrase Colis */}
      <Input
        name="phrasecolis"
        label="Phrase Colis"
        size="lg"
        value={formData.phrasecolis}
        onChange={handleChange}
        error={!!errors.phrasecolis}
      />
      {errors.phrasecolis && (
        <Typography variant="paragraph" color="red">
          {errors.phrasecolis}
        </Typography>
      )}
      

 </div>
     
<div className="flex items-center justify-center w-full">
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500">JPEG images only</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          name="codeqr"
          accept="image/jpeg"
          className="hidden"
          onChange={handleFilejpgChange}
        />
      </label>
    </div>
    <div className="mt-2 min-h-[24px] text-center text-sm text-gray-500">{jpgfileName}</div>
    </form>
  )}
  {/* Button to show PDF3 form */}
<div className="pl-10 pr-10 pb-5">
  <Button
    className="w-[100%]"
    disabled={sheets.length === 0} // Disable if no sheets available
    onClick={() => setShowPdf3Form(true)}
  >
    Afficher la formulaire du FICHIER WORD
  </Button>
</div>

{/* Form for PDF3 (shows when the button is clicked) */}
{showPdf3Form && (
  <form className="pl-10 pr-10 pb-5 mt-5 space-y-4">
          <div className="flex gap-4">
            <Input
              name="code"
              label="Code"
              size="lg"
              value={pdf3FormData.code}
              onChange={handlePdf3Change}
            />
            <Input
              name="drp"
              label="D.R.P.P"
              size="lg"
              value={pdf3FormData.drp}
              onChange={handlePdf3Change}
            />
            <Input
              name="ben"
              label="B E N°"
              size="lg"
              value={pdf3FormData.ben}
              onChange={handlePdf3Change}
            />
            <Input
              type="date"
              name="date3"
              label="Du"
              size="lg"
              value={pdf3FormData.date3}
              onChange={handlePdf3Change}
            />
            
          </div>

          <div className="flex gap-4">
            <Input
              name="time"
              label="time"
              size="lg"
              value={pdf3FormData.time}
              onChange={handlePdf3Change}
            />
            <Input
              type="date"
              name="date1"
              label="DATE EDITION"
              size="lg"
              value={pdf3FormData.date1}
              onChange={handlePdf3Change}
            />
            <Input
              type="date"
              name="date2"
              label="DATE ECHEANCE PAIEMENT"
              size="lg"
              value={pdf3FormData.date2}
              onChange={handlePdf3Change}
            />
          </div>

          <div className="flex gap-4">
            <Input
              type="date"
              name="date4"
              label="DATE DECLARATION"
              size="lg"
              value={pdf3FormData.date4}
              onChange={handlePdf3Change}
            />
            <Input
              type="date"
              name="date5"
              label="DATE LIQUIDATION"
              size="lg"
              value={pdf3FormData.date5}
              onChange={handlePdf3Change}
            />
          </div>

          <div className="flex gap-4">
            <Input
              name="codeem"
              label="N° DU DECLARATION"
              size="lg"
              value={pdf3FormData.codeem}
              onChange={handlePdf3Change}
            />
            <Input
              name="codees"
              label="N° DU LIQUIDATION"
              size="lg"
              value={pdf3FormData.codees}
              onChange={handlePdf3Change}
            />
          </div>

          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    DELAI
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
<div className="flex gap-4">
<div className="pt-3">
                    MAJORATION
</div>
<div className="pl-12">
                  <Button
                  className="bg-cyan-900"
                    onClick={() => setMajoration(!majoration)}                 >
                    {majoration ? 'Automatique' : 'Manuelle'}
                  </Button>
</div>
</div>

                  </Typography>

                </th>
                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    ECHEANCE
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {[60, 90, 120, 180].map((delai, index) => (
                <tr key={delai}>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {delai}
                    </Typography>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Input
                      type="number"
                      name={`majoration${index + 1}`}
                      label={`Majoration ${index + 1}`}
                      size="lg"
                      value={pdf3FormData[`majoration${index + 1}`]}
                      onChange={handlePdf3Change}
                    />
                  </td>
                  <td className="p-4 border-b border-blue-gray-50">
                    <Input
                      type="date"
                      name={`echeance${index + 1}`}
                      label={`Echeance ${index + 1}`}
                      size="lg"
                      value={pdf3FormData[`echeance${index + 1}`]}
                      onChange={handlePdf3Change}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
)}
<div className="pl-10 pr-10 pb-5">
  <Button
    className="w-[100%]"
    disabled={sheets.length === 0} // Disable if no sheets available
    onClick={() => setShowPdfquitance(true)}
  >
    Afficher la formulaire du PDF RECU
  </Button>
</div>

{/* Form for PDF3 (shows when the button is clicked) */}
{showPdfquitance && (
 <form className="pl-10 pr-10 pb-5 mt-5 space-y-4">
 <div className="flex gap-4">
   <Input
     name="reglementNum"
     label="Réglement N°"
     size="lg"
     value={formData2.reglementNum}
     onChange={handleChange2}
     error={!!errors2.reglementNum}
   />
   {errors2.reglementNum && (
     <Typography variant="paragraph" color="red">
       {errors2.reglementNum}
     </Typography>
   )}

   <Input
     name="imputation"
     label="Imputation"
     size="lg"
     value={formData2.imputation}
     onChange={handleChange2}
     error={!!errors2.imputation}
   />
   {errors2.imputation && (
     <Typography variant="paragraph" color="red">
       {errors2.imputation}
     </Typography>
   )}
 </div>

 <div className="flex gap-4">
   <Input
     name="recette"
     label="Recette"
     size="lg"
     value={formData2.recette}
     onChange={handleChange2}
     error={!!errors2.recette}
   />
   {errors2.recette && (
     <Typography variant="paragraph" color="red">
       {errors2.recette}
     </Typography>
   )}

   <Input
     name="quittanceNum"
     label="Quittance N°"
     size="lg"
     value={formData2.quittanceNum}
     onChange={handleChange2}
     error={!!errors2.quittanceNum}
   />
   {errors2.quittanceNum && (
     <Typography variant="paragraph" color="red">
       {errors2.quittanceNum}
     </Typography>
   )}
 </div>

 <div className="flex gap-4">
   <Input
     name="date"
     label="Date"
     size="lg"
     value={formData2.date}
     onChange={handleChange2}
     error={!!errors2.date}
   />
   {errors2.date && (
     <Typography variant="paragraph" color="red">
       {errors2.date}
     </Typography>
   )}
     <Input
     name="recude"
     label="RECU DE"
     size="lg"
     value={formData2.recude}
     onChange={handleChange2}
     error={!!errors2.recude}
   />
   {errors2.recude && (
     <Typography variant="paragraph" color="red">
       {errors2.recude}
     </Typography>
   )}

 </div>

 <div className="flex gap-4">
 <Input
     name="declarationNum"
     label="N° Déclaration"
     size="lg"
     value={formData2.declarationNum}
     onChange={handleChange2}
     error={!!errors2.declarationNum}
   />
   {errors2.declarationNum && (
     <Typography variant="paragraph" color="red">
       {errors2.declarationNum}
     </Typography>
   )}
   <Input
     name="liquidationNum"
     label="N° Liquidation"
     size="lg"
     value={formData2.liquidationNum}
     onChange={handleChange2}
     error={!!errors2.liquidationNum}
   />
   {errors2.liquidationNum && (
     <Typography variant="paragraph" color="red">
       {errors2.liquidationNum}
     </Typography>
   )}
 </div>

 <div className="flex gap-4">
   <Input
     name="moyenPaiement"
     label="Moyen Paiement"
     size="lg"
     value={formData2.moyenPaiement}
     onChange={handleChange2}
     error={!!errors2.moyenPaiement}
   />
   {errors2.moyenPaiement && (
     <Typography variant="paragraph" color="red">
       {errors2.moyenPaiement}
     </Typography>
   )}

   <Input
     name="referenceTransaction"
     label="Référence Transaction"
     size="lg"
     value={formData2.referenceTransaction}
     onChange={handleChange2}
     error={!!errors2.referenceTransaction}
   />
   {errors2.referenceTransaction && (
     <Typography variant="paragraph" color="red">
       {errors2.referenceTransaction}
     </Typography>
   )}
 </div>
 <div className="flex gap-4 items-center">
  <Input
    name="datePaiement"
    label="Date Paiement"
    size="lg"
    value={formData2.datePaiement}
    onChange={handleChange2}
    error={!!errors2.datePaiement}
  />
  {errors2.datePaiement && (
    <Typography variant="paragraph" color="red">
      {errors2.datePaiement}
    </Typography>
  )}
  <Input
    name="montant"
    label="Montant"
    size="lg"
    value={formData2.montant}
    onChange={handleChange2}
    error={!!errors2.montant}
  />
  {errors2.montant && (
    <Typography variant="paragraph" color="red">
      {errors2.montant}
    </Typography>
  )}
  <Button
    className="bg-cyan-900 text-white py-3 px-6  min-w-[150px]"
    onClick={() => setAuto(!auto)}
  >
    {auto ? 'Automatique' : 'Manuelle'}
  </Button>
</div>


 <div className="flex items-center justify-center w-full">
   <label 
     htmlFor="file-upload2" 
     className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
   >
     <div className="flex flex-col items-center justify-center pt-5 pb-6">
       <svg 
         className="w-10 h-10 mb-3 text-gray-400" 
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
       <p className="mb-2 text-sm text-gray-500">
         <span className="font-semibold">Click to upload</span> or drag and drop
       </p>
       <p className="text-xs text-gray-500">JPEG images only</p>
     </div>
     <input 
       id="file-upload2" 
       type="file" 
       name="codeqrr"
       accept="image/jpeg"
       className="hidden"
       onChange={handleFilejpgChange3}
     />
   </label>
 </div>
 <div className="mt-2 min-h-[24px] text-center text-sm text-gray-500">
   {jpgfileName2}
 </div>
</form>
)}
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
                  
                  {/* New button for generating PDF2 */}
                  <Button
                   className="bg-teal-700"// You can change the color as needed
                    onClick={() => handleGeneratePdf2(sheet.data, sheet.name)}
                    disabled={!isFormDataComplete() || pdfStatus[sheet.name]?.generatingPdf2} // Disable until form data is complete
                  >
                    {pdfStatus[sheet.name]?.generatingPdf2 ? 'Generating PDF2...' : 'Generate PDF2'}
                  </Button>
                  &nbsp;&nbsp;&nbsp;

                  {pdfStatus[sheet.name]?.errorPdf2 && (
                    <Typography color="red" variant="body2">Error generating PDF2</Typography>
                  )}
                   {/* Button to generate PDF3 */}
                      <Button
                        className="bg-gray-700"
                        onClick={() => handleGeneratePdf3(sheet.data, sheet.name)}
                        disabled={!isPdf3FormComplete() || pdfStatus[sheet.name]?.generatingPdf3}
                      >
                        {pdfStatus[sheet.name]?.generatingPdf3 ? 'Generating PDF3...' : 'Generate PDF3'}
                      </Button>
                      &nbsp;&nbsp;&nbsp;
                      <Button
                        className="bg-green-900"
                        onClick={() => quitance(sheet.data, sheet.name)}
                        disabled={!isFormDataComplete2() }
                      >
                       Generate Quitance
                      </Button>
                  
                  {sheet.totals && (
                    <div className="mt-4">
                      <Typography variant="body2">Total Pieces: {sheet.totals.pieces}</Typography>
                      <Typography variant="body2">Total Value: {sheet.totals.value.toFixed(2)}</Typography>
                      <Typography variant="body2">Total Weight: {sheet.totals.weight.toFixed(2)}</Typography>

                    </div>
                  )}
                </div>
                <div className="p-6">
      <Typography variant="h5" className="mb-4">Canva Chine</Typography>
      <div className="flex gap-4">
        <Button
          color="green"
          onClick={() => generateExcelFromTemplate(sheet.data, sheet.name)}
          className="w-auto min-w-[180px] flex items-center justify-center"
        >
          {loadingDownload ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
              <div className="ml-2">Downloading Canva Chine file ...</div>
            </div>
          ) : (
            <span className="whitespace-nowrap">Canva Chine file</span>
          )}
        </Button>

        <Input
          type="date"
          name="date4"
          label="DATE DECLARATION"
          size="lg"
          value={pdf3FormData.date4}
          onChange={handlePdf3Change}
        />
        <Input
          name="codeem"
          label="N° DU DECLARATION"
          size="lg"
          value={pdf3FormData.codeem}
          onChange={handlePdf3Change}
        />
        <Input
          name="codees"
          label="N° DU LIQUIDATION"
          size="lg"
          value={pdf3FormData.codees}
          onChange={handlePdf3Change}
        />
      </div>
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