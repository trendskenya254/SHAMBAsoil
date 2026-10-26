import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'hero' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={install}
          id="pwa-install-sidebar-btn"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition-colors ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-300" />
          <span>Install App</span>
        </button>
      );
    }

    if (variant === 'hero') {
      return (
        <button
          onClick={install}
          id="pwa-install-hero-btn"
          className={`px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Install on Device</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        id="pwa-install-nav-btn"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors ${className}`}
        title="Install ShambaSoil to home screen"
      >
        <Download className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-ios-btn"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors ${className}`}
          title="Install on iPhone / iPad"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                    🌱
                  </div>
                  <h3 className="text-base font-bold text-stone-900 font-display">
                    Install ShambaSoil
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-stone-600">
                <p>
                  To install ShambaSoil on your iPhone or iPad for quick offline access:
                </p>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
