import React, { useState } from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomStatusBar } from './components/layout/BottomStatusBar';
import { DemoModeBar } from './components/layout/DemoModeBar';
import { DashboardPage } from './components/pages/DashboardPage';
import { SensorsPage } from './components/pages/SensorsPage';
import { EquipmentPage } from './components/pages/EquipmentPage';
import { CommunicationPage } from './components/pages/CommunicationPage';
import { ProtectionPage } from './components/pages/ProtectionPage';
import { DataLogsPage } from './components/pages/DataLogsPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { EquipmentDetailModal } from './components/common/EquipmentDetailModal';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab } = useTelemetry();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'communication':
        return <CommunicationPage />;
      case 'protection':
        return <ProtectionPage />;
      case 'logs':
        return <DataLogsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-ladakh-darkest text-slate-100 flex flex-col cockpit-grid">
      {/* HUD Cockpit Header */}
      <Header />

      {/* Interactive SIH Demo Mode Scenario Bar */}
      <DemoModeBar />

      {/* Mobile Navigation Drawer Trigger */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-cyan-500/20">
        <span className="text-xs font-hud font-bold text-cyan-400 uppercase">
          NAVIGATION: {activeTab.toUpperCase()}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Dropdown Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-36 z-40 bg-black/80 backdrop-blur-md">
            <div className="p-4" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Scrollable Page Viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Universal Equipment Detailed Inspection Modal */}
      <EquipmentDetailModal />

      {/* Persistent Bottom Avionics Status Bar */}
      <BottomStatusBar />
    </div>
  );
};

export function App() {
  return (
    <TelemetryProvider>
      <MainLayout />
    </TelemetryProvider>
  );
}

export default App;
