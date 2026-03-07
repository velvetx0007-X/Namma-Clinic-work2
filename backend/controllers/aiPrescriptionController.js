const mlService = require("../services/mlService");
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.uploadAndProcess = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { patientId, doctorId } = req.body;
        const filePath = req.file.path;
        const fileMimeType = req.file.mimetype;

        // 1. Process with AI (Gemini)
        const extractedData = await mlService.processPrescription(filePath, fileMimeType);

        // 2. Fetch Patient and Doctor details for PDF
        const patient = await Patient.findById(patientId);
        const doctor = await Clinic.findById(doctorId);

        if (!patient || !doctor) {
            return res.status(404).json({ success: false, message: 'Patient or Doctor not found' });
        }

        // 3. Generate Digital PDF using helper function
        const pdfPath = await generatePrescriptionPDF(
            patient,
            doctor,
            extractedData.medications,
            {
                complaints: extractedData.complaints,
                vitals: extractedData.vitals,
                diagnosis: extractedData.diagnosis,
                advice: extractedData.advice,
                investigations: extractedData.investigations,
                followUp: extractedData.followUp
            },
            true // isAIProcessed
        );

        // 4. Save to DB
        const prescription = new Prescription({
            patientId,
            doctorId,
            medications: extractedData.medications,
            isAIProcessed: true,
            originalFile: filePath,
            digitalPrescriptionPdf: pdfPath,
            aiExtractedData: {
                complaints: extractedData.complaints,
                reason: extractedData.reason || extractedData.complaints,
                time: extractedData.time || new Date().toLocaleTimeString(),
                vitals: extractedData.vitals,
                diagnosis: extractedData.diagnosis,
                advice: extractedData.advice,
                investigations: extractedData.investigations,
                followUp: extractedData.followUp
            }
        });

        await prescription.save();

        res.status(201).json({
            success: true,
            message: 'Prescription processed successfully',
            data: prescription
        });

    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to generate prescription PDF (reusable for both AI and manual prescriptions)
const generatePrescriptionPDF = async (patient, doctor, medications, aiExtractedData = null, isAIProcessed = false) => {
    const pdfFileName = `prescription_${Date.now()}.pdf`;
    const pdfPath = path.join('uploads', pdfFileName);
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text(doctor.clinicName || 'Clinic Name', { align: 'center' });
    doc.fontSize(12).text(`Dr. ${doctor.userName || 'Doctor Name'}`, { align: 'center' });
    if (doctor.nmrNumber) doc.text(`NMR: ${doctor.nmrNumber}`, { align: 'center' });
    if (doctor.address) doc.fontSize(9).text(doctor.address, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Date & Time
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    if (aiExtractedData && aiExtractedData.time) {
        doc.text(`Time: ${aiExtractedData.time}`, { align: 'right' });
    }
    doc.moveDown();

    // Patient Info
    doc.fontSize(14).text('Patient Information', { underline: true });
    doc.fontSize(10).text(`Name: ${patient.name}`);
    doc.text(`Email: ${patient.email}`);
    doc.text(`Phone: ${patient.phoneNumber || 'N/A'}`);
    if (patient.age) doc.text(`Age: ${patient.age}`);
    if (patient.bloodGroup) doc.text(`Blood Group: ${patient.bloodGroup}`);
    doc.text(`Address: ${patient.area || 'N/A'}`);
    doc.moveDown();

    // AI Extracted Details (if available)
    if (aiExtractedData) {
        const sections = [
            { label: 'Reason for Visit', value: aiExtractedData.complaints || aiExtractedData.reason },
            { label: 'Vitals', value: aiExtractedData.vitals },
            { label: 'Diagnosis', value: aiExtractedData.diagnosis },
            { label: 'Advice', value: aiExtractedData.advice },
            { label: 'Investigations', value: aiExtractedData.investigations },
            { label: 'Follow Up', value: aiExtractedData.followUp }
        ];

        sections.forEach(s => {
            if (s.value && s.value !== 'Not provided') {
                doc.fontSize(12).text(s.label, { underline: true });
                doc.fontSize(10).text(s.value);
                doc.moveDown(0.5);
            }
        });
    }

    // Medications
    doc.fontSize(14).text('Prescribed Medications', { underline: true });
    doc.moveDown(0.5);

    if (medications && medications.length > 0) {
        medications.forEach((m, i) => {
            doc.fontSize(11).fillColor('black').text(`${i + 1}. ${m.drugName}`, { continued: false });
            doc.fontSize(10).text(`   Dosage: ${m.dosage}`);
            doc.text(`   Frequency: ${m.frequency}`);
            doc.text(`   Duration: ${m.duration}`);
            if (m.instructions && m.instructions !== 'Not provided') {
                doc.fontSize(9).fillColor('#555').text(`   Instructions: ${m.instructions}`, { oblique: true });
            }
            doc.fillColor('black');
            doc.moveDown(0.5);
        });
    } else {
        doc.fontSize(10).text('No medications prescribed');
    }

    doc.moveDown();

    // Doctor Signature Section
    doc.moveDown(2);
    doc.fontSize(10).text('_________________________', { align: 'right' });
    doc.text(`Dr. ${doctor.userName}`, { align: 'right' });
    if (doctor.nmrNumber) doc.fontSize(8).text(`NMR: ${doctor.nmrNumber}`, { align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    const disclaimer = isAIProcessed
        ? 'DISCLAIMER: This is an AI-generated digital version of your uploaded prescription. Please verify the details with the original document or your healthcare provider before use.'
        : 'This prescription is digitally generated. For any queries, please contact your healthcare provider.';

    doc.fontSize(8).fillColor('gray').text(disclaimer, { align: 'center' });

    doc.end();

    // Wait for stream to finish
    await new Promise((resolve) => stream.on('finish', resolve));

    return pdfPath;
};

// Export function for manual prescription PDF generation
exports.generateManualPrescriptionPDF = async (req, res) => {
    try {
        const { patientId, doctorId, medications } = req.body;

        if (!patientId || !doctorId || !medications || medications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, Doctor ID, and at least one medication are required'
            });
        }

        // Fetch Patient and Doctor details
        const patient = await Patient.findById(patientId);
        const doctor = await Clinic.findById(doctorId);

        if (!patient || !doctor) {
            return res.status(404).json({ success: false, message: 'Patient or Doctor not found' });
        }

        // Generate PDF
        const pdfPath = await generatePrescriptionPDF(patient, doctor, medications, null, false);

        res.status(200).json({
            success: true,
            message: 'Prescription PDF generated successfully',
            data: { pdfPath }
        });

    } catch (error) {
        console.error('Manual PDF Generation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export the helper function for use in other controllers
exports.generatePrescriptionPDFHelper = generatePrescriptionPDF;
