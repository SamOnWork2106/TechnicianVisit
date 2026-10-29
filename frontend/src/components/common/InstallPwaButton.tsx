import { useState, useEffect } from "react";
import { Download, Smartphone, X, Info, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"android" | "ios">("android");

  useEffect(() => {
    // Check if app is already running as standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setActiveGuideTab("ios");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("IntelliGreen App successfully installed on your device!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn("Install prompt error:", err);
      }
    }
    // If native prompt is not available, show the interactive guide
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 shadow-2xs transition cursor-pointer active:scale-95"
        title="Download / Install this application onto your mobile phone or desktop"
      >
        <Smartphone size={14} className="text-teal-700" />
        <span>Install App</span>
        <Download size={12} className="opacity-70" />
      </button>

      {/* Mobile Download / Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-left animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 text-teal-800">
              <Info size={20} />
              <h3 className="font-bold text-base">Install App on Phone</h3>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveGuideTab("android")}
                className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                  activeGuideTab === "android"
                    ? "border-teal-700 text-teal-800 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("ios")}
                className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                  activeGuideTab === "ios"
                    ? "border-teal-700 text-teal-800 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {activeGuideTab === "android" ? (
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  To install IntelliGreen as a standalone Android application:
                </p>
                <ol className="space-y-2 list-decimal pl-4 text-slate-700 font-medium">
                  <li>
                    Tap the <strong>three vertical dots (⋮)</strong> in Chrome at the top right.
                  </li>
                  <li>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Install"</strong> to confirm.
                  </li>
                </ol>
                <div className="p-2.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] flex items-start gap-1.5 mt-3">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  <span>The app icon will appear directly on your phone's home screen and app drawer!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  To install IntelliGreen on your iPhone or iPad:
                </p>
                <ol className="space-y-2 list-decimal pl-4 text-slate-700 font-medium">
                  <li>
                    Open this page in <strong>Safari</strong>.
                  </li>
                  <li>
                    Tap the <strong>Share button</strong> (square with arrow pointing up).
                  </li>
                  <li>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Add"</strong> in the top right corner.
                  </li>
                </ol>
                <div className="p-2.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] flex items-start gap-1.5 mt-3">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  <span>It will launch in full-screen standalone mode just like a native app.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full mt-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
