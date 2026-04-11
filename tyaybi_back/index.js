const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { convertExcelToPdf } = require('./converter'); 


const app = express();
const PORT = 3000;
const PDFDocument = require("pdfkit");



const filePath = '../tyaybi_front/src/pages/dashboard/clients/bddngp.json';
const filePath2 = '../taibi_front/src/pages/dashboard/clients/num.json';
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json({ limit: "7mb" })); // Increase JSON payload limit
app.use(bodyParser.urlencoded({ extended: true, limit: "7mb" })); // Increase URL-encoded payload limit
const consoFontPath = path.join(__dirname, 'fonts', 'Consolas.ttf'); // Update this path as necessary
// Configure multer to handle file uploads
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.xls' && ext !== '.xlsx') {
            return cb(new Error('Only Excel files are allowed'));
        }
        cb(null, true);
    }
});
  
// Upload and convert Excel to PDF
app.post('/upload', upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file was uploaded.');
      }
  
      // Log the uploaded file information
      
  
      // Extract totalPrice and totalDDP from the request body
      const { totalPrice, totalDDP } = req.body;
  
      // Validate totalPrice and totalDDP
      if (!totalPrice || !totalDDP) {
        return res.status(400).send('Total price and total DDP are required.');
      }
  
      // Call function to convert uploaded Excel file to PDF
      const pdfBuffer = await convertExcelToPdf(req.file.path, totalPrice, totalDDP);
  
      // Remove the uploaded Excel file after conversion
      fs.unlinkSync(req.file.path);
  
      // Set content type and send the PDF as attachment
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
      res.send(Buffer.from(pdfBuffer, 'binary'));
    } catch (error) {
      console.error('Error converting Excel to PDF:', error.message); // Log the error message
      res.status(500).send(`Error converting Excel to PDF: ${error.message}`);
    }
  });

// CRUD operations on JSON data
app.get('/data', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
        } else {
            try {
                const jsonData = JSON.parse(data);
                const limitedData = jsonData.Feuil1.slice(0, 100000000000); // Adjust to your data structure
                res.send(limitedData);
            } catch (error) {
                res.status(500).send('Error parsing JSON data');
            }
        }
    });
});

// Filter duplicates by Désignation commerciale (case insensitive)
app.get('/data/filterDuplicates', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error parsing JSON data');
        }

        const designationMap = new Map();

        jsonData.Feuil1.forEach(item => {
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
        designationMap.forEach(items => {
            if (items.length > 1) {
                duplicateItems.push(...items);
            }
        });

        res.send(duplicateItems);
    });
});

app.post('/data', (req, res) => {
    const newItem = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error parsing JSON data');
        }

        jsonData.Feuil1.push(newItem);

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            
            res.send('File updated successfully');
        });
    });
});

app.delete('/data', (req, res) => {
    fs.writeFile(filePath, JSON.stringify({ "Feuil1": [] }, null, 2), 'utf8', err => {
        if (err) {
            res.status(500).send('Error clearing file');
        } else {
            res.send('File cleared successfully');
        }
    });
});

app.get('/data/filter', (req, res) => {
    const { designationCommerciale } = req.query;

    if (!designationCommerciale) {
        return res.status(400).send('designationCommerciale query parameter is required');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error parsing JSON data');
        }

        const filteredData = jsonData.Feuil1.filter(item => 
            item["Désignation commerciale"] && item["Désignation commerciale"].toLowerCase().includes(designationCommerciale.toLowerCase())
        );

        res.send(filteredData);
    });
});


app.delete('/data/delete', (req, res) => {
    const { designationCommerciale, codeNGP } = req.body;

    if (!designationCommerciale || !codeNGP) {
        return res.status(400).send('Both designationCommerciale and codeNGP fields are required');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData = JSON.parse(data);
        const originalLength = jsonData.Feuil1.length;
        jsonData.Feuil1 = jsonData.Feuil1.filter(item => 
            !(item["Désignation commerciale"] === designationCommerciale && item["Code NGP(à 10 chiffres)"] === parseInt(codeNGP))
        );

        if (jsonData.Feuil1.length === originalLength) {
            return res.status(404).send('No matching entry found');
        }

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
            if (err) {
                return res.status(500).send('Error writing file');
            }

            res.send('Entry deleted successfully');
        });
    });
});

app.put('/data/update', (req, res) => {
    const { designationCommerciale, codeNGP, updatedData } = req.body;

    if (!designationCommerciale || !codeNGP || !updatedData) {
        return res.status(400).send('Both designationCommerciale, codeNGP and updatedData fields are required');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        let jsonData = JSON.parse(data);
        let entryFound = false;

        jsonData.Feuil1 = jsonData.Feuil1.map(item => {
            if (item["Désignation commerciale"] === designationCommerciale && item["Code NGP(à 10 chiffres)"] === parseInt(codeNGP)) {
                entryFound = true;
                return updatedData;
            }
            return item;
        });

        if (!entryFound) {
            return res.status(404).send('No matching entry found to update');
        }

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
            if (err) {
                return res.status(500).send('Error writing file');
            }

            res.send('Entry updated successfully');
        });
    });
});
app.post('/uploadJsonData', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file was uploaded.');
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
                    "Code NGP(à 10 chiffres)": parseInt(codeNGP)
                    
                });
            }
        });

        // Read the existing JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        jsonData.Feuil1.push(...newRows);

        // Write the updated JSON data back to the file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

        // Remove the uploaded Excel file
        fs.unlinkSync(req.file.path);

        res.send('Excel data successfully added to JSON file');
    } catch (error) {
        console.error('Error processing Excel file:', error.message); // Log the error message
        res.status(500).send(`Error processing Excel file: ${error.message}`);
    }
});
// LTA PARTAGE scan endpoint
app.post('/lta/scan', (req, res) => {
    const { partagePath, refs } = req.body;
    if (!partagePath || !refs || !Array.isArray(refs)) {
        return res.status(400).json({ error: 'partagePath and refs[] are required' });
    }

    const results = [];

    for (const ref of refs) {
        const trimmedRef = ref.trim();
        if (!trimmedRef) continue;

        // Search for folder matching "MAWB {ref}" (case-insensitive, ignoring spaces)
        let folderPath = null;
        try {
            const entries = fs.readdirSync(partagePath, { withFileTypes: true });
            const targetKey = `mawb${trimmedRef.toLowerCase().replace(/\s+/g, '')}`;
            const match = entries.find(
                e => e.isDirectory() && e.name.toLowerCase().replace(/\s+/g, '') === targetKey
            );
            if (match) folderPath = path.join(partagePath, match.name);
        } catch (e) {
            results.push({ ref: trimmedRef, found: false, error: 'Cannot read PARTAGE folder: ' + e.message });
            continue;
        }

        if (!folderPath) {
            results.push({ ref: trimmedRef, found: false });
            continue;
        }

        try {
            const files = fs.readdirSync(folderPath);
            const xlsxFile = files.find(f => /\.(xlsx|xls)$/i.test(f));
            const pdfFile = files.find(f => /\.pdf$/i.test(f));

            const manifestB64 = xlsxFile
                ? fs.readFileSync(path.join(folderPath, xlsxFile)).toString('base64')
                : null;
            const pdfB64 = pdfFile
                ? fs.readFileSync(path.join(folderPath, pdfFile)).toString('base64')
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
            results.push({ ref: trimmedRef, found: true, error: 'Error reading folder files: ' + e.message });
        }
    }

    res.json({ results });
});

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});
