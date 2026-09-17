PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  first_name TEXT,
  last_name TEXT,
  display_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  path TEXT,
  pace TEXT CHECK (pace IN ('accelerated', 'balanced')),
  mastery INTEGER NOT NULL DEFAULT 0,
  next_lesson TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  session_version INTEGER NOT NULL DEFAULT 1,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lock_until TEXT,
  last_login_at TEXT,
  last_activity_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_version INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_study_day TEXT,
  completed_lessons_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE completed_steps (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_id, step_id)
);

CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('login', 'step_completed', 'lesson_completed', 'assignment_created')),
  lesson_id TEXT,
  step_id TEXT,
  assignment_id TEXT,
  xp INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX activity_events_user_created_idx ON activity_events(user_id, created_at DESC);

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_at TEXT,
  lesson_id TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed')),
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  read_at TEXT
);

CREATE INDEX assignments_student_created_idx ON assignments(student_id, created_at DESC);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  read_at TEXT
);

CREATE INDEX notifications_user_created_idx ON notifications(user_id, created_at DESC);
