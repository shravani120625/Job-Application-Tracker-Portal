import mongoose from 'mongoose';

// Sub-schema for Tasks / Reminders
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  dueAt: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  done: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Sub-schema for Contacts
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  title: {
    type: String, // e.g. HR Recruiter, Engineering Manager, Referrer
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Sub-schema for Notes
const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content cannot be empty'],
    trim: true,
  },
}, { timestamps: true });

// Main Job Application Schema
const JobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    roleTitle: {
      type: String,
      required: [true, 'Job title/role is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    source: {
      type: String, // e.g. LinkedIn, Company Website, Referral, Indeed
      trim: true,
      default: 'Direct',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    salaryNote: {
      type: String,
      trim: true,
      default: '',
    },
    stage: {
      type: String,
      enum: ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'],
      default: 'Saved',
    },
    statusNote: {
      type: String,
      trim: true,
      default: '',
    },
    jdText: {
      type: String, // Raw Job Description text for parsing
      default: '',
    },
    skillsMatched: {
      type: [String],
      default: [],
    },
    skillsMissing: {
      type: [String],
      default: [],
    },
    // Sub-document arrays
    tasks: [TaskSchema],
    contacts: [ContactSchema],
    notes: [NoteSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to search quickly by user and stage/company
JobApplicationSchema.index({ user: 1, stage: 1 });
JobApplicationSchema.index({ user: 1, company: 1 });

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
export default JobApplication;
