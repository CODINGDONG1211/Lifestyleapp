import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for our state
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  date: string;
};

export type Habit = {
  id: string;
  name: string;
  streak: number;
  target: number;
  completedDays: string[];
  color: string;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export type Workout = {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  completed: boolean;
};

export type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
  color?: string;
  endTime?: Date;
};

// Create context types
type AppContextType = {
  tasks: Task[];
  habits: Habit[];
  workouts: Workout[];
  events: Event[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  setEvents: (events: Event[]) => void;
};

// Create context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    completed: false,
    priority: 'high',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Go Grocery Shopping',
    completed: true,
    priority: 'medium',
    date: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Schedule Dentist Appointment',
    completed: false,
    priority: 'low',
    date: new Date().toISOString(),
  },
];

const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Drink Water',
    streak: 5,
    target: 8,
    completedDays: [
      new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    ],
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Read',
    streak: 3,
    target: 30,
    completedDays: [
      new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    ],
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Meditate',
    streak: 0,
    target: 10,
    completedDays: [],
    color: '#EC4899',
  },
];

const sampleWorkouts: Workout[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    name: 'Upper Body',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
      { id: '2', name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
      { id: '3', name: 'Shoulder Press', sets: 3, reps: 12, weight: 65 },
    ],
    completed: false,
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    name: 'Lower Body',
    exercises: [
      { id: '1', name: 'Squats', sets: 4, reps: 10, weight: 185 },
      { id: '2', name: 'Deadlifts', sets: 3, reps: 8, weight: 225 },
      { id: '3', name: 'Leg Press', sets: 3, reps: 12, weight: 270 },
    ],
    completed: true,
  },
];

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [workouts, setWorkouts] = useState<Workout[]>(sampleWorkouts);
  const [events, setEvents] = useState<Event[]>([]);

  // Task functions
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks([...tasks, newTask as Task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, ...updates } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Habit functions
  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit = { ...habit, id: Date.now().toString() };
    setHabits([...habits, newHabit as Habit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(habit => (habit.id === id ? { ...habit, ...updates } : habit)));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  // Workout functions
  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workout, id: Date.now().toString() };
    setWorkouts([...workouts, newWorkout as Workout]);
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(workouts.map(workout => (workout.id === id ? { ...workout, ...updates } : workout)));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        habits,
        workouts,
        events,
        addTask,
        updateTask,
        deleteTask,
        addHabit,
        updateHabit,
        deleteHabit,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        setEvents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
