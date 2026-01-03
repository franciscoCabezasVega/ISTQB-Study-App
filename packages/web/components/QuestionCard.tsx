'use client';

import React, { useState } from 'react';
import { Question } from '@istqb-app/shared';
import { Card } from './Card';
import { Button } from './Button';
import { useTranslation } from '@/lib/useTranslation';

// Helper function to process text with line breaks
const processText = (text: string): string => {
  if (!text) return '';
  // Replace literal \n with actual line breaks
  return text.replace(/\\n/g, '\n');
};

// Helper function to check if text contains HTML
const containsHTML = (text: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(text);
};

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedOptions: string[], timeSpent: number) => void;
  isLoading?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
  selectedAnswerIds?: string[];
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  isLoading = false,
  showFeedback = false,
  isCorrect = false,
  selectedAnswerIds = [],
}) => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (question.type === 'true_false' || question.type === 'multiple_choice') {
      if (question.type === 'true_false') {
        setSelectedOptions([optionId]);
      } else {
        setSelectedOptions((prev) =>
          prev.includes(optionId)
            ? prev.filter((id) => id !== optionId)
            : [...prev, optionId]
        );
      }
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0 && !answered) {
      setAnswered(true);
      onAnswer(selectedOptions, 0);
    }
  };

  return (
    <Card className="w-full">
      <h2 className="text-2xl font-bold mb-6">{question.title}</h2>
      {question.description && (
        containsHTML(question.description) ? (
          <div 
            className="text-gray-700 dark:text-gray-300 mb-6 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">{processText(question.description)}</p>
        )
      )}

      <div className="space-y-3 mb-8">
        {Array.isArray(question.options) &&
          question.options.map((option: { id: string; text: string }) => (
            <label
              key={option.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                selectedOptions.includes(option.id)
                  ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                  : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              } ${answered ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <input
                type={question.type === 'true_false' ? 'radio' : 'checkbox'}
                name={`question-${question.id}`}
                value={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleSelectOption(option.id)}
                disabled={answered}
                className="w-5 h-5"
              />
              <span className="ml-3 text-gray-800 dark:text-gray-200">{option.text}</span>
            </label>
          ))}
      </div>

      {showFeedback && answered && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            isCorrect
              ? 'bg-green-100 border border-green-500 dark:bg-green-900 dark:border-green-400'
              : 'bg-red-100 border border-red-500 dark:bg-red-900 dark:border-red-400'
          }`}
        >
          <h3 className="font-bold mb-2">
            {isCorrect ? '✅ ' + t('study.correct') : '❌ ' + t('study.incorrect')}
          </h3>
          {selectedAnswerIds && selectedAnswerIds.length > 0 && (
            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              {selectedAnswerIds.map((optionId) => {
                const option = question.options.find((opt) => opt.id === optionId);
                if (option?.explanation) {
                  return (
                    <p key={optionId} className="whitespace-pre-line">{processText(option.explanation)}</p>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}

      {!answered && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={selectedOptions.length === 0 || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? t('study.evaluating') : t('study.submitAnswer')}
        </Button>
      )}
    </Card>
  );
};
