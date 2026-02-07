import { supabase } from './supabase';
import { Workout } from './schema';

/**
 * Checks if a new set is a personal record for the given exercise.
 * 
 * For weight/reps exercises: PR if it's the most reps at this weight, or more weight than ever done.
 * For distance exercises: PR if it's the longest distance.
 * For time exercises: PR if it's the longest time.
 */
export async function checkIsPR(
  exerciseId: number,
  userId: number,
  weight?: number | null,
  reps?: number | null,
  distance?: number | null,
  time?: string | null
): Promise<boolean> {
  try {
    // Fetch all previous sets for this exercise with pagination
    let allSets: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('workouts')
        .select('exercise, weight, reps, distance, time')
        .eq('exercise', exerciseId)
        .eq('user_id', userId)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allSets = [...allSets, ...data];
        hasMore = data.length === pageSize;
        page++;
      }
    }

    if (allSets.length === 0) {
      // First time doing this exercise = PR
      return true;
    }

    const previousSets = allSets;

    // Weight/Reps exercises
    if (weight !== null && weight !== undefined && reps !== null && reps !== undefined) {
      // Check if this is more weight than ever done
      const maxWeight = Math.max(...previousSets.map(s => s.weight || 0));
      if (weight > maxWeight) return true;

      // Check if this is the most reps at this weight
      const setsAtThisWeight = previousSets.filter(s => s.weight === weight);
      if (setsAtThisWeight.length > 0) {
        const maxRepsAtWeight = Math.max(...setsAtThisWeight.map(s => s.reps || 0));
        if (reps > maxRepsAtWeight) return true;
      }
    }

    // Distance + Time exercises (e.g., running)
    if (distance !== null && distance !== undefined && time && time !== '00:00') {
      const timeToSeconds = (t: string): number => {
        const [mins, secs] = t.split(':').map(Number);
        return (mins || 0) * 60 + (secs || 0);
      };

      const currentSeconds = timeToSeconds(time);

      // Check if this is the longest distance
      const distances = previousSets.map(s => s.distance || 0);
      const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;
      if (distance > maxDistance) return true;

      // Check if this is the fastest time ever (across all distances)
      const times = previousSets
        .filter(s => s.time && s.time !== '00:00')
        .map(s => timeToSeconds(s.time!));

      if (times.length > 0) {
        const minTime = Math.min(...times);
        if (currentSeconds < minTime) return true;
      }

      // Check if this is the longest distance at this specific time
      const setsAtThisTime = previousSets.filter(s => {
        return s.time && Math.abs(timeToSeconds(s.time) - currentSeconds) < 1; // within 1 second
      });

      if (setsAtThisTime.length > 0) {
        const maxDistanceAtTime = Math.max(
          ...setsAtThisTime.map(s => s.distance || 0)
        );
        if (distance > maxDistanceAtTime) return true;
      }


    }
    // Distance only (no time)
    else if (distance !== null && distance !== undefined) {
      const maxDistance = Math.max(...previousSets.map(s => s.distance || 0));
      if (distance > maxDistance) return true;
    }
    // Time only exercises (e.g., plank)
    else if (time && time !== '00:00') {
      const timeToSeconds = (t: string): number => {
        const [mins, secs] = t.split(':').map(Number);
        return (mins || 0) * 60 + (secs || 0);
      };

      const currentSeconds = timeToSeconds(time);
      const maxSeconds = Math.max(
        ...previousSets
          .filter(s => s.time)
          .map(s => timeToSeconds(s.time!))
      );

      if (currentSeconds > maxSeconds) return true;
    }

    return false;
  } catch (err) {
    console.error('Error checking PR:', err);
    return false;
  }
}
