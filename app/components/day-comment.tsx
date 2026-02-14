import React, { useState } from 'react';
import { MessageSquare, Save, X } from 'lucide-react';
import { Button, Card, SpinnerInline } from './ui';
import { Textarea } from './ui/form/textarea';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';
import { DayComment as DayCommentType } from '@/app/lib/schema';
import { useUser } from '@/app/contexts/user-context';
import { useWorkoutData } from '@/app/contexts/workout-data-context';

interface Props {
  date: string; // YYYY-MM-DD format
  initialComment: DayCommentType | null;
  onUpdate: () => void;
}

export function DayComment({ date, initialComment, onUpdate }: Props) {
  const { user } = useUser();
  const { addComment, updateComment, deleteComment } = useWorkoutData();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setEditValue(initialComment?.comment || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      // Delete if empty
      if (initialComment) {
        await handleDelete();
      }
      setIsEditing(false);
      return;
    }

    setSaving(true);
    
    if (initialComment) {
      // Update existing - optimistic update
      const oldComment = editValue;
      updateComment(initialComment.id, editValue);
      
      try {
        const { error } = await supabase
          .from('comments')
          .update({ comment: editValue })
          .eq('id', initialComment.id);

        if (error) throw error;
        
        toast.success('Comment saved');
        onUpdate();
        setIsEditing(false);
      } catch (err) {
        // Rollback on error
        updateComment(initialComment.id, initialComment.comment);
        console.error('Error saving comment:', err);
        toast.error('Failed to save comment');
      } finally {
        setSaving(false);
      }
    } else {
      // Create new - optimistic add
      if (!user?.id) {
        toast.error('User not authenticated');
        setSaving(false);
        return;
      }

      const tempId = -Date.now();
      addComment({ id: tempId, date, comment: editValue });

      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({ date, comment: editValue, user_id: user.id })
          .select('id')
          .single();

        if (error) throw error;

        // Replace temp with real ID
        deleteComment(tempId);
        addComment({ id: data.id, date, comment: editValue });
        
        toast.success('Comment saved');
        onUpdate();
        setIsEditing(false);
      } catch (err) {
        // Rollback on error
        deleteComment(tempId);
        console.error('Error saving comment:', err);
        toast.error('Failed to save comment');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!initialComment) return;

    // Optimistically delete from cache
    const backup = initialComment;
    deleteComment(initialComment.id);

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', initialComment.id);

      if (error) throw error;

      toast.success('Comment deleted');
      setEditValue('');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      // Rollback on error
      addComment(backup);
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    }
  };

  const handleCancel = () => {
    setEditValue(initialComment?.comment || '');
    setIsEditing(false);
  };

  return (
    <Card className={`transition-all ${isEditing ? 'h-auto' : 'h-24 overflow-hidden'}`}>
      <div className={`p-0 h-full ${!isEditing ? 'overflow-y-auto' : ''}`}>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <MessageSquare size={16} />
              Day Note
            </div>
            <Textarea
              placeholder="Add a note for this day..."
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`bg-bg-tertiary border-border-primary text-text-primary 
                resize-none`}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                <X size={16} />
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <SpinnerInline />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : initialComment ? (
          <div
            className="flex items-start gap-3 cursor-pointer h-full"
            onClick={handleStartEdit}
          >
            <MessageSquare size={16} className="text-text-dim mt-0.5 shrink-0" />
            <p className="flex-1 text-sm text-text-secondary italic">
              {initialComment.comment}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className={`w-full h-full flex items-center justify-center 
              gap-2 text-text-dim hover:text-text-secondary transition-colors`}
          >
            <MessageSquare size={16} />
            <span className="text-sm hover:cursor-pointer">Add day note</span>
          </button>
        )}
      </div>
    </Card>
  );
}
