import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
};

// Create context with default values
const AppContext = createContext<AppContextType | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setTasks(data.tasks || []);
          setHabits(data.habits || []);
          setWorkouts(data.workouts || []);
          setEvents(data.events?.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endTime: event.endTime ? new Date(event.endTime) : undefined
          })) || []);
        } else {
          // Initialize the document if it doesn't exist
          await setDoc(userDocRef, {
            tasks: [],
            habits: [],
            workouts: [],
            events: [],
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Save data to Firestore whenever it changes
  useEffect(() => {
    const saveUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          tasks,
          habits,
          workouts,
          events: events.map(event => ({
            ...event,
            date: event.date.toISOString(),
            endTime: event.endTime?.toISOString()
          })),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (user) {
        saveUserData();
      }
    }, 1000); // Debounce saves to avoid too many writes

    return () => clearTimeout(debounceTimeout);
  }, [user, tasks, habits, workouts, events]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: crypto.randomUUID() };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit = { ...habit, id: crypto.randomUUID() };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id: string, habit: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...habit } : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workout, id: crypto.randomUUID() };
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const updateWorkout = (id: string, workout: Partial<Workout>) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...workout } : w));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, event: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const value = {
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
    addEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
