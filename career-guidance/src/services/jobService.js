import { api } from './api';

export const jobService = {
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getJob: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  applyForJob: async (jobId, coverLetter) => {
    const response = await api.post('/jobs/apply', { jobId, coverLetter });
    return response.data;
  }
};