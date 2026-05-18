const express = require('express');
const {
  getDocuments,
  createDocument,
  addDocumentVersion,
  updateApprovalStatus,
  deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/storage');

const router = express.Router();

// Mount endpoints under protect authentication
router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), createDocument);

router.route('/:id/version')
  .post(upload.single('file'), addDocumentVersion);

router.route('/:id/approval')
  .put(authorize('admin', 'Committee Head', 'head'), updateApprovalStatus); // Allow standard heads and admins

router.route('/:id')
  .delete(deleteDocument);

module.exports = router;
