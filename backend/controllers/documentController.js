const Document = require('../models/Document');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadFile } = require('../config/storage');

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = asyncHandler(async (req, res, next) => {
  const { committee } = req.query;
  const query = {};
  if (committee) query.committee = committee;

  const docs = await Document.find(query)
    .populate('createdBy', 'name email role')
    .populate('committee', 'name')
    .populate('versions.uploadedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, count: docs.length, data: docs });
});

// @desc    Create new document (Uploads version 1)
// @route   POST /api/documents
// @access  Private
exports.createDocument = asyncHandler(async (req, res, next) => {
  const { title, description, committee } = req.body;

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file document', 400));
  }

  // Upload to storage engine (Cloudinary or local Fallback)
  const uploadResult = await uploadFile(req.file);

  const document = await Document.create({
    title,
    description,
    committee: committee || null,
    createdBy: req.user._id,
    currentVersion: 1,
    versions: [{
      version: 1,
      url: uploadResult.url,
      fileName: uploadResult.fileName,
      uploadedBy: req.user._id
    }]
  });

  const populated = await Document.findById(document._id)
    .populate('createdBy', 'name email role')
    .populate('versions.uploadedBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Upload a new version of an existing document
// @route   POST /api/documents/:id/version
// @access  Private
exports.addDocumentVersion = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file document', 400));
  }

  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(new ErrorResponse('Document not found', 404));
  }

  // Upload to storage engine
  const uploadResult = await uploadFile(req.file);

  const nextVersion = document.currentVersion + 1;
  document.currentVersion = nextVersion;
  document.approvalStatus = 'Pending'; // Reset to pending for review
  document.approvedBy = null;
  document.approvalDate = null;
  
  document.versions.push({
    version: nextVersion,
    url: uploadResult.url,
    fileName: uploadResult.fileName,
    uploadedBy: req.user._id
  });

  await document.save();

  const populated = await Document.findById(document._id)
    .populate('createdBy', 'name email role')
    .populate('versions.uploadedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// @desc    Approve or Reject a document
// @route   PUT /api/documents/:id/approval
// @access  Private (Admin / Committee Head only)
exports.updateApprovalStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid approval status. Must be Approved or Rejected.', 400));
  }

  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(new ErrorResponse('Document not found', 404));
  }

  document.approvalStatus = status;
  document.approvedBy = req.user._id;
  document.approvalDate = new Date();

  await document.save();

  const populated = await Document.findById(document._id)
    .populate('createdBy', 'name email role')
    .populate('approvedBy', 'name email')
    .populate('versions.uploadedBy', 'name email');

  res.status(200).json({ success: true, data: populated });
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (Admin or Creator)
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(new ErrorResponse('Document not found', 404));
  }

  // Creator or Admin can delete
  if (document.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this document', 403));
  }

  await document.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
