-- Meeting Minutes Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create the meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (recommended)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create a policy for public access (adjust as needed for your use case)
CREATE POLICY "Enable all operations for meetings" ON meetings
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Create an updated_at trigger (optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meetings_updated_at 
    BEFORE UPDATE ON meetings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO meetings (title, time, content) VALUES 
  ('Weekly Team Standup', '2024-01-15 09:00:00+00', '# Weekly Team Standup

## Attendees
- John Doe
- Jane Smith
- Mike Johnson

## Agenda
1. Sprint progress review
2. Blockers and impediments
3. Next week planning

## Action Items
- [ ] Complete user authentication feature
- [ ] Review design mockups
- [ ] Schedule client demo'),
  
  ('Product Planning Session', '2024-01-12 14:30:00+00', '# Product Planning Session

## Overview
Planning session for Q1 2024 product roadmap.

## Key Decisions
- Focus on user experience improvements
- Prioritize mobile responsiveness
- Integrate analytics dashboard

## Next Steps
1. Create detailed user stories
2. Estimate development effort
3. Schedule design reviews'),
  
  ('Client Feedback Review', '2024-01-10 16:00:00+00', '# Client Feedback Review

## Summary
Review of client feedback from recent product demo.

## Feedback Points
- Overall positive reception
- Request for additional reporting features
- Need for better mobile experience

## Action Items
- [ ] Implement advanced reporting
- [ ] Improve mobile UI
- [ ] Schedule follow-up meeting');