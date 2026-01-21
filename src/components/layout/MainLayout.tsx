import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
