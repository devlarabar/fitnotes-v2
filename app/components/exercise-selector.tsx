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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft size={24} />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-text-primary">{category.name}</h2>
          <p className="text-xs text-text-muted">{filteredExercises.length} exercises</p>
        </div>
        <Button variant="ghost" onClick={onClose} className="p-2">
          <X size={24} />
        </Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-secondary border border-border-primary rounded-2xl py-3 pl-10 pr-4 text-text-primary outline-none focus:border-accent-primary transition-all placeholder:text-text-subtle"
        />
      </div>

      <div className="space-y-3">
        {filteredExercises.map(exercise => (
          <Card
            key={exercise.id}
            onClick={() => handleSelect(exercise)}
            className="flex items-center justify-between group hover:border-accent-primary/30"
          >
            <div className="flex items-center gap-4">
              <IconContainer size="lg" className="group-hover:bg-accent-primary/20 transition-all">
                <Activity size={20} />
              </IconContainer>
              <div>
                <h3 className="font-bold text-text-primary group-hover:text-accent-secondary transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-xs text-text-subtle uppercase tracking-wider font-black">
                  {exercise.categories?.name || 'Other'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-faint group-hover:text-accent-primary transition-colors" />
          </Card>
        ))}
        {filteredExercises.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-subtle italic">No exercises found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
