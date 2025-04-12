
import React, { useState } from 'react';
import { useAppContext, Habit } from '@/context/AppContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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

const HabitTracker = () => {
  const { habits, addHabit, updateHabit, deleteHabit } = useAppContext();
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitColor, setNewHabitColor] = useState('#3B82F6');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Generate dates for the past week
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const handleAddHabit = () => {
    if (newHabitName.trim() && newHabitTarget > 0) {
      if (editingHabit) {
        updateHabit(editingHabit.id, {
          name: newHabitName,
          target: newHabitTarget,
          color: newHabitColor,
        });
      } else {
        addHabit({
          name: newHabitName,
          streak: 0,
          target: newHabitTarget,
          completedDays: [],
          color: newHabitColor,
        });
      }
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const resetForm = () => {
    setNewHabitName('');
    setNewHabitTarget(1);
    setNewHabitColor('#3B82F6');
    setEditingHabit(null);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setNewHabitTarget(habit.target);
    setNewHabitColor(habit.color);
    setIsDialogOpen(true);
  };

  const handleToggleDay = (habit: Habit, date: string) => {
    const isCompleted = habit.completedDays.includes(date);
    let newCompletedDays;
    
    if (isCompleted) {
      newCompletedDays = habit.completedDays.filter(d => d !== date);
    } else {
      newCompletedDays = [...habit.completedDays, date];
    }
    
    // Calculate new streak
    let streak = 0;
    const sortedDays = [...newCompletedDays].sort();
    const today = new Date().toISOString().split('T')[0];
    
    if (sortedDays.includes(today)) {
      streak = 1;
      let checkDate = new Date(today);
      
      // Check consecutive previous days
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevDate = checkDate.toISOString().split('T')[0];
        if (sortedDays.includes(prevDate)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    updateHabit(habit.id, {
      completedDays: newCompletedDays,
      streak,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          Habit Tracker
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => resetForm()}
            >
              <Plus size={16} /> Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Drink Water"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="habit-target">Daily Target</Label>
                <Input
                  id="habit-target"
                  type="number"
                  min="1"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="habit-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="habit-color"
                    type="color"
                    value={newHabitColor}
                    onChange={(e) => setNewHabitColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <div 
                    className="flex-1 rounded-md"
                    style={{ backgroundColor: newHabitColor }}
                  ></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHabit}>
                {editingHabit ? 'Save Changes' : 'Add Habit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No habits tracked yet. Add your first habit to start building streaks!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_repeat(7,_minmax(36px,_1fr))] gap-2 mb-2 px-2">
              <div></div>
              {pastDays.map((date) => (
                <div key={date} className="text-center text-xs font-medium">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                  <div className="text-xs font-normal">
                    {new Date(date).getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {habits.map((habit) => (
              <div 
                key={habit.id} 
                className="grid grid-cols-[1fr_repeat(7,_minmax(36px,_1fr))] gap-2 items-center p-2 rounded-md hover:bg-muted/50"
              >
                <div className="flex items-center justify-between pr-2">
                  <div>
                    <div className="font-medium" style={{ color: habit.color }}>
                      {habit.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">{habit.streak}</span> day streak
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleEditHabit(habit)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
                
                {pastDays.map((date) => {
                  const isCompleted = habit.completedDays.includes(date);
                  
                  return (
                    <button
                      key={date}
                      className={`streak-dot ${isCompleted ? 'streak-dot-completed' : 'streak-dot-empty'}`}
                      style={isCompleted ? { backgroundColor: habit.color } : {}}
                      onClick={() => handleToggleDay(habit, date)}
                    >
                      {isCompleted ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitTracker;
