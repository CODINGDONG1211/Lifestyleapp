
import React, { useState } from 'react';
import { useAppContext, Task } from '@/context/AppContext';
import { 
  PlusCircle, 
  CheckCircle2, 
  Circle, 
  Edit, 
  Trash2,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const DailyPlanner = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const todayTasks = tasks.filter(task => 
    new Date(task.date).toDateString() === new Date().toDateString()
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        date: new Date().toISOString(),
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          Daily Tasks
        </CardTitle>
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
          {todayTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks for today. Add some tasks to get started.
            </div>
          ) : (
            todayTasks.map((task) => (
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
