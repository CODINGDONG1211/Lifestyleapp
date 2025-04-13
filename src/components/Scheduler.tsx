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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Search,
  Settings,
  MoreVertical,
  ExternalLink,
  Menu as MenuIcon,
  MapPin,
  Users,
  BookOpen,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, getHours, addHours, setHours, setMinutes, startOfHour, addMinutes, parse } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator } from "@/components/ui/menubar";
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

export type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
  color?: string; // Optional color for events
  endTime?: Date; // Optional end time for events
};

type SchedulerProps = {
  isWidget?: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DEFAULT_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Vaisakhi',
    date: new Date(2025, 3, 13, 12),
    description: 'Vaisakhi celebration',
    color: 'bg-green-600',
    endTime: new Date(2025, 3, 13, 14)
  },
  {
    id: '2',
    title: 'Ambedkar Jayanti',
    date: new Date(2025, 3, 14, 12),
    description: 'Ambedkar Jayanti celebration',
    color: 'bg-green-600'
  },
  {
    id: '3',
    title: 'Mesadi',
    date: new Date(2025, 3, 14, 14),
    description: 'Mesadi celebration',
    color: 'bg-green-600'
  },
  {
    id: '4',
    title: 'Bahag Bihu/Vaisakhadi',
    date: new Date(2025, 3, 15, 12),
    description: 'Bahag Bihu/Vaisakhadi celebration',
    color: 'bg-green-600'
  },
  {
    id: '5',
    title: 'Good Friday',
    date: new Date(2025, 3, 18, 12),
    description: 'Good Friday observance',
    color: 'bg-green-600'
  },
];

const Scheduler = ({ isWidget = true }: SchedulerProps) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    description: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>(isWidget ? 'month' : 'month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{start: Date, end: Date} | null>(null);

  const handleAddEvent = () => {
    if (newEvent.title.trim() === '') return;
    
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
      color: 'bg-green-600',
      endTime: newEvent.endTime || addHours(newEvent.date, 1)
    };
    
    setEvents([...events, event]);
    setNewEvent({
      title: '',
      date: new Date(),
      description: '',
    });
    setIsDialogOpen(false);
    setSelectedRange(null);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const selectedDayEvents = selected ? getEventsForDate(selected) : [];
  
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

  const getHeaderDate = () => {
    if (currentView === 'day') {
      return format(currentViewDate, 'MMMM d, yyyy');
    } else if (currentView === 'week') {
      const start = startOfWeek(currentViewDate);
      const end = endOfWeek(currentViewDate);
      return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
    } else {
      return format(currentViewDate, 'MMMM yyyy');
    }
  };

  const handleTimeSlotClick = (hour: number, day: Date = currentViewDate) => {
    const startTime = setHours(day, hour);
    const endTime = addHours(startTime, 1);
    
    setSelectedRange({
      start: startTime,
      end: endTime
    });
    
    setNewEvent({
      title: '',
      date: startTime,
      description: '',
      endTime: endTime
    });
    
    setIsDialogOpen(true);
  };

  const handleTimeChange = (type: 'start' | 'end', timeString: string) => {
    if (!timeString) return;
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      if (type === 'start') {
        const newDate = setMinutes(setHours(newEvent.date, hours), minutes);
        setNewEvent({
          ...newEvent,
          date: newDate,
          endTime: newEvent.endTime && newEvent.endTime <= newDate 
            ? addMinutes(newDate, 15) 
            : newEvent.endTime
        });
      } else {
        const newEndTime = setMinutes(setHours(newEvent.date, hours), minutes);
        if (newEndTime > newEvent.date) {
          setNewEvent({
            ...newEvent,
            endTime: newEndTime
          });
        }
      }
    } catch (error) {
      console.error('Invalid time format', error);
    }
  };

  const renderMonthGridView = () => {
    const date = currentViewDate;
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    return (
      <div className="grid-cols-1">
        <div className="grid grid-cols-7 border-b">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={index} className="py-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 h-[calc(100vh-220px)]">
          {days.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === date.getMonth();
            const isToday = isSameDay(day, new Date());
            const isSelected = selected && isSameDay(day, selected);
            
            return (
              <div 
                key={i} 
                className={`border-r border-b min-h-[100px] ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/20'
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
                onClick={() => {
                  setSelected(day);
                  if (!isWidget && currentView !== 'day') {
                    setCurrentView('day');
                    setCurrentViewDate(day);
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <div className={`p-1 text-right ${isToday ? 'text-white' : ''}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                      isToday ? 'bg-primary text-white' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map((event, idx) => (
                      <div 
                        key={event.id} 
                        className={`${event.color || 'bg-primary'} text-white px-2 py-1 mb-1 rounded-sm truncate text-xs`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto">
        <div className="flex">
          <div className="w-16 border-r"></div>
          <div className="flex-1 grid grid-cols-1">
            <div className="border-b py-2 text-center font-medium bg-blue-50">
              <div className="text-xl">
                {format(currentViewDate, 'd')}
              </div>
              <div className="uppercase text-sm">
                {format(currentViewDate, 'EEE')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-16 border-r">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 text-right pr-2 text-sm text-muted-foreground border-b">
                {hour === 0 ? '' : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            {HOURS.map((hour) => {
              const eventsForHour = events.filter(event => 
                isSameDay(event.date, currentViewDate) && 
                getHours(event.date) === hour
              );
              
              return (
                <div 
                  key={hour} 
                  className="h-14 border-b relative hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleTimeSlotClick(hour)}
                >
                  {eventsForHour.map(event => (
                    <div 
                      key={event.id} 
                      className={`absolute left-0 right-0 mx-1 ${event.color || 'bg-primary'} text-white p-1 rounded-sm overflow-hidden text-sm`}
                      style={{ 
                        top: '2px', 
                        height: 'calc(100% - 4px)',
                        zIndex: 10 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {event.title}
                      {event.endTime && (
                        <span className="text-xs block opacity-80">
                          {format(event.date, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            
            {isSameDay(currentViewDate, new Date()) && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                style={{ 
                  top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` 
                }}
              >
                <div className="h-2 w-2 rounded-full bg-red-500 absolute -left-1 -top-1"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentViewDate);
    const endDate = endOfWeek(currentViewDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto">
        <div className="flex">
          <div className="w-16 border-r"></div>
          {days.map((day, idx) => (
            <div key={idx} className="flex-1 border-r">
              <div className={`border-b py-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
                <div className="text-xl">
                  {format(day, 'd')}
                </div>
                <div className="uppercase text-sm">
                  {format(day, 'EEE')}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-1">
          <div className="w-16 border-r">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 text-right pr-2 text-sm text-muted-foreground border-b">
                {hour === 0 ? '' : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="border-r relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-14 border-b relative">
                    {events
                      .filter(event => 
                        isSameDay(event.date, day) && 
                        getHours(event.date) === hour
                      )
                      .map(event => (
                        <div 
                          key={event.id} 
                          className={`absolute left-0 right-0 mx-1 ${event.color || 'bg-primary'} text-white p-1 rounded-sm overflow-hidden text-xs`}
                          style={{ top: '2px', height: 'calc(100% - 4px)' }}
                        >
                          {event.title}
                        </div>
                      ))
                    }
                  </div>
                ))}
                {isSameDay(day, new Date()) && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                    style={{ 
                      top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` 
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500 absolute -left-1 -top-1"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex items-center border-b p-2 bg-white">
        <Button variant="ghost" size="icon" className="mr-2">
          <MenuIcon size={20} />
        </Button>
        
        <div className="flex items-center mr-6">
          <CalendarIcon className="h-6 w-6 mr-2 text-blue-500" />
          <h1 className="text-xl font-semibold">Calendar</h1>
        </div>
        
        <Button 
          variant="outline" 
          className="mr-2 rounded-full px-4" 
          onClick={handleToday}
        >
          Today
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft size={20} />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight size={20} />
        </Button>
        
        <h2 className="text-xl font-medium ml-4">
          {getHeaderDate()}
        </h2>
        
        <div className="ml-auto flex items-center">
          <Menubar className="border-none">
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer">
                {currentView === 'month' ? 'Month' : currentView === 'week' ? 'Week' : 'Day'} 
                <ChevronRight className="h-4 w-4 rotate-90 ml-1" />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem 
                  onClick={() => setCurrentView('day')}
                  className={currentView === 'day' ? 'bg-muted' : ''}
                >
                  Day
                </MenubarItem>
                <MenubarItem 
                  onClick={() => setCurrentView('week')}
                  className={currentView === 'week' ? 'bg-muted' : ''}
                >
                  Week
                </MenubarItem>
                <MenubarItem 
                  onClick={() => setCurrentView('month')}
                  className={currentView === 'month' ? 'bg-muted' : ''}
                >
                  Month
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="icon">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 border-r p-4 overflow-y-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-6 w-full shadow-sm flex items-center justify-center py-6">
                <Plus size={20} className="mr-2" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event on your calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Add title"
                    className="text-lg font-medium border-0 border-b-2 rounded-none focus-visible:ring-0 px-0 focus-visible:border-primary"
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-1 items-center gap-2">
                    <div>
                      {selectedRange ? format(selectedRange.start, 'EEEE, MMMM d') : format(newEvent.date, 'EEEE, MMMM d')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time"
                        value={format(newEvent.date, 'HH:mm')}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        className="w-24"
                      />
                      <span>-</span>
                      <Input 
                        type="time"
                        value={newEvent.endTime ? format(newEvent.endTime, 'HH:mm') : format(addHours(newEvent.date, 1), 'HH:mm')}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Add location" className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm" />
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Add guests" className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm" />
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-1" />
                  <Textarea 
                    placeholder="Add description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="min-h-[80px] border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{format(currentViewDate, 'MMMM yyyy')}</span>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentViewDate(prev => subMonths(prev, 1))}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentViewDate(prev => addMonths(prev, 1))}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                setSelected(date);
                if (date) setCurrentViewDate(date);
              }}
              className="w-full"
              month={currentViewDate}
            />
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for people"
                className="pl-8 bg-muted/50 border-0"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">My calendars</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-primary mr-2"></div>
                <span>Personal</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-green-600 mr-2"></div>
                <span>Holidays</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2"></div>
                <span>Birthdays</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>
                <span>Tasks</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Other calendars</h3>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-purple-500 mr-2"></div>
                <span>Holidays in India</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {currentView === 'month' && renderMonthGridView()}
          {currentView === 'week' && renderWeekView()}
          {currentView === 'day' && renderDayView()}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
