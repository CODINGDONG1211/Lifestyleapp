import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

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

// Type for event data stored in Firestore
type StoredEvent = Omit<Event, 'date' | 'endTime'> & {
  date: string;
  endTime?: string;
};

// Update context type to include loading state
type AppContextType = {
  tasks: Task[];
  habits: Habit[];
  workouts: Workout[];
  events: Event[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Set up real-time listener for user data
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupUserDataListener = async () => {
      if (!user) {
        setTasks([]);
        setHabits([]);
        setWorkouts([]);
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // First, get the initial data
        const initialDoc = await getDoc(userDocRef);
        if (!initialDoc.exists()) {
          // Initialize the document if it doesn't exist
          await setDoc(userDocRef, {
            tasks: [],
            habits: [],
            workouts: [],
            events: [],
            updatedAt: new Date().toISOString()
          });
        } else {
          // Set initial data
          const data = initialDoc.data();
          setTasks(data.tasks || []);
          setHabits(data.habits || []);
          setWorkouts(data.workouts || []);
          setEvents(data.events?.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endTime: event.endTime ? new Date(event.endTime) : undefined
          })) || []);
        }

        // Set up real-time listener for updates
        unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.tasks) setTasks(data.tasks);
            if (data.habits) setHabits(data.habits);
            if (data.workouts) setWorkouts(data.workouts);
            if (data.events) {
              setEvents(data.events.map((event: any) => ({
                ...event,
                date: new Date(event.date),
                endTime: event.endTime ? new Date(event.endTime) : undefined
              })));
            }
          }
          setLoading(false);
        }, (error) => {
          console.error('Error in snapshot listener:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up user data listener:', error);
        setLoading(false);
      }
    };

    setupUserDataListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Helper function to save data
  const saveUserData = async (data: Partial<{
    tasks: Task[],
    habits: Habit[],
    workouts: Workout[],
    events: StoredEvent[]
  }>) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  // Update all operations to be async and directly save to Firestore
  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: crypto.randomUUID() };
    const updatedTasks = [...tasks, newTask];
    await saveUserData({ tasks: updatedTasks });
    setTasks(updatedTasks); // Update local state immediately
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...task } : t);
    await saveUserData({ tasks: updatedTasks });
    setTasks(updatedTasks); // Update local state immediately
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    await saveUserData({ tasks: updatedTasks });
    setTasks(updatedTasks); // Update local state immediately
  };

  const addHabit = async (habit: Omit<Habit, 'id'>) => {
    const newHabit = { ...habit, id: crypto.randomUUID() };
    const updatedHabits = [...habits, newHabit];
    await saveUserData({ habits: updatedHabits });
    setHabits(updatedHabits); // Update local state immediately
  };

  const updateHabit = async (id: string, habit: Partial<Habit>) => {
    const updatedHabits = habits.map(h => h.id === id ? { ...h, ...habit } : h);
    await saveUserData({ habits: updatedHabits });
    setHabits(updatedHabits); // Update local state immediately
  };

  const deleteHabit = async (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    await saveUserData({ habits: updatedHabits });
    setHabits(updatedHabits); // Update local state immediately
  };

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    const newWorkout = { ...workout, id: crypto.randomUUID() };
    const updatedWorkouts = [...workouts, newWorkout];
    await saveUserData({ workouts: updatedWorkouts });
    setWorkouts(updatedWorkouts); // Update local state immediately
  };

  const updateWorkout = async (id: string, workout: Partial<Workout>) => {
    const updatedWorkouts = workouts.map(w => w.id === id ? { ...w, ...workout } : w);
    await saveUserData({ workouts: updatedWorkouts });
    setWorkouts(updatedWorkouts); // Update local state immediately
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    await saveUserData({ workouts: updatedWorkouts });
    setWorkouts(updatedWorkouts); // Update local state immediately
  };

  const addEvent = async (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    const updatedEvents = [...events, newEvent];
    const eventsToSave: StoredEvent[] = updatedEvents.map(e => ({
      ...e,
      date: e.date.toISOString(),
      endTime: e.endTime?.toISOString()
    }));
    await saveUserData({ events: eventsToSave });
    setEvents(updatedEvents); // Update local state immediately
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    const updatedEvents = events.map(e => e.id === id ? { ...e, ...event } : e);
    const eventsToSave: StoredEvent[] = updatedEvents.map(e => ({
      ...e,
      date: e.date.toISOString(),
      endTime: e.endTime?.toISOString()
    }));
    await saveUserData({ events: eventsToSave });
    setEvents(updatedEvents); // Update local state immediately
  };

  const deleteEvent = async (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    const eventsToSave: StoredEvent[] = updatedEvents.map(e => ({
      ...e,
      date: e.date.toISOString(),
      endTime: e.endTime?.toISOString()
    }));
    await saveUserData({ events: eventsToSave });
    setEvents(updatedEvents); // Update local state immediately
  };

  const value = {
        tasks,
        habits,
        workouts,
    events,
    loading,
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

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
