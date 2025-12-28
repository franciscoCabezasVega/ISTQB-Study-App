import { supabase } from '../config/supabase';
import { Achievement, UserAchievement, DailyStreak, Language } from '@istqb-app/shared';
import { v4 as uuidv4 } from 'uuid';

export interface AchievementCriteria {
  type: 'first_answer' | 'topic_master' | 'streak' | 'exam_score' | 'questions_count';
  value?: number;
  topic?: string;
}

class AchievementService {
  /**
   * Obtiene el idioma preferido del usuario desde su perfil
   */
  private async getUserLanguage(userId: string): Promise<Language> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('language')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return 'es'; // Default fallback
      }

      return (data.language as Language) || 'es';
    } catch (error) {
      console.error('Error getting user language:', error);
      return 'es';
    }
  }

  /**
   * Obtener todos los logros disponibles en el idioma especificado
   */
  async getAllAchievements(language: Language = 'es'): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase.from('achievements').select('*').order('created_at');

      if (error) {
        throw new Error(`Error fetching achievements: ${error.message}`);
      }

      return data.map((a) => this.mapToAchievement(a, language));
    } catch (error) {
      console.error('AchievementService.getAllAchievements error:', error);
      throw error;
    }
  }

  /**
   * Obtener logros de un usuario
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching user achievements: ${error.message}`);
      }

      // Mapear directamente sin esperar el join (será resuelto en el frontend si es necesario)
      return (data || []).map((ua: any) => ({
        id: ua.id,
        user_id: ua.user_id,
        achievement_id: ua.achievement_id,
        unlocked_at: ua.unlocked_at,
      }));
    } catch (error) {
      console.error('AchievementService.getUserAchievements error:', error);
      // Retornar array vacío si hay error
      return [];
    }
  }

  /**
   * Desbloquear logro para un usuario
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      // Verificar si ya tiene el logro
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        return null; // Ya tiene el logro
      }

      // Crear nuevo logro desbloqueado
      const userAchievementId = uuidv4();
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          id: userAchievementId,
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error unlocking achievement: ${error.message}`);
      }

      return {
        id: data.id,
        user_id: data.user_id,
        achievement_id: data.achievement_id,
        unlocked_at: data.unlocked_at,
      };
    } catch (error) {
      console.error('AchievementService.unlockAchievement error:', error);
      throw error;
    }
  }

  /**
   * Verificar y desbloquear logros basados en acciones del usuario
   */
  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const unlocked: UserAchievement[] = [];

      // Obtener estadísticas del usuario
      const stats = await this.getUserStats(userId);

      // Verificar logro: Primera respuesta
      if (stats.totalAnswers === 1) {
        const achievement = await this.findAchievementByCode('first_answer');
        if (achievement) {
          const unlockedAchievement = await this.unlockAchievement(userId, achievement.id);
          if (unlockedAchievement) unlocked.push(unlockedAchievement);
        }
      }

      // Verificar logro: 100 preguntas respondidas
      if (stats.totalAnswers >= 100) {
        const achievement = await this.findAchievementByCode('questions_100');
        if (achievement) {
          const unlockedAchievement = await this.unlockAchievement(userId, achievement.id);
          if (unlockedAchievement) unlocked.push(unlockedAchievement);
        }
      }

      // Verificar logros por tema (90%+ de aciertos)
      for (const [topic, topicStats] of Object.entries(stats.topicsStats)) {
        if (topicStats.total >= 10 && topicStats.successRate >= 90) {
          const achievement = await this.findAchievementByCode(`topic_master_${topic.toLowerCase().replace(/\s+/g, '_')}`);
          if (achievement) {
            const unlockedAchievement = await this.unlockAchievement(userId, achievement.id);
            if (unlockedAchievement) unlocked.push(unlockedAchievement);
          }
        }
      }

      // Verificar logro: Streak de 7 días
      const streak = await this.getUserStreak(userId);
      if (streak.current_streak >= 7) {
        const achievement = await this.findAchievementByCode('streak_7');
        if (achievement) {
          const unlockedAchievement = await this.unlockAchievement(userId, achievement.id);
          if (unlockedAchievement) unlocked.push(unlockedAchievement);
        }
      }

      // Verificar logro: Examen con 80%+
      if (stats.bestExamScore >= 80) {
        const achievement = await this.findAchievementByCode('exam_champion');
        if (achievement) {
          const unlockedAchievement = await this.unlockAchievement(userId, achievement.id);
          if (unlockedAchievement) unlocked.push(unlockedAchievement);
        }
      }

      return unlocked;
    } catch (error) {
      console.error('AchievementService.checkAndUnlockAchievements error:', error);
      throw error;
    }
  }

  /**
   * Actualizar o crear streak de usuario
   */
  async updateStreak(userId: string): Promise<DailyStreak> {
    try {
      // Obtener streak existente o crear si no existe
      let { data: streak, error: streakError } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Si no existe, crear uno nuevo
      if (streakError && streakError.code === 'PGRST116') {
        return await this.createStreak(userId);
      }

      if (streakError) {
        throw new Error(`Error fetching streak: ${streakError.message}`);
      }

      // Verificar última actividad en study_answers y exam_answers
      const { data: studyAnswers } = await supabase
        .from('study_answers')
        .select('answered_at')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false })
        .limit(1);

      // Para exam_answers necesitamos join con exam_sessions para filtrar por user_id
      const { data: examAnswers } = await supabase
        .from('exam_answers')
        .select('created_at, exam_sessions!inner(user_id)')
        .eq('exam_sessions.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Encontrar la respuesta más reciente
      let lastAnswer = null;
      if (studyAnswers && studyAnswers.length > 0 && examAnswers && examAnswers.length > 0) {
        const studyDate = new Date(studyAnswers[0].answered_at);
        const examDate = new Date(examAnswers[0].created_at);
        lastAnswer = studyDate > examDate 
          ? { answered_at: studyAnswers[0].answered_at } 
          : { answered_at: examAnswers[0].created_at };
      } else if (studyAnswers && studyAnswers.length > 0) {
        lastAnswer = studyAnswers[0];
      } else if (examAnswers && examAnswers.length > 0) {
        lastAnswer = { answered_at: examAnswers[0].created_at };
      }

      if (!lastAnswer) {
        // Sin actividad, devolver streak actual
        return {
          user_id: streak.user_id,
          current_streak: streak.current_streak || 0,
          longest_streak: streak.longest_streak || 0,
          last_study_date: streak.last_study_date,
        };
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalizar a medianoche
      
      const lastAnswerDate = new Date(lastAnswer.answered_at);
      lastAnswerDate.setHours(0, 0, 0, 0); // Normalizar a medianoche

      // Fecha del último streak registrado
      const lastStreakDate = streak.last_study_date ? new Date(streak.last_study_date) : null;
      if (lastStreakDate) {
        lastStreakDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
      }

      // Calcular diferencia en días desde el último streak
      const daysSinceLastStreak = lastStreakDate 
        ? Math.floor((now.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      console.log('🔥 Streak calculation:', {
        now: now.toISOString().split('T')[0],
        lastAnswerDate: lastAnswerDate.toISOString().split('T')[0],
        lastStreakDate: lastStreakDate ? lastStreakDate.toISOString().split('T')[0] : 'null',
        daysSinceLastStreak,
        currentStreak: streak.current_streak,
      });

      let currentStreak = streak.current_streak || 0;
      let longestStreak = streak.longest_streak || 0;
      let shouldUpdate = false;

      // Solo actualizar si la última respuesta es de HOY
      const isToday = lastAnswerDate.getTime() === now.getTime();
      
      if (isToday && lastStreakDate) {
        const isSameDay = lastStreakDate.getTime() === now.getTime();
        
        if (isSameDay) {
          // Ya estudió hoy, no cambiar streak
          shouldUpdate = false;
        } else if (daysSinceLastStreak === 1) {
          // Estudió ayer, incrementar streak
          currentStreak++;
          longestStreak = Math.max(currentStreak, longestStreak);
          shouldUpdate = true;
        } else if (daysSinceLastStreak > 1) {
          // Pasó más de 1 día sin estudiar, resetear a 1
          currentStreak = 1;
          shouldUpdate = true;
        }
      } else if (isToday && !lastStreakDate) {
        // Primer día de estudio
        currentStreak = 1;
        longestStreak = 1;
        shouldUpdate = true;
      } else if (!isToday && daysSinceLastStreak > 1) {
        // No estudió hoy y pasó más de 1 día, resetear a 0
        currentStreak = 0;
        shouldUpdate = true;
      }

      // Solo actualizar en BD si hubo cambios
      if (!shouldUpdate) {
        return {
          user_id: streak.user_id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_study_date: streak.last_study_date,
        };
      }

      // Actualizar streak
      const updateData: any = {
        current_streak: currentStreak,
        longest_streak: longestStreak,
      };

      // Solo actualizar last_study_date si estudió HOY
      if (isToday) {
        updateData.last_study_date = now.toISOString();
      }

      const { error: updateError } = await supabase
        .from('daily_streaks')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Error updating streak: ${updateError.message}`);
      }

      return {
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_study_date: isToday ? now.toISOString() : streak.last_study_date,
      };
    } catch (error: any) {
      // Si no existe el streak, crear uno
      if (error.code === 'PGRST116') {
        return await this.createStreak(userId);
      }
      console.error('AchievementService.updateStreak error:', error);
      throw error;
    }
  }

  /**
   * Crear streak inicial
   */
  private async createStreak(userId: string): Promise<DailyStreak> {
    try {
      // Primero verificar si ya existe
      const { data: existing } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Ya existe, devolverlo
        return {
          user_id: existing.user_id,
          current_streak: existing.current_streak || 1,
          longest_streak: existing.longest_streak || 1,
          last_study_date: existing.last_study_date,
        };
      }

      // No existe, crear uno nuevo
      const { data, error } = await supabase
        .from('daily_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Si la tabla no existe, devolver streak básico
        if (error.code === '42P01') {
          return {
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_study_date: new Date().toISOString(),
          };
        }
        throw new Error(`Error creating streak: ${error.message}`);
      }

      return {
        user_id: data.user_id,
        current_streak: data.current_streak || 1,
        longest_streak: data.longest_streak || 1,
        last_study_date: data.last_study_date,
      };
    } catch (error: any) {
      // Si hay error, devolver streak básico
      console.error('AchievementService.createStreak error:', error);
      return {
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_study_date: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtener streak de usuario
   */
  async getUserStreak(userId: string): Promise<DailyStreak> {
    try {
      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe, crear uno inicial
          return await this.createStreak(userId);
        }
        throw new Error(`Error fetching streak: ${error.message}`);
      }

      return {
        user_id: data.user_id,
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
        last_study_date: data.last_study_date || new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.code === '42P01') {
        // Tabla no existe, devolver streak básico
        return {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_study_date: new Date().toISOString(),
        };
      }
      console.error('AchievementService.getUserStreak error:', error);
      throw error;
    }
  }

  /**
   * Buscar logro por código
   */
  private async findAchievementByCode(code: string): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error finding achievement: ${error.message}`);
      }

      return this.mapToAchievement(data, 'es');
    } catch (error) {
      console.error('AchievementService.findAchievementByCode error:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas del usuario para verificar logros
   */
  private async getUserStats(userId: string): Promise<{
    totalAnswers: number;
    topicsStats: Record<string, { total: number; correct: number; successRate: number }>;
    bestExamScore: number;
  }> {
    try {
      // Total de respuestas (combinar study_answers y exam_answers)
      const { count: studyAnswersCount } = await supabase
        .from('study_answers')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      // Para exam_answers necesitamos hacer join con exam_sessions
      const { data: examAnswersData } = await supabase
        .from('exam_answers')
        .select('id, exam_sessions!inner(user_id)')
        .eq('exam_sessions.user_id', userId);

      const examAnswersCount = examAnswersData?.length || 0;
      const totalAnswers = (studyAnswersCount || 0) + examAnswersCount;

      // Estadísticas por tema
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      const topicsStats: Record<string, { total: number; correct: number; successRate: number }> = {};
      if (progress) {
        progress.forEach((p: any) => {
          if (p.topic) {
            topicsStats[p.topic] = {
              total: p.total_questions || 0,
              correct: p.correct_answers || 0,
              successRate: p.success_rate || 0,
            };
          }
        });
      }

      // Mejor puntaje de examen
      const { data: exams, error: examError } = await supabase
        .from('exam_sessions')
        .select('score')
        .eq('user_id', userId)
        .not('score', 'is', null)
        .order('score', { ascending: false })
        .limit(1);

      if (examError) {
        console.error('Error fetching exam scores:', examError);
      }

      const bestExamScore = exams && exams.length > 0 ? (exams[0].score as number) : 0;

      return {
        totalAnswers: totalAnswers || 0,
        topicsStats,
        bestExamScore,
      };
    } catch (error) {
      console.error('AchievementService.getUserStats error:', error);
      return {
        totalAnswers: 0,
        topicsStats: {},
        bestExamScore: 0,
      };
    }
  }

  /**
   * Mapear achievement de BD a DTO en el idioma especificado
   */
  private mapToAchievement(data: any, language: Language = 'es'): Achievement {
    const useEnglish = language === 'en' && data.name_en != null;
    
    return {
      id: data.id,
      code: data.code,
      name: useEnglish ? data.name_en : data.name_es,
      description: useEnglish ? data.description_en : data.description_es,
      icon: data.icon,
      criteria: data.criteria,
      language: useEnglish ? 'en' : 'es',
    };
  }
}

export default new AchievementService();
