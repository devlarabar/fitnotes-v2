import React, { useState } from 'react';
import { Search, X, ChevronRight, Activity, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Exercise, Category } from '@/app/lib/schema';
import { Card, Button, Badge, IconContainer } from './ui';

interface Props {
  exercises: Exercise[];
  category: Category;
  onSelect: (exercise: Exercise) => void;
  onBack: () => void;
  onClose: () => void;
}

export function ExerciseSelector({ exercises, category, onSelect, onBack, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filteredExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = e.category === category.id;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-slate-950 flex flex-col"
    >
      <div className="p-4 border-b border-slate-900 flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft size={24} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-white">{category.name}</h2>
          <p className="text-xs text-slate-500">{filteredExercises.length} exercises</p>
        </div>
        <Button variant="ghost" onClick={onClose} className="p-2">
          <X size={24} />
        </Button>
      </div>

      <div className="p-4 border-b border-slate-900">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-white outline-none focus:border-violet-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredExercises.map(exercise => (
          <Card
            key={exercise.id}
            onClick={() => handleSelect(exercise)}
            className="flex items-center justify-between group hover:border-violet-500/30"
          >
            <div className="flex items-center gap-4">
              <IconContainer size="lg" className="group-hover:bg-violet-500/20 transition-all">
                <Activity size={20} />
              </IconContainer>
              <div>
                <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-xs text-slate-600 uppercase tracking-wider font-black">
                  {exercise.categories?.name || 'Other'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-700 group-hover:text-violet-500 transition-colors" />
          </Card>
        ))}
        {filteredExercises.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-600 italic">No exercises found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
