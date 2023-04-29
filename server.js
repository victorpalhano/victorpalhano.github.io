const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

const upload = multer({ dest: 'uploads/' });

app.post('/merge', upload.array('pdf-files', 10), async (req, res) => {
  const pdfFiles = req.files;
  const mergedPdf = await mergePdfs(pdfFiles);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(mergedPdf);
});

async function mergePdfs(files) {
  const pdfDoc = await PDFDocument.create();
  for (let file of files) {
    const pdfBytes = await fs.promises.readFile(file.path);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => pdfDoc.addPage(page));
  }
  const mergedPdf = await pdfDoc.save();
  return mergedPdf;
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
