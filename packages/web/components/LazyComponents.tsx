/**
 * Lazy loading wrapper para componentes pesados
 * Mejora el performance inicial de la app cargando componentes bajo demanda
 */

import dynamic from 'next/dynamic';

// Loading component genérico
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load de componentes pesados con loading fallback
export const LazyExamSession = dynamic(
  () => import('./ExamSession').then((mod) => ({ default: mod.ExamSession })),
  {
    loading: LoadingFallback,
    ssr: false, // No renderizar en SSR para mejor FCP
  }
);

export const LazyExamResults = dynamic(
  () => import('./ExamResults').then((mod) => ({ default: mod.ExamResults })),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

export const LazyQuestionCard = dynamic(
  () => import('./QuestionCard').then((mod) => ({ default: mod.QuestionCard })),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);
