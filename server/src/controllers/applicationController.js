import JobApplication from '../models/JobApplication.js';
import { extractSkills } from '../utils/keywordExtractor.js';

// ==========================================
// 1. APPLICATION CRUD CONTROLLERS
// ==========================================

// @desc    Get all job applications for logged-in user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const { stage, search } = req.query;
    let query = { user: req.user._id };

    // Filter by stage if provided
    if (stage) {
      query.stage = stage;
    }

    // Search by company or roleTitle if provided
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await JobApplication.find(query).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error(`[Get Applications Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

// @desc    Get single job application details
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(`[Get Application By ID Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching application details' });
  }
};

// @desc    Create a new job application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res) => {
  try {
    const {
      company,
      roleTitle,
      location,
      source,
      url,
      salaryNote,
      stage,
      statusNote,
      jdText,
    } = req.body;

    if (!company || !roleTitle) {
      return res.status(400).json({ success: false, message: 'Company and Role Title are required' });
    }

    // Extract skills if job description is provided
    let skillsMatched = [];
    if (jdText) {
      skillsMatched = extractSkills(jdText);
    }

    const application = await JobApplication.create({
      user: req.user._id,
      company,
      roleTitle,
      location,
      source,
      url,
      salaryNote,
      stage,
      statusNote,
      jdText,
      skillsMatched,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(`[Create Application Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error creating application' });
  }
};

// @desc    Update a job application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res) => {
  try {
    let application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { jdText } = req.body;

    // Rerun keyword extraction if JD text changed
    if (jdText !== undefined && jdText !== application.jdText) {
      req.body.skillsMatched = extractSkills(jdText);
    }

    application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(`[Update Application Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};

// @desc    Delete a job application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error(`[Delete Application Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting application' });
  }
};

// ==========================================
// 2. NESTED SUB-RESOURCES (TASKS)
// ==========================================

// @desc    Add a task/reminder to an application
// @route   POST /api/applications/:id/tasks
// @access  Private
export const addTask = async (req, res) => {
  try {
    const { title, dueAt } = req.body;
    if (!title || !dueAt) {
      return res.status(400).json({ success: false, message: 'Task title and due date are required' });
    }

    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.tasks.push({ title, dueAt });
    await application.save();

    res.status(201).json({
      success: true,
      data: application.tasks[application.tasks.length - 1],
      application,
    });
  } catch (error) {
    console.error(`[Add Task Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error adding task' });
  }
};

// @desc    Update a task status or details
// @route   PUT /api/applications/:id/tasks/:taskId
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const task = application.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update fields if provided
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.dueAt !== undefined) task.dueAt = req.body.dueAt;
    if (req.body.done !== undefined) task.done = req.body.done;

    await application.save();

    res.status(200).json({
      success: true,
      data: task,
      application,
    });
  } catch (error) {
    console.error(`[Update Task Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/applications/:id/tasks/:taskId
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const task = application.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Remove using Mongoose document API
    task.deleteOne();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Task removed successfully',
      application,
    });
  } catch (error) {
    console.error(`[Delete Task Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

// ==========================================
// 3. NESTED SUB-RESOURCES (CONTACTS)
// ==========================================

// @desc    Add a contact to an application
// @route   POST /api/applications/:id/contacts
// @access  Private
export const addContact = async (req, res) => {
  try {
    const { name, email, phone, title, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Contact name is required' });
    }

    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.contacts.push({ name, email, phone, title, notes });
    await application.save();

    res.status(201).json({
      success: true,
      data: application.contacts[application.contacts.length - 1],
      application,
    });
  } catch (error) {
    console.error(`[Add Contact Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error adding contact' });
  }
};

// @desc    Update a contact's details
// @route   PUT /api/applications/:id/contacts/:contactId
// @access  Private
export const updateContact = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const contact = application.contacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (req.body.name !== undefined) contact.name = req.body.name;
    if (req.body.email !== undefined) contact.email = req.body.email;
    if (req.body.phone !== undefined) contact.phone = req.body.phone;
    if (req.body.title !== undefined) contact.title = req.body.title;
    if (req.body.notes !== undefined) contact.notes = req.body.notes;

    await application.save();

    res.status(200).json({
      success: true,
      data: contact,
      application,
    });
  } catch (error) {
    console.error(`[Update Contact Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating contact' });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/applications/:id/contacts/:contactId
// @access  Private
export const deleteContact = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const contact = application.contacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    contact.deleteOne();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Contact removed successfully',
      application,
    });
  } catch (error) {
    console.error(`[Delete Contact Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting contact' });
  }
};

// ==========================================
// 4. NESTED SUB-RESOURCES (NOTES)
// ==========================================

// @desc    Add a note to an application
// @route   POST /api/applications/:id/notes
// @access  Private
export const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty' });
    }

    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.notes.push({ content });
    await application.save();

    res.status(201).json({
      success: true,
      data: application.notes[application.notes.length - 1],
      application,
    });
  } catch (error) {
    console.error(`[Add Note Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error adding note' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/applications/:id/notes/:noteId
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const note = application.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.deleteOne();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Note removed successfully',
      application,
    });
  } catch (error) {
    console.error(`[Delete Note Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
};
