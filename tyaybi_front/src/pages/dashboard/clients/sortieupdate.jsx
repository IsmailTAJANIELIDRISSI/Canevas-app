import React, { useState } from "react";
import { Button,Input, Card, Typography,Table,TableCell,TableHeader, TableBody,TableRow,TableHead} from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import bddngp from './bddngp.json';
import ExcelJS from 'exceljs';
import stringSimilarity from 'string-similarity';
import numData from './num.json';


export function Clients() {
  const [exclusionWaybills, setExclusionWaybills] = useState([]);
  const [pdfStatus, setPdfStatus] = useState({});
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
  const [totalvaluee, setTotalvaluee] = useState(0);
  const [exclusionFile, setExclusionFile] = useState(null);
  const [excexiste,setExcexiste]=useState(false)
  const [exclusionFileName, setExclusionFileName] = useState("");
  const [value2, setValue2] = useState("1/3");
  const [loading,setLoading]=useState(false)
  const [loadingall,setIsLoadingall]=useState(false)
  const [loadingDownload,setLoadingDownload]=useState(false)
  const [loadingDownloads,setLoadingDownloads]=useState(false)
  const [foundver,setFoundver]=useState(false)
  const [summary,setSummary]=useState(false)
  const [missingNGP, setMissingNGP] = useState([]);
  const [jsondataa, setJsondata] = useState([]);

  const [foundngp,setFoundngp]=useState(false)
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    poidBrute: "",
    date: "",
    city: "",
    time:"",
    colis:"",
    Numenregistrement:"",
    cityAbbrev: "",
    numtitre:"",
    country: "CHINE",
    countryAbbrev: "CN",
    exportateur: "",
    phrasecolis: "SOIT 35 COLIS.NS SOLL LA DISP DES FORM CCEC"
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
      "8504409980": [17.5, 0.25, 20.0]
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
            montant: tax1Amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
          },
          {
            taxe: "007217",
            assiette: value.toFixed(2),
            taux: tax2Rate % 1 === 0 ? tax2Rate.toFixed(1) : tax2Rate,
            stva: "T",
            sfr: "",
            tv: "",
            montant: tax2Amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
          },
          {
            taxe: "002109",
            assiette: tax3Assiette.toFixed(2),
            taux: tax3Rate % 1 === 0 ? tax3Rate.toFixed(1) : tax3Rate,
            stva: "T",
            sfr: "",
            tv: "",
            montant: tax3Amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
          }
        ];
    
        data22.push({
          articleNumber: articleNumber,
          customsCode: customsCode,
          value: value.toFixed(2).replace('.', ','),
          quantity: quantity,
          taxes: taxes,
          total: total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
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
console.log("jsondtatatatattata");

console.log(jsondataa);
const today = new Date();
const hours = today.getHours();
var seconds = today.getSeconds().toString().padStart(2, '0');
const minutes = today.getMinutes();
const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds}`;
// Ensure tax1, tax2, and tax3 are numbers before summing them
const sous = (parseFloat(tax1) + parseFloat(tax2) + parseFloat(tax3)+150).toFixed(2);

// Calculate remisecredit based on numeric subtotal
const remisecredit = Math.ceil((parseFloat(sous) * 0.05 * 30) / 365).toFixed(2);
const grandTotal = (
  parseFloat(sous) +
  parseFloat(remisecredit)
).toFixed(2);
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
    echeance4:formatDate(pdf3FormData.echeance4)

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

  
  const isFormDataComplete = () => {
    return Object.values(formData).every(value => value.trim() !== "");
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

  function extractNumber(sheetName) {
    const match = sheetName.match(/\d+/); // Use regex to find digits
    return match ? parseInt(match[0], 10) : 1; // Return the number or null if not found
  }
  const generatePdf2 = async (data, sheetname) => {
  
   console.log(data);

    const sheetnum = extractNumber(sheetname); 
    const lastArray =data[data.length - 1][10]; 
    const montanttotale = parseFloat(lastArray).toFixed(3);

    
    const totalarticle = 217; 
    console.log("hadiiiiiiiiiii",totalarticle);
    
    const totalformule = Math.ceil(totalarticle / 2); 


    const formuleArray = Array.from({ length: totalformule }, (_, i) => i + 1);
    const totalgolobalvaleur =585858;
    var codetab = 0;
    var codetab2 = 0;
   
      codetab = formData.numtitre
      const colis = formData.colis;
      console.log(codetab);
      console.log(codetab2);
    const fret = parseFloat((parvaleur / totalgolobalvaleur) * montanttotale).toFixed(3);
   
   const rmmawb =removeMawbPrefix(mawb)
   console.log(rmmawb);
   const result = 85858;
   const dateEnregistrement = "85/58/2025";
   codetab2 = 72525
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
    const time1 = "28:27:65"; // e.g., "20:25:16"

// Create time2 by removing the seconds
    const time2 = time1.substring(0, 5); // This gives you "20:25"
    console.log(1111111111111);
    console.log("totalarticle:", totalarticle);
console.log("totalformule:", totalformule);
console.log("date:", date);
console.log("dateString:", "04/09/2024");
console.log("formData:", formData);
console.log("hours:", hours);
console.log("minutes:", minutes);
console.log("assurance:", assurance);
console.log("totalgolobalpoidnet:", totalgolobalpoidnet);
console.log("formData.poidBrute:", formData.poidBrute);
console.log("time1:", time1);
console.log("time2:", time2);
console.log("montanttotale:", montanttotale);
console.log("fret:", fret);
console.log("colis:", colis);
console.log("sheetnum:", sheetnum);
console.log("sheetname:", sheetname);
console.log("rmmawb:", rmmawb);
console.log("mawb:", mawb);
console.log("codetab:", codetab);
console.log("codetab2:", codetab2);
console.log("seconds:", seconds);
console.log("dateEnregistrement:", dateEnregistrement);

// Construct data1 and log it
const data1 = {
    totalarticle,
    totalformule,
    date,
    year: "04/09/2024",
    month: "04/09/2024",
    day: "04/09/2024",
    mdina: formData.city,
    mdinaab: formData.cityAbbrev,
    hours,
    minutes,
    assurance,
    poidnet: totalgolobalpoidnet,
    poidbrut: formData.poidBrute, 
    time: time2,
    time2: time1,
    montanttotale,
    city: formData.country,
    cityab: formData.countryAbbrev,
    fret,
    exportateur: formData.exportateur,
    phrasecolis: formData.phrasecolis,
    sheetnum,
    colis,
    sheetname,
    mawb: rmmawb,
    mawbb: mawb,
    codetab,
    codetab2,
    seconds,
    dateEnregistrement
};
console.log("data1:", data1);
    const payload = {
        data1: {
            totalarticle: totalarticle,
            totalformule: totalformule,
            date: date,
            year: "04/09/2024",
            month: "04/09/2024",
            day: "04/09/2024",
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
        data2: data.slice(1),
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

const handleGeneratePdf2 = async () => {


  try {
    // Your logic to generate PDF2
    await generatePdf2(jsondataa,"sheetName"); // Assuming this is your function to generate PDF2

   
  } catch (error) {
    // Handle error

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
      setJsondata(jsondata)
      const waybills = jsonData.slice(0).map(row => row[0]);
      
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
     console.log(jsonData);
     setJsondata(jsonData)
    };
  };
  
  const handleDownloadSummaryOnly = async () => {
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
        const uniqueWaybillCount = uniqueWaybillNumbers.length;
        
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
        

    
        // Count the number of unique waybill numbers
        const uniqueWaybillCount = uniqueWaybillNumbers.length;
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
        const uniqueWaybillCount = uniqueWaybillNumbers.length;
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
        

       console.log(uniqueWaybillNumbers);
        // Count the number of unique waybill numbers
        const uniqueWaybillCount = uniqueWaybillNumbers.length;
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
          sheet.data[i][18], sheet.data[i][19]
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
  
      // Add headers
      worksheet.addRow(sheetData[0]); // Assuming first row is header
  
      // Add data rows
  
      for (let i = 1; i < sheetData.length-1; i++) {
        
        worksheet.addRow(sheetData[i]);
      }
      const totalPrice = sheetData[sheetData.length-1][10];
      
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
        sheetData[i][18], sheetData[i][19]
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
  
    for (let i = 1; i < sheets.length; i++) { // Start from the second sheet
      const sheet = sheets[i];
      await generateAndDownloadExcel(sheet);
      updateProgress();
      await generateAndDownloadPDF(sheet);
      updateProgress();
    }
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
      sheet.data[i][18], sheet.data[i][19]
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
  
    // Add headers and data rows
    worksheet.addRow(sheet.data[0]);
    for (let i = 1; i < sheet.data.length - 1; i++) {
      worksheet.addRow(sheet.data[i]);
    }
  
    const totalPrice = sheet.data[sheet.data.length - 1][10];
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
          <Button onClick={handleSliceExcel}  className="w-[100%]">
              {loading ? (
                <div className="flex items-center justify-center "> 
                  <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
                  <div className="ml-2">Slicing...</div>
                </div>
              ) : (
                "Slice Excel"
              )}
         </Button>  
  
            <Button onClick={handleGeneratePdf2}  className="w-[100%]">
              
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
      Afficher la formulaire du pdf
    </Button>
  </div>

  {/* Form (shows when button is clicked) */}
  {!showForm && (
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
     

    </form>
  )}
  {/* Button to show PDF3 form */}
<div className="pl-10 pr-10 pb-5">
  <Button
    className="w-[100%]"
    disabled={sheets.length === 0} // Disable if no sheets available
    onClick={() => setShowPdf3Form(true)}
  >
    Afficher la formulaire du PDF3
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
                    MAJORATION
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
                  

                  {sheet.totals && (
                    <div className="mt-4">
                      <Typography variant="body2">Total Pieces: {sheet.totals.pieces}</Typography>
                      <Typography variant="body2">Total Value: {sheet.totals.value}</Typography>
                      <Typography variant="body2">Total Weight: {sheet.totals.weight}</Typography>
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