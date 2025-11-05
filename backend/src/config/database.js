const { db } = require('./firebase');

// Database collections configuration
const collections = {
  USERS: 'users',
  INSTITUTIONS: 'institutions',
  FACULTIES: 'faculties',
  COURSES: 'courses',
  APPLICATIONS: 'applications',
  JOBS: 'jobs',
  JOB_APPLICATIONS: 'job_applications',
  TRANSCRIPTS: 'transcripts',
  NOTIFICATIONS: 'notifications',
  SYSTEM_LOGS: 'system_logs',
  REPORTS: 'reports'
};

// Database helper functions
const dbHelpers = {
  // Generic document operations
  async getDocument(collection, id) {
    try {
      const doc = await db.collection(collection).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw new Error(`Error getting document from ${collection}: ${error.message}`);
    }
  },

  async createDocument(collection, data) {
    try {
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Error creating document in ${collection}: ${error.message}`);
    }
  },

  async updateDocument(collection, id, data) {
    try {
      await db.collection(collection).doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { id, ...data };
    } catch (error) {
      throw new Error(`Error updating document in ${collection}: ${error.message}`);
    }
  },

  async deleteDocument(collection, id) {
    try {
      await db.collection(collection).doc(id).delete();
      return { id, deleted: true };
    } catch (error) {
      throw new Error(`Error deleting document from ${collection}: ${error.message}`);
    }
  },

  // Query operations
  async queryDocuments(collection, field, operator, value) {
    try {
      const snapshot = await db.collection(collection)
        .where(field, operator, value)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error querying documents from ${collection}: ${error.message}`);
    }
  },

  async getAllDocuments(collection, orderBy = null, limit = null) {
    try {
      let query = db.collection(collection);
      
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error getting all documents from ${collection}: ${error.message}`);
    }
  }
};

module.exports = { collections, dbHelpers };