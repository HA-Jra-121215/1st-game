import React, { useState } from 'react';
import {
  Check,
  Code,
  Copy,
  Download,
  FolderArchive,
  Layers,
  Play,
  Smartphone,
  Terminal,
  X,
  Zap
} from 'lucide-react';
import { downloadAndroidProject } from '../../android/androidProjectZip';
import { soundEngine } from '../../audio/soundEngine';

interface AndroidApkModalProps {
  deferredPrompt: any;
  onInstallPwa: () => void;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  deferredPrompt,
  onInstallPwa,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    soundEngine.playButtonClick();
    setIsZipping(true);
    try {
      await downloadAndroidProject();
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  const copyCliCommand = () => {
    soundEngine.playButtonClick();
    navigator.clipboard.writeText('cd android && ./gradlew assembleDebug');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0c101d] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                ANDROID MOBILE & APK HUB
              </h2>
              <p className="text-xs text-white/50">Play natively on your Android mobile device</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4">
          {/* OPTION 1: 1-Tap Direct Install */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-black/50 border border-emerald-500/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-widest">
                RECOMMENDED & FASTEST
              </span>
              <span className="text-xs text-emerald-400 font-bold">No PC Required</span>
            </div>

            <h3 className="text-sm font-black text-white mb-1">
              Method 1: Direct Install on Android Phone (WebAPK)
            </h3>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">
              Installs a true full-screen native Android application with app icon on your home screen, offline cache, hardware acceleration, and vibration.
            </p>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onInstallPwa();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-black stroke-[3]" />
              <span>INSTALL APP ON THIS ANDROID PHONE</span>
            </button>
            <div className="mt-2 text-[10px] text-white/40 text-center">
              *If prompt does not open, tap Chrome menu (⋮) ➔ "Install app" or "Add to Home screen"
            </div>
          </div>

          {/* OPTION 2: Download Complete Android Studio Project (.ZIP) */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-widest">
                STANDALONE APK
              </span>
              <span className="text-xs text-purple-400 font-bold">Android Studio</span>
            </div>

            <h3 className="text-sm font-black text-white mb-1">
              Method 2: Export Complete Android Studio Project
            </h3>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">
              Downloads a complete ready-to-compile Android project with Gradle scripts, AndroidManifest.xml, Kotlin MainActivity, and asset loader.
            </p>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="w-full py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isZipping ? 'PACKAGING PROJECT...' : 'DOWNLOAD ANDROID STUDIO PROJECT (.ZIP)'}</span>
            </button>
          </div>

          {/* OPTION 3: Gradle CLI & Build Steps */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Compile APK via Gradle / Command Line</span>
            </h3>

            <div className="bg-black/70 border border-white/10 rounded-xl p-2.5 flex items-center justify-between font-mono text-xs text-cyan-300 mb-2">
              <span>cd android && ./gradlew assembleDebug</span>
              <button
                onClick={copyCliCommand}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition"
                title="Copy Command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <ol className="text-[11px] text-white/60 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Open the downloaded folder in <strong>Android Studio</strong>.</li>
              <li>Click <strong>Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)</strong>.</li>
              <li>Locate <code className="text-emerald-400 font-mono">app-debug.apk</code> and tap to install on your phone!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
