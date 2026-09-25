import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ThemeConfig } from '../types/game';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  QrCode,
  Zap,
  Globe,
  AlertCircle,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
}

// Target public shared URL accessible from any mobile browser
const PUBLIC_APP_URL = 'https://ais-pre-k5nzmvzzx3ywqwpe7xa576-549822315614.asia-east1.run.app';

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  theme,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const targetUrl =
    typeof window !== 'undefined' && window.location.origin.includes('ais-pre-')
      ? window.location.origin
      : PUBLIC_APP_URL;

  // Direct PWABuilder package link pre-filled with the manifest
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(targetUrl)}`;

  // Generate QR Code on open
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(targetUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0B0F19',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border ${theme.cardClass} p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Install on Mobile / Get APK</h3>
            <p className="text-xs text-slate-400">
              Run Lexicon Quest as a standalone native app on your Android device
            </p>
          </div>
        </div>

        {/* Important note explaining APK compilation */}
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block mb-0.5">Why an APK cannot be compiled directly inside this web sandbox:</strong>
            Android APK binaries require the Google Android SDK, Java JDK, and Gradle toolchain, which cannot run inside browser-based web containers.
            However, you can install the app on your phone <strong>immediately</strong> using the two proven methods below.
          </div>
        </div>

        {/* Step 1: Scan QR Code with Phone Camera (EASIEST) */}
        <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm flex items-center gap-1.5 text-emerald-400">
              <QrCode className="w-4 h-4" />
              <span>Step 1: Scan with Phone Camera (Instant)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
              Recommended
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <img
                  src={qrDataUrl}
                  alt="Scan to open on mobile"
                  className="w-32 h-32"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-slate-800 rounded-xl animate-pulse shrink-0" />
            )}

            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                1. Open your <strong>Android Camera</strong> or <strong>Google Lens</strong> and point it at the QR code.
              </p>
              <p>
                2. Tap the link to open Lexicon Quest in <strong>Chrome</strong>.
              </p>
              <p>
                3. Chrome will automatically prompt: <strong className="text-white">"Add Lexicon Quest to Home screen"</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Android will install the official <strong>WebAPK</strong> onto your device home screen with full offline support and full-screen window!
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: In-browser direct install if already on mobile */}
        {isInstallable && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 mb-4 text-xs">
            <div className="font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Detected Mobile Browser Support</span>
            </div>
            <p className="text-slate-300 mb-3">
              Your browser supports direct installation. Tap below to install Lexicon Quest now:
            </p>
            <button
              onClick={handleInstallClick}
              className={`w-full py-2.5 px-4 rounded-xl ${theme.accentBg} font-semibold flex items-center justify-center gap-2 shadow-sm transition-all`}
            >
              <Download className="w-4 h-4" />
              <span>Install to Android Device</span>
            </button>
          </div>
        )}

        {/* Copy Link for WhatsApp / SMS / Email */}
        <div className="mb-4 p-3 rounded-xl border border-slate-700/40 bg-slate-800/20">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mobile App URL:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300 select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/50 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Link to PWABuilder to Download Standalone APK */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Need a physical .apk file to download?</span>
            </span>
          </div>
          <p className="text-slate-400 mb-3 leading-relaxed">
            Click below to open <strong>PWABuilder</strong> with this app's verified manifest already loaded. Microsoft's cloud build server will package and give you the signed <code>.apk</code> download:
          </p>

          <a
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Generate .APK on PWABuilder</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-5 pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg ${theme.accentBg} text-xs font-medium transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
