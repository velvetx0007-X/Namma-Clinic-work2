const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');

// Create bill
router.post('/', async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            items,
            consultationFee,
            labCharges,
            totalAmount,
            paymentMethod,
            paidAmount,
            insuranceClaim
        } = req.body;

        const billing = new Billing({
            patientId,
            appointmentId,
            createdBy: req.user?.id,
            items,
            consultationFee,
            labCharges,
            totalAmount,
            paymentMethod,
            paidAmount: paidAmount || 0,
            paymentStatus: paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
            insuranceClaim
        });

        await billing.save();

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: billing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient bills
router.get('/patient/:patientId', async (req, res) => {
    try {
        const bills = await Billing.find({ patientId: req.params.patientId })
            .populate('createdBy', 'userName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Record payment
router.put('/:id/payment', async (req, res) => {
    try {
        const { paidAmount, paymentMethod } = req.body;

        const billing = await Billing.findById(req.params.id);
        if (!billing) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        billing.paidAmount += paidAmount;
        billing.paymentMethod = paymentMethod;

        if (billing.paidAmount >= billing.totalAmount) {
            billing.paymentStatus = 'paid';
        } else if (billing.paidAmount > 0) {
            billing.paymentStatus = 'partial';
        }

        await billing.save();

        res.json({ success: true, message: 'Payment recorded', data: billing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get daily revenue report
router.get('/reports/daily', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bills = await Billing.find({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const totalRevenue = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);
        const pendingAmount = bills.reduce((sum, bill) => {
            return sum + (bill.totalAmount - bill.paidAmount);
        }, 0);

        res.json({
            success: true,
            data: {
                totalBills: bills.length,
                totalRevenue,
                pendingAmount,
                bills
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get comprehensive revenue report (Daily, Weekly, Monthly, Yearly)
router.get('/reports/analytics', async (req, res) => {
    try {
        const { doctorId } = req.query; // If doctorId is provided, filter by doctor
        const filter = {};
        if (doctorId) filter.createdBy = doctorId;

        const now = new Date();
        
        // Helper for date ranges
        const getStartOfDay = (d) => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date;
        };

        // Daily (Last 7 days)
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const dailyBills = await Billing.find({
            ...filter,
            createdAt: { $gte: getStartOfDay(sevenDaysAgo) }
        }).sort({ createdAt: 1 });

        // Weekly (Last 4 weeks)
        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(now.getDate() - 28);
        const weeklyBills = await Billing.find({
            ...filter,
            createdAt: { $gte: getStartOfDay(fourWeeksAgo) }
        }).sort({ createdAt: 1 });

        // Monthly (Last 6 months)
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const monthlyBills = await Billing.find({
            ...filter,
            createdAt: { $gte: getStartOfDay(sixMonthsAgo) }
        }).sort({ createdAt: 1 });

        // Yearly (Last 5 years)
        const fiveYearsAgo = new Date(now);
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        const yearlyBills = await Billing.find({
            ...filter,
            createdAt: { $gte: getStartOfDay(fiveYearsAgo) }
        }).sort({ createdAt: 1 });

        // Aggregate functions
        const aggregateByDay = (bills) => {
            const map = {};
            bills.forEach(b => {
                const day = b.createdAt.toISOString().split('T')[0];
                map[day] = (map[day] || 0) + b.paidAmount;
            });
            return Object.entries(map).map(([name, value]) => ({ name, value }));
        };

        const aggregateByMonth = (bills) => {
            const map = {};
            bills.forEach(b => {
                const month = b.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
                map[month] = (map[month] || 0) + b.paidAmount;
            });
            return Object.entries(map).map(([name, value]) => ({ name, value }));
        };

        res.json({
            success: true,
            data: {
                daily: aggregateByDay(dailyBills),
                weekly: aggregateByDay(weeklyBills), // Simplification: still show by day for last 4 weeks
                monthly: aggregateByMonth(monthlyBills),
                yearly: aggregateByMonth(yearlyBills) // Simplification: still show by month for last 5 years
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
