import React, { useState } from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';
import { WebGLBackground } from '../ui/WebGLBackground';
import { WorkoutModal } from '../workout/WorkoutModal';
import { mockUserProfile, mockActiveWorkout } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex w-full min-h-screen relative z-10 bg-background text-text-primary overflow-x-hidden">
      <WebGLBackground />

      <Sidebar 
        onStartWorkout={() => setIsWorkoutModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div 
        className={`flex-1 ${
          isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
        } flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-in-out max-w-full overflow-x-hidden`}
      >
        <Header user={user || mockUserProfile} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <WorkoutModal
        workout={mockActiveWorkout}
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />
    </div>
  );
};


