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
