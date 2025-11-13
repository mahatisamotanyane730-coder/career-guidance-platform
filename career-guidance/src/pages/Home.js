import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">CareerGuide LS</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Your Future in 
            <span className="text-blue-400"> Lesotho</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect with higher learning institutions, find the perfect courses, 
            and launch your career with Lesotho's premier career guidance platform.
          </p>
          
          {!user && (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border border-blue-600 text-blue-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Key Benefits Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">Smart Matching</div>
              <div className="text-gray-400 text-sm">
                Our intelligent system matches your qualifications with suitable courses and career opportunities, 
                ensuring you find the perfect fit for your skills and aspirations.
              </div>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-4">Seamless Process</div>
              <div className="text-gray-400 text-sm">
                From course applications to job placements, experience a streamlined journey with real-time tracking 
                and instant notifications at every step.
              </div>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-4">Career Ready</div>
              <div className="text-gray-400 text-sm">
                Build professional CVs, connect with top employers, and access career guidance to transition 
                smoothly from education to employment.
              </div>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">Local Focus</div>
              <div className="text-gray-400 text-sm">
                Specifically designed for Lesotho's education and job market, featuring local institutions 
                and companies that understand the unique opportunities in our country.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-800 py-16 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need For Your Career Journey</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From discovering institutions to launching your career - we've got you covered every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Find Institutions</h3>
              <p className="text-gray-400">
                Explore universities and colleges across Lesotho with detailed information about programs and admission requirements.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
              <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Apply to Courses</h3>
              <p className="text-gray-400">
                Submit applications to your preferred courses online with real-time tracking of your application status.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Career Opportunities</h3>
              <p className="text-gray-400">
                Connect with employers and find job opportunities that match your qualifications after graduation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-300">Simple steps to achieve your career goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Create Profile</h3>
              <p className="text-gray-400">Sign up and complete your academic profile with your qualifications and interests</p>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Discover Options</h3>
              <p className="text-gray-400">Browse matched courses and institutions based on your profile and preferences</p>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Apply & Connect</h3>
              <p className="text-gray-400">Submit applications and connect with institutions and potential employers</p>
            </div>
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Launch Career</h3>
              <p className="text-gray-400">Receive offers, build your CV, and start your professional journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Benefits Section */}
      <div className="bg-gray-800 py-16 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose CareerGuide LS?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our platform is designed specifically for Lesotho's unique educational and employment landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Personalized Guidance</h3>
              <p className="text-gray-400 text-sm">
                Get course and career recommendations tailored to your academic background, skills, and career aspirations.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Direct Applications</h3>
              <p className="text-gray-400 text-sm">
                Apply to multiple institutions and courses through a single platform with streamlined application processes.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Career Transition</h3>
              <p className="text-gray-400 text-sm">
                Smooth transition from student to professional with job matching, CV building, and employer connections.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Real-time Updates</h3>
              <p className="text-gray-400 text-sm">
                Stay informed with instant notifications about application status, deadlines, and new opportunities.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Local Expertise</h3>
              <p className="text-gray-400 text-sm">
                Access institutions and companies that understand Lesotho's educational system and job market needs.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-white">Comprehensive Support</h3>
              <p className="text-gray-400 text-sm">
                From course selection to career placement, we provide support at every stage of your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-blue-900 py-16 border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
              Join students, institutions, and companies transforming education and employment in Lesotho. 
              Take the first step toward your future today.
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account Now
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2025 CareerGuide LS. All rights reserved.</p>
          <p className="text-gray-500 mt-2">Empowering education and career development in Lesotho</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;