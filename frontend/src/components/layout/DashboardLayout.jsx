import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <Sidebar />
      <main 
        className="pt-16 pl-60 min-h-screen"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
