// Institution model schema
const institutionSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  description: { type: String, required: true },
  website: String,
  logo: String,
  status: { 
    type: String, 
    default: 'active', 
    enum: ['active', 'suspended', 'pending'] 
  },
  verificationStatus: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'verified', 'rejected'] 
  },
  faculties: [{ type: String }], // Array of faculty IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = institutionSchema;