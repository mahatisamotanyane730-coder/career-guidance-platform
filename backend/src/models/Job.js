// Job model schema
const jobSchema = {
  companyId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: {
    degree: { type: String, required: true },
    skills: [{ type: String, required: true }],
    experience: { type: String, required: true },
    additionalRequirements: String
  },
  responsibilities: [String],
  benefits: [String],
  salary: { type: Number, required: true },
  salaryType: { 
    type: String, 
    default: 'monthly', 
    enum: ['monthly', 'yearly', 'hourly'] 
  },
  location: { type: String, required: true },
  jobType: { 
    type: String, 
    default: 'full-time', 
    enum: ['full-time', 'part-time', 'contract', 'internship'] 
  },
  status: { 
    type: String, 
    default: 'active', 
    enum: ['active', 'closed', 'draft'] 
  },
  deadline: { type: Date, required: true },
  applications: [{ type: String }], // Array of application IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = jobSchema;