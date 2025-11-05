import { api } from './api';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalInstitutions: 0,
          totalCompanies: 0,
          totalApplications: 0,
          totalJobs: 0,
          usersByRole: {
            student: 0,
            institution: 0,
            company: 0,
            admin: 0
          },
          pendingInstitutions: 0,
          pendingCompanies: 0,
          activeInstitutions: 0,
          activeCompanies: 0,
          suspendedUsers: 0,
          pendingApplications: 0,
          newUsersThisMonth: 0
        }
      };
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/admin/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return { success: true, data: [] };
    }
  },

  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalInstitutions: 0,
          totalCompanies: 0,
          totalApplications: 0
        }
      };
    }
  },

  // Institutions
  getInstitutions: async () => {
    try {
      const response = await api.get('/admin/institutions');
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return { success: true, data: [] };
    }
  },

  updateInstitutionStatus: async (institutionId, status) => {
    try {
      const response = await api.patch(`/admin/institutions/${institutionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating institution status:', error);
      return { success: false, message: 'Error updating institution status' };
    }
  },

  // Companies
  getCompanies: async () => {
    try {
      const response = await api.get('/admin/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return { success: true, data: [] };
    }
  },

  updateCompanyStatus: async (companyId, status) => {
    try {
      const response = await api.patch(`/admin/companies/${companyId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating company status:', error);
      return { success: false, message: 'Error updating company status' };
    }
  },

  // Users
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: true, data: [] };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, message: 'Error updating user status' };
    }
  },

  // Bulk operations
  bulkUpdateInstitutions: async (institutionIds, status) => {
    try {
      const response = await api.patch('/admin/institutions/bulk-status', { institutionIds, status });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating institutions:', error);
      return { success: false, message: 'Error bulk updating institutions' };
    }
  },

  // Reports
  getSystemReports: async (params) => {
    try {
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching system reports:', error);
      return { success: true, data: [] };
    }
  }
};