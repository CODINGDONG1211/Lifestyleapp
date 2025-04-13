import React from 'react';
import Navbar from '@/components/Navbar';
import DailyPlanner from '@/components/DailyPlanner';
import HabitTracker from '@/components/HabitTracker';
import WorkoutTracker from '@/components/WorkoutTracker';
import AnalyticsSummary from '@/components/AnalyticsSummary';
import { AppProvider } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Calendar, Dumbbell, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to LifeHub
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks, habits, and workouts all in one place.
            </p>
          </div>

          {/* Desktop view: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <DailyPlanner />
              <HabitTracker />
            </div>
            <div className="space-y-6">
              <WorkoutTracker />
            </div>
          </div>

          {/* Mobile view: Tabs layout */}
          <div className="md:hidden">
            <Tabs defaultValue="tasks">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="tasks" className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Habits</span>
                </TabsTrigger>
                <TabsTrigger value="workouts" className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">Workouts</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tasks">
                <DailyPlanner />
              </TabsContent>
              <TabsContent value="habits">
                <HabitTracker />
              </TabsContent>
              <TabsContent value="workouts">
                <WorkoutTracker />
              </TabsContent>
              <TabsContent value="analytics">
                <AnalyticsSummary />
              </TabsContent>
            </Tabs>
          </div>

          {/* Analytics section (for desktop, hidden on mobile) */}
          <div className="hidden md:block mt-8">
            <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
            <AnalyticsSummary />
          </div>
        </main>
      </div>
    </AppProvider>
  );
};

export default Index;
