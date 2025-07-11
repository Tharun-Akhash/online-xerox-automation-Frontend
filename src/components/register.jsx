import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, User, CheckCircle, Phone } from 'lucide-react';

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    email: '',
    rollNumber: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@srec.ac.in')) {
      newErrors.email = 'Email must end with @srec.ac.in';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Roll number validation
    if (!formData.rollNumber) {
      newErrors.rollNumber = 'Roll number is required';
    } else if (!/^\d{10}$/.test(formData.rollNumber)) {
      newErrors.rollNumber = 'Roll number must be exactly 10 digits';
    } else if (!formData.rollNumber.startsWith('7181')) {
      newErrors.rollNumber = 'Roll number must start with 7181';
    }
    
    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    } else if (!['6', '7', '8', '9'].includes(formData.phoneNumber.charAt(0))) {
      newErrors.phoneNumber = 'Phone number must start with 6, 7, 8, or 9';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // API call to register endpoint
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          rollNumber: formData.rollNumber,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert('Registration successful! Please login with your credentials.');
        // Navigate to login page after successful registration
        navigate('/login');
      } else {
        // Handle registration errors
        if (data.errors) {
          // If server returns field-specific errors
          setErrors(data.errors);
        } else {
          // General error message
          setErrors({ general: data.message || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format roll number and phone number input
    if (name === 'rollNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear general error when user types
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const generateRollNumber = () => {
    const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const rollNumber = '7181' + randomDigits;
    setFormData(prev => ({
      ...prev,
      rollNumber: rollNumber
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4 py-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          className="mb-6 flex items-center text-white/70 hover:text-white transition-colors"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Student Registration</h2>
            <p className="text-gray-300">Create your student account to get started.</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-500/20 border border-red-400/50 rounded-lg p-3">
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="yourname@srec.ac.in"
                  className={`w-full pl-10 pr-4 py-3 bg-white/20 border ${
                    errors.email ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Roll Number Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="7181XXXXXX"
                  maxLength="10"
                  className={`w-full pl-10 pr-20 py-3 bg-white/20 border ${
                    errors.rollNumber ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={generateRollNumber}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Generate
                </button>
              </div>
              {errors.rollNumber && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.rollNumber}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Must start with 7181 and be 10 digits total</p>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength="10"
                  className={`w-full pl-10 pr-4 py-3 bg-white/20 border ${
                    errors.phoneNumber ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
              </div>
              {errors.phoneNumber && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phoneNumber}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">10 digits starting with 6, 7, 8, or 9</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/20 border ${
                    errors.password ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/20 border ${
                    errors.confirmPassword ? 'border-red-400' : 'border-white/30'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-white/20">
            <p className="text-gray-300">
              Already have an account?{' '}
              <button
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                onClick={() => navigate('/login')}
              >
                Login here
              </button>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 bg-blue-500/20 backdrop-blur-lg rounded-2xl p-4 border border-blue-400/30">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-100">
              <p className="font-medium mb-1">Registration Requirements:</p>
              <ul className="text-xs space-y-1 text-blue-200">
                <li>• Email must end with @srec.ac.in</li>
                <li>• Roll number: 10 digits starting with 7181</li>
                <li>• Phone number: 10 digits starting with 6, 7, 8, or 9</li>
                <li>• Password: 8+ chars with uppercase, lowercase, number</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}