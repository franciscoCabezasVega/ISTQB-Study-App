# Setup de Supabase para ISTQB Study App

## 1. Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se inicialice
5. Ve a Settings > API para obtener:
   - Project URL (SUPABASE_URL)
   - Anon Key (SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

## 2. Crear tablas

Accede al SQL Editor en Supabase y ejecuta los siguientes scripts:

### Tabla de usuarios

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  language TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla de preguntas

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'situational')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('low', 'medium', 'high')),
  topic TEXT NOT NULL,
  options JSONB,
  correct_answer_ids TEXT[] NOT NULL,
  explanation TEXT NOT NULL,
  istqb_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
```

### Tabla de respuestas de usuarios

```sql
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  selected_options TEXT[] NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  attempt_number INTEGER DEFAULT 1,
  UNIQUE(user_id, question_id, answered_at)
);

CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at);
```

### Tabla de progreso de usuario

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE,
  next_review_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, topic)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
```

### Tabla de repetición espaciada

```sql
CREATE TABLE spaced_repetition_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  ease_factor DECIMAL(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_spaced_repetition_user_id ON spaced_repetition_cards(user_id);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition_cards(next_review_date);
```

### Tabla de sesiones de examen

```sql
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'all')),
  total_questions INTEGER,
  questions JSONB NOT NULL, -- Array de preguntas con { id, text }
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER,
  total_time_spent INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_difficulty ON exam_sessions(difficulty);
```

### Tabla de logros

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

### Tabla de recordatorios

```sql
CREATE TABLE study_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  preferred_time TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_study_reminders_user_id ON study_reminders(user_id);
```

### Tabla de streaks diarios

```sql
CREATE TABLE daily_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_streaks_user_id ON daily_streaks(user_id);
```

## 3. Configurar Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "users_view_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view questions
CREATE POLICY "questions_select_all" ON questions
  FOR SELECT USING (true);

-- Users can view their own answers
CREATE POLICY "user_answers_view_own" ON user_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_answers_insert_own" ON user_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables...
```

## 4. Insertar preguntas de ejemplo

Descarga el archivo SQL con preguntas de ejemplo ISTQB en:
`docs/sample_questions.sql`

O crea preguntas manualmente a través de la API.

## 5. Crear funciones personalizadas

```sql
-- Función para obtener estadísticas por tema
CREATE OR REPLACE FUNCTION get_user_statistics_by_topic(p_user_id UUID)
RETURNS TABLE(
  topic TEXT,
  total_questions INTEGER,
  correct_answers INTEGER,
  success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.topic,
    COUNT(*)::INTEGER,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::INTEGER,
    ROUND(100.0 * SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2)::DECIMAL
  FROM questions q
  LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.user_id = p_user_id
  WHERE ua.user_id = p_user_id
  GROUP BY q.topic
  ORDER BY q.topic;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar progreso
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, topic, total_questions, correct_answers, incorrect_answers, success_rate)
  SELECT
    NEW.user_id,
    q.topic,
    COUNT(*)::INTEGER,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::INTEGER,
    SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END)::INTEGER,
    ROUND(100.0 * SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2)
  FROM questions q
  LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.user_id = NEW.user_id
  WHERE q.id = NEW.question_id AND ua.user_id = NEW.user_id
  GROUP BY q.topic
  ON CONFLICT (user_id, topic) DO UPDATE SET
    total_questions = EXCLUDED.total_questions,
    correct_answers = EXCLUDED.correct_answers,
    incorrect_answers = EXCLUDED.incorrect_answers,
    success_rate = EXCLUDED.success_rate,
    last_studied = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_progress_after_answer
AFTER INSERT ON user_answers
FOR EACH ROW
EXECUTE FUNCTION update_user_progress();
```

## 6. Verificar setup

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar índices
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan > 0 
ORDER BY idx_scan DESC;
```

## ✅ Checklist final

- [ ] Crear proyecto en Supabase
- [ ] Obtener credenciales de API
- [ ] Crear todas las tablas
- [ ] Habilitar RLS en todas las tablas
- [ ] Crear políticas de seguridad
- [ ] Crear funciones personalizadas
- [ ] Insertar preguntas de ejemplo
- [ ] Guardar credenciales en archivos .env

## 🔒 Notas de seguridad

- Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY` en repositorios públicos
- Usa variables de entorno para todas las credenciales
- Revisa y personaliza las políticas RLS según tus necesidades
- Implementa rate limiting en producción
- Usa HTTPS en todos los endpoints

---

Para más información, consulta la documentación oficial de Supabase:
https://supabase.com/docs
