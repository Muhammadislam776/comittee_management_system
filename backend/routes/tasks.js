const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks,
  addTaskComment,
  addTaskAttachment
} = require('../controllers/taskController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/user').get(protect, getUserTasks);

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin', 'committee_head'), createTask);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, authorize('admin'), deleteTask);

router.route('/:id/comments').post(protect, addTaskComment);
router.route('/:id/attachments').post(protect, addTaskAttachment);

module.exports = router;
