'use client';

import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { useTranslation } from '@/lib/useTranslation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('[PWA] Error during install:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || isInstalled) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl animate-fade-in-up z-40">
      <div className="flex items-start gap-3">
        <div className="text-3xl" aria-hidden="true">📱</div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">{t('pwa.installTitle')}</h3>
          <p className="text-sm opacity-90 mb-3">{t('pwa.installDescription')}</p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstall}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              {t('pwa.installButton')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDismiss}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              {t('pwa.installLater')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
