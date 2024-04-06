import {PDFDocument} from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist';
import path from 'path';
import fs from 'fs';

const trackingString = "TRACKING #";
const shipString = "SHIP";

const splitPDFIntoPages = async (inputPath, outputDir) => {
    try {
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }


        const data = new Uint8Array(fs.readFileSync(inputPath));
        const pdf = await pdfjsLib.getDocument(data).promise;

        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1) 

            const textContent = await page.getTextContent();

            const text = textContent.items.map(item => item.str).join('');

            const trackingIndex = text.indexOf(trackingString);

            if (trackingIndex === -1) {
                console.log("No tracking number found.");
                continue;
            }
        
            const trackingSubstring = text.substring(trackingIndex + trackingString.length, text.indexOf(shipString)).trim();

            const trackingNumber = trackingSubstring.replace(/\s/g, '');

            const outputFileName = `${trackingNumber}.pdf`;

            const outputPathPage = path.join(outputDir, outputFileName);

            const newPDF = await PDFDocument.create();

            const [copiedPage] = await newPDF.copyPages(pdfDoc, [i]);

            newPDF.addPage(copiedPage);

            const pdfBytes = await newPDF.save();

            fs.writeFileSync(outputPathPage, pdfBytes);
        }
    } catch (error) {
        console.error('Error splitting PDF into pages:', error);
    }
}

const inputPath = 'pdf-example.pdf'; 

const outputDir = 'output_folder';

splitPDFIntoPages(inputPath, outputDir);