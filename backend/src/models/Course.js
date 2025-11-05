// Course model schema
const courseSchema = {
  name: { type: String, required: true },
  facultyId: { type: String, required: true },
  institutionId: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., "4 years"
  fees: { type: Number, required: true },
  requirements: {
    minimumGrade: { type: String, required: true },
    subjects: [{ type: String }],
    additionalRequirements: String
  },
  curriculum: [{
    year: Number,
    subjects: [String]
  }],
  seats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'open', 
    enum: ['open', 'closed', 'waitlist'] 
  },
  applicationDeadline: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = courseSchema;