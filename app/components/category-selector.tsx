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
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose} className="p-2">
          <X size={24} />
        </Button>
        <h2 className="text-xl font-black text-text-primary">Select Category</h2>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(category => (
          <Card
            key={category.id}
            onClick={() => onSelect(category)}
            className="flex items-center justify-between group hover:border-accent-primary/30"
          >
            <div className="flex items-center gap-4">
              <IconContainer size="lg" className="group-hover:bg-accent-primary/20 transition-all text-2xl">
                {category.name.charAt(0)}
              </IconContainer>
              <div>
                <h3 className="font-bold text-text-primary group-hover:text-accent-secondary transition-colors text-lg">
                  {category.name}
                </h3>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-faint group-hover:text-accent-primary transition-colors" />
          </Card>
        ))}
      </div>
    </div>
  );
}
