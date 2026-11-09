import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopInfo, setShowDesktopInfo] = useState(false);

  // If already running as an installed PWA in standalone window, don't show install button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Desktop standard install flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
        title="Install ZEISS Certificate Generator to your desktop or device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          title="Install app on iPhone or iPad"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlusSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> in the Safari toolbar at the bottom of the screen.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">2</span>
                  <span>Scroll down the menu and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner. The app will now launch offline anytime!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers before the prompt triggers or where user can install via browser address bar
  return (
    <>
      <button
        onClick={() => setShowDesktopInfo(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        title="Offline App & Install Info"
      >
        <Download className="w-3.5 h-3.5 text-blue-600" />
        <span>Installable App</span>
      </button>

      {showDesktopInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Install as Offline App</h3>
              </div>
              <button
                onClick={() => setShowDesktopInfo(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                This app is a <strong>Progressive Web App (PWA)</strong>. It runs 100% offline and can be installed directly to your computer or phone without an app store:
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">In Chrome, Edge, or Brave:</div>
                <p>Click the <strong>Install</strong> icon in your browser address bar (top right, near bookmarks).</p>
              </div>
              <p className="text-[11px] text-slate-500">
                All scripts, fonts, and Carl Zeiss certificate assets are cached locally by the Service Worker for instant offline use.
              </p>
            </div>

            <button
              onClick={() => setShowDesktopInfo(false)}
              className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
