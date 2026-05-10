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

        const { patientId, doctorId, vitals, symptoms, diagnosis, clinicalNotes } = req.body;
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

        // Parse vitals if it's a string
        const parsedVitals = typeof vitals === 'string' ? JSON.parse(vitals) : vitals;

        // 3. Generate Digital PDF
        const pdfPath = await generatePrescriptionPDF(
            patient,
            doctor,
            extractedData.medications,
            {
                complaints: symptoms || extractedData.complaints,
                vitals: parsedVitals,
                diagnosis: diagnosis || extractedData.diagnosis,
                advice: extractedData.advice,
                investigations: extractedData.investigations,
                followUp: extractedData.followUp,
                clinicalNotes: clinicalNotes
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
            vitals: parsedVitals,
            symptoms,
            diagnosis: diagnosis || extractedData.diagnosis,
            clinicalNotes,
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

// Create Manual Prescription
exports.createManual = async (req, res) => {
    try {
        const { patientId, doctorId, medications, vitals, symptoms, diagnosis, clinicalNotes } = req.body;

        if (!patientId || !doctorId || !medications || medications.length === 0) {
            return res.status(400).json({ success: false, message: 'Patient, Doctor and medications are required' });
        }

        const patient = await Patient.findById(patientId);
        const doctor = await Clinic.findById(doctorId);

        if (!patient || !doctor) {
            return res.status(404).json({ success: false, message: 'Patient or Doctor not found' });
        }

        // Generate PDF
        const pdfPath = await generatePrescriptionPDF(
            patient,
            doctor,
            medications,
            {
                complaints: symptoms,
                vitals: vitals,
                diagnosis: diagnosis,
                clinicalNotes: clinicalNotes
            },
            false // isAIProcessed
        );

        const prescription = new Prescription({
            patientId,
            doctorId,
            medications,
            vitals,
            symptoms,
            diagnosis,
            clinicalNotes,
            isAIProcessed: false,
            digitalPrescriptionPdf: pdfPath
        });

        await prescription.save();

        res.status(201).json({
            success: true,
            message: 'Manual prescription created successfully',
            data: prescription
        });
    } catch (error) {
        console.error('Manual Creation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const generatePrescriptionPDF = async (patient, doctor, medications, details = {}, isAIProcessed = false) => {
    const pdfFileName = `prescription_${Date.now()}.pdf`;
    const pdfPath = path.join('uploads', pdfFileName);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Color Palette
    const primaryColor = '#0056b3';
    const secondaryColor = '#444';
    const accentColor = '#6c757d';

    // Header - Clinic Branding
    doc.fillColor(primaryColor).fontSize(24).text(doctor.clinicName || 'Namma Clinic', { align: 'center', bold: true });
    doc.fillColor(secondaryColor).fontSize(12).text(`Providing Quality Healthcare Services`, { align: 'center' });
    doc.fontSize(10).text(doctor.address || 'Chennai, Tamil Nadu, India', { align: 'center' });
    doc.moveDown();
    
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown();

    // Doctor & Patient Layout (2 Columns)
    const topY = doc.y;
    doc.fillColor(primaryColor).fontSize(12).text('DOCTOR DETAILS', 40, topY, { underline: true });
    doc.fillColor('black').fontSize(10).text(`Dr. ${doctor.userName}`, 40, topY + 20);
    doc.text(`NMR No: ${doctor.nmrNumber || 'N/A'}`, 40, topY + 35);
    doc.text(`Contact: ${doctor.phoneNumber || 'N/A'}`, 40, topY + 50);

    doc.fillColor(primaryColor).fontSize(12).text('PATIENT DETAILS', 300, topY, { underline: true });
    doc.fillColor('black').fontSize(10).text(`Name: ${patient.name}`, 300, topY + 20);
    doc.text(`UHID: ${patient.uhid || patient._id.toString().slice(-6).toUpperCase()}`, 300, topY + 35);
    doc.text(`Age/Gender: ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}`, 300, topY + 50);
    doc.text(`Phone: ${patient.phoneNumber || 'N/A'}`, 300, topY + 65);

    doc.moveDown(5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown();

    // Vitals Section
    if (details.vitals) {
        doc.fillColor(primaryColor).fontSize(14).text('CLINICAL VITALS', { bold: true });
        doc.moveDown(0.5);
        
        const v = details.vitals;
        const vitalsText = [
            `BP: ${v.bloodPressure || '-'} mmHg`,
            `Sugar: ${v.sugarLevel || '-'} mg/dL`,
            `Weight: ${v.weight || '-'} kg`,
            `Pulse: ${v.pulse || '-'} bpm`,
            `Temp: ${v.temperature || '-'} °F`
        ].join('  |  ');
        
        doc.fillColor('black').fontSize(10).rect(40, doc.y, 515, 25).fill('#f8f9fa');
        doc.fillColor(primaryColor).text(vitalsText, 50, doc.y - 18, { align: 'center' });
        doc.moveDown(2);
    }

    // Diagnosis & Symptoms
    if (details.complaints || details.diagnosis) {
        const dY = doc.y;
        if (details.complaints) {
            doc.fillColor(primaryColor).fontSize(12).text('Symptoms:', 40, dY, { bold: true });
            doc.fillColor('black').fontSize(10).text(details.complaints, 120, dY);
        }
        if (details.diagnosis) {
            const diagY = details.complaints ? dY + 15 : dY;
            doc.fillColor(primaryColor).fontSize(12).text('Diagnosis:', 40, diagY, { bold: true });
            doc.fillColor('black').fontSize(10).text(details.diagnosis, 120, diagY);
        }
        doc.moveDown(2);
    }

    // Medications (The Core)
    doc.fillColor(primaryColor).fontSize(16).text('Rx (Prescription)', { bold: true });
    doc.moveDown();

    if (medications && medications.length > 0) {
        medications.forEach((m, i) => {
            doc.fillColor('black').fontSize(11).text(`${i + 1}. ${m.drugName}`, { continued: false, bold: true });
            doc.fontSize(10).text(`   Dosage: ${m.dosage}  |  Frequency: ${m.frequency}  |  Duration: ${m.duration}`);
            if (m.instructions && m.instructions !== 'Not provided') {
                doc.fontSize(9).fillColor(accentColor).text(`   Notes: ${m.instructions}`, { oblique: true });
            }
            doc.moveDown(0.5);
        });
    } else {
        doc.fontSize(10).text('No medications prescribed.');
    }

    // Notes
    if (details.clinicalNotes) {
        doc.moveDown();
        doc.fillColor(primaryColor).fontSize(12).text('Clinical Notes:', { bold: true });
        doc.fillColor('black').fontSize(10).text(details.clinicalNotes);
    }

    // Signature
    doc.moveDown(3);
    const sigY = doc.y;
    doc.moveTo(400, sigY).lineTo(550, sigY).strokeColor('#333').stroke();
    doc.fontSize(10).text(`Dr. ${doctor.userName}`, 400, sigY + 5, { align: 'center' });
    doc.fontSize(8).text(`(Digital Signature)`, 400, sigY + 18, { align: 'center' });

    // Footer
    const footerY = 780;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#eee').stroke();
    const disclaimer = isAIProcessed
        ? 'AI-Generated Transcript. Please verify with physical copy or doctor.'
        : 'Generated digitally by Namma Clinic Management System.';
    doc.fontSize(8).fillColor(accentColor).text(disclaimer, 40, footerY + 10, { align: 'center' });
    doc.text(`Prescription ID: ${Date.now()}`, 40, footerY + 20, { align: 'center' });

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return pdfPath;
};

exports.generatePrescriptionPDFHelper = generatePrescriptionPDF;
