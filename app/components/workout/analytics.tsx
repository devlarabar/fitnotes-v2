import React, { useMemo } from 'react';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { Card } from '@/app/components/ui';
import { 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Activity,
  Flame,
  Award
} from 'lucide-react';

interface AnalyticsStats {
  workoutDays: number;
  totalDays: number;
  workoutPercentage: number;
  totalSets: number;
  totalExercises: number;
  mostActiveDay: string;
  currentStreak: number;
  longestStreak: number;
}

export function Analytics() {
  const { workouts } = useWorkoutData();

  const stats = useMemo<AnalyticsStats>(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);

    // Filter workouts to last 90 days
    const recentWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= ninetyDaysAgo && workoutDate <= today;
    });

    // Get unique workout dates
    const uniqueDates = new Set(recentWorkouts.map(w => w.date));
    const workoutDays = uniqueDates.size;
    const totalDays = 90;
    const workoutPercentage = totalDays > 0 
      ? Math.round((workoutDays / totalDays) * 100) 
      : 0;

    // Total sets
    const totalSets = recentWorkouts.length;

    // Total unique exercises
    const uniqueExercises = new Set(recentWorkouts.map(w => w.exercise));
    const totalExercises = uniqueExercises.size;

    // Most active day of the week
    const dayCount: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0
    };

    uniqueDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[dayName]++;
    });

    const mostActiveDay = Object.entries(dayCount).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0];

    // Calculate streaks
    const sortedDates = Array.from(uniqueDates)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
      // Check if today or yesterday has a workout for current streak
      const lastWorkoutDate = sortedDates[sortedDates.length - 1];
      const daysSinceLastWorkout = Math.floor(
        (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastWorkout <= 1) {
        currentStreak = 1;
        
        // Count backwards from the last workout
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const dayDiff = Math.floor(
            (sortedDates[i + 1].getTime() - sortedDates[i].getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const dayDiff = Math.floor(
          (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    }

    return {
      workoutDays,
      totalDays,
      workoutPercentage,
      totalSets,
      totalExercises,
      mostActiveDay,
      currentStreak,
      longestStreak
    };
  }, [workouts]);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    color: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-text-dim font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold text-text-primary mb-2">
          Last 90 Days
        </h3>
        <p className="text-sm text-text-dim">
          Your workout journey at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Calendar}
          label="Workout Days"
          value={`${stats.workoutDays} / ${stats.totalDays}`}
          color="bg-blue-500"
        />
        
        <StatCard
          icon={TrendingUp}
          label="Active Rate"
          value={`${stats.workoutPercentage}%`}
          color="bg-green-500"
        />
        
        <StatCard
          icon={Dumbbell}
          label="Total Sets"
          value={stats.totalSets}
          color="bg-purple-500"
        />
        
        <StatCard
          icon={Activity}
          label="Unique Exercises"
          value={stats.totalExercises}
          color="bg-orange-500"
        />
        
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
          color="bg-red-500"
        />
        
        <StatCard
          icon={Award}
          label="Longest Streak"
          value={`${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`}
          color="bg-yellow-500"
        />
      </div>

      {stats.workoutDays > 0 && (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-text-dim mb-2">Most Active Day</p>
            <p className="text-xl font-bold text-accent-primary">
              {stats.mostActiveDay}
            </p>
          </div>
        </Card>
      )}

      {stats.workoutDays === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Activity size={48} className="mx-auto text-text-dim mb-4" />
            <p className="text-text-muted">
              No workouts in the last 90 days. Time to get started!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
