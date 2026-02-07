-- Drop the old unique constraint on date only
alter table public.comments drop constraint if exists comments_date_key;

-- Add new unique constraint on (date, user_id)
alter table public.comments add constraint comments_date_user_id_key unique (date, user_id);
