const express = require('express');
const PR = require('../models/PR');
const Project = require('../models/Project');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Submit PR
router.post('/submit', auth, authorize('Employee'), async (req, res) => {
  try {
    const pr = new PR({
      ...req.body,
      title: req.body.title || req.body.taskName,
      startDate: Date.now(),
      employee: req.user._id,
      status: 'Pending'
    });
    await pr.save();
    res.status(201).send(pr);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get PRs submitted by the user
router.get('/my-prs', auth, async (req, res) => {
  try {
    const prs = await PR.find({ employee: req.user._id }).populate('employee peerReviewer leadDeveloper project findings.reviewer');
    res.send(prs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get PRs assigned to the user for review
router.get('/assigned-prs', auth, async (req, res) => {
  try {
    console.log('Fetching assigned PRs for user:', req.user._id, 'Role:', req.user.role);
    let query = { 
      $or: [{ peerReviewer: req.user._id }, { leadDeveloper: req.user._id }],
      status: { $nin: ['Approved', 'Merged', 'Rejected'] }
    };
    const prs = await PR.find(query).populate('employee peerReviewer leadDeveloper project findings.reviewer');
    console.log('Found PRs:', prs.length);
    res.send(prs);
  } catch (error) {
    console.error('Error fetching assigned PRs:', error);
    res.status(500).send(error);
  }
});

// Get completed reviews for the user
router.get('/assigned-history', auth, async (req, res) => {
  try {
    let query = { 
      $or: [{ peerReviewer: req.user._id }, { leadDeveloper: req.user._id }],
      status: { $in: ['Approved', 'Merged', 'Rejected'] }
    };
    const prs = await PR.find(query).populate('employee peerReviewer leadDeveloper project findings.reviewer').sort({ 'timestamps.created': -1 });
    res.send(prs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Add findings / Review
router.post('/review/:id', auth, authorize(['Employee', 'Lead Developer']), async (req, res) => {
  try {
    const { findings, status } = req.body;
    const pr = await PR.findById(req.params.id);

    if (!pr) return res.status(404).send();

    // Workflow logic: If Employee (as Peer Reviewer) approves, it goes to Lead Reviewing
    // If Lead approves, it becomes Approved
    if (findings && findings.length > 0) {
      findings.forEach(f => pr.findings.push({ ...f, reviewer: req.user._id }));
    }

    if (status === 'Needs Fix') {
      pr.status = 'Needs Fix';
      pr.rejectionCount += 1;
    } else if (status === 'Approved') {
      if (req.user.role === 'Employee') {
        pr.timestamps.peerReviewed = Date.now();
        if (pr.timestamps.leadReviewed) {
          pr.status = 'Approved';
          pr.endDate = Date.now();
        } else {
          pr.status = 'Peer Approved';
        }
      } else if (req.user.role === 'Lead Developer') {
        pr.timestamps.leadReviewed = Date.now();
        if (pr.timestamps.peerReviewed) {
          pr.status = 'Approved';
          pr.endDate = Date.now();
        } else {
          pr.status = 'Lead Approved';
        }
      }
    }

    await pr.save();
    res.send(pr);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update PR (after fixes)
router.patch('/update/:id', auth, authorize('Employee'), async (req, res) => {
  try {
    const pr = await PR.findOne({ _id: req.params.id, employee: req.user._id });
    if (!pr) return res.status(404).send();

    pr.status = 'Pending'; // Resubmit
    // Mark all existing findings as Fixed on resubmit
    pr.findings.forEach(f => {
      if (f.status === 'Open') f.status = 'Fixed';
    });
    await pr.save();
    res.send(pr);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
