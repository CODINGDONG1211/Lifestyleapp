import React, { useState } from 'react';
import { useAppContext, Workout, Exercise } from '@/context/AppContext';
import { exercises } from '@/data/exercises';
import { 
  Plus, 
  Trash2, 
  Dumbbell, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  FileDown,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from '@/hooks/use-toast';

// Convert exercises data to combobox options format
const exerciseOptions = exercises.map(exercise => ({
  value: exercise.name,
  label: exercise.name,
  category: exercise.category + (exercise.subcategory ? ` - ${exercise.subcategory}` : '')
}));

const WorkoutTracker = () => {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([
    { name: '', sets: 3, reps: 10, weight: 0 }
  ]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  
  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0 }]);
  };
  
  const handleExerciseChange = (index: number, field: keyof Omit<Exercise, 'id'>, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: field === 'name' ? value : Number(value)
    };
    setExercises(newExercises);
  };
  
  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };
  
  const handleAddWorkout = () => {
    if (newWorkoutName.trim() && exercises.length > 0 && exercises[0].name.trim()) {
      if (editingWorkout) {
        updateWorkout(editingWorkout.id, {
          name: newWorkoutName,
          exercises: exercises.map((ex, i) => ({
            ...ex,
            id: editingWorkout.exercises[i]?.id || Date.now().toString() + i
          })),
        });
      } else {
        addWorkout({
          date: new Date().toISOString(),
          name: newWorkoutName,
          exercises: exercises.map((ex, i) => ({
            ...ex,
            id: Date.now().toString() + i
          })),
          completed: false
        });
      }
      resetForm();
      setIsDialogOpen(false);
    }
  };
  
  const resetForm = () => {
    setNewWorkoutName('');
    setExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
    setEditingWorkout(null);
  };
  
  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setNewWorkoutName(workout.name);
    setExercises(workout.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight
    })));
    setIsDialogOpen(true);
  };
  
  const handleToggleComplete = (workout: Workout) => {
    updateWorkout(workout.id, { completed: !workout.completed });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Export workout data as CSV
  const exportWorkoutData = (workout: Workout) => {
    const headers = ['Exercise', 'Sets', 'Reps', 'Weight'];
    const csvContent = [
      headers.join(','),
      ...workout.exercises.map(exercise => 
        `${exercise.name},${exercise.sets},${exercise.reps},${exercise.weight}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${workout.name.replace(/\s+/g, '-')}_${formatDate(workout.date).replace(/,\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Workout Exported",
      description: `${workout.name} data has been downloaded as CSV`,
    });
  };

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Generate a simple progress graph (for demonstration)
  const renderProgressGraph = (workout: Workout) => {
    const maxWeight = Math.max(...workout.exercises.map(ex => ex.weight));
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress Overview</span>
          <BarChart2 size={16} className="text-primary" />
        </div>
        <div className="space-y-1">
          {workout.exercises.map(ex => {
            const percentage = Math.round((ex.weight / (maxWeight || 1)) * 100);
            return (
              <div key={ex.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{ex.name}</span>
                  <span>{ex.weight}kg</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          Workout Tracker
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={resetForm}
            >
              <Plus size={16} /> Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWorkout ? 'Edit Workout' : 'Create New Workout'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid gap-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g., Upper Body"
                />
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleAddExercise}
                    className="flex items-center gap-1 h-8"
                  >
                    <Plus size={14} /> Add Exercise
                  </Button>
                </div>
                
                {exercises.map((exercise, index) => (
                  <div 
                    key={index}
                    className="grid gap-3 p-3 border rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Exercise {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`exercise-name-${index}`} className="text-xs">
                        Name
                      </Label>
                      <Combobox
                        options={exerciseOptions}
                        value={exercise.name}
                        onSelect={(value) => handleExerciseChange(index, 'name', value)}
                        placeholder="Search exercises..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor={`exercise-sets-${index}`} className="text-xs">Sets</Label>
                        <Input
                          id={`exercise-sets-${index}`}
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exercise-reps-${index}`} className="text-xs">Reps</Label>
                        <Input
                          id={`exercise-reps-${index}`}
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exercise-weight-${index}`} className="text-xs">Weight (kg)</Label>
                        <Input
                          id={`exercise-weight-${index}`}
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWorkout}>
                {editingWorkout ? 'Save Changes' : 'Create Workout'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No workouts yet. Start by creating your first workout plan!
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion type="multiple" className="space-y-2">
              {sortedWorkouts.map((workout) => (
                <AccordionItem
                  key={workout.id}
                  value={workout.id}
                  className={`border rounded-md ${
                    workout.completed ? 'border-green-200 bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center px-4">
                    <AccordionTrigger className="flex-1 py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-base">
                          {workout.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(workout.date)} • {workout.exercises.length} exercises
                        </span>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 px-2 ${
                          workout.completed 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' 
                            : ''
                        }`}
                        onClick={() => handleToggleComplete(workout)}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        {workout.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkout(workout);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportWorkoutData(workout);
                        }}
                      >
                        <FileDown size={16} className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkout(workout.id);
                        }}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="p-4 pt-0 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex flex-col p-3 border rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <Dumbbell size={16} className="text-primary" />
                              <span className="font-medium">{exercise.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Sets:</span>{' '}
                                <span className="font-medium">{exercise.sets}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reps:</span>{' '}
                                <span className="font-medium">{exercise.reps}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Weight:</span>{' '}
                                <span className="font-medium">{exercise.weight}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {renderProgressGraph(workout)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutTracker;
