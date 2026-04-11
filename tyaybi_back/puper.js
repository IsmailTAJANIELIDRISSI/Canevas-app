const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateCustomsForm(doc, pageNum, data1, data2Row) {
    // Set font
    doc.font('Helvetica');

    // Header
    doc.fontSize(10).text('MINISTERE DE L\'ECONOMIE ET DES FINANCES', { align: 'left' });
    doc.fontSize(8).text('ADMINISTRATION DES DOUANES ET IMPOTS INDIRECTS', { align: 'left' });
    doc.moveDown();

    // Right aligned text
    doc.fontSize(8).text('Enregistrée, acceptée', 500, 50, { align: 'right' });
    doc.text(`Imprimé le: 11/09/2024 12:55`, { align: 'right' });
    doc.fontSize(10).text('Mod. D.U.M 2014', { align: 'right' });

    // Main content
    const startY = 100;
    const lineHeight = 20;
    let currentY = startY;

    // Function to draw a box with text
    function drawBox(x, y, width, height, text, fontSize = 8) {
        doc.rect(x, y, width, height).stroke();
        doc.fontSize(fontSize).text(text, x + 5, y + 5, { width: width - 10 });
    }

    // Exporter section
    drawBox(50, currentY, 300, 60, '2 Exportateur / Expéditeur');
    doc.fontSize(8).text(`N° R.C\nCentre R.C\nICE`, 300, currentY + 5);
    doc.text(`${data1.nom} ${data1.prenom} - Page ${pageNum}`, 55, currentY + 25);
    doc.text('CHINE', 55, currentY + 40);

    // Declaration section
    drawBox(360, currentY, 185, 60, '1 DECLARATION');
    doc.fontSize(8).text(`D10    301    008/2500 P 11/09/2024`, 365, currentY + 15);
    doc.text(`BUREAU: CASABLANCA PORT 12:54`, 365, currentY + 30);

    currentY += 70;

    // Importer section
    drawBox(50, currentY, 300, 60, '5 Importateur / Destinataire');
    doc.fontSize(8).text(`N° R.C ${data2Row[1]}\nCentre R.C ${data2Row[2]}\nICE 000230731000088`, 300, currentY + 5);
    doc.text('MED AFRICA LOGISTICS', 55, currentY + 25);
    doc.text('195 BD EMILE ZOLA 7EME ETAGE N21 CASABLANCA', 55, currentY + 40);

    // Registration section
    drawBox(360, currentY, 185, 60, 'A ENREGISTREMENT');

    currentY += 70;

    // Declarant section
    drawBox(50, currentY, 495, 40, '10 Déclarant');
    doc.fontSize(8).text('BJ332668', 55, currentY + 15);
    doc.text('MED AFRICA LOGISTICS', 55, currentY + 25);
    doc.text(`N° d'agrément 1633`, 300, currentY + 15);
    doc.text(`N° du répertoire 000230731000088`, 300, currentY + 25);

    currentY += 50;

    // Transport section
    drawBox(50, currentY, 495, 30, '15 Moyen de transport au départ / à l\'arrivée');
    doc.fontSize(8).text(`02 | Avion`, 55, currentY + 15);
    doc.text('DOHA INTRNTL', 300, currentY + 15);

    currentY += 40;

    // Nature of transport
    drawBox(50, currentY, 495, 30, '17 Nature et numéro du titre de transport');
    doc.fontSize(8).text(`${data2Row[3]}|${data2Row[4]}|DOH`, 55, currentY + 15);

    currentY += 40;

    // Date and location
    drawBox(50, currentY, 165, 30, '24 Date d\'arrivée');
    doc.fontSize(8).text('10 | 09 | 2024', 55, currentY + 15);

    drawBox(215, currentY, 165, 30, '25 Localisation des marchandises');
    doc.fontSize(8).text(`${data2Row[5]}`, 220, currentY + 15);

    drawBox(380, currentY, 165, 30, '26 Code bureau destination');
    doc.fontSize(8).text('I', 385, currentY + 15);
}

const doc = new PDFDocument({ size: 'A4', margin: 50 });
doc.pipe(fs.createWriteStream('output.pdf'));

// Sample data
const data1 = { nom: "anas", prenom: "nabli", age: 13, datenaissance: "2003-09-09", niveau: "bac+3" };
const data2 = [
    [4, 25574, 1, 'waybillNumber1', 'ngpCode1', 22222, 'CN', 'SP', 'NON', 'total1', 'MAD', 'pieces1', '002', 'weight1', 'pieces1', 77, 66, 55, 44, 33, 22],
    [4, 25574, 1, 'waybillNumber2', 'ngpCode2', 22222, 'CN', 'SP', 'NON', 'total2', 'MAD', 'pieces2', '002', 'weight2', 'pieces2', 77, 66, 55, 44, 33, 22],
    [4, 25574, 1, 'waybillNumber1', 'ngpCode1', 22222, 'CN', 'SP', 'NON', 'total1', 'MAD', 'pieces1', '002', 'weight1', 'pieces1', 77, 66, 55, 44, 33, 22],
    [4, 25574, 1, 'waybillNumber1', 'ngpCode1', 22222, 'CN', 'SP', 'NON', 'total1', 'MAD', 'pieces1', '002', 'weight1', 'pieces1', 77, 66, 55, 44, 33, 22],
    [4, 25574, 1, 'waybillNumber1', 'ngpCode1', 22222, 'CN', 'SP', 'NON', 'total1', 'MAD', 'pieces1', '002', 'weight1', 'pieces1', 77, 66, 55, 44, 33, 22],
    [4, 25574, 1, 'waybillNumber1', 'ngpCode1', 22222, 'CN', 'SP', 'NON', 'total1', 'MAD', 'pieces1', '002', 'weight1', 'pieces1', 77, 66, 55, 44, 33, 22]
];


// Loop to create pages based on data2
for (let i = 0; i < data2.length; i++) {
    if (i > 0) {
        doc.addPage(); // Add a new page for subsequent pages
    }
    generateCustomsForm(doc, i + 1, data1, data2[i]); // Pass the document, page number, data1, and the current row from data2
}

// Finalize the PDF
doc.end();
module.exports = { generateCustomsForm };