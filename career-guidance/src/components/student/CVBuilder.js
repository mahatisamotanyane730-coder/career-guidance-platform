// src/components/student/CVBuilder.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';

const CVBuilder = ({ jobId, onCVGenerated }) => {
  const { user } = useAuth();
  const [cvData, setCvData] = useState({
    education: [],
    skills: [],
    experience: [],
    achievements: '',
    personalInfo: {}
  });
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);

  const loadStudentCVData = useCallback(async () => {
    try {
      // Load job details to tailor CV
      const jobsResponse = await studentService.getAvailableJobs();
      const jobs = jobsResponse.success ? jobsResponse.data : [];
      const targetJob = jobs.find(job => job.id === jobId);
      setJobDetails(targetJob);

      // Load student's applications to get education history
      const applicationsResponse = await studentService.getStudentApplications(user.uid);
      const applications = applicationsResponse.success ? applicationsResponse.data : [];
      
      // Load transcript for skills and achievements
      const transcriptResponse = await studentService.getTranscript(user.uid);
      const transcript = transcriptResponse.success ? transcriptResponse.data : null;

      // Build education history
      const education = applications.map(app => ({
        institution: app.institutionName || 'Educational Institution',
        course: app.courseName || 'Course of Study',
        status: app.status || 'Completed',
        year: app.applicationDate ? new Date(app.applicationDate).getFullYear() : 'Current'
      }));

      // Extract skills from transcript subjects and applications
      const courseSkills = applications.map(app => 
        app.courseName?.split(' ')[0] || 'Academic'
      );
      
      const subjectSkills = transcript?.completedSubjects?.map(subject => 
        subject.split(' ')[0]
      ) || [];

      const allSkills = [...new Set([...courseSkills, ...subjectSkills])].slice(0, 8);

      // Mock experience based on education
      const experience = applications.slice(0, 2).map((app, index) => ({
        role: `Student - ${app.courseName || 'Academic Program'}`,
        institution: app.institutionName || 'Educational Institution',
        duration: `${new Date().getFullYear() - index - 1} - ${new Date().getFullYear() - index}`,
        description: `Completed coursework in ${app.courseName || 'relevant field'} with focus on practical applications.`
      }));

      setCvData({
        education,
        skills: allSkills,
        experience,
        achievements: transcript ? 
          `Completed ${transcript.completedSubjects?.length || 0} subjects with focus on ${transcript.completedSubjects?.slice(0, 3).join(', ') || 'academic excellence'}. Demonstrated strong analytical and problem-solving skills throughout academic career.` 
          : 'Strong academic background with demonstrated commitment to learning and professional development.',
        personalInfo: {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student',
          email: user.email || '',
          phone: 'Not specified'
        }
      });
    } catch (error) {
      console.error('Error loading CV data:', error);
    } finally {
      setLoading(false);
    }
  }, [jobId, user.uid, user.firstName, user.lastName, user.email]);

  useEffect(() => {
    loadStudentCVData();
  }, [loadStudentCVData]);

  const generateCVText = () => {
    const { personalInfo, education, skills, experience, achievements } = cvData;

    return `
PROFESSIONAL CURRICULUM VITAE
=============================

PERSONAL DETAILS
----------------
Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}

EDUCATION BACKGROUND
-------------------
${education.map(edu => `• ${edu.course} - ${edu.institution} (${edu.status}, ${edu.year})`).join('\n')}

SKILLS & COMPETENCIES
---------------------
${skills.map(skill => `• ${skill}`).join('\n')}

${experience.length > 0 ? `
EXPERIENCE & INVOLVEMENT
------------------------
${experience.map(exp => `• ${exp.role} at ${exp.institution} (${exp.duration})
  ${exp.description}`).join('\n\n')}
` : ''}

ACHIEVEMENTS & CAPABILITIES
---------------------------
${achievements}

${jobDetails ? `
TAILORED FOR
------------
${jobDetails.title} at ${jobDetails.company?.companyName || 'the company'}
Matching Requirements: ${jobDetails.requirements?.join(', ') || 'Various skills'}
` : ''}

REFERENCES
----------
Available upon request
    `.trim();
  };

  if (loading) {
    return (
      <div className="text-white p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        Building your professional CV...
      </div>
    );
  }

  return (
    <div className="elegant-card p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">📄 Dynamic CV Builder</h3>
      <p className="text-gray-300 mb-4">Your CV has been automatically generated from your academic profile and applications.</p>
      
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
        <pre className="text-white text-sm whitespace-pre-wrap font-mono">
          {generateCVText()}
        </pre>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => onCVGenerated(generateCVText())}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300"
        >
          Use This CV & Apply
        </button>
        <button
          onClick={() => onCVGenerated('')}
          className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300"
        >
          Apply Without CV
        </button>
      </div>
    </div>
  );
};

export default CVBuilder;