const { firestoreHelper } = require('../config/firebase');

// Get admin dashboard
const getDashboard = async (req, res) => {
  try {
    const [users, institutions, companies, applications, jobs] = await Promise.all([
      firestoreHelper.getAllUsers(),
      firestoreHelper.getInstitutions(),
      firestoreHelper.getCompanies(),
      firestoreHelper.getAllApplications(),
      firestoreHelper.getAllJobs()
    ]);

    const stats = {
      totalUsers: users.length,
      totalInstitutions: institutions.length,
      totalCompanies: companies.length,
      totalApplications: applications.length,
      totalJobs: jobs.length,
      pendingInstitutions: institutions.filter(inst => inst.status === 'pending').length,
      pendingCompanies: companies.filter(comp => comp.status === 'pending').length,
      activeUsers: users.filter(user => user.status === 'active').length
    };

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: applications.slice(0, 10)
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard'
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const applications = await firestoreHelper.getAllApplications();
    
    res.json({
      success: true,
      data: applications.slice(0, 20)
    });
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
};

// Get institutions for admin
const getInstitutions = async (req, res) => {
  try {
    const institutions = await firestoreHelper.getInstitutions();
    
    res.json({
      success: true,
      data: institutions
    });
    
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions'
    });
  }
};

// Get companies for admin
const getCompanies = async (req, res) => {
  try {
    const companies = await firestoreHelper.getCompanies();
    
    res.json({
      success: true,
      data: companies
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies'
    });
  }
};

// Get users for admin
const getUsers = async (req, res) => {
  try {
    const users = await firestoreHelper.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Update institution status
const updateInstitutionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await firestoreHelper.updateInstitutionStatus(id, status);
    
    res.json({
      success: true,
      message: 'Institution status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating institution status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating institution status'
    });
  }
};

// Update company status
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await firestoreHelper.updateCompanyStatus(id, status);
    
    res.json({
      success: true,
      message: 'Company status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company status'
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await firestoreHelper.updateUserStatus(id, status);
    
    res.json({
      success: true,
      message: 'User status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// Get system reports
const getSystemReports = async (req, res) => {
  try {
    const reports = await firestoreHelper.getSystemReports();
    
    res.json({
      success: true,
      data: reports
    });
    
  } catch (error) {
    console.error('Error fetching system reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system reports'
    });
  }
};

module.exports = {
  getDashboard,
  getRecentActivity,
  getInstitutions,
  getCompanies,
  getUsers,
  updateInstitutionStatus,
  updateCompanyStatus,
  updateUserStatus,
  getSystemReports
};