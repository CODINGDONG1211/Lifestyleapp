
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock 
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
};

type SchedulerProps = {
  isWidget?: boolean;
};

const Scheduler = ({ isWidget = true }: SchedulerProps) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    description: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>(isWidget ? 'month' : 'month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const handleAddEvent = () => {
    if (newEvent.title.trim() === '') return;
    
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
    };
    
    setEvents([...events, event]);
    setNewEvent({
      title: '',
      date: new Date(),
      description: '',
    });
    setIsDialogOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const selectedDayEvents = selected ? getEventsForDate(selected) : [];
  
  // Navigation handlers
  const handlePrevious = () => {
    if (currentView === 'day') {
      setCurrentViewDate(prev => addDays(prev, -1));
    } else if (currentView === 'week') {
      setCurrentViewDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentViewDate(prev => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'day') {
      setCurrentViewDate(prev => addDays(prev, 1));
    } else if (currentView === 'week') {
      setCurrentViewDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentViewDate(prev => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentViewDate(new Date());
  };

  // Render different calendar views
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentViewDate);
    
    return (
      <div className="border rounded-md p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            {format(currentViewDate, 'MMMM d, yyyy')}
          </h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 24 }).map((_, hour) => {
            const timeLabel = `${hour}:00`;
            const hourEvents = dayEvents.filter(event => {
              const eventHour = event.date.getHours();
              return eventHour === hour;
            });
            
            return (
              <div key={hour} className="grid grid-cols-[80px_1fr] border-t pt-2">
                <div className="text-sm text-muted-foreground">
                  {timeLabel}
                </div>
                <div>
                  {hourEvents.length > 0 ? (
                    hourEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="bg-primary/10 p-2 rounded-md mb-1 border-l-4 border-primary"
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-muted-foreground">{event.description}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-8 hover:bg-muted/50 rounded-md cursor-pointer"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentViewDate);
    const weekEnd = endOfWeek(currentViewDate);
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="border rounded-md p-4">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {daysOfWeek.map((day) => (
            <div 
              key={day.toString()} 
              className={`text-center py-2 ${
                isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-md' : ''
              }`}
              onClick={() => {
                setSelected(day);
                if (!isWidget) {
                  setCurrentView('day');
                  setCurrentViewDate(day);
                }
              }}
            >
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className="text-2xl">{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          {daysOfWeek.map((day) => {
            const dayEvents = getEventsForDate(day);
            if (dayEvents.length === 0) return null;
            
            return (
              <div key={day.toString()} className="border-t pt-2">
                <div className="font-medium mb-2">{format(day, 'EEEE, MMMM d')}</div>
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="bg-primary/10 p-2 rounded-md border-l-4 border-primary"
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="border rounded-md p-4">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          month={currentViewDate}
          onMonthChange={setCurrentViewDate}
          className="rounded-md border"
        />
      </div>
    );
  };

  // Widget version (compact)
  if (isWidget) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Scheduler
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus size={16} /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Event Date</Label>
                  <Calendar
                    mode="single"
                    selected={newEvent.date}
                    onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                    className="rounded-md border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Input
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Enter event description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="rounded-md border"
              />
            </div>
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {selected ? format(selected, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
              </div>
              
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events scheduled for this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{event.title}</h4>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full page version with all views
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus size={16} /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid gap-2">
                <Label>Event Date</Label>
                <Calendar
                  mode="single"
                  selected={newEvent.date}
                  onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                  className="rounded-md border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-description">Description</Label>
                <Input
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEvent}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight size={16} />
          </Button>
        </div>
        <div>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'day' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="day" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Day</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Month</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div>
        {currentView === 'day' && renderDayView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'month' && renderMonthView()}
      </div>
    </div>
  );
};

export default Scheduler;
