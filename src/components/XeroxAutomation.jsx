import React, { useState, useEffect } from 'react';

const XeroxAutomation = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [numCopies, setNumCopies] = useState(1);
  const [printingType, setPrintingType] = useState('bw');
  const [printingSide, setPrintingSide] = useState('single');
  const [finishingOption, setFinishingOption] = useState('none');
  const [file, setFile] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [colorPages, setColorPages] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // New state for API integration
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [apiError, setApiError] = useState(null);
  const API_BASE_URL="http://localhost:5000"

  // API base URL - adjust this to match your backend
 // ✅ But usually tokens are stored in cookies or localStorage, not envs


  // Check if user is authenticated (you might need to adjust this based on your auth implementation)
 // Check if user is authenticated (you might need to adjust this based on your auth implementation)
  const getAuthToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('✅ Token retrieved:', token ? 'Present' : 'Missing');
  return token;
};

  // Calculate total cost whenever relevant values change
  useEffect(() => {
    if (totalPages > 0) {
      calculateTotalCost(totalPages);
    }
  }, [totalPages, numCopies, printingType, printingSide, finishingOption, colorPages]);

  const calculateTotalCost = (pages) => {
    let costPerPage = 0;
    let adjustedPages = pages;
    let colorPageCount = 0;
    let bwPageCount = pages;

    // Parse color pages if specified
    if (colorPages.trim() && printingType === 'mixed') {
      const colorPageNumbers = parsePageNumbers(colorPages);
      colorPageCount = colorPageNumbers.length;
      bwPageCount = pages - colorPageCount;
    }

    if (printingType === 'bw') {
      costPerPage = 1;
    } else if (printingType === 'colour') {
      costPerPage = 10;
    } else if (printingType === 'poster') {
      costPerPage = 50;
    } else if (printingType === 'mixed') {
      costPerPage = 0; // We'll calculate separately
    }

    if (printingSide === 'double') {
      adjustedPages = Math.ceil(pages / 2);
    }

    let cost = 0;
    if (printingType === 'mixed') {
      // Calculate mixed cost
      if (printingSide === 'double') {
        cost = (Math.ceil(bwPageCount / 2) * 1 + Math.ceil(colorPageCount / 2) * 10) * numCopies;
      } else {
        cost = (bwPageCount * 1 + colorPageCount * 10) * numCopies;
      }
    } else {
      cost = adjustedPages * costPerPage * numCopies;
    }

    if (finishingOption === 'spiral') cost += 40;
    else if (finishingOption === 'caligo') cost += 60;
    else if (finishingOption === 'stickfile') cost += 15;

    setTotalCost(cost.toFixed(2));
  };

  const parsePageNumbers = (pageString) => {
    const pages = [];
    const parts = pageString.split(',');
    
    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i <= totalPages) pages.push(i);
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (pageNum && pageNum <= totalPages) pages.push(pageNum);
      }
    });
    
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  // Enhanced PDF page count extraction for large files
  const extractPDFPageCount = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const searchLength = Math.min(uint8Array.length, 50000);
      const pdfText = Array.from(uint8Array.slice(0, searchLength))
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      const countMatches = pdfText.match(/\/Count\s+(\d+)/g);
      if (countMatches && countMatches.length > 0) {
        const counts = countMatches.map(match => parseInt(match.match(/\d+/)[0]));
        const maxCount = Math.max(...counts);
        if (maxCount > 0) return maxCount;
      }
      
      const nMatch = pdfText.match(/\/N\s+(\d+)/);
      if (nMatch) {
        const pageCount = parseInt(nMatch[1]);
        if (pageCount > 0) return pageCount;
      }
      
      const pageTypeMatches = pdfText.match(/\/Type\s*\/Page(?!\w)/g);
      if (pageTypeMatches && pageTypeMatches.length > 0) {
        return pageTypeMatches.length;
      }
      
      const kidsMatch = pdfText.match(/\/Kids\s*\[([^\]]+)\]/);
      if (kidsMatch) {
        const kidsContent = kidsMatch[1];
        const objRefs = kidsContent.match(/\d+\s+\d+\s+R/g);
        if (objRefs && objRefs.length > 0) {
          return objRefs.length;
        }
      }
      
      if (uint8Array.length > 10000) {
        const fullText = Array.from(uint8Array)
          .map(byte => String.fromCharCode(byte))
          .join('');
        
        const allPageMatches = fullText.match(/\/Type\s*\/Page\W/g);
        if (allPageMatches && allPageMatches.length > 0) {
          return allPageMatches.length;
        }
        
        const xrefMatch = fullText.match(/xref\s*\n\s*0\s+(\d+)/);
        if (xrefMatch) {
          const objCount = parseInt(xrefMatch[1]);
          const estimatedPages = Math.floor(objCount / 10);
          if (estimatedPages > 0 && estimatedPages < 10000) {
            return estimatedPages;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting PDF page count:', error);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    // Reset states
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setSubmitted(false);
    setSubmitSuccess(false);
    setOrderDetails(null);
    setError(null);
    setApiError(null);
    setLoading(true);
    setTotalPages(0);

    try {
      const pageCount = await extractPDFPageCount(selectedFile);
      
      if (pageCount && pageCount > 0) {
        setTotalPages(pageCount);
        setLoading(false);
      } else {
        setError('Could not automatically detect page count. Please try a different PDF file.');
        setLoading(false);
      }
    } catch (error) {
      setError('Error reading PDF file. Please try a different file.');
      setLoading(false);
    }
  };

  // New function to submit to backend API
   // Add this debug logging to your submitToAPI function in XeroxAutomation.jsx
// Replace your current submitToAPI function with this version for debugging:

const submitToAPI = async () => {
  const token = getAuthToken();
  
  console.log('=== DEBUG SUBMISSION ===');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('File:', file ? file.name : 'No file');
  console.log('Total Pages:', totalPages);
  console.log('Num Copies:', numCopies);
  console.log('Printing Type:', printingType);
  console.log('Printing Side:', printingSide);
  console.log('Finishing Option:', finishingOption);
  console.log('Color Pages:', colorPages);
  console.log('Special Instructions:', specialInstructions);
  
  if (!token) {
    setApiError('Please log in to submit print jobs. You need to be authenticated to use this service.');
    return;
  }

  setSubmitting(true);
  setApiError(null);

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file); // Make sure this matches backend expectation
    formData.append('totalPages', totalPages.toString());
    formData.append('numCopies', numCopies.toString());
    formData.append('printingType', printingType);
    formData.append('printingSide', printingSide);
    formData.append('finishingOption', finishingOption);

    if (colorPages.trim()) {
      formData.append('colorPages', colorPages.trim());
    }
    if (specialInstructions.trim()) {
      formData.append('specialInstructions', specialInstructions.trim());
    }

    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(`${API_BASE_URL}/api/printjobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - let browser set it
      },
      body: formData
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    const data = await response.json();
    console.log('Response Data:', data);

    if (response.ok && data.success) {
      setSubmitSuccess(true);
      setOrderDetails(data.data.printJob);
      setSubmitted(true);
      
      setTimeout(() => {
        resetForm();
      }, 10000);
    } else {
      // Log more detailed error information
     console.log(' API Error Response:', responseData);
    console.log(' Validation Errors:', responseData.errors); // Add this line
      throw new Error(data.message || data.error || 'Failed to submit print job');
    }
  } catch (error) {
    console.error('API submission error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    setApiError(error.message || 'Failed to submit print job. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const handleSubmit = async () => {
    // Validation
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (totalPages === 0) {
      setError('Please wait for the PDF to load completely');
      return;
    }
    if (printingType === 'mixed' && !colorPages.trim()) {
      setError('Please specify which pages to print in color');
      return;
    }

    // Clear previous states
    setError(null);
    setApiError(null);
    
    // Submit to API
    await submitToAPI();
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setTotalPages(0);
    setNumCopies(1);
    setPrintingType('bw');
    setPrintingSide('single');
    setFinishingOption('none');
    setColorPages('');
    setSpecialInstructions('');
    setTotalCost(null);
    setSubmitted(false);
    setSubmitSuccess(false);
    setOrderDetails(null);
    setError(null);
    setApiError(null);
    setLoading(false);
    setSubmitting(false);
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setApiError('Please log in to use the printing service. Authentication is required.');
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 font-sans overflow-x-hidden">
      {/* Header with Logo */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-t-3xl p-8 text-center shadow-lg mb-0">
        <div className="flex items-center justify-center flex-wrap gap-5 mb-5">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md border-4 border-indigo-500">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              SREC
            </div>
          </div>
          
          <div className="text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold m-0 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              🖨 SREC Digital Xerox
            </h1>
            <p className="text-lg md:text-xl mt-1 text-gray-600 font-medium">
              Sri Ramakrishna Engineering College
            </p>
            <p className="text-base md:text-lg mt-0.5 text-gray-500 italic">
              Smart Printing Solutions for Students
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full bg-white bg-opacity-95 rounded-b-3xl shadow-2xl backdrop-blur-sm">
        <div className="p-6 md:p-10 w-full">
          
          {/* Authentication Error */}
          {apiError && apiError.includes('log in') && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-5 rounded-2xl mb-6 text-center">
              <div className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                🔐 Authentication Required
              </div>
              <div className="text-sm md:text-base text-gray-700">
                {apiError}
              </div>
            </div>
          )}
          
          {/* File Upload Section */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-6 rounded-2xl mb-6 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              📁 Upload Your Document
            </h3>
            <div className="bg-white bg-opacity-10 border-2 border-dashed border-white border-opacity-50 rounded-xl p-5 text-center cursor-pointer transition-all duration-300">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                disabled={submitting}
                className="w-full p-4 border-none rounded-xl text-base bg-white text-gray-800 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {fileName && (
                <div className="mt-2.5 text-sm text-gray-800 font-semibold bg-white bg-opacity-80 px-3 py-2 rounded-lg">
                  📄 Selected: {fileName}
                </div>
              )}
              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2.5">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing PDF pages... This may take a moment for large files.</span>
                </div>
              )}
            </div>
          </div>

          {totalPages > 0 && (
            <div className="bg-gradient-to-r from-green-400 to-blue-400 p-5 rounded-2xl mb-6 text-center text-white">
              <p className="m-0 text-2xl md:text-3xl font-bold flex items-center justify-center gap-2.5">
                <span className="text-3xl md:text-4xl">📋</span>
                Total Pages Detected: {totalPages}
              </p>
            </div>
          )}

          {/* Color Pages Selection */}
          {totalPages > 0 && (
            <div className="bg-gradient-to-r from-pink-400 to-yellow-300 p-5 rounded-2xl mb-6">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
                🎨 Color Printing Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-white mb-2">
                    Print Type:
                  </label>
                  <select 
                    value={printingType} 
                    onChange={(e) => setPrintingType(e.target.value)}
                    disabled={submitting}
                    className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="bw">⚫ All Black & White (₹1/page)</option>
                    <option value="colour">🌈 All Color (₹10/page)</option>
                    <option value="mixed">🎨 Mixed (Some pages in color)</option>
                    <option value="poster">📊 Poster Print (₹50/page)</option>
                  </select>
                </div>
                
                {printingType === 'mixed' && (
                  <div>
                    <label className="block text-base font-bold text-white mb-2">
                      Pages to Print in Color:
                    </label>
                    <input 
                      type="text" 
                      value={colorPages} 
                      onChange={(e) => setColorPages(e.target.value)}
                      placeholder="e.g., 1,3,5-8,12"
                      disabled={submitting}
                      className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-800 font-semibold bg-white bg-opacity-70 px-2 py-1 mt-1 rounded">
                      Format: Individual pages (1,3,5) or ranges (5-8)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {totalPages > 0 && (
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-5 rounded-2xl mb-6">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
                📝 Special Instructions
              </h3>
              <textarea 
                value={specialInstructions} 
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requirements? (e.g., specific paper quality, orientation, urgent delivery, etc.)"
                rows="3"
                disabled={submitting}
                className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="mt-3 text-sm bg-gray-800 bg-opacity-80 text-white p-3 rounded-lg">
                <p className="mb-2 font-bold">💡 <strong>Pro Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-100">
                  <li>For presentations: Request "High Quality Paper"</li>
                  <li>For reports: Mention "Professional Binding"</li>
                  <li>For urgent jobs: Write "URGENT - Need by [time]"</li>
                  <li>For duplex issues: Specify "Check page orientation"</li>
                </ul>
              </div>
            </div>
          )}

          {/* Printing Options */}
          {totalPages > 0 && (
            <div className="bg-gradient-to-r from-orange-300 to-red-300 p-6 rounded-2xl mb-6">
              <h3 className="text-xl md:text-2xl font-bold mb-5 text-gray-800 text-center">
                🎨 Customize Your Print Job
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-2">
                    📄 Print Side:
                  </label>
                  <select 
                    value={printingSide} 
                    onChange={(e) => setPrintingSide(e.target.value)}
                    disabled={submitting}
                    className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="single">📄 Single-sided</option>
                    <option value="double">📋 Double-sided (Eco-friendly)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-800 mb-2">
                    📚 Number of Copies:
                  </label>
                  <input 
                    type="number" 
                    value={numCopies} 
                    min="1" 
                    max="100"
                    onChange={(e) => setNumCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={submitting}
                    className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-800 mb-2">
                    🎯 Binding Options:
                  </label>
                  <select 
                    value={finishingOption} 
                    onChange={(e) => setFinishingOption(e.target.value)}
                    disabled={submitting}
                    className="w-full p-3 border-none rounded-xl text-base bg-white text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="none">📎 No Binding</option>
                    <option value="spiral">🌀 Spiral Binding (+₹40)</option>
                    <option value="caligo">📘 Caligo Binding (+₹60)</option>
                    <option value="stickfile">📁 Stick File (+₹15)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Cost Display */}
          {totalCost && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl mb-6 text-white text-center">
              <div className="text-3xl md:text-4xl font-bold mb-4">
                💰 Total Cost: ₹{totalCost}
              </div>
              <div className="text-sm md:text-base leading-relaxed bg-gray-800 bg-opacity-90 text-white p-4 rounded-xl">
                <div className="mb-2">
                  📄 Pages: {printingSide === 'double' ? Math.ceil(totalPages / 2) : totalPages} × 
                  {printingType === 'mixed' ? ' Mixed Pricing' : 
                   ` ₹${printingType === 'bw' ? '1' : printingType === 'colour' ? '10' : '50'}`} × {numCopies} copies
                </div>
                {printingType === 'mixed' && colorPages && (
                  <div className="mb-2 text-yellow-200">
                    🎨 Color pages: {parsePageNumbers(colorPages).join(', ')} (₹10 each)
                  </div>
                )}
                {finishingOption !== 'none' && (
                  <div className="mb-2 text-blue-200">🎯 Binding: +₹{finishingOption === 'spiral' ? '40' : finishingOption === 'caligo' ? '60' : '15'}</div>
                )}
                {printingSide === 'double' && (
                  <div className="text-green-300 font-bold">♻ Eco-friendly double-sided printing saves paper!</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <button 
              onClick={handleSubmit}
              disabled={totalPages === 0 || loading || submitting || !getAuthToken()}
              className={`flex-1 min-w-[200px] p-5 border-none rounded-xl text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg ${
                totalPages === 0 || loading || submitting || !getAuthToken()
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  🚀 Submitting...
                </div>
              ) : loading ? '⏳ Processing...' : '🚀 Submit Print Job'}
            </button>
            <button 
              onClick={resetForm}
              disabled={submitting}
              className="flex-1 min-w-[200px] p-5 bg-gradient-to-r from-orange-300 to-red-300 text-gray-800 border-none rounded-xl text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Start Over
            </button>
          </div>

          {/* API Success Message */}
          {submitSuccess && orderDetails && (
            <div className="bg-gradient-to-r from-green-400 to-blue-400 p-6 rounded-2xl mb-6 text-center text-white">
              <div className="text-2xl md:text-3xl font-bold text-green-800 mb-3">
                ✅ Print Job Submitted Successfully!
              </div>
              <div className="text-sm md:text-base text-green-800 bg-green-100 bg-opacity-80 p-4 rounded-xl">
                <strong>Order ID:</strong> {orderDetails.orderId}<br/>
                <strong>Document:</strong> {orderDetails.originalFileName}<br/>
                <strong>Pages:</strong> {orderDetails.totalPages}<br/>
                <strong>Copies:</strong> {orderDetails.numCopies}<br/>
                <strong>Print Type:</strong> {orderDetails.printingType.toUpperCase()}<br/>
                <strong>Print Side:</strong> {orderDetails.printingSide}<br/>
                <strong>Binding:</strong> {orderDetails.finishingOption}<br/>
                {orderDetails.colorPages && (
                  <>
                    <strong>Color Pages:</strong> {orderDetails.colorPages}<br/>
                  </>
                )}
                {orderDetails.specialInstructions && (
                  <>
                    <strong>Special Instructions:</strong> {orderDetails.specialInstructions}<br/>
                  </>
                )}
                <strong>Total Cost:</strong> ₹{orderDetails.totalCost}<br/>
                <strong>Status:</strong> {orderDetails.status.toUpperCase()}<br/>
                <strong>Submitted:</strong> {new Date(orderDetails.submittedAt).toLocaleString()}<br/><br/>
                📍 Please collect your documents from the SREC Xerox Center within 24 hours.<br/>
                💡 Show this Order ID at the counter for quick service.<br/>
                📧 You can track your order status in your dashboard.
              </div>
            </div>
          )}

          {/* Legacy Success Message (fallback) */}
          {submitted && !submitSuccess && (
            <div className="bg-gradient-to-r from-green-400 to-blue-400 p-6 rounded-2xl mb-6 text-center text-white">
              <div className="text-2xl md:text-3xl font-bold text-green-800 mb-3">
                ✅ Print Job Prepared Successfully!
              </div>
              <div className="text-sm md:text-base text-green-800 bg-green-100 bg-opacity-80 p-4 rounded-xl">
                <strong>Document:</strong> {fileName}<br/>
                <strong>Pages:</strong> {totalPages}<br/>
                <strong>Copies:</strong> {numCopies}<br/>
                {printingType === 'mixed' && colorPages && (
                  <>
                    <strong>Color Pages:</strong> {parsePageNumbers(colorPages).join(', ')}<br/>
                  </>
                )}
                {specialInstructions && (
                  <>
                    <strong>Special Instructions:</strong> {specialInstructions}<br/>
                  </>
                )}
                <strong>Total Cost:</strong> ₹{totalCost}<br/><br/>
                📍 Please submit this job through the proper authentication system.
              </div>
            </div>
          )}

         {/* Error Messages */}
          {error && (
            <div className="bg-gradient-to-r from-red-400 to-pink-400 p-5 rounded-2xl text-center text-white mb-6">
              <div className="text-xl md:text-2xl font-bold mb-2">
                ❌ Error
              </div>
              <div className="text-sm md:text-base">
                {error}
              </div>
            </div>
          )}

          {/* API Error Messages */}
          {apiError && !apiError.includes('log in') && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 rounded-2xl text-center text-white mb-6">
              <div className="text-xl md:text-2xl font-bold mb-2">
                🚫 Submission Error
              </div>
              <div className="text-sm md:text-base">
                {apiError}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl text-gray-800">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
              📞 Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold mb-2">📍 Visit Us</div>
                <div className="text-sm">
                  SREC Xerox Center<br/>
                  Sri Ramakrishna Engineering College<br/>
                  Vattamalaipalayam, Coimbatore
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold mb-2">📞 Contact</div>
                <div className="text-sm">
                  Phone: +91 422 2461568<br/>
                  Email: xerox@srec.ac.in<br/>
                  Hours: 9:00 AM - 5:00 PM
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>💡 Quick Tips:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Upload clear, high-quality PDF files for best results</li>
                <li>Double-sided printing saves money and is eco-friendly</li>
                <li>For large jobs (50+ pages), consider visiting in person</li>
                <li>Payment can be made at the counter during collection</li>
                <li>Keep your Order ID safe for quick service</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© 2025 SREC Digital Xerox | Smart Printing Solutions</p>
            <p className="mt-1">Powered by Innovation • Built for Students</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XeroxAutomation;