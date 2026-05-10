const ChildCare = require('../models/ChildCare');

// Add Child Profile
exports.addChild = async (req, res) => {
    try {
        const { childName, childDob, gender, bloodGroup } = req.body;
        const parentId = req.user.id;

        const child = new ChildCare({
            parentId,
            childName,
            childDob,
            gender,
            bloodGroup,
            growthRecords: [],
            vaccinations: []
        });

        await child.save();
        res.status(201).json({ success: true, data: child });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Growth Record
exports.addGrowthRecord = async (req, res) => {
    try {
        const { childId, height, weight, milestone, notes } = req.body;
        const parentId = req.user.id;

        const child = await ChildCare.findOne({ _id: childId, parentId });
        if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

        child.growthRecords.push({ height, weight, milestone, notes });
        await child.save();

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Parent's Children
exports.getChildren = async (req, res) => {
    try {
        const parentId = req.user.id;
        const children = await ChildCare.find({ parentId });
        res.status(200).json({ success: true, data: children });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Smart Search for Child Care (simplified logic, can be enhanced with AI)
exports.smartSearch = async (req, res) => {
    try {
        const { query } = req.query;
        // In a real production app, this would call a search service or AI
        // For now, we return structured advice based on keywords
        
        let results = [];
        if (query.includes('food') || query.includes('nutrition')) {
            results.push({ topic: 'Nutrition', advice: 'Focus on balanced meals with proteins, fruits, and vegetables.' });
        }
        if (query.includes('sleep')) {
            results.push({ topic: 'Sleep', advice: 'Children aged 1-3 need 11-14 hours of sleep including naps.' });
        }
        
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
