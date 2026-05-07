const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/notificationService');
const aiService = require('../services/aiService');

// @desc    Suggest properties for a task
// @route   POST /api/tasks/suggest
// @access  Private (Staff only)
exports.suggestProperties = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description is required for AI suggestion' });
        }
        const suggestion = await aiService.suggestTaskProperties(description);
        res.status(200).json({ success: true, data: suggestion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Staff only)
exports.createTask = async (req, res) => {
    try {
        const { title, description, type, priority, assignedTo, dueDate } = req.body;
        const createdBy = req.user.id;

        // Verify assigned user is a patient
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.role !== 'patient') {
            return res.status(400).json({ success: false, message: 'Tasks can only be assigned to patients' });
        }

        // Generate AI Insight for patient
        const aiSuggestion = await aiService.getPatientInsight(title, description);

        const task = await Task.create({
            title,
            description,
            type,
            priority,
            createdBy,
            assignedTo,
            dueDate,
            aiSuggestion
        });

        // Send real-time notification
        await sendNotification(assignedTo, {
            title: `New Task: ${title}`,
            text: description,
            type: 'task',
            relatedId: task._id,
            onModel: 'Task'
        }, priority === 'High');

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get tasks for a patient
// @route   GET /api/tasks/patient/:patientId
// @access  Private
exports.getPatientTasks = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // RBAC: Patients can only view their own tasks
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to tasks' });
        }

        const tasks = await Task.find({ assignedTo: patientId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task status (acknowledge/complete)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // RBAC: Only assigned patient or creator can update
        if (task.assignedTo.toString() !== req.user.id && task.createdBy.toString() !== req.user.id && req.user.role === 'patient') {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this task' });
        }

        task.status = status;
        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Staff only)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // RBAC: Only staff can delete
        if (req.user.role === 'patient') {
            return res.status(403).json({ success: false, message: 'Patients cannot delete tasks' });
        }

        await task.deleteOne();
        res.status(200).json({ success: true, message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
