import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Category } from '@/app/lib/schema';
import { Button, Card, IconContainer } from './ui';

interface Props {
  categories: Category[];
  onSelect: (category: Category) => void;
  onClose: () => void;
}

export function CategorySelector({ categories, onSelect, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-slate-950 flex flex-col"
    >
      <div className="p-4 border-b border-slate-900 flex items-center gap-4">
        <Button variant="ghost" onClick={onClose} className="p-2">
          <X size={24} />
        </Button>
        <h2 className="text-xl font-black text-white">Select Category</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {categories.map(category => (
          <Card
            key={category.id}
            onClick={() => onSelect(category)}
            className="flex items-center justify-between group hover:border-violet-500/30"
          >
            <div className="flex items-center gap-4">
              <IconContainer size="lg" className="group-hover:bg-violet-500/20 transition-all text-2xl">
                {category.name.charAt(0)}
              </IconContainer>
              <div>
                <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors text-lg">
                  {category.name}
                </h3>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-700 group-hover:text-violet-500 transition-colors" />
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
