/**
 * PhoneFrame Simulator Component
 * Provides authentic mobile container matching Figma 390x844 dimensions
 */
import React, { useState } from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Sparkles, Terminal, X, Download } from 'lucide-react';
import { UserRole, theme } from '../theme';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onQuickSwitchRole?: (role: UserRole) => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeRole,
  onQuickSwitchRole,
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [showEasGuide, setShowEasGuide] = useState(false);
  const roleColor = theme.colors[activeRole];

  return (
    <div className="min-h-screen bg-slate-200/80 flex flex-col items-center justify-center p-0 md:p-6 transition-colors">
      {/* Top Testing Control Bar */}
      <aside aria-label="Testing and Simulator Controls" className="w-full max-w-[430px] mb-3 px-3 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Role:</span>
          <div className="flex items-center gap-1">
            {(['tutee', 'tutor', 'parent'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onQuickSwitchRole?.(r)}
                className={`px-2 py-0.5 rounded-lg capitalize font-semibold transition ${
                  activeRole === r
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: activeRole === r ? theme.colors[r] : undefined,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEasGuide(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition"
            title="EAS APK Cloud Build Guide"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>EAS APK</span>
          </button>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            title={fullscreen ? 'Show Phone Bezel' : 'Expand View'}
          >
            {fullscreen ? <Smartphone className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* EAS Build Modal Guide */}
      {showEasGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">EAS APK Cloud Build</h3>
                  <p className="text-[11px] text-slate-500">React Native • No Android Studio needed</p>
                </div>
              </div>
              <button
                onClick={() => setShowEasGuide(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="text-slate-700 leading-relaxed">
                This project contains complete <strong>app.json</strong> and <strong>eas.json</strong> files configured for Expo Application Services (EAS). You can compile a native Android APK in the cloud without installing Android Studio!
              </p>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] space-y-2">
                <div className="text-slate-400 text-[10px]"># 1. Install EAS CLI</div>
                <div>npm install -g eas-cli</div>
                <div className="text-slate-400 text-[10px] mt-2"># 2. Log in (free Expo account)</div>
                <div>eas login</div>
                <div className="text-slate-400 text-[10px] mt-2"># 3. Build standalone Android APK</div>
                <div className="text-emerald-400 font-bold">eas build -p android --profile preview</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>🔔</span> Native Notification Pop-up Window
                </div>
                <p className="text-[11px]">
                  When built, the native APK uses <strong>expo-notifications</strong> and the React Native <strong>&lt;Modal&gt;</strong> pop-up window. Students receive instant pop-ups when tutors accept, and tutors receive instant pop-ups when session requests are submitted.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEasGuide(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Mobile Device Mockup */}
      <div
        className={`w-full bg-white flex flex-col relative transition-all overflow-hidden ${
          fullscreen
            ? 'max-w-md min-h-screen'
            : 'max-w-[400px] h-[844px] rounded-[44px] shadow-2xl border-[10px] border-slate-900 ring-1 ring-slate-900/10'
        }`}
      >
        {/* iOS Status Bar */}
        <div className="w-full px-7 pt-3 pb-1 flex items-center justify-between text-slate-900 text-xs font-semibold select-none bg-white z-50">
          <span className="tracking-tight">9:41</span>
          <div className="w-24 h-4.5 bg-black rounded-full mx-auto -mt-1 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-tighter">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic App Content */}
        <div className="flex-1 flex flex-col overflow-y-auto relative bg-[#F8FAFC]">
          {children}
        </div>

        {/* Home Indicator Bar */}
        {!fullscreen && (
          <div className="w-full py-1.5 bg-white flex justify-center items-center z-50">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
