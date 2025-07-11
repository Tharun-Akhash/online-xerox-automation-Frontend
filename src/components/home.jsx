import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Store, Users, Shield, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Authentication",
      description: "Protected login system with role-based access"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-User Support",
      description: "Separate portals for students and shopkeepers"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Easy Registration",
      description: "Quick and simple registration process"
    }
  ];

  const handleStudentLogin = () => {
    navigate('/login');
  };

  const handleStudentRegister = () => {
    navigate('/register');
  };

  const handleShopkeeperLogin = () => {
    navigate('/shoplogin');
  };

  const handleShopkeeperRegister = () => {
    navigate('/shopregister');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-fade-in">
            SREC Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Welcome to Sri Ramakrishna Engineering College Portal - Your gateway to seamless campus services
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-blue-400 mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Login Options */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Choose Your Portal</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Login Card */}
            <div 
              className={`bg-white/10 backdrop-blur-lg rounded-3xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                selectedRole === 'student' ? 'ring-4 ring-blue-400 bg-white/20' : 'hover:bg-white/20'
              }`}
              onClick={() => setSelectedRole(selectedRole === 'student' ? null : 'student')}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Student Portal</h3>
                <p className="text-gray-300 mb-6">Access your academic resources and campus services</p>
                
                {selectedRole === 'student' && (
                  <div className="space-y-4 animate-fade-in">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentLogin();
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Student Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentRegister();
                      }}
                      className="w-full bg-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      Register as Student
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Shopkeeper Login Card */}
            <div 
              className={`bg-white/10 backdrop-blur-lg rounded-3xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                selectedRole === 'shopkeeper' ? 'ring-4 ring-purple-400 bg-white/20' : 'hover:bg-white/20'
              }`}
              onClick={() => setSelectedRole(selectedRole === 'shopkeeper' ? null : 'shopkeeper')}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Store className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Shopkeeper Portal</h3>
                <p className="text-gray-300 mb-6">Manage your shop and connect with students</p>
                
                {selectedRole === 'shopkeeper' && (
                  <div className="space-y-4 animate-fade-in">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShopkeeperLogin();
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Shopkeeper Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShopkeeperRegister();
                      }}
                      className="w-full bg-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      Register as Shopkeeper
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p>&copy; 2025 Sri Ramakrishna Engineering College. All rights reserved.</p>
        </div>
      </div>

      {/* <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style> */}
      
    </div>
  );
}