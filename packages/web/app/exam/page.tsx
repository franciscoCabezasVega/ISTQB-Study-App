'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useExamStore } from '@/lib/store/examStore';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguageStore } from '@/lib/store/languageStore';

function ExamPageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { startExam } = useExamStore();
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">{t('exam.accessRequired')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('exam.mustSignIn')}
          </p>
          <Button onClick={() => router.push('/auth/signin')} variant="primary" size="lg">
            {t('exam.goToSignIn')}
          </Button>
        </Card>
      </div>
    );
  }

  const handleStartExam = async () => {
    try {
      setLoading(true);

      // Crear sesión de examen con el idioma actual
      const response = await apiClient.createExamSession(language);
      const session = response.data.data;

      // Iniciar store con las preguntas
      startExam(session.sessionId, session.totalQuestions, session.questions);

      // Redirigir a la sesión
      router.push(`/exam/session?sessionId=${session.sessionId}`);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Cambio de lógica: eliminar la condición !acknowledged
  if (showInstructions) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">📋 {t('exam.detailedInstructions')}</h1>

        <div className="space-y-4">
          <Card className="border-l-4 border-blue-500">
            <h3 className="text-xl font-bold mb-2">🎯 {t('exam.objective')}</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {t('exam.objectiveDesc')}
            </p>
          </Card>

          <Card className="border-l-4 border-green-500">
            <h3 className="text-xl font-bold mb-2">⏱️ {t('exam.timeAndQuestions')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>{t('exam.totalQuestions')}</strong> 40</li>
              <li><strong>{t('exam.timeLimitLabel')}</strong> 60 {t('exam.minutes')}</li>
              <li><strong>{t('exam.avgTimePerQuestion')}</strong> 1.5 {t('exam.minutes')}</li>
              <li><strong>{t('exam.scoring')}</strong> 2.5 {t('exam.toPass')} (total 100)</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <h3 className="text-xl font-bold mb-2">✅ {t('exam.passingCriteria')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>{t('exam.minToPass')}</strong> 65% (26 {t('exam.questions').toLowerCase()})</li>
              <li><strong>{t('exam.currentCertification')}</strong> {t('exam.requires65')}</li>
              <li>{t('exam.detailedBreakdown')}</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <h3 className="text-xl font-bold mb-2">📌 {t('exam.examRules')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('exam.cannotPause')}</li>
              <li>{t('exam.timerCountsDown')}</li>
              <li>{t('exam.cannotGoBack')}</li>
              <li>{t('exam.allRequired')}</li>
              <li>{t('exam.canReview')}</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-red-500">
            <h3 className="text-xl font-bold mb-2">⚠️ {t('exam.important')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('exam.ensureTime')}</li>
              <li>{t('exam.stableConnection')}</li>
              <li>{t('exam.minimizeDistractions')}</li>
              <li>{t('exam.havePaper')}</li>
            </ul>
          </Card>
        </div>

        <Card className="bg-yellow-50 dark:bg-yellow-900/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {t('exam.acknowledgeInstructions')}
            </span>
          </label>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setShowInstructions(false);
              setAcknowledged(false);
            }}
            disabled={loading}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={handleStartExam}
            disabled={!acknowledged || loading}
          >
            {loading ? t('exam.starting') : t('exam.beginExam')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">🎯 {t('exam.title')}</h1>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
        <h2 className="text-2xl font-bold mb-6">{t('exam.examInformation')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">40</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('exam.questions')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">60</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('exam.minutes')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">65%</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('exam.toPass')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">100</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('exam.maxPoints')}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">{t('exam.quickSummary')}</h2>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>{t('exam.summary1')} <strong>40 {t('exam.questions').toLowerCase()}</strong> {t('exam.summary1b')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>{t('exam.summary2')} <strong>60 {t('exam.minutes')}</strong> {t('exam.summary2b')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>{t('exam.summary3')} <strong>65% {t('exam.summary3b')}</strong> {t('exam.summary3c')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>{t('exam.summary5')} <strong>{t('exam.summary5b')}</strong></span>
          </li>
        </ul>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="success"
          size="lg"
          onClick={() => setShowInstructions(true)}
          disabled={loading}
          className="flex-1"
        >
          {loading ? t('exam.starting') : t('exam.startExam')}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.push('/study')}>
          {t('exam.backToStudy')}
        </Button>
      </div>
    </div>
  );
}

export default function ExamPage() {
  const { t } = useTranslation();
  
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center">
            <p className="text-lg">{t('exam.loadingExam')}</p>
          </Card>
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
}
