
import React, { useState } from 'react';
import { useAppContext, Task } from '@/context/AppContext';
import { 
  PlusCircle, 
  CheckCircle2, 
  Circle, 
  Edit, 
  Trash2,
  Flag,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';

const DailyPlanner = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarView, setIsCalendarView] = useState(false);

  const filteredTasks = isCalendarView 
    ? tasks.filter(task => 
        new Date(task.date).toDateString() === selectedDate.toDateString()
      )
    : tasks.filter(task => 
        new Date(task.date).toDateString() === new Date().toDateString()
      );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        date: isCalendarView ? selectedDate.toISOString() : new Date().toISOString(),
      });
      setNewTaskTitle('');
      setNewTaskPriority('medium');
    }
  };

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editingTaskTitle.trim()) {
      updateTask(taskId, { title: editingTaskTitle });
    }
    setEditingTaskId(null);
  };

  const handleChangePriority = (taskId: string, priority: 'low' | 'medium' | 'high') => {
    updateTask(taskId, { priority });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Count tasks per day for calendar highlighting
  const getDayTaskCount = (date: Date) => {
    const formattedDate = date.toDateString();
    return tasks.filter(task => new Date(task.date).toDateString() === formattedDate).length;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold flex items-center">
          Daily Tasks
          {isCalendarView && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 flex items-center gap-1"
              >
                <CalendarIcon size={16} />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                modifiers={{
                  hasTasks: (date) => getDayTaskCount(date) > 0
                }}
                modifiersStyles={{
                  hasTasks: { backgroundColor: 'rgba(14, 165, 233, 0.1)', fontWeight: 'bold' }
                }}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button 
            size="sm" 
            variant={isCalendarView ? "default" : "outline"}
            onClick={() => setIsCalendarView(!isCalendarView)}
            className="h-8"
          >
            {isCalendarView ? "Today's Tasks" : "Calendar View"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow"
          />
          <Select 
            value={newTaskPriority} 
            onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="flex items-center gap-1">
            <PlusCircle size={18} /> Add
          </Button>
        </form>

        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks {isCalendarView ? 'for this day' : 'for today'}. Add some tasks to get started.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-md 
                  border ${task.completed ? 'bg-muted/50 line-through text-muted-foreground' : 'bg-card'}`}
              >
                <div className="flex items-center gap-2 flex-grow">
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="focus:outline-none"
                  >
                    {task.completed ? 
                      <CheckCircle2 className="h-5 w-5 text-primary" /> : 
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    }
                  </button>

                  {editingTaskId === task.id ? (
                    <Input
                      type="text"
                      value={editingTaskTitle}
                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                      autoFocus
                      className="flex-grow"
                    />
                  ) : (
                    <span className="flex-grow">{task.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                  
                  {!task.completed && (
                    <Select 
                      value={task.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        handleChangePriority(task.id, value)
                      }
                    >
                      <SelectTrigger className="h-7 w-[90px] text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {!task.completed && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPlanner;
