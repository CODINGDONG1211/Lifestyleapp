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
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, getHours, addHours, setHours, setMinutes, startOfHour, addMinutes, parse, getMinutes } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator } from "@/components/ui/menubar";
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const Scheduler = ({ isWidget = true }: SchedulerProps) => {
  const { events, addEvent } = useAppContext();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    description: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>(isWidget ? 'month' : 'month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{start: Date, end: Date} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number, minutes: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number, minutes: number } | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<Event | null>(null);

  const handleAddEvent = () => {
    if (newEvent.title.trim() === '') return;
    
    const event: Omit<Event, 'id'> = {
      ...newEvent,
      color: 'bg-green-600',
      endTime: newEvent.endTime || addHours(newEvent.date, 1)
    };
    
    addEvent(event);
    setNewEvent({
      title: '',
      date: selected || new Date(),
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
    const today = new Date();
    setCurrentViewDate(today);
    setSelected(today);
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
        if (!newEvent.endTime) {
          const newEndTime = setMinutes(setHours(newEvent.date, hours), minutes);
          if (newEndTime > newEvent.date) {
            setNewEvent({
              ...newEvent,
              endTime: newEndTime
            });
          }
        } else {
          const sameDay = new Date(newEvent.date);
          const newEndTime = setMinutes(setHours(sameDay, hours), minutes);
          if (newEndTime > newEvent.date) {
            setNewEvent({
              ...newEvent,
              endTime: newEndTime
            });
          }
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

  const getTimeFromMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const totalMinutes = (relativeY / rect.height) * 24 * 60;
    const hour = Math.floor(totalMinutes / 60);
    // Calculate minutes and round to nearest 30
    const minutesPart = totalMinutes % 60;
    const minutes = Math.round(minutesPart / 30) * 30;
    
    // Handle case where minutes round up to 60
    if (minutes === 60) {
      return { 
        hour: Math.min(23, hour + 1), 
        minutes: 0 
      };
    }
    
    return { 
      hour: Math.min(23, Math.max(0, hour)), 
      minutes 
    };
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimeFromMousePosition(e);
    setIsDragging(true);
    setDragStart(time);
    setDragEnd(time);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && !draggingEvent) {
      const time = getTimeFromMousePosition(e);
      setDragEnd(time);
    }
  };

  const handleDragEnd = () => {
    if (isDragging && dragStart && dragEnd && !draggingEvent) {
      // Ensure end time is after start time
      let startDate = setMinutes(setHours(currentViewDate, dragStart.hour), dragStart.minutes);
      let endDate = setMinutes(setHours(currentViewDate, dragEnd.hour), dragEnd.minutes);
      
      // Swap dates if dragged upwards
      if (endDate < startDate) {
        [startDate, endDate] = [endDate, startDate];
      }
      
      setNewEvent({
        title: '',
        date: startDate,
        description: '',
        endTime: endDate
      });
      
      setIsDialogOpen(true);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDraggingEvent(null);
  };

  const handleEventDragStart = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setDraggingEvent(event);
    setIsDragging(true);
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 * 2 }, (_, i) => i / 2); // 30-minute intervals

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
          <div className="w-16 border-r relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 relative">
                <div className="absolute -top-[10px] right-2 text-sm text-muted-foreground">
                {hour === 0 ? '' : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
                </div>
              </div>
            ))}
          </div>
          
          <div 
            className="flex-1 relative"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="absolute top-0 left-0 w-[1px] h-full bg-gray-200"></div>
            {hours.map((hour, index) => (
              <div 
                key={index}
                className={`h-7 ${
                  index % 2 === 0 
                    ? 'border-b border-gray-200' 
                    : 'border-b border-gray-100'
                }`}
              />
            ))}

            {isDragging && dragStart && dragEnd && !draggingEvent && (
              <div 
                className="absolute left-[1px] right-0 bg-blue-100 opacity-50"
                style={{
                  top: `${(dragStart.hour * 60 + dragStart.minutes) / (24 * 60) * 100}%`,
                  height: `${((dragEnd.hour * 60 + dragEnd.minutes) - (dragStart.hour * 60 + dragStart.minutes)) / (24 * 60) * 100}%`
                }}
              />
            )}

            {events.filter(event => isSameDay(event.date, currentViewDate)).map(event => {
              const startMinutes = getHours(event.date) * 60 + getMinutes(event.date);
              const endMinutes = event.endTime 
                ? getHours(event.endTime) * 60 + getMinutes(event.endTime)
                : startMinutes + 60;
                    
                    return (
                      <div 
                        key={event.id} 
                  className={`absolute left-[1px] right-1 ${event.color || 'bg-primary'} text-white p-1 rounded-sm overflow-hidden text-sm cursor-move`}
                        style={{ 
                    top: `${startMinutes / (24 * 60) * 100}%`,
                    height: `${(endMinutes - startMinutes) / (24 * 60) * 100}%`,
                    zIndex: draggingEvent?.id === event.id ? 20 : 10
                  }}
                  onMouseDown={(e) => handleEventDragStart(e, event)}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs opacity-90">
                    {format(event.date, 'h:mm a')} 
                    {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
                  </div>
                  {event.description && (
                    <div className="text-xs mt-1 opacity-75">{event.description}</div>
                  )}
                </div>
              );
            })}
            
            {isSameDay(currentViewDate, new Date()) && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-500 z-30"
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
    const hours = Array.from({ length: 24 * 2 }, (_, i) => i / 2); // 30-minute intervals
    
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
          <div className="w-16 border-r relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 relative">
                <div className="absolute -top-[10px] right-2 text-sm text-muted-foreground">
                {hour === 0 ? '' : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {days.map((day, dayIdx) => (
              <div 
                key={dayIdx} 
                className="border-r relative"
                onMouseDown={(e) => {
                  setCurrentViewDate(day);
                  handleDragStart(e);
                }}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gray-200"></div>
                {hours.map((hour, index) => (
                  <div 
                    key={index}
                    className={`h-7 ${
                      index % 2 === 0 
                        ? 'border-b border-gray-200' 
                        : 'border-b border-gray-100'
                    }`}
                  />
                ))}

                {isDragging && dragStart && dragEnd && !draggingEvent && isSameDay(currentViewDate, day) && (
                  <div 
                    className="absolute left-[1px] right-0 bg-blue-100 opacity-50"
                    style={{
                      top: `${(dragStart.hour * 60 + dragStart.minutes) / (24 * 60) * 100}%`,
                      height: `${((dragEnd.hour * 60 + dragEnd.minutes) - (dragStart.hour * 60 + dragStart.minutes)) / (24 * 60) * 100}%`
                    }}
                  />
                )}

                {events.filter(event => isSameDay(event.date, day)).map(event => {
                  const startMinutes = getHours(event.date) * 60 + getMinutes(event.date);
                  const endMinutes = event.endTime 
                    ? getHours(event.endTime) * 60 + getMinutes(event.endTime)
                    : startMinutes + 60;
                          
                        return (
                          <div 
                            key={event.id} 
                      className={`absolute left-[1px] right-1 ${event.color || 'bg-primary'} text-white p-1 rounded-sm overflow-hidden text-sm cursor-move`}
                            style={{ 
                        top: `${startMinutes / (24 * 60) * 100}%`,
                        height: `${(endMinutes - startMinutes) / (24 * 60) * 100}%`,
                        zIndex: draggingEvent?.id === event.id ? 20 : 10
                      }}
                      onMouseDown={(e) => handleEventDragStart(e, event)}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {format(event.date, 'h:mm a')} 
                        {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
                      </div>
                      {event.description && (
                        <div className="text-xs mt-1 opacity-75">{event.description}</div>
                            )}
                          </div>
                        );
                      })}

                {isSameDay(day, new Date()) && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-30"
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

  const renderMonthView = () => {
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
                <DialogDescription>
                  Create a new event by filling out the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Add title"
                  className="text-lg font-medium border-0 border-b-2 rounded-none focus-visible:ring-0 px-0 focus-visible:border-primary"
                />
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-1 items-center gap-2">
                    <div>
                      {format(newEvent.date, 'EEEE, MMMM d')}
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
                  <Input
                    placeholder="Add location"
                    className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Add guests"
                    className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm"
                  />
                </div>

                <div className="flex gap-2 text-sm">
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
    <div className={`h-full flex flex-col ${!isWidget && 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Scheduler</h2>
        <Button 
          onClick={() => {
            setNewEvent({
              title: '',
              date: selected || new Date(),
              description: '',
              endTime: addHours(selected || new Date(), 1)
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row h-full gap-4">
        {/* Side Calendar - Hidden on mobile */}
        <div className="hidden lg:block w-64">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              className="rounded-md"
            />
          </Card>
        </div>

        {/* Main Calendar View */}
        <div className="flex-1">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePrevious()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNext()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(selected || new Date(), 'MMMM yyyy')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={currentView}
                  onValueChange={(value: 'month' | 'week' | 'day') => setCurrentView(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="calendar-container">
              {currentView === 'month' && renderMonthView()}
              {currentView === 'week' && renderWeekView()}
              {currentView === 'day' && renderDayView()}
            </div>
          </Card>
        </div>
      </div>

      {/* Dialog for adding/editing events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event by filling out the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Add title"
                className="text-lg font-medium border-0 border-b-2 rounded-none focus-visible:ring-0 px-0 focus-visible:border-primary"
              />
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-1 items-center gap-2">
                <div>
                  {format(newEvent.date, 'EEEE, MMMM d')}
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
              <Input 
                placeholder="Add location"
                className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Add guests"
                className="border-0 border-b rounded-none focus-visible:ring-0 px-0 text-sm"
              />
            </div>
            
            <div className="flex gap-2 text-sm">
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
    </div>
  );
};

export default Scheduler;
