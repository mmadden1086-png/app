import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import WeeklyCheckIn from '@/components/follow-through/WeeklyCheckIn';
import BottomNav from '@/components/follow-through/BottomNav';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckIn() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 500),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center px-4 py-3">
          <Link to="/" className="mr-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-extrabold tracking-tight">Weekly Check-In</h1>
        </div>
      </header>
      <div className="max-w-lg mx-auto pt-4">
        <WeeklyCheckIn tasks={tasks} />
      </div>
      <BottomNav />
    </div>
  );
}