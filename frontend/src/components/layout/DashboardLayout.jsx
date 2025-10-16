import React from 'react';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Top Navbar */}
      <TopNavbar />
      
      {/* Main Content - Dynamic margin based on body class */}
      <main 
        id="main-content"
        className="mt-16 min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginLeft: 'var(--sidebar-margin, 0px)'
        }}
      >
        <div className="p-6 md:p-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DashboardLayout;
