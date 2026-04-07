'use client';

import React, { useEffect } from 'react';
import { Card } from '@/components/Card';
import { useReportStore } from '@/lib/store/reportStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';
import { UserReport, ReportStatus, ReportType } from '@istqb-app/shared';
import Link from 'next/link';

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  dismissed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_ICONS: Record<ReportType, string> = {
  question_error: '❓',
  system_bug: '🐛',
  suggestion: '💡',
  other: '📝',
};

function ReportRow({ report, t }: { report: UserReport; t: (key: string) => string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-start gap-3 flex-1">
        <span className="text-xl mt-0.5" aria-hidden>
          {TYPE_ICONS[report.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{report.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {report.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(report.created_at).toLocaleDateString()}
            {' · '}
            {t(`report.type.${report.type}`)}
          </p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[report.status]}`}
      >
        {t(`report.status.${report.status}`)}
      </span>
    </div>
  );
}

export default function MyReportsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { userReports, isLoadingReports, fetchUserReports, openReportModal } = useReportStore();

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('auth.pleaseSignIn')}</p>
        <Link href="/auth/signin" className="text-indigo-600 hover:underline">
          {t('auth.signin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('report.myReportsTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('report.myReportsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => openReportModal()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('report.newReport')}
        </button>
      </div>

      <Card>
        {isLoadingReports ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : userReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {t('report.noReportsYet')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('report.noReportsMessage')}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {userReports.length} {userReports.length === 1 ? t('report.reportSingle') : t('report.reportPlural')}
            </p>
            {userReports.map((report) => (
              <ReportRow key={report.id} report={report} t={t} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
