const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const PR = require('../models/PR');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all users (accessible by all roles for selection in forms)
router.get('/users', auth, authorize(['Admin', 'Employee', 'Lead Developer']), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create user
router.post('/users', auth, authorize('Admin'), async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update user
router.patch('/users/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user
router.delete('/users/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Project CRUD
router.get('/projects', auth, authorize(['Admin', 'Employee', 'Lead Developer']), async (req, res) => {
  try {
    const projects = await Project.find({}).populate('employees leadDevelopers');
    res.send(projects);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/projects', auth, authorize('Admin'), async (req, res) => {
  try {
    const project = new Project({ ...req.body, admin: req.user._id });
    await project.save();
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all PRs for management
router.get('/prs', auth, authorize('Admin'), async (req, res) => {
  try {
    const { status, search, startDate, endDate, projectId, employeeId, sortBy, order = 'desc' } = req.query;
    let query = {};

    if (status) query.status = status;
    if (projectId) query.project = projectId;
    if (employeeId) query.employee = employeeId;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const { subStart, subEnd } = req.query;
    if (subStart || subEnd) {
      query.timestamps = {};
      if (subStart) query['timestamps.created'] = { $gte: new Date(subStart) };
      if (subEnd) query['timestamps.created'] = { ...query['timestamps.created'], $lte: new Date(subEnd) };
    }

    let prs = await PR.find(query)
      .populate('employee project peerReviewer leadDeveloper findings.reviewer')
      .sort({ [sortBy || 'timestamps.created']: order === 'desc' ? -1 : 1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      prs = prs.filter(pr => 
        searchRegex.test(pr.employee?.name) || 
        searchRegex.test(pr.project?.name) ||
        searchRegex.test(pr.title) ||
        searchRegex.test(pr.taskName)
      );
    }

    res.send(prs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Admin direct PR action
router.patch('/prs/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const pr = await PR.findById(req.params.id);
    if (!pr) return res.status(404).send();

    pr.status = status;
    if (status === 'Approved') {
      pr.timestamps.peerReviewed = Date.now();
      pr.timestamps.leadReviewed = Date.now();
    }
    
    await pr.save();
    res.send(pr);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Admin Analytics
router.get('/analytics', auth, authorize('Admin'), async (req, res) => {
  try {
    const prs = await PR.find({}).populate('employee peerReviewer leadDeveloper');
    
    // Status breakdown
    const statusBreakdown = {
      Approved: prs.filter(p => p.status === 'Approved').length,
      Rejected: prs.filter(p => p.status === 'Rejected').length,
      Pending: prs.filter(p => ['Pending', 'Peer Reviewing', 'Lead Reviewing'].includes(p.status)).length
    };

    // Severity breakdown
    const severityCount = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    prs.forEach(pr => {
      pr.findings.forEach(f => {
        if (severityCount[f.severity] !== undefined) severityCount[f.severity]++;
      });
    });

    res.send({ statusBreakdown, severityCount, totalPRs: prs.length });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
