const mongoose = require("mongoose");

const prSchema = new mongoose.Schema({
  title: { type: String },
  prLink: { type: String, required: true },
  moduleName: { type: String, required: true },
  taskName: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  peerReviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  leadDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: [
      "Pending",
      "Peer Reviewing",
      "Needs Fix",
      "Peer Approved",
      "Lead Approved",
      "Lead Reviewing",
      "Approved",
      "Rejected",
      "Merged",
    ],
    default: "Pending",
  },
  findings: [
    {
      description: { type: String },
      severity: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Open", "Fixed"], default: "Open" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  rejectionCount: { type: Number, default: 0 },
  timestamps: {
    created: { type: Date, default: Date.now },
    peerReviewed: { type: Date },
    leadReviewed: { type: Date },
    merged: { type: Date },
  },
});

module.exports = mongoose.model("PR", prSchema);
