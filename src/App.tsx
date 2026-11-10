import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ERPModuleId, UserRole } from './types';
import { ERPProvider, useERP } from './context/ERPContext';
import { DashboardLayoutProvider } from './context/DashboardLayoutContext';
import { Sidebar, navItems } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CommandDialog } from './components/layout/CommandDialog';
import { AICampusAssistant } from './components/ai/AICampusAssistant';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { pageTransitionVariants } from './utils/motion';

// Module Components
import { StudentsModule } from './components/modules/StudentsModule';
import { FacultyModule } from './components/modules/FacultyModule';
import { AdmissionsModule } from './components/modules/AdmissionsModule';
import { AcademicsModule } from './components/modules/AcademicsModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { TimetableModule } from './components/modules/TimetableModule';
import { ExamsModule } from './components/modules/ExamsModule';
import { ResultsModule } from './components/modules/ResultsModule';
import { StudentPerformanceAnalyticsDashboard } from './components/modules/performance/StudentPerformanceAnalyticsDashboard';
import { FinanceModule } from './components/modules/FinanceModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { HostelModule } from './components/modules/HostelModule';
import { HRModule } from './components/modules/HRModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { UserFilesModule } from './components/modules/UserFilesModule';
import { ProfileModule } from './components/modules/ProfileModule';
import { AuthScreen } from './components/auth/AuthScreen';
import { CampusSkeletonPreview } from './components/common/CampusSkeletonPreview';
import { SetNewPasswordScreen } from './components/auth/SetNewPasswordScreen';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { GradientGreyBackground } from './components/common/GradientGreyBackground';

function ERPAppContent() {
  const { role, currentUser, setRole, firebaseUser, isAuthLoading } = useERP();
  const network = useNetworkStatus();
  const [currentModule, setCurrentModule] = useState<ERPModuleId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const mainViewportRef = useRef<HTMLElement>(null);

  // Check URL query parameters for legitimate password reset authorization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'resetPassword') {
        setResetPasswordEmail(params.get('email') || '');
        setResetPasswordToken(params.get('token') || '');
      }
    }
  }, []);

  // Stable navigation handler to prevent unnecessary re-renders of children
  const handleSelectModule = React.useCallback((mod: ERPModuleId) => {
    setCurrentModule(mod);
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When role changes, ensure the user isn't stuck on a disallowed module
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const targetItem = navItems.find((item) => item.id === currentModule);
    if (targetItem && !targetItem.roles.includes(newRole)) {
      setCurrentModule('dashboard');
    }
  };

  // Legitimate Password Reset flow from email link
  if (resetPasswordEmail !== null) {
    return (
      <SetNewPasswordScreen
        email={resetPasswordEmail}
        token={resetPasswordToken || ''}
        onComplete={() => {
          setResetPasswordEmail(null);
          setResetPasswordToken(null);
          if (typeof window !== 'undefined') {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }}
      />
    );
  }

  // Offline or Weak Network Detection Before Loading / Streaming Page
  if (!network.isOnline) {
    return (
      <CampusSkeletonPreview
        reason="offline"
        onRetry={network.recheckConnection}
        onDismiss={() => network.setSimulatedWeakConnection(false)}
      />
    );
  }

  // Loading state while checking Firebase Auth / streaming initial records
  if (isAuthLoading) {
    return (
      <CampusSkeletonPreview
        reason="loading"
        onRetry={network.recheckConnection}
      />
    );
  }

  // Gate ERP behind Firebase sign-in / sign-up
  if (!firebaseUser) {
    return <AuthScreen />;
  }

  const renderModuleContent = () => {
    // Role protection check
    const currentNavItem = navItems.find((item) => item.id === currentModule);
    if (currentNavItem && !currentNavItem.roles.includes(role)) {
      return (
        <OverviewDashboard
          onNavigate={handleSelectModule}
          onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
        />
      );
    }

    switch (currentModule) {
      case 'dashboard':
        return (
          <OverviewDashboard
            onNavigate={handleSelectModule}
            onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
          />
        );
      case 'profile':
        return <ProfileModule />;
      case 'students':
        return <StudentsModule />;
      case 'faculty':
        return <FacultyModule />;
      case 'admissions':
        return <AdmissionsModule />;
      case 'academics':
        return <AcademicsModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'exams':
        return <ExamsModule />;
      case 'results':
        return <ResultsModule />;
      case 'performance':
        return <StudentPerformanceAnalyticsDashboard onNavigate={handleSelectModule} />;
      case 'finance':
        return <FinanceModule />;
      case 'library':
        return <LibraryModule />;
      case 'hostel':
        return <HostelModule />;
      case 'hr':
        return <HRModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'userfiles':
        return <UserFilesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule onNavigate={handleSelectModule} />;
      default:
        return (
          <OverviewDashboard
            onNavigate={handleSelectModule}
            onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
          />
        );
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#181b20] font-sans text-slate-900 dark:text-[#f8fafc] antialiased selection:bg-[#29a19c]/40 selection:text-white transition-colors duration-200">
      {/* Background Gradient Shade Effect: Dark Grey & Light Grey */}
      <GradientGreyBackground />

      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        role={role}
      />

      {/* Main App Workspace */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-transparent transition-colors duration-200">
        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          onOpenSearch={() => setIsCommandOpen(true)}
          onToggleAiDrawer={() => setIsAiDrawerOpen((prev) => !prev)}
          currentModule={currentModule}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onSelectModule={handleSelectModule}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Module Canvas Area */}
        <main
          ref={mainViewportRef}
          id="main-module-viewport"
          className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 pb-24 md:pb-6 bg-transparent dark:bg-transparent transition-colors duration-200"
        >
          <div className="max-w-[1440px] mx-auto space-y-4 md:space-y-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentModule}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {renderModuleContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Persistent Bottom Navigation Bar on Mobile View */}
        <MobileBottomNav
          currentModule={currentModule}
          onSelectModule={handleSelectModule}
          onOpenAiCopilot={() => setIsAiDrawerOpen(true)}
        />
      </div>

      {/* Global Command Palette Dialog (Cmd/Ctrl + K) */}
      <CommandDialog
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectModule={(mod) => setCurrentModule(mod)}
      />

      {/* AI Campus Assistant Drawer */}
      <AICampusAssistant
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <DashboardLayoutProvider>
        <ERPAppContent />
      </DashboardLayoutProvider>
    </ERPProvider>
  );
}
