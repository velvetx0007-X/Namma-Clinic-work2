const mlService = require("../services/mlService");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const LabTest = require("../models/LabTest");
const Patient = require("../models/Patient");
const Clinic = require("../models/Clinic");

exports.uploadAndProcessLabTest = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { patientId, orderedBy } = req.body;
        const filePath = req.file.path;
        const fileMimeType = req.file.mimetype;

        // 1. Extract Data Using Gemini AI (via Service)
        const extractedData = await mlService.processLabTest(filePath, fileMimeType);

        // 2. Fetch Patient and Clinic Details for PDF
        const patient = await Patient.findById(patientId);
        const doctor = await Clinic.findById(orderedBy);

        if (!patient || !doctor) {
            return res.status(404).json({ success: false, message: 'Patient or Doctor not found' });
        }

        // 3. Generate Digital PDF
        const pdfFileName = `digital_lab_${Date.now()}.pdf`;
        const pdfPath = path.join('uploads', pdfFileName);
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(pdfPath);

        doc.pipe(writeStream);

        // Header
        doc.fontSize(20).text(doctor.clinicName || 'Clinic Name', { align: 'center' });
        doc.fontSize(12).text(`Dr. ${doctor.userName || 'Doctor Name'}`, { align: 'center' });
        doc.fontSize(10).text(doctor.area || '', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text('LABORATORY REPORT', { align: 'center' });
        doc.moveDown();

        // Patient Info
        doc.fontSize(12).font('Helvetica-Bold').text('Patient Information:');
        doc.font('Helvetica').fontSize(10);
        doc.text(`Name: ${patient.name}`);
        doc.text(`Email: ${patient.email}`);
        doc.text(`Test Date: ${extractedData.date || new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Lab Test Details
        doc.fontSize(12).font('Helvetica-Bold').text(`Test: ${extractedData.testName || 'Lab Test'}`);
        doc.moveDown();

        // Results Table Header
        const tableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Parameter', 50, tableTop);
        doc.text('Value', 250, tableTop);
        doc.text('Unit', 350, tableTop);
        doc.text('Reference Range', 450, tableTop);
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Results Table Body
        doc.font('Helvetica');
        extractedData.results.forEach(res => {
            const y = doc.y;
            doc.text(res.parameter || '', 50, y);
            doc.text(res.value || '', 250, y);
            doc.text(res.unit || '', 350, y);
            doc.text(res.referenceRange || '', 450, y);
            doc.moveDown(0.5);
            if (doc.y > 700) doc.addPage();
        });

        doc.moveDown();
        if (extractedData.conclusion) {
            doc.font('Helvetica-Bold').text('Conclusion/Impression:');
            doc.font('Helvetica').text(extractedData.conclusion);
            doc.moveDown();
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('gray').text('DISCLAIMER: This is an AI-generated digital report based on the uploaded lab document. Please consult with your physician for clinical correlation and diagnosis.', { align: 'center' });

        doc.end();

        // 4. Save to Database
        const labTest = new LabTest({
            patientId,
            orderedBy,
            testName: extractedData.testName || 'AI Processed Lab Test',
            testType: 'General',
            status: 'completed',
            results: extractedData.conclusion || 'See digital report',
            isAIProcessed: true,
            originalFile: filePath.replace(/\\/g, '/'),
            digitalLabTestPdf: `uploads/${pdfFileName}`,
            aiExtractedData: extractedData,
            completedAt: new Date()
        });

        await labTest.save();

        res.status(200).json({
            success: true,
            message: 'Lab test processed successfully',
            data: labTest
        });

    } catch (error) {
        console.error("Error in uploadAndProcessLabTest:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
