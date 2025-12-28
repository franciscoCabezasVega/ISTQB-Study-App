'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { formatPercentage } from '@/lib/utils';
import Link from 'next/link';

interface ExamResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passingScore?: number;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  totalQuestions,
  correctAnswers,
  timeSpent,
  passingScore = 65,
}) => {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const passed = percentage >= passingScore;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <Card className="w-full text-center">
      <div className="mb-8">
        {passed ? (
          <div className="text-6xl mb-4">🎉</div>
        ) : (
          <div className="text-6xl mb-4">📚</div>
        )}
        <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
          {passed ? '¡Excelente!' : 'Sigue estudiando'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {passed
            ? 'Estás listo para el examen ISTQB'
            : 'Necesitas repasar más temas'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Puntaje</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatPercentage(percentage)}
          </p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Correctas</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {correctAnswers}/{totalQuestions}
          </p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {minutes}m {seconds}s
          </p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-3">Recomendaciones:</h3>
        {passed ? (
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>✅ Has dominado los conceptos principales</li>
            <li>✅ Puedes realizar el examen oficial</li>
            <li>✅ Considera revisar temas avanzados</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>📖 Revisa los temas donde tuviste mayor dificultad</li>
            <li>🔄 Intenta nuevamente las preguntas incorrectas</li>
            <li>⏰ Practica más simulacros de examen</li>
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <Link href="/progress">
          <Button variant="primary" size="lg" className="w-full">
            Ver mi progreso
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="lg" className="w-full">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </Card>
  );
};
