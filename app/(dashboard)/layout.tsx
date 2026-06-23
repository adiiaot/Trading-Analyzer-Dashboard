import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6 bg-bg-primary">
          {children}
        </div>
      </div>
    </div>
  );
}
