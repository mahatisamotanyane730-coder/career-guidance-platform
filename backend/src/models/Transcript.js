// Transcript model schema
const transcriptSchema = {
  studentId: { type: String, required: true },
  institution: { type: String, required: true },
  program: { type: String, required: true },
  graduationYear: Number,
  grades: [{
    course: String,
    code: String,
    grade: String,
    credits: Number
  }],
  gpa: Number,
  fileUrl: { type: String, required: true },
  fileSize: Number,
  verified: { type: Boolean, default: false },
  verifiedBy: String, // Admin ID who verified
  verifiedAt: Date,
  uploadedAt: { type: Date, default: Date.now }
};

module.exports = transcriptSchema;