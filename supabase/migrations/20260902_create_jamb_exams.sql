-- Supabase Migration: Create JAMB Exams History & Results Table
CREATE TABLE IF NOT EXISTS public.jamb_exams (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    mode TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    total_score REAL NOT NULL,
    max_score REAL NOT NULL,
    subject_scores JSONB NOT NULL,
    summary JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jamb_exams_timestamp ON public.jamb_exams (timestamp DESC);
