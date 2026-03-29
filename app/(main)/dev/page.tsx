'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/user-context';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormInput } from '@/app/components/ui/form-input';
import { FormSelect } from '@/app/components/ui/form-select';
import { Button } from '@/app/components/ui';
import { Trash2 } from 'lucide-react';

interface DevUser {
  id: number;
  auth_user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  email: string;
}

interface TrainerRelationship {
  id: number;
  trainer_id: number;
  trainee_id: number;
}

export default function DevPage() {
  const { user } = useUser();
  const { categories, measurementTypes, refetch } = useWorkoutData();
  const router = useRouter();

  // Exercise form
  const [exerciseName, setExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedMeasurementType, setSelectedMeasurementType] =
    useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User management
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingRoleFor, setUpdatingRoleFor] = useState<number | null>(null);

  // Trainer relationships
  const [relationships, setRelationships] = useState<TrainerRelationship[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [savingRelationship, setSavingRelationship] = useState(false);
  const [deletingRelationshipId, setDeletingRelationshipId] =
    useState<number | null>(null);

  useEffect(() => {
    if (user?.role === 'dev') {
      fetchDevData();
    }
  }, [user?.id]);

  // Redirect non-dev users
  if (user && user.role !== 'dev') {
    router.push('/workout');
    return null;
  }

  const fetchDevData = async () => {
    setUsersLoading(true);
    try {
      const [usersRes, relRes] = await Promise.all([
        supabase.rpc('list_all_users_for_dev'),
        supabase.from('trainer_relationships').select('id, trainer_id, trainee_id')
      ]);

      if (usersRes.error) throw usersRes.error;
      setDevUsers(usersRes.data ?? []);

      if (relRes.error) throw relRes.error;
      setRelationships(relRes.data ?? []);
    } catch (err) {
      console.error('Error fetching dev data:', err);
      toast.error('Failed to load user data');
    } finally {
      setUsersLoading(false);
    }
  };

  // Exercise form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseName.trim()) {
      toast.error('Exercise name is required');
      return;
    }
    if (!selectedCategory) {
      toast.error('Category is required');
      return;
    }
    if (!selectedMeasurementType) {
      toast.error('Measurement type is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('exercises')
        .insert({
          name: exerciseName.trim(),
          category: selectedCategory,
          measurement_type: selectedMeasurementType,
        })
        .select();

      if (error) throw error;

      toast.success(`Exercise "${exerciseName}" added successfully!`);
      setExerciseName('');
      setSelectedCategory(null);
      setSelectedMeasurementType(null);
      await refetch();
    } catch (err) {
      console.error('Error adding exercise:', err);
      toast.error('Failed to add exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role management
  const handleToggleTrainerRole = async (targetUser: DevUser) => {
    if (targetUser.role === 'dev' || targetUser.role === 'demo') return;

    const newRole = targetUser.role === 'trainer' ? 'user' : 'trainer';
    setUpdatingRoleFor(targetUser.id);

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) throw error;

      setDevUsers(prev =>
        prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u)
      );
      toast.success(`${targetUser.email} is now ${newRole}`);
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Failed to update role');
    } finally {
      setUpdatingRoleFor(null);
    }
  };

  // Trainer relationship management
  const handleCreateRelationship = async () => {
    if (!selectedTrainerId || !selectedTraineeId) {
      toast.error('Select both a trainer and a trainee');
      return;
    }
    if (selectedTrainerId === selectedTraineeId) {
      toast.error('Trainer and trainee must be different users');
      return;
    }

    setSavingRelationship(true);
    try {
      const { data, error } = await supabase
        .from('trainer_relationships')
        .insert({ trainer_id: selectedTrainerId, trainee_id: selectedTraineeId })
        .select('id, trainer_id, trainee_id')
        .single();

      if (error) throw error;

      setRelationships(prev => [...prev, data]);
      setSelectedTrainerId(null);
      setSelectedTraineeId(null);
      toast.success('Trainer relationship created');
    } catch (err: any) {
      console.error('Error creating relationship:', err);
      if (err?.code === '23505') {
        toast.error('This trainer or trainee is already in a relationship');
      } else {
        toast.error('Failed to create relationship');
      }
    } finally {
      setSavingRelationship(false);
    }
  };

  const handleDeleteRelationship = async (relId: number) => {
    setDeletingRelationshipId(relId);
    try {
      const { error } = await supabase
        .from('trainer_relationships')
        .delete()
        .eq('id', relId);

      if (error) throw error;

      setRelationships(prev => prev.filter(r => r.id !== relId));
      toast.success('Relationship removed');
    } catch (err) {
      console.error('Error deleting relationship:', err);
      toast.error('Failed to remove relationship');
    } finally {
      setDeletingRelationshipId(null);
    }
  };

  const getUserLabel = (userId: number) => {
    const u = devUsers.find(u => u.id === userId);
    if (!u) return `User #${userId}`;
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
    return name ? `${name} (${u.email})` : u.email;
  };

  const trainerUsers = devUsers.filter(u => u.role === 'trainer');
  const traineeUsers = devUsers.filter(u => u.role !== 'trainer');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-text-primary mb-2">Dev Tools</h1>
        <p className="text-text-muted">Manage exercises, users, and trainer relationships</p>
      </div>

      {/* Add Exercise */}
      <div className="bg-bg-secondary rounded-3xl p-8 border border-border-secondary">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Add New Exercise</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            id="exercise-name"
            label="Exercise Name"
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Bench Press"
          />
          <FormSelect
            id="category"
            label="Category"
            options={categories}
            value={selectedCategory ?? ''}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            placeholder="Select a category"
          />
          <FormSelect
            id="measurement-type"
            label="Measurement Type"
            options={measurementTypes}
            value={selectedMeasurementType ?? ''}
            onChange={(e) => setSelectedMeasurementType(Number(e.target.value))}
            placeholder="Select a measurement type"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Adding...' : 'Add Exercise'}
          </Button>
        </form>
      </div>

      {/* User Role Management */}
      <div className="bg-bg-secondary rounded-3xl p-8 border border-border-secondary">
        <h2 className="text-2xl font-bold text-text-primary mb-2">User Roles</h2>
        <p className="text-text-muted text-sm mb-6">
          Toggle trainer status for users. Dev and demo accounts cannot be changed.
        </p>

        {usersLoading ? (
          <p className="text-text-muted text-sm">Loading users...</p>
        ) : (
          <div className="space-y-2">
            {devUsers
              .filter(u => u.role !== 'dev' && u.role !== 'demo')
              .map(u => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
                const isUpdating = updatingRoleFor === u.id;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-2xl
                      bg-bg-tertiary/30 border border-border-primary"
                  >
                    <div>
                      {name && (
                        <p className="text-sm font-bold text-text-primary">{name}</p>
                      )}
                      <p className="text-sm text-text-muted">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                        u.role === 'trainer'
                          ? 'bg-accent-primary/20 text-accent-secondary'
                          : 'bg-bg-tertiary text-text-dim'
                      }`}>
                        {u.role}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleToggleTrainerRole(u)}
                      >
                        {isUpdating
                          ? '...'
                          : u.role === 'trainer'
                            ? 'Remove trainer'
                            : 'Make trainer'
                        }
                      </Button>
                    </div>
                  </div>
                );
              })}
            {devUsers.filter(u => u.role !== 'dev' && u.role !== 'demo').length === 0 && (
              <p className="text-text-muted text-sm">No users found.</p>
            )}
          </div>
        )}
      </div>

      {/* Trainer Relationships */}
      <div className="bg-bg-secondary rounded-3xl p-8 border border-border-secondary">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Trainer Relationships
        </h2>
        <p className="text-text-muted text-sm mb-6">
          Link a trainer to their trainee (1:1). Each person can only be in one relationship.
        </p>

        {/* Existing relationships */}
        {relationships.length > 0 && (
          <div className="space-y-2 mb-6">
            {relationships.map(rel => (
              <div
                key={rel.id}
                className="flex items-center justify-between p-4 rounded-2xl
                  bg-bg-tertiary/30 border border-border-primary"
              >
                <div className="text-sm">
                  <span className="font-bold text-text-primary">
                    {getUserLabel(rel.trainer_id)}
                  </span>
                  <span className="text-text-muted mx-2">→</span>
                  <span className="text-text-secondary">
                    {getUserLabel(rel.trainee_id)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingRelationshipId === rel.id}
                  onClick={() => handleDeleteRelationship(rel.id)}
                  className="text-text-faint hover:text-danger"
                >
                  {deletingRelationshipId === rel.id
                    ? '...'
                    : <Trash2 size={16} />
                  }
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Create new relationship */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            New Relationship
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
                Trainer
              </label>
              <select
                className={`w-full bg-bg-tertiary border border-border-primary rounded-xl
                  px-4 py-3 text-sm text-text-primary focus:outline-none
                  focus:border-accent-primary`}
                value={selectedTrainerId ?? ''}
                onChange={e => setSelectedTrainerId(Number(e.target.value) || null)}
              >
                <option value="">Select trainer...</option>
                {trainerUsers.map(u => {
                  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
                  return (
                    <option key={u.id} value={u.id}>
                      {name ? `${name} (${u.email})` : u.email}
                    </option>
                  );
                })}
              </select>
              {trainerUsers.length === 0 && (
                <p className="text-xs text-text-muted mt-1">
                  No users with trainer role yet.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
                Trainee
              </label>
              <select
                className={`w-full bg-bg-tertiary border border-border-primary rounded-xl
                  px-4 py-3 text-sm text-text-primary focus:outline-none
                  focus:border-accent-primary`}
                value={selectedTraineeId ?? ''}
                onChange={e => setSelectedTraineeId(Number(e.target.value) || null)}
              >
                <option value="">Select trainee...</option>
                {traineeUsers.map(u => {
                  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
                  return (
                    <option key={u.id} value={u.id}>
                      {name ? `${name} (${u.email})` : u.email}
                    </option>
                  );
                })}
              </select>
              {traineeUsers.length === 0 && (
                <p className="text-xs text-text-muted mt-1">
                  No regular users available.
                </p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            disabled={savingRelationship || !selectedTrainerId || !selectedTraineeId}
            onClick={handleCreateRelationship}
            className="w-full"
          >
            {savingRelationship ? 'Creating...' : 'Create Relationship'}
          </Button>
        </div>
      </div>
    </div>
  );
}
