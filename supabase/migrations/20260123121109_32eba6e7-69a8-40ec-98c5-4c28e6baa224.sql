-- Add municipality field to profiles
ALTER TABLE public.profiles 
ADD COLUMN municipality TEXT;