
import React from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Scheduler from '@/components/Scheduler';

const SchedulerPage = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Scheduler isWidget={false} />
      </div>
    </AppProvider>
  );
};

export default SchedulerPage;
