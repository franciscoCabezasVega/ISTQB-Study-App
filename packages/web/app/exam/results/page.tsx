'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useExamStore } from '@/lib/store/examStore';
import { useTranslation } from '@/lib/useTranslation';

function ExamResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { user } = useAuthStore();
  const { resetExam } = useExamStore();
  const { t } = useTranslation();

  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevenir doble llamada en React StrictMode (desarrollo)
  const hasFetchedRef = useRef(false);

  // Helper para redondear porcentajes sin decimales innecesarios
  const formatPercent = (value: number) => {
    return Number.isInteger(value) ? `${value}%` : `${Math.round(value)}%`;
  };

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

    // Evitar doble fetch causado por React StrictMode
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchResults = async () => {
      try {
        const response = await apiClient.getExamResults(sessionId);
        setResults(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Error loading results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md w-full text-center">
          <p className="text-lg">{t('exam.results.calculatingResults')}</p>
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-4"></div>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || t('exam.results.errorLoading')}</p>
          <Button onClick={() => router.push('/exam')} variant="primary">
            {t('exam.results.backToExam')}
          </Button>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con resultado */}
        <Card
          className={`border-4 text-center py-8 ${
            results.passed
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className="text-6xl mb-4">
            {results.passed ? '🎉' : '😞'}
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
            {results.passed ? t('exam.results.passed') : t('exam.results.failed')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {results.passed
              ? t('exam.results.passedMessage')
              : t('exam.results.failedMessage')}
          </p>
        </Card>

        {/* Scores principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {formatPercent(results.score)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{t('exam.results.finalScore')}</p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {results.correctAnswers}/{results.totalQuestions}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{t('exam.results.correctAnswers')}</p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {(results.totalQuestions - results.correctAnswers)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{t('exam.results.incorrectAnswers')}</p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {formatTime(results.timeElapsed)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{t('exam.results.timeSpent')}</p>
          </Card>
        </div>

        {/* Análisis con barra visual de línea de paso */}
        <Card>
          <h3 className="text-lg font-bold mb-4">{t('exam.results.performanceAnalysis')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{t('exam.results.overallScore')}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatPercent(results.score)}</span>
              </div>
              
              {/* Barra de progreso con indicador de línea de paso */}
              <div className="relative">
                <ProgressBar progress={results.score} label="" />
                
                {/* Línea de paso visual en 65% */}
                <div className="absolute top-0 left-[65%] transform -translate-x-1/2 h-full flex flex-col items-center">
                  <div className="h-full w-0.5 bg-yellow-500 dark:bg-yellow-400"></div>
                  <div className="absolute -top-8 bg-yellow-500 dark:bg-yellow-400 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold shadow-lg">
                    {t('exam.results.passMarker')}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('exam.results.passingLine')}: 65%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('exam.results.yourScore')}: {formatPercent(results.score)}
                  </span>
                </div>
              </div>
              {results.passed ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {t('exam.results.passedBy', { percent: Math.round(results.score - 65) })}
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {t('exam.results.failedBy', { percent: Math.round(65 - results.score) })}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Desglose por tema */}
        {results.breakdownByTopic && Object.keys(results.breakdownByTopic).length > 0 && (
          <Card>
            <h3 className="text-lg font-bold mb-4">{t('exam.results.topicBreakdown')}</h3>
            <div className="space-y-4">
              {Object.entries(results.breakdownByTopic).map(
                ([topic, stats]: [string, any]) => {
                  const topicScore = (stats.correct / stats.total) * 100;
                  return (
                    <div key={topic} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {topic}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {stats.correct}/{stats.total} ({formatPercent(topicScore)})
                        </span>
                      </div>
                      <ProgressBar progress={topicScore} label="" />
                    </div>
                  );
                }
              )}
            </div>
          </Card>
        )}

        {/* Recomendaciones */}
        <Card className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-bold mb-4">
            {t('exam.results.recommendations')}
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {!results.passed && (
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span>{t('exam.results.reviewWeakAreas')}</span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('exam.results.studyMode')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('exam.results.errorBank')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>{t('exam.results.takeAnother')}</span>
            </li>
          </ul>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4 flex-wrap">
          <Button variant="success" size="lg" onClick={() => {
            resetExam();
            router.push('/study');
          }} className="flex-1">
            {t('exam.results.backToStudy')}
          </Button>
          <Button variant="primary" size="lg" onClick={() => {
            resetExam();
            router.push('/exam');
          }} className="flex-1">
            {t('exam.results.anotherExam')}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push('/progress')}>
            {t('exam.results.viewProgress')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExamResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center">
            <p className="text-lg">Cargando resultados...</p>
          </Card>
        </div>
      }
    >
      <ExamResultsContent />
    </Suspense>
  );
}
