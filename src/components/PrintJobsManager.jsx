
import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, Eye, Download, X, Search, Phone, Play, XCircle, User
} from 'lucide-react';

const PrintJobsManager = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const fetchPrintJobs = async () => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const res = await fetch(`${API_BASE_URL}/printjobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setPrintJobs(data.data.docs || data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch print jobs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewPDF = (job) => {
    const token = getAuthToken();
    window.open(`${API_BASE_URL}/printjobs/${job._id}/view?token=${token}`, '_blank');
  };

  const downloadPDF = async (job) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/printjobs/${job._id}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = job.originalFileName || 'document.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startPrinting = async (job) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/printjobs/${job._id}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        setPrintJobs(prev => prev.map(j => 
          j._id === job._id ? { ...j, status: 'printing' } : j
        ));
      } else {
        setError(data.message || 'Failed to start printing');
      }
    } catch (err) {
      setError('Failed to start printing');
      console.error(err);
    }
  };

  const rejectJob = async (job) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/printjobs/${job._id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        setPrintJobs(prev => prev.map(j => 
          j._id === job._id ? { ...j, status: 'rejected' } : j
        ));
      } else {
        setError(data.message || 'Failed to reject job');
      }
    } catch (err) {
      setError('Failed to reject job');
      console.error(err);
    }
  };

  const callStudent = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const getStudentDetails = (job) => {
    return {
      email: job.email || job.student?.email || 'N/A',
      rollNumber: job.rollNumber || job.student?.rollNumber || 'N/A',
      phoneNumber: job.phoneNumber || job.student?.phoneNumber || 'N/A',
      department: job.department || job.student?.department || 'N/A'
    };
  };

  const calculateTimeLeft = (requiredBy) => {
    if (!requiredBy) return 'N/A';
    
    const now = new Date();
    const required = new Date(requiredBy);
    const diffMs = required - now;
    
    if (diffMs <= 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (timeLeft) => {
    if (timeLeft === 'Overdue') return 'text-red-600 font-semibold';
    if (timeLeft.includes('m') && !timeLeft.includes('h')) {
      return 'text-red-500';
    }
    if (timeLeft.includes('h') && parseInt(timeLeft) <= 2) {
      return 'text-orange-500';
    }
    return 'text-gray-600';
  };

  useEffect(() => {
    fetchPrintJobs();
  }, []);

  const filteredJobs = printJobs.filter(job =>
    job.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-600">Loading print jobs...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Print Jobs Manager</h1>
          <div className="text-sm text-gray-600">
            Total Jobs: {filteredJobs.length}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by filename, order ID, or roll number..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map(job => {
            const studentDetails = getStudentDetails(job);
            const timeLeft = calculateTimeLeft(job.requiredBy);
            return (
              <div key={job._id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {studentDetails.rollNumber !== 'N/A' ? studentDetails.rollNumber.slice(-3) : 'U'}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {studentDetails.rollNumber} • {studentDetails.department}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {studentDetails.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {studentDetails.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPriorityColor(timeLeft)}`}>
                        {timeLeft} left
                      </div>
                    </div>
                  </div>
                </div>

                {/* File and Cost Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">{job.originalFileName}</span>
                      <span className="text-sm text-gray-500">Order ID: {job.orderId}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">₹{job.totalCost}</div>
                      {job.status === 'paid' && (
                        <div className="text-sm text-green-600">Paid</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Print Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Pages:</span>
                    <span className="ml-2">{job.totalPages} × {job.numCopies}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2">{job.printingType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Side:</span>
                    <span className="ml-2 capitalize">{job.printingSide}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Finishing:</span>
                    <span className="ml-2 capitalize">{job.finishingOption}</span>
                  </div>
                </div>

                {job.specialInstructions && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                    <div className="text-sm">
                      <span className="font-medium text-blue-800">Instructions:</span>
                      <span className="ml-2 text-blue-700">{job.specialInstructions}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {job.status === 'pending' && (
                    <button
                      onClick={() => startPrinting(job)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Printing
                    </button>
                  )}
                  
                  {job.status === 'pending' && (
                    <button
                      onClick={() => rejectJob(job)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => callStudent(studentDetails.phoneNumber)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Student
                  </button>
                  
                  <button
                    onClick={() => viewPDF(job)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </button>
                  
                  <button
                    onClick={() => downloadPDF(job)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Submitted: {formatDate(job.submittedAt)}
                    </span>
                    {job.requiredBy && (
                      <span>
                        Required by: {formatDate(job.requiredBy)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No print jobs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-4xl w-full rounded-lg shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Print Job Details</h2>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Job Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Order ID:</span>
                        <span>{selectedJob.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">File Name:</span>
                        <span>{selectedJob.originalFileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedJob.status)}`}>
                          {selectedJob.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Total Cost:</span>
                        <span className="font-semibold">₹{selectedJob.totalCost}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Student Information</h3>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const studentDetails = getStudentDetails(selectedJob);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Roll Number:</span>
                              <span>{studentDetails.rollNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Department:</span>
                              <span>{studentDetails.department}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Email:</span>
                              <span>{studentDetails.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Phone:</span>
                              <span>{studentDetails.phoneNumber}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Print Specifications</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Pages:</span>
                        <span>{selectedJob.totalPages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Copies:</span>
                        <span>{selectedJob.numCopies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Print Type:</span>
                        <span>{selectedJob.printingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Print Side:</span>
                        <span className="capitalize">{selectedJob.printingSide}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Finishing:</span>
                        <span className="capitalize">{selectedJob.finishingOption}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Color Pages:</span>
                        <span>{selectedJob.colorPages || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span>{formatDate(selectedJob.submittedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Required By:</span>
                        <span>{selectedJob.requiredBy ? formatDate(selectedJob.requiredBy) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Time Left:</span>
                        <span className={getPriorityColor(calculateTimeLeft(selectedJob.requiredBy))}>
                          {calculateTimeLeft(selectedJob.requiredBy)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedJob.specialInstructions && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg text-gray-900 border-b pb-2 mb-3">Special Instructions</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedJob.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintJobsManager;
