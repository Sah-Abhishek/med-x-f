import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
