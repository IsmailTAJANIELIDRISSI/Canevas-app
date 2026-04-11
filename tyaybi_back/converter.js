const ExcelJS = require("exceljs");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const fontkit = require("@pdf-lib/fontkit");

async function convertExcelToPdf(filePath, totalPrice, totalDDP) {
  const smallerWidthColumns = [
    1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20,
  ];
  const defaultCellWidth = 50;
  const smallerCellWidth = 30;
  const fontSize = 2;
  const cellPadding = 2;
  const tableTopPadding = 20;
  const tableLeftPadding = 10;
  const headerRowHeight = 20; // Height for header row
  const dataRowHeight = fontSize + 2 * cellPadding; // Height for data rows
  const spaceBetweenTableAndTotals = 20;
  const minimumSpaceForTotals = 30; // Minimum space needed for the totals section
  
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const arabicFontBytes = fs.readFileSync(
      path.join(__dirname, "./fonts/NotoSansArabic-Regular.ttf")
    );
    const latinFontBytes = fs.readFileSync(
      path.join(__dirname, "./fonts/NotoSans-Regular.ttf")
    );
    const arabicFont = await pdfDoc.embedFont(arabicFontBytes);
    const latinFont = await pdfDoc.embedFont(latinFontBytes);

    let pageWidth = 800;
    let pageHeight = 600;

    workbook.eachSheet((worksheet, sheetId) => {
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      const { width, height } = page.getSize();
      let y = height - tableTopPadding;

      // Handle the header row
      const headerRow = worksheet.getRow(1);
      let xPosition = tableLeftPadding;

      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const cellText = cell.value ? cell.value.toString().trim() : "";
        const isSmallerWidth = smallerWidthColumns.includes(colNumber);
        const cellWidth = isSmallerWidth ? smallerCellWidth : defaultCellWidth;

        page.drawRectangle({
          x: xPosition,
          y: y - headerRowHeight,
          width: cellWidth,
          height: headerRowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });

        const fontToUse = determineFont(cellText, arabicFont, latinFont);

        // Truncate text to fit within the cell width
        const truncatedText = truncateTextToFit(
          cellText,
          cellWidth,
          fontToUse,
          fontSize,
          cellPadding
        );

        // Calculate text width and position to center and justify it
        const textWidth = fontToUse.widthOfTextAtSize(truncatedText, fontSize);
        const textX = xPosition + (cellWidth - textWidth) / 2;
        const textY = y - headerRowHeight + (headerRowHeight - fontSize) / 2;

        page.drawText(truncatedText, {
          x: textX,
          y: textY,
          size: fontSize,
          font: fontToUse,
          color: rgb(0, 0, 0),
        });

        xPosition += cellWidth;
      });

      y -= headerRowHeight;

      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip the header row since it's already handled

        let maxRowHeight = 0;
        let xPosition = tableLeftPadding;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const cellText = cell.value ? cell.value.toString().trim() : "";
          const isSmallerWidth = smallerWidthColumns.includes(colNumber);
          const cellWidth = isSmallerWidth
            ? smallerCellWidth
            : defaultCellWidth;
          const cellHeight = dataRowHeight;
          maxRowHeight = Math.max(maxRowHeight, cellHeight);

          page.drawRectangle({
            x: xPosition,
            y: y - cellHeight,
            width: cellWidth,
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 0.5,
          });

          const fontToUse = determineFont(cellText, arabicFont, latinFont);

          // Truncate text to fit within the cell width
          const truncatedText = truncateTextToFit(
            cellText,
            cellWidth,
            fontToUse,
            fontSize,
            cellPadding
          );

          page.drawText(truncatedText, {
            x: xPosition + cellPadding,
            y: y - cellHeight + cellPadding,
            size: fontSize,
            font: fontToUse,
            color: rgb(0, 0, 0),
          });

          xPosition += cellWidth;
        });

        y -= maxRowHeight;
        if (y <= tableTopPadding) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = height - tableTopPadding;
        }
      });
      
      // Check if there's enough space for the totals
      // If not enough space for totals, create a new page
      if (y < tableTopPadding + minimumSpaceForTotals) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = height - tableTopPadding;
      }
      
      // Add space between the table and the totals
      y -= spaceBetweenTableAndTotals;

      // Draw the total price
      page.drawText(`Total Value DDP: ${totalPrice}`, {
        x: tableLeftPadding,
        y: y,
        size: 4,
        font: latinFont,
        color: rgb(0, 0, 0),
      });

      // Draw the total DDP
      page.drawText(`Freight Included: ${totalDDP}`, {
        x: tableLeftPadding,
        y: y - fontSize - 5,
        size: 4,
        font: latinFont,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync("output.pdf", pdfBytes);

    console.log("PDF created successfully.");
    return pdfBytes;
  } catch (error) {
    console.error("Error in convertExcelToPdf:", error.message);
    console.error(error.stack);
    throw error;
  }
}

function determineFont(text, arabicFont, latinFont) {
  const containsArabic = /[\u0600-\u06FF]/.test(text);
  const containsLatin = /[a-zA-Z]/.test(text);

  if (containsArabic) {
    return arabicFont;
  } else if (containsLatin) {
    return latinFont;
  } else {
    return latinFont;
  }
}

function truncateTextToFit(text, maxWidth, font, fontSize, cellPadding) {
  let truncatedText = text;
  while (
    font.widthOfTextAtSize(truncatedText, fontSize) >
    maxWidth - 2 * cellPadding
  ) {
    truncatedText = truncatedText.slice(0, -1);
  }
  return truncatedText;
}

module.exports = { convertExcelToPdf };