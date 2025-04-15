import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function Navbar() {
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
              to="/scheduler" 
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary flex items-center"
            >
              <Calendar className="mr-1 h-4 w-4" />
              Schedule
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
