'use client';

import React, { useState, useEffect } from 'react';
import { useReportStore } from '@/lib/store/reportStore';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from './Button';

export const ReportModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isModalOpen,
    prefillType,
    prefillQuestionId,
    prefillPageUrl,
    closeReportModal,
    submitReport,
  } = useReportStore();

  const [type, setType] = useState<'question_error' | 'system_bug' | 'suggestion' | 'other'>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar con prefill al abrir
  useEffect(() => {
    if (isModalOpen) {
      setType(prefillType || 'other');
      setTitle('');
      setDescription('');
      setSubmitted(false);
      setError(null);
    }
  }, [isModalOpen, prefillType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError(t('report.errorTitleShort'));
      return;
    }
    if (description.trim().length < 10) {
      setError(t('report.errorDescShort'));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({
        type,
        title: title.trim(),
        description: description.trim(),
        question_id: prefillQuestionId || undefined,
        page_url: prefillPageUrl || undefined,
      });
      setSubmitted(true);
    } catch {
      setError(t('report.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReportModal();
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('report.modalTitle')}
          </h2>
          <button
            onClick={closeReportModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('report.submitSuccess')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('report.submitSuccessMessage')}
              </p>
              <Button variant="primary" onClick={closeReportModal}>
                {t('common.close')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de reporte */}
              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('report.typeLabel')}
                </label>
                <select
                  id="report-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="question_error">{t('report.type.question_error')}</option>
                  <option value="system_bug">{t('report.type.system_bug')}</option>
                  <option value="suggestion">{t('report.type.suggestion')}</option>
                  <option value="other">{t('report.type.other')}</option>
                </select>
              </div>

              {/* Pregunta asociada (solo lectura) */}
              {prefillQuestionId && (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-2">
                  🔗 {t('report.linkedQuestion')}: <code className="font-mono">{prefillQuestionId.slice(0, 8)}...</code>
                </div>
              )}

              {/* Título */}
              <div>
                <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('report.titleLabel')}
                  <span className="ml-1 text-xs text-gray-400">({title.length}/200)</span>
                </label>
                <input
                  id="report-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                  placeholder={t('report.titlePlaceholder')}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('report.descriptionLabel')}
                  <span className="ml-1 text-xs text-gray-400">({description.length}/2000)</span>
                </label>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                  placeholder={t('report.descriptionPlaceholder')}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  className="flex-1"
                  onClick={closeReportModal}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('report.sending') : t('report.send')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
