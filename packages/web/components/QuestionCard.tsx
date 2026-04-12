'use client';

import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Question } from '@istqb-app/shared';
import { Card } from './Card';
import { Button } from './Button';
import { useTranslation } from '@/lib/useTranslation';
import { useReportStore } from '@/lib/store/reportStore';

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

// Helper function to replace image placeholder with actual image
const renderDescriptionWithImage = (description: string, imageUrl: string | null | undefined): JSX.Element => {
  const imagePlaceholder = /{{IMAGE}}|\[IMAGE\]/g;
  
  if (!imageUrl || !imagePlaceholder.test(description)) {
    // No image or no placeholder, render description normally
    if (containsHTML(description)) {
      return (
        <div 
          className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
        />
      );
    }
    return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{processText(description)}</p>;
  }
  
  // Replace placeholder with image
  const imageElement = '<div class="my-6 flex justify-center"><img src="' + imageUrl + '" alt="Diagrama de la pregunta" class="max-w-full h-auto rounded-lg shadow-md border border-gray-300 dark:border-gray-600" loading="lazy" /></div>';
  const htmlWithImage = description.replace(imagePlaceholder, imageElement);
  
  return (
    <div 
      className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlWithImage, { ADD_TAGS: ['img'], ADD_ATTR: ['src', 'alt', 'class', 'loading'] }) }}
    />
  );
};

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedOptions: string[], timeSpent: number) => void;
  isLoading?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
  selectedAnswerIds?: string[];
}

const EMPTY_ANSWER_IDS: string[] = [];

export const QuestionCard: React.FC<QuestionCardProps> = React.memo((
  {
    question,
    onAnswer,
    isLoading = false,
    showFeedback = false,
    isCorrect = false,
    selectedAnswerIds = EMPTY_ANSWER_IDS,
  }
) => {
  const { t } = useTranslation();
  const { openReportModal } = useReportStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Scroll al feedback cuando aparece (depende de showFeedback, no de answered,
  // porque feedbackRef.current es null hasta que el padre pasa showFeedback=true)
  useEffect(() => {
    if (showFeedback && feedbackRef.current) {
      const timer = setTimeout(() => {
        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        feedbackRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

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
        <div className="mb-6">
          {renderDescriptionWithImage(question.description, question.image_url)}
        </div>
      )}

      {/* Render image separately if no placeholder was found in description */}
      {question.image_url && !question.description?.match(/{{IMAGE}}|\[IMAGE\]/) && (
        <div className="mb-6 flex justify-center">
          <img 
            src={question.image_url} 
            alt="Diagrama de la pregunta" 
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-300 dark:border-gray-600"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-3 mb-8">
        {Array.isArray(question.options) &&
          question.options.map((option: { id: string; text: string }) => {
            const isCorrectOption = answered && showFeedback && question.correct_answer_ids.includes(option.id);
            const isWrongSelected = answered && showFeedback && selectedOptions.includes(option.id) && !question.correct_answer_ids.includes(option.id);

            let optionClass = 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600';
            if (answered && showFeedback) {
              if (isCorrectOption) {
                optionClass = 'bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-400';
              } else if (isWrongSelected) {
                optionClass = 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400';
              } else {
                optionClass = 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-40';
              }
            } else if (!answered && selectedOptions.includes(option.id)) {
              optionClass = 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400';
            }

            return (
              <label
                key={option.id}
                className={`flex items-center p-4 border rounded-lg transition ${answered ? 'cursor-not-allowed' : 'cursor-pointer'} ${optionClass}`}
              >
                {answered && showFeedback ? (
                  <span className="flex-shrink-0 flex items-center justify-center text-base leading-none">
                    {isCorrectOption ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : isWrongSelected ? (
                      <span>❌</span>
                    ) : null}
                  </span>
                ) : (
                  <input
                    type={question.type === 'true_false' ? 'radio' : 'checkbox'}
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleSelectOption(option.id)}
                    disabled={answered}
                    className="w-5 h-5 flex-shrink-0"
                  />
                )}
                <span
                  className={`ml-3 ${
                    answered && showFeedback
                      ? isCorrectOption
                        ? 'font-semibold text-green-800 dark:text-green-200'
                        : isWrongSelected
                          ? 'font-semibold text-red-800 dark:text-gray-100 line-through'
                          : 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {option.text}
                </span>
              </label>
            );
          })}
      </div>

      {showFeedback && answered && (
        <div
          ref={feedbackRef}
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
                  return containsHTML(option.explanation) ? (
                    <div
                      key={optionId}
                      className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option.explanation) }}
                    />
                  ) : (
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

      {/* Botón para reportar error en la pregunta */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => openReportModal({ type: 'question_error', questionId: question.id })}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
          title={t('report.reportQuestion')}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {t('report.reportQuestion')}
        </button>
      </div>
    </Card>
  );
});
