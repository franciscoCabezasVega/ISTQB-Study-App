'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CardSkeleton } from '@/components/Skeleton';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/useTranslation';
import { ISTQB_TOPICS } from '@istqb-app/shared';

interface TopicStats {
  [key: string]: {
    total: number;
    correct: number;
    percentage: number;
  };
}

interface QuestionCounts {
  [key: string]: number;
}

export default function StudyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<TopicStats>({});
  const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({});
  const [loading, setLoading] = useState(true);

  // Mapeo de IDs a nombres en BD (inglés) - Nombres oficiales ISTQB
  const topicIdToDbName: Record<string, string> = {
    'fundamentals': 'Fundamentals of Testing',
    'sdlc': 'Testing Throughout the Software Development Lifecycle',
    'static': 'Static Testing',
    'techniques': 'Test Analysis and Design',
    'management': 'Managing the Test Activities',
    'tools': 'Test Tools',
  };

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsResponse, countsResponse] = await Promise.all([
          apiClient.getStatistics(),
          apiClient.getQuestionCountByTopic(),
        ]);

        const statsMap: TopicStats = {};
        
        statsResponse.data.statisticsByTopic?.forEach((stat: any) => {
          statsMap[stat.topic] = {
            total: stat.total_questions || 0,
            correct: stat.correct_answers || 0,
            percentage: stat.success_rate || 0,
          };
        });

        setStats(statsMap);
        setQuestionCounts(countsResponse.data.data || {});
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleStartStudy = (topicDbName: string) => {
    router.push(`/study/session?topic=${encodeURIComponent(topicDbName)}`);
  };

  const topics = [
    {
      id: 'fundamentals',
      titleKey: 'study.topics.fundamentals.title',
      descriptionKey: 'study.topics.fundamentals.description',
      icon: '🔍',
    },
    {
      id: 'sdlc',
      titleKey: 'study.topics.sdlc.title',
      descriptionKey: 'study.topics.sdlc.description',
      icon: '🔄',
    },
    {
      id: 'static',
      titleKey: 'study.topics.static.title',
      descriptionKey: 'study.topics.static.description',
      icon: '📄',
    },
    {
      id: 'techniques',
      titleKey: 'study.topics.techniques.title',
      descriptionKey: 'study.topics.techniques.description',
      icon: '🛠️',
    },
    {
      id: 'management',
      titleKey: 'study.topics.management.title',
      descriptionKey: 'study.topics.management.description',
      icon: '📋',
    },
    {
      id: 'tools',
      titleKey: 'study.topics.tools.title',
      descriptionKey: 'study.topics.tools.description',
      icon: '⚙️',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">📖 {t('study.pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('study.pageSubtitle')}
        </p>
      </div>

      {/* Botones de acción rápida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <Button
          variant="success"
          size="lg"
          onClick={() => router.push('/exam')}
          className="w-full"
        >
          🎯 {t('study.examSimulator')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push('/progress')}
          className="w-full"
        >
          📊 {t('study.viewProgress')}
        </Button>
      </div>

      {/* Grid de temas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const title = t(topic.titleKey);
            const dbTopicName = topicIdToDbName[topic.id];
            const stat = stats[dbTopicName];
            const totalAvailable = questionCounts[dbTopicName] || 0;
            const correct = stat ? stat.correct : 0;
            const progressPercentage = totalAvailable > 0 ? (correct / totalAvailable) * 100 : 0;
            const hasQuestions = totalAvailable > 0;
            
            return (
              <Card key={topic.id}>
                <div className="mb-3 min-h-[3.5rem]">
                  <h2 className="text-lg font-bold line-clamp-2 leading-tight">{topic.icon} {title}</h2>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {t(topic.descriptionKey)}
                </p>

                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t('study.progress')}: <strong>{correct}/{totalAvailable}</strong> ({progressPercentage.toFixed(1)}%)
                  </p>
                  <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {totalAvailable} {t('study.availableQuestions')}
                  </p>
                </div>

                <div className="relative group mt-auto">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleStartStudy(dbTopicName)}
                    disabled={!hasQuestions}
                  >
                    {t('study.startButton')}
                  </Button>
                  {!hasQuestions && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {t('study.noQuestionsAvailable')}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
