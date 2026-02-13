
import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight, Lock, Unlock, Smartphone, Download, Share2, Copy, Check, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LOVE_MESSAGES, TIMELINE_DATA } from './constants';
import FloatingHearts from './components/FloatingHearts';

// --- Types ---
enum Screen {
  GATE = 1,
  WELCOME = 2,
  TIMELINE = 3,
  REVEAL = 4,
  PROPOSAL = 5
}

// --- Animation Component ---
const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div className={`transition-all duration-1000 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}>
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.GATE);
  const [gateStep, setGateStep] = useState(1);
  const [yearInput, setYearInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [gateError, setGateError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [randomMessage, setRandomMessage] = useState<string | null>(null);
  const [proposalStatus, setProposalStatus] = useState<'pending' | 'yes' | 'always'>('pending');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGateSubmit = () => {
    setGateError('');
    if (gateStep === 1) {
      if (yearInput.trim() === '2022') {
        setGateStep(2);
      } else {
        setGateError('Hmm… try again. Think about when everything changed 🌸');
      }
    } else if (gateStep === 2) {
      if (cityInput.trim().toLowerCase() === 'grenoble') {
        setIsUnlocked(true);
        setTimeout(() => setCurrentScreen(Screen.WELCOME), 3500);
      } else {
        setGateError('Not quite… think about the city where destiny worked overtime 🚲');
      }
    }
  };

  const handleReveal = () => {
    const msg = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];
    setRandomMessage(msg);
  };

  const triggerConfetti = (isAlways: boolean) => {
    const duration = isAlways ? 5 * 1000 : 2 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f472b6', '#fbcfe8', '#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f472b6', '#fbcfe8', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleProposal = (choice: 'yes' | 'always') => {
    setProposalStatus(choice);
    triggerConfetti(choice === 'always');
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'YS Story', url: window.location.href });
      } catch (e) { handleCopyLink(); }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`relative h-full w-full bg-[#FFF5F7] text-gray-800 selection:bg-pink-100 selection:text-pink-600 transition-colors duration-[2000ms] ${isUnlocked && currentScreen === Screen.GATE ? 'bg-black/20' : ''}`}>
      <FloatingHearts />

      {/* FAB - Help/Install */}
      {currentScreen === Screen.GATE && !isUnlocked && (
        <button 
          onClick={() => setShowInstallModal(true)}
          className="fixed top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-pink-100 text-pink-400 active:scale-95 transition-transform"
        >
          <Smartphone className="w-6 h-6" />
        </button>
      )}

      {/* Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowInstallModal(false)} className="absolute top-6 right-6 text-gray-400">✕</button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-xl font-serif">Install YS Story</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl flex gap-3 text-pink-700 text-sm">
                <Info className="w-5 h-5 shrink-0" />
                <p>Host this on <strong>Vercel</strong> or <strong>GitHub Pages</strong> to get a real link you can open on your phone!</p>
              </div>

              <button onClick={handleShare} className="w-full py-4 bg-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <Share2 className="w-4 h-4" /> {navigator.share ? 'Share Link' : 'Copy Link'}
              </button>
              
              {copySuccess && <p className="text-center text-green-500 text-xs font-bold animate-bounce">Link Copied!</p>}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-left">
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Once on your phone:</p>
              <ul className="text-[11px] text-gray-600 space-y-1 list-disc pl-4">
                <li><strong>Android:</strong> Tap ⋮ and "Install app"</li>
                <li><strong>iPhone:</strong> Tap Share and "Add to Home Screen"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 h-full w-full max-w-lg mx-auto overflow-y-auto px-6 py-12 scroll-smooth no-scrollbar">
        
        {/* SCREEN 1: GATE */}
        {currentScreen === Screen.GATE && (
          <div className="flex flex-col items-center justify-center min-h-full">
            {!isUnlocked ? (
              <FadeIn className="w-full text-center">
                <h1 className="text-3xl font-serif mb-2 italic">“Only one person can enter this story…”</h1>
                <p className="text-pink-400 font-sans tracking-widest text-[10px] uppercase mb-12">This space belongs to us 🌸</p>
                
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border border-pink-50">
                  <div className="space-y-8">
                    {gateStep === 1 ? (
                      <div className="animate-[fadeIn_0.5s_ease-out]">
                        <label className="block text-gray-600 mb-4 font-sans text-sm">Since what year have we been writing our story?</label>
                        <input 
                          type="number" 
                          inputMode="numeric"
                          value={yearInput}
                          onChange={(e) => setYearInput(e.target.value)}
                          placeholder="YYYY"
                          className="w-full bg-pink-50/50 border-2 border-pink-100 p-4 rounded-2xl text-center text-2xl font-sans focus:border-pink-300 outline-none transition-all placeholder:text-pink-200"
                        />
                      </div>
                    ) : (
                      <div className="animate-[fadeIn_0.5s_ease-out]">
                        <label className="block text-gray-600 mb-4 font-sans text-sm">Where did our story begin?</label>
                        <input 
                          type="text" 
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="City name..."
                          className="w-full bg-pink-50/50 border-2 border-pink-100 p-4 rounded-2xl text-center text-xl font-sans focus:border-pink-300 outline-none transition-all placeholder:text-pink-200"
                        />
                      </div>
                    )}
                    {gateError && <p className="text-red-400 text-xs italic animate-pulse">{gateError}</p>}
                    <button 
                      onClick={handleGateSubmit}
                      className="w-full py-4 bg-pink-400 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform font-sans"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </FadeIn>
            ) : (
              <div className="fixed inset-0 flex items-center justify-center z-50 px-6">
                <div className="text-center animate-[scaleIn_1s_ease-out]">
                  <div className="mb-8 flex justify-center">
                    <div className="p-8 bg-white/90 rounded-full shadow-2xl animate-glow-unlock border border-pink-100">
                      <Unlock className="w-12 h-12 text-pink-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif mb-2 text-white drop-shadow-md">Access granted to Murugesa</h2>
                  <p className="text-white/80 mb-10 font-sans tracking-wide">Lifetime membership approved.</p>
                  <div className="italic text-white/90 space-y-2 font-serif text-lg">
                    <p className="animate-[fadeIn_0.8s_ease-out_0.5s_both]">Since 2022.</p>
                    <p className="animate-[fadeIn_0.8s_ease-out_1.0s_both]">Since Grenoble.</p>
                    <p className="animate-[fadeIn_0.8s_ease-out_1.5s_both]">Since you.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 2: WELCOME */}
        {currentScreen === Screen.WELCOME && (
          <div className="flex flex-col items-center justify-center min-h-full text-center">
            <FadeIn>
              <h1 className="text-5xl font-serif mb-10 text-gray-800">Hi Murugesa 🌷</h1>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed max-w-xs mx-auto mb-16 font-sans px-4">
                <p>Since 2022… my life has been different.</p>
                <p>Better. Softer. Happier.</p>
                <p>I didn’t just build this app.</p>
                <p className="italic font-medium text-pink-500">I built this for you.</p>
              </div>
              <button 
                onClick={() => setCurrentScreen(Screen.TIMELINE)}
                className="group px-10 py-5 bg-pink-400 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2 mx-auto font-sans"
              >
                Begin Our Story <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeIn>
          </div>
        )}

        {/* SCREEN 3: TIMELINE */}
        {currentScreen === Screen.TIMELINE && (
          <div className="flex flex-col min-h-full pt-8">
            <FadeIn>
              <h2 className="text-4xl font-serif text-center mb-12">Our Journey</h2>
              <div className="space-y-10">
                {TIMELINE_DATA.map((item, idx) => (
                  <FadeIn key={idx} delay={idx * 300} className="relative bg-white p-8 rounded-[2rem] shadow-soft border border-pink-50 group transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute -top-4 -left-2 bg-pink-100 text-pink-500 w-10 h-10 rounded-full flex items-center justify-center font-serif italic text-xl border-4 border-[#FFF5F7]">
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-serif text-pink-500 mb-4">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans">{item.text}</p>
                  </FadeIn>
                ))}
              </div>
              <div className="mt-16 pb-12 text-center">
                <button 
                  onClick={() => setCurrentScreen(Screen.REVEAL)}
                  className="px-12 py-5 bg-pink-400 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform font-sans"
                >
                  Why I Love You
                </button>
              </div>
            </FadeIn>
          </div>
        )}

        {/* SCREEN 4: REVEAL */}
        {currentScreen === Screen.REVEAL && (
          <div className="flex flex-col items-center justify-center min-h-full text-center">
            <FadeIn className="w-full">
              <div className="mb-12">
                <button 
                  onClick={handleReveal}
                  className="relative p-10 bg-white rounded-full shadow-xl active:scale-90 transition-transform group border border-pink-50"
                >
                  <Heart className={`w-24 h-24 ${randomMessage ? 'fill-pink-500 text-pink-500' : 'text-pink-100'} transition-all duration-700`} />
                  <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping-slow opacity-0 group-hover:opacity-10 pointer-events-none"></div>
                </button>
                <p className="mt-6 text-pink-300 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse font-sans">Tap the heart to reveal</p>
              </div>

              <div className="min-h-[140px] px-6 flex items-center justify-center mb-16">
                {randomMessage && (
                  <p key={randomMessage} className="text-xl md:text-2xl font-serif text-gray-800 animate-[fadeIn_0.5s_ease-out] leading-relaxed italic">
                    “{randomMessage}”
                  </p>
                )}
              </div>

              <button 
                onClick={() => setCurrentScreen(Screen.PROPOSAL)}
                className="group text-pink-300 hover:text-pink-500 font-sans font-medium flex items-center gap-1 mx-auto transition-colors p-4"
              >
                One More Thing… <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeIn>
          </div>
        )}

        {/* SCREEN 5: PROPOSAL */}
        {currentScreen === Screen.PROPOSAL && (
          <div className="flex flex-col items-center justify-center min-h-full text-center py-12">
            <FadeIn className="w-full max-w-sm">
              {proposalStatus === 'pending' ? (
                <>
                  <div className="space-y-4 mb-12 text-lg text-gray-600 italic font-serif">
                    <p className="animate-[fadeIn_1s_ease-out]">Murugesa…</p>
                    <p className="animate-[fadeIn_1s_ease-out_0.5s_both]">From 2022 in Grenoble,</p>
                    <p className="animate-[fadeIn_1s_ease-out_1s_both]">to every badminton match,</p>
                    <p className="animate-[fadeIn_1s_ease-out_1.5s_both]">to every stressful day,</p>
                    <p className="animate-[fadeIn_1s_ease-out_2s_both]">to every laugh we share…</p>
                    <p className="text-pink-500 font-bold text-2xl mt-8 animate-[fadeIn_1s_ease-out_2.5s_both]">You are my best decision.</p>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-serif mb-12 leading-tight animate-[fadeIn_1s_ease-out_3.5s_both] text-gray-800 px-2">
                    Will you be my Valentine?<br/>
                    <span className="text-lg italic text-gray-400 block mt-4 font-sans">And my forever teammate in life? 🏸💍</span>
                  </h2>

                  <div className="flex flex-col gap-4 animate-[fadeIn_1s_ease-out_4.5s_both] px-4">
                    <button 
                      onClick={() => handleProposal('yes')}
                      className="py-5 bg-white border-2 border-pink-400 text-pink-500 rounded-full font-bold shadow-lg active:scale-95 transition-transform font-sans"
                    >
                      YES 💖
                    </button>
                    <button 
                      onClick={() => handleProposal('always')}
                      className="py-5 bg-pink-500 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform font-sans"
                    >
                      ALWAYS ♾️
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-[scaleIn_0.8s_ease-out] flex flex-col items-center">
                  <div className="mb-8 p-6 bg-white rounded-full shadow-2xl">
                     <Heart className="w-16 h-16 fill-pink-500 text-pink-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-serif text-pink-500 mb-4 italic">Best decision of my life.</h2>
                  <p className="text-gray-400 text-xs tracking-[0.3em] uppercase mb-12 font-sans">Since 2022. Ours Forever.</p>
                  
                  <div className="flex justify-center gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-2 rounded-full bg-pink-200 animate-bounce" 
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </FadeIn>
          </div>
        )}
      </main>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-unlock {
          0%, 100% { box-shadow: 0 0 30px rgba(244, 114, 182, 0.3); transform: scale(1); }
          50% { box-shadow: 0 0 60px rgba(244, 114, 182, 0.7); transform: scale(1.05); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-glow-unlock { animation: glow-unlock 2s infinite ease-in-out; }
        .animate-ping-slow { animation: ping-slow 3s infinite ease-out; }
        .shadow-soft { box-shadow: 0 10px 25px -5px rgba(255, 182, 193, 0.15); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
