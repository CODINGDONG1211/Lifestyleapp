
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
import { Calendar as CalendarIcon, Plus, External } from 'lucide-react';
import { format } from 'date-fns';

type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
};

const Scheduler = () => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    description: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleGoogleCalendarExport = () => {
    // This is a simple implementation; a real integration would need OAuth
    if (selectedDayEvents.length === 0) return;
    
    const event = selectedDayEvents[0];
    const startTime = format(event.date, "yyyyMMdd'T'HHmmss");
    const endTime = format(new Date(event.date.getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss");
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${startTime}/${endTime}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

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
              {selectedDayEvents.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGoogleCalendarExport}
                  className="flex items-center gap-1"
                >
                  <External size={14} />
                  Add to Google Calendar
                </Button>
              )}
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
};

export default Scheduler;
