// src/utils/courseMatcher.js
export const checkCourseQualification = (course, transcript) => {
  if (!course.requirements || !transcript.grades) return true;
  
  const requiredSubjects = course.requirements;
  const studentGrades = transcript.grades;
  
  // Check if student has all required subjects
  const hasAllSubjects = requiredSubjects.every(subject => 
    Object.keys(studentGrades).includes(subject)
  );
  
  if (!hasAllSubjects) return false;
  
  // Simple grading system - you can enhance this
  const gradePoints = {
    'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
  };
  
  // Calculate average grade for required subjects
  let totalPoints = 0;
  requiredSubjects.forEach(subject => {
    totalPoints += gradePoints[studentGrades[subject]] || 0;
  });
  
  const averageGrade = totalPoints / requiredSubjects.length;
  
  // Qualify if average grade is C or above
  return averageGrade >= 3;
};

export const getQualifiedCourses = (courses, transcript) => {
  if (!transcript.grades) return courses; // Show all if no transcript
  
  return courses.filter(course => 
    checkCourseQualification(course, transcript)
  );
};