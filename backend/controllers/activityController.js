const StepTracking = require('../models/StepTracking');
const WaterIntake = require('../models/WaterIntake');
const WellnessTask = require('../models/WellnessTask');

// Save or Update Step Tracking
exports.updateSteps = async (req, res) => {
    try {
        const { steps, distance, calories, fatLoss, duration, date } = req.body;
        const patientId = req.user.id;

        const activity = await StepTracking.findOneAndUpdate(
            { patientId, date },
            { 
                $set: { steps, distance, calories, fatLoss, duration }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Daily Activity
exports.getDailyActivity = async (req, res) => {
    try {
        const { date } = req.query;
        const patientId = req.user.id;

        const activity = await StepTracking.findOne({ patientId, date });
        const water = await WaterIntake.findOne({ patientId, date });
        const tasks = await WellnessTask.findOne({ patientId, date });

        res.status(200).json({ 
            success: true, 
            data: {
                activity: activity || { steps: 0, distance: 0, calories: 0, fatLoss: 0, duration: 0 },
                water: water || { amount: 0, goal: 2.5 },
                tasks: tasks ? tasks.tasks : []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Water Intake
exports.updateWater = async (req, res) => {
    try {
        const { amount, date } = req.body;
        const patientId = req.user.id;

        const water = await WaterIntake.findOneAndUpdate(
            { patientId, date },
            { $inc: { amount: amount } },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: water });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Wellness Task
exports.updateTask = async (req, res) => {
    try {
        const { taskId, status, progress, date, title, type } = req.body;
        const patientId = req.user.id;

        let wellness = await WellnessTask.findOne({ patientId, date });

        if (!wellness) {
            wellness = new WellnessTask({ patientId, date, tasks: [] });
        }

        const taskIndex = wellness.tasks.findIndex(t => t.id === taskId || (t.title === title && t.type === type));

        if (taskIndex > -1) {
            if (status) wellness.tasks[taskIndex].status = status;
            if (progress !== undefined) wellness.tasks[taskIndex].progress = progress;
            if (status === 'in-progress') wellness.tasks[taskIndex].startTime = new Date();
            if (status === 'completed') wellness.tasks[taskIndex].endTime = new Date();
        } else {
            wellness.tasks.push({ title, type, status: status || 'pending', progress: progress || 0 });
        }

        await wellness.save();
        res.status(200).json({ success: true, data: wellness.tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
