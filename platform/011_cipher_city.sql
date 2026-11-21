-- Cipher City (cybersecurity, grades 6 to 8).
--
-- The course keeps its data in tables of its own, all named cc_*. It changes no existing table.
-- Every row carries school_id and is covered by the same row-level security rule as the rest of
-- the platform, and every row hangs off a student, so deleting a student, a class, a teacher or
-- a school (by hand or by the daily clean-up) removes that student's Cipher City rows with them.

-- One row for each lesson a student has opened: mission, steps and their code, quick check, reflection.
CREATE TABLE cc_work (
  school_id uuid NOT NULL REFERENCES schools ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  lesson_id text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

-- Per-student counters: reward-game seconds used, and how many code runs in the current minute.
CREATE TABLE cc_student (
  student_id uuid PRIMARY KEY REFERENCES students ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools ON DELETE CASCADE,
  play_used int NOT NULL DEFAULT 0,
  runs int NOT NULL DEFAULT 0,
  runs_from timestamptz NOT NULL DEFAULT now()
);

-- A teacher's review of one lesson: rubric scores and written feedback.
CREATE TABLE cc_review (
  school_id uuid NOT NULL REFERENCES schools ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  lesson_id text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}',
  feedback text NOT NULL DEFAULT '',
  at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

-- Badges a teacher has given.
CREATE TABLE cc_award (
  school_id uuid NOT NULL REFERENCES schools ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students ON DELETE CASCADE,
  badge_id text NOT NULL,
  note text NOT NULL DEFAULT '',
  at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, badge_id)
);

-- "I'm stuck": at most one open request for each student.
CREATE TABLE cc_help (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools ON DELETE CASCADE,
  student_id uuid NOT NULL UNIQUE REFERENCES students ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes ON DELETE CASCADE,
  lesson_id text NOT NULL,
  step_id text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON cc_help (class_id);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['cc_work', 'cc_student', 'cc_review', 'cc_award', 'cc_help'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY school_only ON %I TO r4a_app USING (school_id = current_school()) WITH CHECK (school_id = current_school())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO r4a_app', t);
  END LOOP;
END $$;
