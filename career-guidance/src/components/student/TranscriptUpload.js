import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../contexts/AuthContext';

const TranscriptUpload = ({ onTranscriptUploaded, editMode = false, existingTranscript = null }) => {
  const [uploading, setUploading] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [formData, setFormData] = useState({
    highSchool: '',
    yearCompleted: '',
    completedSubjects: []
  });
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAvailableSubjects();
  }, []);

  useEffect(() => {
    if (editMode && existingTranscript) {
      setFormData({
        highSchool: existingTranscript.highSchool || '',
        yearCompleted: existingTranscript.yearCompleted || '',
        completedSubjects: existingTranscript.completedSubjects || []
      });
      setTranscriptData(existingTranscript);
    }
  }, [editMode, existingTranscript]);

  const loadAvailableSubjects = async () => {
    try {
      const commonSubjects = [
        'English', 'Mathematics', 'Science', 'Physical Science', 'Biology', 
        'Chemistry', 'Physics', 'Geography', 'History', 'Commerce', 
        'Accounting', 'Economics', 'Sesotho', 'Life-Skills', 'Art',
        'Computer Studies', 'ICT', 'Agriculture', 'Sociology', 'Psychology',
        'Media Studies', 'Design and Technology', 'Sign Language'
      ];
      
      setAvailableSubjects(commonSubjects.sort());
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => {
      const isSelected = prev.completedSubjects.includes(subject);
      if (isSelected) {
        return {
          ...prev,
          completedSubjects: prev.completedSubjects.filter(s => s !== subject)
        };
      } else {
        return {
          ...prev,
          completedSubjects: [...prev.completedSubjects, subject]
        };
      }
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PDF, JPEG, or PNG file.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      // For now, we'll simulate file upload and extract data
      // In a real implementation, you would upload to cloud storage and process the file
      
      alert('File upload feature will be implemented with cloud storage. For now, please use manual entry or contact support.');
      
      // Simulate successful upload
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
      }, 2000);
      
    } catch (error) {
      alert('Error uploading file: ' + error.message);
      setUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    const missingFields = [];
    if (!formData.highSchool) missingFields.push('High School Name');
    if (!formData.yearCompleted) missingFields.push('Year Completed');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.join('\n')}`);
      return;
    }

    if (formData.completedSubjects.length === 0) {
      alert('Please select at least one subject you completed in high school.');
      return;
    }

    setUploading(true);
    try {
      const transcriptData = {
        highSchool: formData.highSchool,
        yearCompleted: formData.yearCompleted,
        completedSubjects: formData.completedSubjects,
        studentId: user.uid,
        studentName: `${user.firstName} ${user.lastName}`,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadMethod: 'manual'
      };

      const result = await studentService.uploadTranscript(user.uid, transcriptData);
      
      if (result.success) {
        setTranscriptData(transcriptData);
        if (onTranscriptUploaded) onTranscriptUploaded(transcriptData);
        
        if (editMode) {
          alert('Subjects updated successfully! Refreshing qualified courses...');
        } else {
          alert('Transcript uploaded successfully! Loading qualified courses...');
        }
        
        setTimeout(() => {
          window.location.href = '/student/qualified-courses';
        }, 2000);
      } else {
        alert('Failed to save subjects: ' + result.message);
      }
    } catch (error) {
      alert('Error saving subjects: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    if (editMode) {
      window.location.href = '/student/qualified-courses';
    }
  };

  return (
    <div className="elegant-card p-6 mb-6 bg-gradient-to-r from-purple-900 to-blue-900">
      <h2 className="text-xl font-semibold text-white mb-4">
        {editMode ? 'Edit Your High School Subjects' : 'High School Transcript'}
      </h2>
      
      {(!transcriptData || editMode) ? (
        <div className="space-y-6">
          <p className="text-gray-300">
            {editMode 
              ? 'Update your high school subjects to see updated course matches.' 
              : 'Provide your high school transcript information to see courses you qualify for.'}
          </p>

          {/* Upload Method Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Choose Upload Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setUploadMethod('manual')}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  uploadMethod === 'manual' 
                    ? 'border-blue-500 bg-blue-900' 
                    : 'border-gray-600 bg-gray-700 hover:border-blue-400'
                }`}
              >
                <h4 className="font-semibold text-white mb-2">Manual Entry</h4>
                <p className="text-sm text-gray-300">
                  Select your subjects manually from the list
                </p>
              </button>
              
              <button
                onClick={() => setUploadMethod('file')}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  uploadMethod === 'file' 
                    ? 'border-green-500 bg-green-900' 
                    : 'border-gray-600 bg-gray-700 hover:border-green-400'
                }`}
              >
                <h4 className="font-semibold text-white mb-2">Upload Document</h4>
                <p className="text-sm text-gray-300">
                  Upload your transcript as PDF or image
                </p>
              </button>
            </div>

            {/* Manual Entry Form */}
            {uploadMethod === 'manual' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  {editMode ? 'Update Your Information' : 'Enter Your High School Information'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      High School Name *
                    </label>
                    <input
                      type="text"
                      value={formData.highSchool}
                      onChange={(e) => setFormData(prev => ({ ...prev, highSchool: e.target.value }))}
                      placeholder="Enter your high school name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Year Completed *
                    </label>
                    <input
                      type="number"
                      value={formData.yearCompleted}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearCompleted: e.target.value }))}
                      placeholder="e.g., 2024"
                      min="2000"
                      max="2030"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Select Subjects You Completed in High School *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 border border-gray-600 rounded-lg">
                    {availableSubjects.map((subject) => (
                      <div key={subject} className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors duration-200">
                        <input
                          type="checkbox"
                          id={`subject-${subject}`}
                          checked={formData.completedSubjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                        />
                        <label 
                          htmlFor={`subject-${subject}`}
                          className="ml-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors duration-200"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    Selected: {formData.completedSubjects.length} subjects
                  </div>
                </div>

                <div className="flex gap-4">
                  {editMode && (
                    <button
                      onClick={handleCancelEdit}
                      disabled={uploading}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleManualSubmit}
                    disabled={uploading}
                    className={`${editMode ? 'flex-1' : 'w-full'} bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {uploading 
                      ? (editMode ? 'Updating...' : 'Saving...') 
                      : (editMode ? 'Update Subjects' : 'Save Subjects & View Qualified Courses')}
                  </button>
                </div>
              </div>
            )}

            {/* File Upload Form */}
            {uploadMethod === 'file' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Upload Your Transcript</h4>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-all duration-300 hover:border-green-500">
                  <input
                    type="file"
                    id="transcript-file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="transcript-file"
                    className="cursor-pointer block"
                  >
                    <div className="text-gray-400 mb-4">
                      {selectedFile ? 'File selected:' : 'Click to select transcript file'}
                    </div>
                    {selectedFile ? (
                      <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                        <p className="text-green-300 font-medium">{selectedFile.name}</p>
                        <p className="text-green-400 text-sm">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                        <p className="text-gray-300">PDF, JPG, or PNG files only</p>
                        <p className="text-gray-400 text-sm">Maximum file size: 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="text-sm text-gray-400">
                  <p>Supported formats: PDF, JPG, PNG</p>
                  <p>We'll extract your subjects and grades from the document</p>
                </div>

                <div className="flex gap-4">
                  {editMode && (
                    <button
                      onClick={handleCancelEdit}
                      disabled={uploading}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !selectedFile}
                    className={`${editMode ? 'flex-1' : 'w-full'} bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Transcript & Process'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4 transition-all duration-300">
          <div className="flex items-center">
            <div>
              <h3 className="text-lg font-medium text-green-200">Transcript Saved Successfully!</h3>
              <p className="text-green-300 mt-1">
                {transcriptData.highSchool} • Year Completed: {transcriptData.yearCompleted}
              </p>
              <p className="text-green-300">
                Completed {transcriptData.completedSubjects.length} subjects
              </p>
              <p className="text-green-400 text-sm">
                Upload method: {transcriptData.uploadMethod === 'file' ? 'Document Upload' : 'Manual Entry'}
              </p>
              <button
                onClick={() => window.location.href = '/student/qualified-courses'}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300"
              >
                View Qualified Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptUpload;