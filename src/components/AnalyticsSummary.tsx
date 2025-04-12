
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { CheckCircle2, Circle, Dumbbell, Calendar } from 'lucide-react';

const AnalyticsSummary = () => {
  const { tasks, habits, workouts } = useAppContext();

  // Task statistics
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0;
  
  const taskPriorityData = [
    { name: 'High', value: tasks.filter(task => task.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(task => task.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(task => task.priority === 'low').length },
  ];
  
  // Habit statistics
  const habitStreakData = habits.map(habit => ({
    name: habit.name,
    streak: habit.streak,
    color: habit.color,
  }));
  
  // Workout statistics
  const workoutCompletionRate = workouts.length > 0
    ? Math.round((workouts.filter(workout => workout.completed).length / workouts.length) * 100)
    : 0;
  
  // Pie chart colors
  const PRIORITY_COLORS = ['#EF4444', '#F59E0B', '#10B981'];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <span className="font-medium">{tasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed Tasks</span>
              <span className="font-medium">{tasks.filter(task => task.completed).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-medium">{taskCompletionRate}%</span>
            </div>
          </div>
          
          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {taskPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Habit Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={habitStreakData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="streak" name="Current Streak (days)">
                    {habitStreakData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 text-muted-foreground">
              No habit data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Workout Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Total Workouts</div>
              <div className="text-2xl font-semibold mt-1">{workouts.length}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-semibold mt-1">
                {workouts.filter(w => w.completed).length}
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <div className="text-2xl font-semibold mt-1">{workoutCompletionRate}%</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-sm mb-2">Recent Workouts</h4>
            {workouts.length > 0 ? (
              <div className="space-y-2">
                {workouts
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-2">
                        {workout.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{workout.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No workout data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSummary;
