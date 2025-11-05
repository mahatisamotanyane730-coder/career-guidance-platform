// Faculty model schema
const facultySchema = {
  name: { type: String, required: true },
  institutionId: { type: String, required: true },
  description: { type: String, required: true },
  dean: String,
  contactEmail: String,
  courses: [{ type: String }], // Array of course IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = facultySchema;