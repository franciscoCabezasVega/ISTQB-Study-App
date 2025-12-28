'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExamSession } from '@/components/ExamSession';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Question } from '@istqb-app/shared';

function ExamSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { user } = useAuthStore();
  const { language } = useLanguageStore();

  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    questions: Question[];
    difficulty: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!sessionId) {
      setError('Session ID not found');
      setLoading(false);
      return;
    }

    // Cargar las preguntas de la sesión de examen
    const loadExamQuestions = async () => {
      setLoading(true);
      try {
        const examStorageData = localStorage.getItem('exam-store');
        if (!examStorageData) {
          setError('No exam session data found');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(examStorageData);
        const difficulty = parsed.state?.difficulty || 'all';
        const existingQuestions = parsed.state?.questions || [];

        console.log('[DEBUG] Exam session data:', { 
          difficulty, 
          existingQuestionsCount: existingQuestions.length,
          language 
        });

        // Si ya hay preguntas en el store y no ha cambiado el idioma, usarlas
        if (existingQuestions.length > 0) {
          console.log('[DEBUG] Using existing questions from store');
          setSessionData({
            sessionId,
            questions: existingQuestions,
            difficulty,
          });
        } else {
          console.log('[DEBUG] Loading questions from backend');
          // Si no hay preguntas, cargarlas del backend
          const response = await apiClient.getQuestionsForExam(40, language);
          const questions = response.data.data;

          console.log('[DEBUG] Questions loaded:', questions?.length || 0);

          if (!questions || questions.length === 0) {
            setError('No questions available');
            setLoading(false);
            return;
          }

          setSessionData({
            sessionId,
            questions,
            difficulty,
          });

          // Actualizar el localStorage con las nuevas preguntas
          parsed.state.questions = questions;
          localStorage.setItem('exam-store', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error('Error loading exam questions:', e);
        setError('Error loading session data');
      } finally {
        setLoading(false);
      }
    };

    loadExamQuestions();
  }, [sessionId, user, router]); // NO incluir language para evitar recarga durante el examen

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <p className="text-lg">Cargando examen...</p>
        </Card>
      </div>
    );
  }

  if (error || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Invalid session'}</p>
        </Card>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <p className="text-lg">Iniciando sesión de examen...</p>
        </Card>
      </div>
    );
  }

  return (
    <ExamSession
      sessionId={sessionId}
      questions={sessionData.questions}
      difficulty={sessionData.difficulty}
    />
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ExamSessionContent />
    </Suspense>
  );
}
