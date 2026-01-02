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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const sessionLanguageRef = React.useRef<string>(language);

  // Detectar refresh de página: si hay una sesión activa en sessionStorage, redirigir al home
  useEffect(() => {
    const activeSession = sessionStorage.getItem('active_exam_session');
    
    if (activeSession === 'true') {
      // Hubo un refresh durante la sesión activa -> redirigir al home
      console.log('[SESSION] Refresh detectado durante sesión de examen activa. Redirigiendo al home...');
      sessionStorage.removeItem('active_exam_session');
      router.push('/');
      return;
    }
    
    // Marcar que la sesión está activa
    sessionStorage.setItem('active_exam_session', 'true');
    sessionLanguageRef.current = language;
    setIsSessionActive(true);
    
    // Limpiar al desmontar el componente (navegación normal o salida)
    return () => {
      sessionStorage.removeItem('active_exam_session');
    };
  }, [router, language]);

  // Detectar cambio de idioma durante la sesión
  useEffect(() => {
    if (isSessionActive && sessionData && language !== sessionLanguageRef.current) {
      console.log('[SESSION] Cambio de idioma detectado durante sesión de examen activa. Redirigiendo al home...');
      sessionStorage.removeItem('active_exam_session');
      router.push('/');
      return;
    }
  }, [language, sessionData, isSessionActive, router]);

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem('active_exam_session');
      router.push('/auth/signin');
      return;
    }

    if (!sessionId) {
      setError('Session ID not found');
      setLoading(false);
      sessionStorage.removeItem('active_exam_session');
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
        const existingQuestions = parsed.state?.questions || [];

        console.log('[DEBUG] Exam session data:', { 
          existingQuestionsCount: existingQuestions.length,
          language 
        });

        // Si ya hay preguntas en el store y no ha cambiado el idioma, usarlas
        if (existingQuestions.length > 0) {
          console.log('[DEBUG] Using existing questions from store');
          setSessionData({
            sessionId,
            questions: existingQuestions,
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
          });

          // Actualizar el localStorage con las nuevas preguntas
          parsed.state.questions = questions;
          localStorage.setItem('exam-store', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error('Error loading exam questions:', e);
        setError('Error loading session data');
        sessionStorage.removeItem('active_exam_session');
      } finally {
        setLoading(false);
      }
    };

    if (isSessionActive) {
      loadExamQuestions();
    }
  }, [sessionId, user, router, isSessionActive]); // NO incluir language para evitar recarga durante el examen

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
