import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addTask,
  updateTask,
  deleteTask,
  addContact,
  updateContact,
  deleteContact,
  addNote,
  deleteNote,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// Main Job Application CRUD routes
router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

// Nested Tasks Routes
router.route('/:id/tasks')
  .post(addTask);

router.route('/:id/tasks/:taskId')
  .put(updateTask)
  .delete(deleteTask);

// Nested Contacts Routes
router.route('/:id/contacts')
  .post(addContact);

router.route('/:id/contacts/:contactId')
  .put(updateContact)
  .delete(deleteContact);

// Nested Notes Routes
router.route('/:id/notes')
  .post(addNote);

router.route('/:id/notes/:noteId')
  .delete(deleteNote);

export default router;
