// User model schema for Firestore
const userSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'institution', 'company', 'admin'] 
  },
  status: { 
    type: String, 
    default: 'active', 
    enum: ['active', 'suspended', 'pending'] 
  },
  institutionName: { type: String }, // For institution role
  companyName: { type: String }, // For company role
  verificationStatus: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'verified', 'rejected'] 
  },
  profile: {
    phone: String,
    address: {
      street: String,
      city: String,
      country: String
    },
    bio: String,
    avatar: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = userSchema;