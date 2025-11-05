// Notification model schema
const notificationSchema = {
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['application', 'job', 'system', 'message'] 
  },
  relatedId: String, // ID of related entity (application, job, etc.)
  read: { type: Boolean, default: false },
  priority: { 
    type: String, 
    default: 'normal', 
    enum: ['low', 'normal', 'high'] 
  },
  createdAt: { type: Date, default: Date.now }
};

module.exports = notificationSchema;