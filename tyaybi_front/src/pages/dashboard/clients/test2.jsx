import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

// Set the worker source path directly
GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'; // Ensure this path is correct


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

  // Define regex patterns
  const dateAndTimePattern = /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/;
  const declarationNumberAndDatePattern = /\d+\s[A-Za-z]\s\d{2}\/\d{2}\/\d{4}/;
  const timeOnlyPattern = /\b\d{2}:\d{2}\b/;
  const transportInfoPattern = /(\s+\d{2})\|(\d+)\|(\d+-\d+\/\d+)\|([A-Za-z]+\s)/;
  const soitStatementPattern = /SOIT\s\d+\sCOLIS.NS SOLL LA DISP DES FORM CCEC/;
  const poidsBrutTotalPattern = /\s(\d+\.\d{2})\s+/;
  const arrivalCityPattern = /(\w+(?:\s+\w+)*)(?=\s+02\s+Avion)/; // Updated pattern
  const arrivalDatePattern = /(\d{2}\s+\d{2}\s+\d{4})/;

  // Extract matches
  const dateAndTime = pageText.match(dateAndTimePattern)?.[0] || 'Not found';
  const declarationNumberAndDate = pageText.match(declarationNumberAndDatePattern)?.[0] || 'Not found';
  const timeOnly = pageText.match(timeOnlyPattern)?.[0] || 'Not found';
  const transportInfo = pageText.match(transportInfoPattern)?.[0] || 'Not found';
  const soitStatement = pageText.match(soitStatementPattern)?.[0] || 'Not found';
  const poidsBrutTotal = pageText.match(poidsBrutTotalPattern)?.[1] || 'Not found';
  const arrivalCity = pageText.match(arrivalCityPattern)?.[1].trim() || 'Not found'; // Trim spaces
  const arrivalDate = pageText.match(arrivalDatePattern)?.[1] || 'Not found';

  console.log("Extracted Information:", {
    dateAndTime,
    declarationNumberAndDate,
    timeOnly,
    transportInfo,
    soitStatement,
    poidsBrutTotal,
    arrivalCity,
    arrivalDate
  });

  return {
    dateAndTime,
    declarationNumberAndDate,
    timeOnly,
    transportInfo,
    soitStatement,
    poidsBrutTotal,
    arrivalCity,
    arrivalDate
  };
};


// React component
const FileParser = () => {
  const [info, setInfo] = useState({
    dateAndTime: '',
    declarationNumberAndDate: '',
    timeOnly: '',
    transportInfo: '',
    soitStatement: '',
    poidsBrutTotal: '',
    arrivalCity: '',
    arrivalDate: ''
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("Selected File:", file);
    
    if (file) {
      const extractedInfo = await extractInfoFromPdf(file);
      setInfo(extractedInfo);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <div>
        <h3>Extracted Information:</h3>
        <p><strong>Date and Time:</strong> {info.dateAndTime}</p>
        <p><strong>Declaration Number and Date:</strong> {info.declarationNumberAndDate}</p>
        <p><strong>Time Only:</strong> {info.timeOnly}</p>
        <p><strong>Transport Info:</strong> {info.transportInfo}</p>
        <p><strong>Soit Statement:</strong> {info.soitStatement}</p>
        <p><strong>Poids Brut Total:</strong> {info.poidsBrutTotal}</p>
        <p><strong>Arrival City:</strong> {info.arrivalCity}</p>
        <p><strong>Arrival Date:</strong> {info.arrivalDate}</p>
      </div>
    </div>
  );
};

export default FileParser;
