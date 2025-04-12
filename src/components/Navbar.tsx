
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  BarChart3, 
  CheckSquare,

  Dumbbell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">LifeHub</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary"
            >
              Dashboard
            </Link>
            <Link 
              to="/planner" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
            >
              <CheckSquare className="mr-1 h-4 w-4" />
              Tasks
            </Link>
            <Link 
              to="/habits" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
            >
              <CalendarDays className="mr-1 h-4 w-4" />
              Habits
            </Link>
            <Link 
              to="/workouts" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
            >
              <Dumbbell className="mr-1 h-4 w-4" />
              Workouts
            </Link>
            <Link 
              to="/analytics" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              Analytics
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6 lg:px-8 bg-card animate-fade-in">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/planner" 
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <CheckSquare className="mr-2 h-5 w-5" />
              Tasks
            </Link>
            <Link 
              to="/habits" 
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <CalendarDays className="mr-2 h-5 w-5" />
              Habits
            </Link>
            <Link 
              to="/workouts" 
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Dumbbell className="mr-2 h-5 w-5" />
              Workouts
            </Link>
            <Link 
              to="/analytics" 
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
