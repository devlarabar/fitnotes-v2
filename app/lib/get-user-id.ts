/**
 * Gets the current user's ID from the cached user context
 * This is a synchronous function that returns the cached user_id
 * Returns null if not authenticated or user not found
 * 
 * NOTE: This should only be used inside components that have access to useUser hook.
 * For use in hooks/components, import and use the useUser hook directly.
 */
export function getUserIdSync(user: { id: number } | null): number | null {
  return user?.id || null;
}
