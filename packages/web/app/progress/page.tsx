'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { StreakCounter } from '@/components/StreakCounter';
import { StatCardSkeleton, ProgressBarSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useStreakStore } from '@/lib/store/streakStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { formatPercentage } from '@/lib/utils';
import { useTranslation } from '@/lib/useTranslation';
import { translateTopicToSpanish } from '@istqb-app/shared';

interface StatsByTopic {
  topic: string;
  total_questions: number;
  correct_answers: number;
  success_rate: number;
}

interface ExamStatistics {
  total_exams: number;
  average_score: number;
  last_score: number;
  highest_score: number;
  exams_passed: number;
  last_exam_date: string | null;
}

export default function ProgressPage() {
  const { refreshStreak } = useStreakStore();
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsByTopic[]>([]);
  const [examStats, setExamStats] = useState<ExamStatistics | null>(null);
  const [overallSuccessRate, setOverallSuccessRate] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Refrescar el streak al cargar la página
        refreshStreak();
        
        const response = await apiClient.getStatistics();

        if (response.data.statisticsByTopic) {
          setStats(response.data.statisticsByTopic);
          
          // Calcular totales
          const total = response.data.statisticsByTopic.reduce(
            (sum: number, s: StatsByTopic) => sum + s.total_questions,
            0
          );
          const correct = response.data.statisticsByTopic.reduce(
            (sum: number, s: StatsByTopic) => sum + s.correct_answers,
            0
          );
          
          setTotalAnswers(total);
          setOverallSuccessRate(total > 0 ? (correct / total) * 100 : 0);
        }

        // Cargar estadísticas de examen
        console.log('API Response:', response.data);
        if (response.data.examStatistics) {
          console.log('Exam Statistics:', response.data.examStatistics);
          setExamStats(response.data.examStatistics);
        } else {
          console.log('No exam statistics in response');
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">📊 {t('progress.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('progress.subtitle')}
          </p>
        </div>

        {/* Skeletons para estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Skeletons para desempeño por tema */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('progress.performanceByTopic')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressBarSkeleton />
            <ProgressBarSkeleton />
            <ProgressBarSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">📊 {t('progress.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('progress.subtitle')}
        </p>
      </div>

      {/* Estadísticas generales de estudio */}
      <div>
        <h2 className="text-2xl font-bold mb-4">✏️ {t('progress.studyProgress')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.totalQuestions')}</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalAnswers}</p>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.successRate')}</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {formatPercentage(overallSuccessRate)}
          </p>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.topicsStudied')}</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.length}</p>
        </Card>

          <Card className="bg-orange-50 dark:bg-orange-900">
            <StreakCounter />
          </Card>
        </div>
      </div>

      {/* Desempeño por tema */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🎯 {t('progress.performanceByTopic')}</h2>

        {stats.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              {t('progress.noDataMessage')}
            </p>
            <Link href="/study" className="block">
              <Button variant="primary" size="lg" className="w-full">
                {t('study.startStudy')}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {stats.map((stat) => {
              const translatedTopic = language === 'es' ? translateTopicToSpanish(stat.topic) : stat.topic;
              return (
              <Card key={stat.topic}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">{translatedTopic}</h3>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>{stat.correct_answers} {t('progress.of')} {stat.total_questions} {t('progress.correctAnswers')}</span>
                      <span className="font-bold">{formatPercentage(stat.success_rate)}</span>
                  </div>
                </div>

                <ProgressBar
                  current={stat.correct_answers}
                  total={stat.total_questions}
                  color={
                    stat.success_rate >= 80
                      ? 'green'
                      : stat.success_rate >= 60
                      ? 'yellow'
                      : 'red'
                  }
                />
              </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Estadísticas de exámenes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📝 {t('progress.examSimulators')}</h2>

        {!examStats || examStats.total_exams === 0 ? (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              {t('progress.noExamsMessage')}
            </p>
            <Link href="/exam" className="block">
              <Button variant="success" size="lg" className="w-full">
                {t('exam.startExam')}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-blue-50 dark:bg-blue-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.totalExams')}</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{examStats.total_exams}</p>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.averageScore')}</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {formatPercentage(examStats.average_score || 0)}
              </p>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.lastScore')}</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercentage(examStats.last_score || 0)}
              </p>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.highestScore')}</p>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {formatPercentage(examStats.highest_score || 0)}
              </p>
            </Card>

            <Card className="bg-teal-50 dark:bg-teal-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.examsPassed')}</p>
              <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                {examStats.exams_passed}/{examStats.total_exams}
              </p>
            </Card>

            {examStats.last_exam_date && (
              <Card className="bg-pink-50 dark:bg-pink-900">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('progress.lastExamDate')}</p>
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {new Date(examStats.last_exam_date).toLocaleDateString()}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/study" className="w-full">
          <Button variant="primary" size="lg" className="w-full">
            📖 {t('study.continueStudying')}
          </Button>
        </Link>
        <Link href="/exam" className="w-full">
          <Button variant="success" size="lg" className="w-full">
            🎯 {t('exam.title')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
