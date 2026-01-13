'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question } from '@istqb-app/shared';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { QuestionSkeleton } from '@/components/Skeleton';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useTranslation } from '@/lib/useTranslation';

// Cache para preguntas ya cargadas
const questionsCache = new Map<string, Question[]>();

// Helper function to process text with line breaks
const processText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
};

// Helper function to check if text contains HTML
const containsHTML = (text: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(text);
};

// Helper function to add lazy loading to images in HTML
const addLazyLoadingToHTML = (html: string): string => {
  if (!html) return '';
  // Add loading="lazy" to all img tags that don't already have it
  return html.replace(/<img(?![^>]*loading=)/g, '<img loading="lazy"');
};

interface ReviewQuestionCardProps {
  question: Question;
  index: number;
}

const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = React.memo(({ question, index }) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full mb-6">
      <div className="mb-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
          {t('study.question')} {index + 1}
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
      
      {question.description && (
        <div className="mb-6">
          {(() => {
            const imagePlaceholder = /{{IMAGE}}|\[IMAGE\]/;
            const hasPlaceholder = question.image_url && imagePlaceholder.test(question.description);
            
            if (hasPlaceholder) {
              // Replace placeholder with image
              const imageElement = '<div class="my-6 flex justify-center"><img src="' + question.image_url + '" alt="Diagrama de la pregunta" class="max-w-full h-auto rounded-lg shadow-md border border-gray-300 dark:border-gray-600" loading="lazy" /></div>';
              const htmlWithImage = question.description.replace(imagePlaceholder, imageElement);
              return (
                <div 
                  className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: addLazyLoadingToHTML(htmlWithImage) }}
                />
              );
            }
            
            // Normal rendering without placeholder
            if (containsHTML(question.description)) {
              return (
                <div 
                  className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: addLazyLoadingToHTML(question.description) }}
                />
              );
            }
            
            return (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {processText(question.description)}
              </p>
            );
          })()}
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

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('study.options')}:
        </h3>
        {Array.isArray(question.options) &&
          question.options.map((option) => {
            const isCorrect = question.correct_answer_ids.includes(option.id);
            
            return (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {containsHTML(option.text) ? (
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: addLazyLoadingToHTML(option.text) }}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{processText(option.text)}</p>
                    )}
                  </div>
                  {isCorrect && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                      ✓ {t('study.correct')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {question.explanation && question.explanation !== question.description && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            {t('study.explanation')}:
          </h4>
          {containsHTML(question.explanation) ? (
            <div 
              className="text-blue-800 dark:text-blue-300 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: addLazyLoadingToHTML(question.explanation) }}
            />
          ) : (
            <p className="text-blue-800 dark:text-blue-300 whitespace-pre-line">
              {processText(question.explanation)}
            </p>
          )}
        </div>
      )}
    </Card>
  );
});

ReviewQuestionCard.displayName = 'ReviewQuestionCard';

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'Fundamentals of Testing';
  const { language } = useLanguageStore();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const questionsPerPage = 5;
  
  // Ref para evitar múltiples cargas
  const loadingRef = useRef(false);
  const prevTopicRef = useRef<string>('');
  const prevLanguageRef = useRef<string>('');
  const cacheKey = `${topic}-${language}`;

  // Mapeo de temas en inglés a las claves en i18n
  const topicKeyMap: Record<string, string> = {
    'Fundamentals of Testing': 'fundamentals',
    'Testing Throughout the Software Development Lifecycle': 'sdlc',
    'Static Testing': 'static',
    'Test Analysis and Design': 'techniques',
    'Managing the Test Activities': 'management',
    'Test Tools': 'tools',
  };

  // Función para obtener el título traducido
  const getTranslatedTopicTitle = () => {
    const topicKey = topicKeyMap[topic];
    if (topicKey) {
      return t(`study.topics.${topicKey}.title`);
    }
    return topic;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      // Evitar cargas múltiples simultáneas
      if (loadingRef.current) return;
      
      // Verificar caché primero
      const cached = questionsCache.get(cacheKey);
      if (cached) {
        setQuestions(cached);
        setLoading(false);
        return;
      }

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        // UNA SOLA petición para cargar las preguntas
        const response = await apiClient.getQuestionsByTopic(
          topic,
          language,
          100 // Límite aumentado a 100 preguntas para mejor cobertura
        );
        
        const loadedQuestions = response.data || [];
        
        // Guardar en caché
        questionsCache.set(cacheKey, loadedQuestions);
        setQuestions(loadedQuestions);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(t('study.errorLoadingQuestions') || 'Error al cargar las preguntas');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    // Reset página solo si cambió el tópico o idioma
    if (prevTopicRef.current !== topic || prevLanguageRef.current !== language) {
      console.log('Topic or language changed, resetting to page 1');
      setCurrentPage(1);
      prevTopicRef.current = topic;
      prevLanguageRef.current = language;
    }

    loadQuestions();
  }, [topic, language, t, cacheKey]);

  // Calcular preguntas a mostrar en la página actual
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const handleNextPage = () => {
    console.log('Next clicked - Current:', currentPage, 'Total:', totalPages, 'Changing:', isChangingPage);
    if (currentPage < totalPages && !isChangingPage) {
      console.log('Advancing to next page');
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsChangingPage(true);
      setCurrentPage((prev) => {
        console.log('Setting page from', prev, 'to', prev + 1);
        return prev + 1;
      });
      setTimeout(() => setIsChangingPage(false), 150);
    }
  };

  const handlePrevPage = () => {
    console.log('Prev clicked - Current:', currentPage, 'Changing:', isChangingPage);
    if (currentPage > 1 && !isChangingPage) {
      console.log('Going to previous page');
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsChangingPage(true);
      setCurrentPage((prev) => {
        console.log('Setting page from', prev, 'to', prev - 1);
        return prev - 1;
      });
      setTimeout(() => setIsChangingPage(false), 150);
    }
  };

  const handlePageClick = (page: number) => {
    console.log('Page clicked:', page, 'Current:', currentPage, 'Changing:', isChangingPage);
    if (page !== currentPage && !isChangingPage) {
      console.log('Changing to page:', page);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsChangingPage(true);
      setCurrentPage(page);
      setTimeout(() => setIsChangingPage(false), 150);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <QuestionSkeleton />
          <QuestionSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => router.push('/study')}>
                {t('common.back')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('study.noQuestionsAvailable')}
              </p>
              <Button onClick={() => router.push('/study')}>
                {t('common.back')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/study')}
            className="mb-4"
          >
            ← {t('common.back')}
          </Button>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t('study.reviewMode')}: {getTranslatedTopicTitle()}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {questions.length} {questions.length === 1 ? t('study.question') : t('study.questions')} 
                  {questions.length > questionsPerPage && (
                    <span className="ml-2">
                      ({t('study.showing')} {indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, questions.length)})
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t('common.language')}
                </div>
                <div className="font-semibold text-lg">
                  {language === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Questions List */}
        <div 
          className={`space-y-6 transition-opacity duration-200 ${
            isChangingPage ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ minHeight: '600px' }}
        >
          {currentQuestions.map((question, index) => (
            <ReviewQuestionCard
              key={`${question.id}-${currentPage}`}
              question={question}
              index={indexOfFirstQuestion + index}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Card>
              <div className="flex items-center justify-between">
                <Button 
                  onClick={handlePrevPage} 
                  disabled={currentPage <= 1 || isChangingPage}
                  variant="secondary"
                >
                  ← {t('common.previous')}
                </Button>
                
                <div className="flex items-center gap-2">
                  {/* Mostrar páginas */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button 
                  onClick={handleNextPage} 
                  disabled={currentPage >= totalPages || isChangingPage}
                  variant="secondary"
                >
                  {t('common.next')} →
                </Button>
              </div>
              
              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                {t('study.page')} {currentPage} {t('study.of')} {totalPages}
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8">
          <Card>
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('study.reviewComplete')} {questions.length} {questions.length === 1 ? t('study.question') : t('study.questions')}
              </p>
              <Button onClick={() => router.push('/study')}>
                {t('study.backToTopics')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <QuestionSkeleton />
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
