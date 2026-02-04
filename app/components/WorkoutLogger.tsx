import React from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, WeightUnit, DistanceUnit } from '@/app/lib/schema';
import { Button, Card, SectionHeader, Badge } from './ui';
import { SetInputs } from './SetInputs';

interface LocalSet {
  id: string;
  weight?: number;
  weight_unit?: number;
  reps?: number;
  distance?: number;
  distance_unit?: number;
  time?: string;
  timestamp: number;
}

interface LocalWorkoutExercise {
  id: string;
  exerciseId: number;
  sets: LocalSet[];
}

interface LocalWorkout {
  id: string;
  date: string;
  exercises: LocalWorkoutExercise[];
}

interface Props {
  workout: LocalWorkout;
  exercises: Exercise[];
  weightUnits: WeightUnit[];
  distanceUnits: DistanceUnit[];
  onAddSet: (exId: string) => void;
  onUpdateSet: (exId: string, setId: string, updates: any) => void;
  onRemoveSet: (exId: string, setId: string) => void;
  onRemoveExercise: (exId: string) => void;
  onOpenSelector: () => void;
  showEmptyState?: boolean;
}

export function WorkoutLogger({
  workout,
  exercises,
  weightUnits,
  distanceUnits,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExercise,
  onOpenSelector,
  showEmptyState = true
}: Props) {
  


  return (
    <div className="space-y-6">
      {workout.exercises.length === 0 && showEmptyState ? (
        <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
          <p className="text-slate-500 max-w-[200px]">No exercises added yet. Start your session by adding one.</p>
          <Button variant="secondary" onClick={onOpenSelector} className="mt-6">
            Browse Exercises
          </Button>
        </Card>
      ) : workout.exercises.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {workout.exercises.map((workoutEx) => {
              const exerciseData = exercises.find(e => e.id === workoutEx.exerciseId);
              const measurementType = exerciseData?.measurement_type?.name;

              return (
                <motion.div
                  key={workoutEx.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-0 overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-slate-800/20 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                          <Trophy size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{exerciseData?.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{exerciseData?.categories?.name}</Badge>
                            {measurementType && (
                              <Badge variant="vivid">{measurementType}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => onRemoveExercise(workoutEx.id)}
                        className="p-2 h-auto text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    <div className="p-4 space-y-3">
                      {workoutEx.sets.map((set, idx) => (
                        <div key={set.id} className="flex items-end gap-3 group">
                          <div className="w-8 pb-3 text-center text-xs font-bold text-slate-600">{idx + 1}</div>
                          <SetInputs
                            set={set}
                            measurementType={measurementType}
                            weightUnits={weightUnits}
                            distanceUnits={distanceUnits}
                            onUpdate={(updates) => onUpdateSet(workoutEx.id, set.id, updates)}
                          />
                          <Button
                            variant="ghost"
                            onClick={() => onRemoveSet(workoutEx.id, set.id)}
                            className="p-2 mb-1.5 h-auto text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="secondary"
                        onClick={() => onAddSet(workoutEx.id)}
                        className="w-full mt-2 py-3 border-dashed bg-transparent hover:bg-slate-800/50"
                      >
                        <Plus size={16} /> Add Set
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button variant="primary" onClick={onOpenSelector} className="w-12 h-12 rounded-full p-0">
            <Plus size={24} />
          </Button>
        </div>
      )}
    </div>
  );
}
