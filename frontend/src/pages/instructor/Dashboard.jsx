import InstructorSidebar from '../../components/instructor/InstructorSidebar';

const InstructorDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <InstructorSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Instructor dashboard - To be implemented
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
