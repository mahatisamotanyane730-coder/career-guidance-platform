// Application model schema
const applicationSchema = {
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  institutionId: { type: String, required: true },
  documents: [{
    type: String, // transcript, id_copy, etc.
    url: String,
    uploadedAt: Date
  }],
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'under_review', 'admitted', 'rejected', 'waitlist'] 
  },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: String, // Institution admin ID
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = applicationSchema;