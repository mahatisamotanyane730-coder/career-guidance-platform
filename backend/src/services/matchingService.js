// AI-powered matching service (simplified version)
const calculateMatchScore = (student, job) => {
  let score = 0;
  const maxScore = 100;

  // Course relevance (40%)
  if (student.course && job.requirements.degree) {
    if (student.course.toLowerCase().includes(job.requirements.degree.toLowerCase())) {
      score += 40;
    }
  }

  // Skills match (30%)
  if (student.skills && job.requirements.skills) {
    const matchingSkills = student.skills.filter(skill => 
      job.requirements.skills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    score += (matchingSkills.length / job.requirements.skills.length) * 30;
  }

  // Experience match (20%)
  if (student.experience && job.requirements.experience) {
    if (student.experience >= parseExperience(job.requirements.experience)) {
      score += 20;
    }
  }

  // Location preference (10%)
  if (student.preferredLocation && job.location) {
    if (student.preferredLocation.toLowerCase() === job.location.toLowerCase()) {
      score += 10;
    }
  }

  return Math.min(score, maxScore);
};

const parseExperience = (expString) => {
  // Convert "2-4 years" to minimum years
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

// Get recommended jobs for student
const getRecommendedJobs = (student, allJobs) => {
  return allJobs
    .map(job => ({
      ...job,
      matchScore: calculateMatchScore(student, job)
    }))
    .filter(job => job.matchScore > 50)
    .sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { calculateMatchScore, getRecommendedJobs };