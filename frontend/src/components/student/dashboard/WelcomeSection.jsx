import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Welcome Banner Component
 * Displays personalized greeting with gradient background
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user object
 */
const WelcomeSection = ({ user }) => {
  const navigate = useNavigate();
  
  // Extract first name and get initials
  const firstName = user?.name?.split(' ')[0] || 'John';
  const getInitials = (name) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Format current date
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  const handleStartPractice = () => {
    navigate('/student/assessments');
  };

  return (
    <div 
      className="rounded-2xl shadow-sm mb-8"
      style={{
        background: 'linear-gradient(135deg, #5B5FEF 0%, #4845EF 100%)',
        padding: '40px 48px'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Avatar + Greeting */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div 
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center font-bold"
            style={{ 
              color: '#5B5FEF',
              fontSize: '32px'
            }}
          >
            {getInitials(user?.name)}
          </div>
          
          {/* Greeting Text */}
          <div>
            <h1 
              className="font-bold text-white mb-1"
              style={{ 
                fontSize: '32px',
                lineHeight: '1.2'
              }}
            >
              Welcome back, {user?.name || 'John Doe'}!
            </h1>
            <p 
              className="text-white"
              style={{ 
                fontSize: '14px',
                opacity: 0.9
              }}
            >
              {currentDate}
            </p>
          </div>
        </div>

        {/* Right Section - CTA Button */}
        <button
          onClick={handleStartPractice}
          className="flex items-center gap-2 bg-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
          style={{
            color: '#5B5FEF',
            padding: '12px 24px',
            fontSize: '14px'
          }}
          aria-label="Start practice test"
        >
          <PlayCircle className="w-[18px] h-[18px]" />
          <span>Start Practice</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeSection;
