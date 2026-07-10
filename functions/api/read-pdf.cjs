// CJS script to extract text from PDF
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
const fs = require('fs');
const path = require('path');

const pdfPath = path.resolve(__dirname, '../../Police_FIR_ER_Diagram.pdf');
const buf = fs.readFileSync(pdfPath);

pdfParse(buf).then(data => {
    console.log('=== PDF PAGES:', data.numpages, '===');
    console.log(data.text);
}).catch(err => {
    // Try with default export
    const mod = require('pdf-parse');
    const fn = mod.default || mod;
    fn(buf).then(data => {
        console.log('=== PDF PAGES:', data.numpages, '===');
        console.log(data.text);
    }).catch(e => console.error('Error:', e.message));
});
