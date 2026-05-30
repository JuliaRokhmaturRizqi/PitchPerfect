/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Mic, MicOff, ChevronRight, ArrowLeft, 
  Sparkles, AlertCircle, Zap, Search
} from 'lucide-react';
import { TypewriterSubtitle } from './components/TypewriterSubtitle';

// Memasukkan Modul Gemini:
import { GoogleGenAI } from '@google/genai';
// Bypass TypeScript error untuk process.env
const ai = new GoogleGenAI({ apiKey: (process as any).env.GEMINI_API_KEY });

// --- Types & Constants ---
type Screen = 'landing' | 'briefing' | 'roster' | 'arena' | 'analytics';

interface Judge {
  id: number;
  level: number;
  name: string;
  role: string;
  description: string;
  image: string;
  accent: string;
}

const JUDGES: Judge[] = [
  {
    id: 1,
    level: 1,
    name: "Profesor Aris",
    role: "Dosen Ramah • Celestial Level 1",
    description: "Mendukung dan fokus pada kejelasan. Sangat cocok untuk presenter pemula.",
    // Menggunakan gambar baru: pria berkacamata dengan senyum ramah
    image: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&q=80&w=1000",
    accent: "#00F5FF" 
  },
  {
    id: 2,
    level: 2,
    name: "Sarah Vance",
    role: "Investor Kritis • Celestial Level 2",
    description: "Dingin dan berorientasi pada ROI. Ia akan menggali angka dan kesesuaian pasar.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000",
    accent: "#00F5FF"
  },
  {
    id: 3,
    level: 3,
    name: "The Apex",
    role: "Juri Sangar • Celestial Level 3",
    description: "Tanpa ampun. Tekanan tinggi, pertanyaan cepat. Bertahanlah di dalam interogasi.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000",
    accent: "#00F5FF"
  }
];

const ATTACK_POOL: Record<number, string[]> = {
  1: [
    "Bagaimana Anda menjelaskan ini kepada orang awam?",
    "Apa motivasi utama Anda membangun proyek ini?",
    "Siapa target audiens Anda yang paling spesifik?"
  ],
  2: [
    "Bagaimana strategi Anda untuk mencapai profitabilitas?",
    "Apa keunggulan kompetitif Anda dibandingkan pemain besar?",
    "Berapa biaya akuisisi pelanggan (CAC) Anda?"
  ],
  3: [
    "Model bisnis Anda memiliki celah logis. Apa pembelaan Anda?",
    "Data Anda tidak sinkron dengan tren pasar. Mengapa kami harus percaya?",
    "Apa yang menghentikan kompetitor menghancurkan Anda besok?"
  ]
};

const CURVEBALL_POOL = [
  "Bagaimana jika pemerintah melarang seluruh model bisnis Anda besok pagi?",
  "Jika seluruh jaringan seluler hancur total selama satu minggu, bagaimana rencana mitigasi Anda?"
];

const TopBar = ({ setDraft }: { setDraft: (text: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const templates = [
    {
      title: "📱 Pitch Deck: Startup FinTech",
      text: "FinTrack adalah aplikasi manajemen keuangan pribadi yang dirancang untuk membantu generasi milenial dan Gen Z. Masalah utama saat ini adalah rendahnya literasi finansial yang menyebabkan kebiasaan konsumtif. Solusi kami menawarkan fitur analisis pengeluaran otomatis berbasis AI dan rekomendasi investasi ramah pemula. Target pasar awal kami adalah 10 juta pekerja muda di Indonesia dengan model bisnis berlangganan."
    },
    {
      title: "🌿 Proposal Bisnis: Solusi Eco-Friendly",
      text: "EcoPack menawarkan solusi kemasan biodegradable alternatif yang terbuat dari serat jamur dan limbah pertanian kelapa sawit. Berbeda dengan plastik sekali pakai konvensional, produk kami terurai secara alami ke tanah hanya dalam waktu 45 hari. Kami secara spesifik menargetkan industri makanan dan minuman (F&B) skala menengah ke atas yang ingin beralih ke praktik bisnis berkelanjutan."
    },
    {
      title: "📊 Sidang Riset / Akademik",
      text: "Dewan penguji yang terhormat, penelitian saya ini mengkaji dampak penerapan kebijakan kerja jarak jauh (remote working) terhadap produktivitas dan kesejahteraan mental karyawan di sektor teknologi. Melalui survei kuantitatif terhadap 500 responden, kami menemukan bahwa fleksibilitas lokasi secara mengejutkan meningkatkan output kerja hingga 40%, namun berisiko memicu kelelahan (burnout) akibat batasan waktu kerja yang kabur."
    }
  ];

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0F0F11] sticky top-0 z-[100]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-teal flex items-center justify-center font-bold text-black text-lg italic">P</div>
          <span className="font-bold tracking-tight text-lg text-white">PitchPerfect</span>
        </div>
        
        <div className="relative hidden md:block">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 items-center gap-2 w-80 hover:border-accent-teal/50 transition-all cursor-pointer"
          >
            <Search size={15} className={isOpen ? "text-accent-teal" : "text-zinc-500"} />
            <span className={isOpen ? "text-zinc-300 text-xs" : "text-zinc-500 text-xs"}>Pilih template presentasi...</span>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1F2937] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[150] flex flex-col">
              <div className="px-3 py-2 bg-black/20 border-b border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                Template Tersimpan
              </div>
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDraft(tpl.text);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-300 hover:bg-accent-teal/10 hover:text-accent-teal transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [subtitleComplete, setSubtitleComplete] = useState(false);
  const [draft, setDraft] = useState('');
  const [briefingError, setBriefingError] = useState('');
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [micStartTime, setMicStartTime] = useState<number | null>(null);
  const [audioVolume, setAudioVolume] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCurveballEnabled, setIsCurveballEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showWarningFlash, setShowWarningFlash] = useState(false);
  
  const volumeInterval = useRef<number | null>(null);
  const stopListeningRef = useRef<((isTimeout?: boolean) => Promise<void>) | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const accumulatedTranscript = useRef<string>("");

  useEffect(() => {
    if (screen === 'landing') setSubtitleComplete(false);
  }, [screen]);

  // --- INISIALISASI SENSOR SUARA ASLI ---
  useEffect(() => {
    // Bypass TypeScript check untuk properti window spesifik browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + " ";
        }
        accumulatedTranscript.current = current;
      };
      speechRecognitionRef.current = recognition;
    }
  }, []);

  const getRandomQuestions = useCallback((level: number, count: number = 3, curveball: boolean = false) => {
    const pool = ATTACK_POOL[level] || [];
    let shuffled = [...pool].sort(() => 0.5 - Math.random());
    shuffled = shuffled.slice(0, count);

    if (curveball && count >= 2) {
      const curveShuffled = [...CURVEBALL_POOL].sort(() => 0.5 - Math.random());
      const replaceIdx = Math.min(count - 1, 1);
      shuffled[replaceIdx] = curveShuffled[0];
    }
    return shuffled;
  }, []);

  const generateJudgeResponse = useCallback(async (draftText: string, userAnswer: string, judgeLevel: number, questionNum: number) => {
    let baseInstruction = "";
    if (judgeLevel === 1) {
      baseInstruction = "Anda adalah Dosen Ramah. Berikan kritik membangun dengan nada suportif. Jawablah dengan ringkas, maksimal 2 kalimat.";
    } else if (judgeLevel === 2) {
      baseInstruction = "Anda adalah Investor Kritis. Fokus pada skalabilitas bisnis. Nada bicara interogatif. Jawablah dengan ringkas, maksimal 2 kalimat.";
    } else {
      baseInstruction = "Anda adalah Juri Sangar. Anda sangat skeptis, galak, dan langsung menyerang celah logika. Jawablah dengan ringkas, maksimal 2 kalimat.";
    }

    if (isCurveballEnabled && questionNum === 2) {
      baseInstruction += " KHUSUS UNTUK PERTANYAAN INI: Berikan pertanyaan jebakan berupa skenario hipotetis ekstrem.";
    }

    let prompt = `Materi Utama: "${draftText}".\n`;
    if (questionNum === 1) {
      prompt += "Ini adalah awal sesi. Ajukan pertanyaan kritis pertama Anda secara langsung.";
    } else {
      prompt += `Jawaban pengguna: "${userAnswer}".\nAjukan pertanyaan lanjutan yang membantah jawaban tersebut secara tajam.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: { systemInstruction: baseInstruction }
      });
      return response.text || "Terjadi kesalahan membaca pikiran juri.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Maaf, koneksi ke sistem AI terputus. Silakan coba lagi.";
    }
  }, [isCurveballEnabled]);

  const simulateAITalk = useCallback((text: string, judgeLevel: number = 1) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      
      if (judgeLevel === 1) {
        // Nada direndahkan agar terdengar maskulin dan kalem
        utterance.pitch = 0.8; 
        // Tempo sedikit diperlambat agar terkesan sabar dan berwibawa
        utterance.rate = 0.95;
      } else if (judgeLevel === 2) {
        utterance.pitch = 1.0; utterance.rate = 1.15;
      } else {
        utterance.pitch = 0.3; utterance.rate = 0.9;
      }
      
      utterance.onstart = () => {
        setIsTalking(true);
        volumeInterval.current = window.setInterval(() => {
          setAudioVolume(Math.floor(Math.random() * 90) + 10);
        }, 100);
      };

      utterance.onend = () => {
        setIsTalking(false);
        setAudioVolume(0);
        if (volumeInterval.current) {
          clearInterval(volumeInterval.current);
          volumeInterval.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsTalking(true);
      setTimeout(() => { setIsTalking(false); setAudioVolume(0); }, 3000);
    }
  }, []);

  const handleStartArena = () => {
    if (selectedJudge) {
      const qs = getRandomQuestions(selectedJudge.level, totalQuestions, isCurveballEnabled);
      setSessionQuestions(qs);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setScreen('arena');
    }
  };

  const handleProceedToRoster = () => {
    if (draft.trim().length < 20) {
      setBriefingError("Materi terlalu singkat! Tolong masukkan abstrak presentasi yang serius.");
      return;
    }
    setBriefingError('');
    setScreen('roster');
  };

  useEffect(() => {
    if (screen === 'arena' && sessionQuestions.length > 0 && currentQuestionIndex === 0) {
      const timer = setTimeout(() => {
        simulateAITalk(sessionQuestions[0], selectedJudge?.level);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [screen, sessionQuestions, currentQuestionIndex, simulateAITalk, selectedJudge]);

  const handleFinishPitch = () => {
    setScreen('analytics');
    setIsListening(false);
    if (volumeInterval.current) clearInterval(volumeInterval.current);
  };

  const handleStopListening = useCallback(async (isTimeout = false) => {
    setIsListening(false);
    
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch(e: any){}
    }
    
    // Ambil teks asli dari suara pengguna
    let realTranscript = accumulatedTranscript.current.trim();
    
    if (isTimeout) {
      setShowWarningFlash(true);
      setTimeout(() => setShowWarningFlash(false), 2000);
      if (!realTranscript) {
        realTranscript = "[WAKTU HABIS TERDIAM]";
      } else {
        realTranscript += " [WAKTU HABIS]";
      }
    } else if (!realTranscript) {
      // Jika user menekan tombol stop tanpa bicara sepatah kata pun
      realTranscript = "[TERDIAM]"; 
    }

    const newUserAnswers = [...userAnswers, realTranscript];
    
    if (!realTranscript) realTranscript = "Saya tidak bisa menjawab.";

    
    setUserAnswers(newUserAnswers);
    setMicStartTime(null);
    accumulatedTranscript.current = ""; 

    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const dynamicQuestion = await generateJudgeResponse(draft, realTranscript, selectedJudge?.level || 1, nextIndex);
      setTimeout(() => simulateAITalk(dynamicQuestion, selectedJudge?.level || 1), 1000);
    } else {
      setTimeout(() => {
        setScreen('analytics');
        setIsListening(false);
        if (volumeInterval.current) clearInterval(volumeInterval.current);
      }, 2000);
    }
  }, [userAnswers, currentQuestionIndex, totalQuestions, draft, selectedJudge, generateJudgeResponse, simulateAITalk]);

  useEffect(() => {
    stopListeningRef.current = handleStopListening;
  }, [handleStopListening]);

  useEffect(() => {
    if (isListening) {
      setTimeLeft(60);
      const interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (stopListeningRef.current) stopListeningRef.current(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(60);
    }
  }, [isListening]);

  const renderScreen = () => {
    switch (screen) {
      case 'roster':
        return (
          <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto w-full py-8 md:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-accent-teal font-semibold text-xs tracking-widest uppercase mb-1 block">Judge Selection</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">PILIH JURI ANDA</h2>
              </div>
              <button onClick={() => setScreen('briefing')} className="bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wider cursor-pointer">
                <ArrowLeft size={14} /> Kembali
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {JUDGES.map((judge) => (
                <motion.div key={judge.id} whileHover={{ y: -4 }} onClick={() => setSelectedJudge(judge)} className={`bg-[#1F2937] border rounded-lg p-6 cursor-pointer transition-all flex flex-col justify-between text-center ${selectedJudge?.id === judge.id ? 'border-accent-teal ring-1 ring-accent-teal' : 'border-white/5'}`}>
                  <div className="flex flex-col items-center">
                    <img src={judge.image} alt={judge.name} className="w-24 h-24 rounded-full object-cover border border-white/10 mb-4 grayscale hover:grayscale-0 transition-all duration-300" />
                    <div className="text-[10px] font-bold text-accent-teal uppercase tracking-widest mb-1.5">INTENSITAS: LEVEL {judge.level}</div>
                    <h3 className="text-xl font-bold text-white mb-0.5">{judge.name}</h3>
                    <p className="text-zinc-400 text-xs font-semibold tracking-wide mb-4">{judge.role}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed italic">"{judge.description}"</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedJudge && (
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#1F2937] border border-white/5 p-6 rounded-lg">
                  <div className="w-full md:col-span-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5 text-center sm:text-left">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Konfigurasi Simulasi</span>
                      <h4 className="text-sm font-semibold text-white">Jumlah Pertanyaan dari {selectedJudge.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map((num) => (
                        <button key={num} onClick={() => setTotalQuestions(num)} className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${totalQuestions === num ? 'bg-accent-teal text-black border-accent-teal' : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white'}`}>
                          {num} Pertanyaan
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:col-span-4 flex items-center justify-end">
                    <button onClick={handleStartArena} className="w-full bg-accent-teal hover:bg-accent-teal/95 text-black py-3 rounded-lg font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all uppercase hover:scale-[1.01] active:scale-95 duration-150 cursor-pointer">
                      Enter The Arena <ArrowLeft className="rotate-180" size={14} />
                    </button>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1F2937] border border-white/5 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#14B8A6] font-bold text-[10px] uppercase tracking-wider">Fitur Lanjutan</span>
                      <span className="bg-[#14B8A6]/15 text-[#14B8A6] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#14B8A6]/20">AKTIF</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">Mode Kejutan (Curveball Mode)</h4>
                    <p className="text-zinc-400 text-xs text-left">Izinkan juri memberikan skenario hipotetis di luar konteks.</p>
                  </div>
                  <button onClick={() => setIsCurveballEnabled(!isCurveballEnabled)} className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none cursor-pointer ${isCurveballEnabled ? 'bg-[#14B8A6]' : 'bg-[#0A0A0A] border border-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ${isCurveballEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        );

      case 'arena':
        return (
          <motion.div 
            key="arena" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            // Perubahan Utama: Hapus 'fixed inset-0' dan ganti dengan 'flex-1 relative'
            className="flex-1 w-full flex flex-col items-center justify-center relative bg-[#061F24] py-8"
          >
            {isListening && (
              <div id="arena-pressure-timer" className="absolute top-0 left-0 w-full h-[3px] bg-zinc-950 z-[100]">
                <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 12 ? 'bg-[#EF4444]' : 'bg-[#14B8A6]'}`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
              </div>
            )}

            <AnimatePresence>
              {showWarningFlash && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#EF4444]/10 border-4 border-[#EF4444]/40 flex items-center justify-center z-[150] pointer-events-none">
                  <div className="bg-[#0A0A0A] border border-[#EF4444]/30 px-6 py-4 rounded-lg text-center shadow-lg max-w-sm">
                    <span className="text-[#EF4444] font-black text-sm tracking-widest uppercase block mb-1">BATAS WAKTU SELESAI</span>
                    <p className="text-zinc-400 text-xs">Sesi otomatis dihentikan karena mencapai batas maksimal 60 detik.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Perubahan: Pindahkan progress indikator agar tidak menabrak header */}
            <div id="arena-session-progress" className="w-full max-w-6xl px-6 md:px-12 flex flex-col items-start mb-4">
              <span className="text-accent-teal font-semibold text-xs tracking-wider uppercase block mb-1">Status Sesi</span>
              <p className="text-zinc-400 text-sm font-medium">Pertanyaan <span className="text-white font-bold">{currentQuestionIndex + 1}</span> dari <span className="text-white font-bold">{totalQuestions}</span></p>
              <div className="flex gap-1 mt-2">
                {[...Array(totalQuestions)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentQuestionIndex ? 'w-6 bg-accent-teal' : i < currentQuestionIndex ? 'w-3 bg-zinc-600' : 'w-3 bg-zinc-800'}`} />
                ))}
              </div>
            </div>

            <div className="relative flex flex-col items-center scale-90 md:scale-100 mt-2">
              <motion.div
                animate={{ y: isTalking ? [0, -3, 0] : [0, 0, 0], scale: isTalking ? 1.01 : 1 }}
                transition={{ duration: 0.18, repeat: isTalking ? Infinity : 0 }}
                style={isTalking ? { boxShadow: `0 0 ${20 + audioVolume * 1.2}px ${audioVolume / 4}px rgba(20, 184, 166, 0.45)` } : {}}
                className={`w-64 h-64 md:w-72 md:h-72 rounded-full border border-white/5 bg-zinc-950 p-2 flex items-center justify-center transition-all ${selectedJudge?.id === 3 && audioVolume > 85 ? 'shake-animation' : ''}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border border-white/10 p-1 bg-zinc-900">
                  <img src={selectedJudge?.image} alt={selectedJudge?.name} className="w-full h-full rounded-full object-cover grayscale brightness-90 transition-opacity duration-300" style={{ opacity: isTalking || isListening ? 1 : 0.5 }} />
                </div>
              </motion.div>
              
              <div className="text-center mt-6">
                <div className="inline-block bg-zinc-900/80 border border-white/5 px-4 py-1.5 rounded-lg mb-2">
                  <span className="text-accent-teal font-bold tracking-wider uppercase text-[9px]">{isTalking ? 'DENGARKAN JURI' : isListening ? `MICROPHONE AKTIF • BERBICARA (${timeLeft}s)` : 'SIAP-SIAP'}</span>
                </div>
                <h4 className="font-extrabold text-2xl text-white">{selectedJudge?.name}</h4>
                <p className="text-zinc-400 text-xs mt-1 max-w-sm px-4">{isTalking ? "Juri sedang membahas presentasi Anda..." : isListening ? "Ucapkan jawaban Anda sekarang melalui mic." : "Klik mic untuk mulai menjawab."}</p>
              </div>
            </div>

            <div className="mt-8 pb-4 w-full flex flex-col items-center gap-6">
              <div className="flex items-end justify-center gap-1 h-12">
                {[...Array(15)].map((_, i) => (
                  <motion.div key={i} animate={{ height: isTalking || isListening ? `${Math.max(4, (isTalking ? audioVolume : 15) * (0.2 + Math.random() * 0.8))}px` : '4px' }} className={`w-1 rounded-full transition-colors ${isTalking ? 'bg-accent-teal' : isListening ? 'bg-red-500' : 'bg-white/5'}`} />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setScreen('roster')} className="w-10 h-10 rounded-full border border-white/5 bg-zinc-900 text-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={async () => {
                    if (isTalking) return;
                    if (!isListening) {
                      setIsListening(true);
                      setMicStartTime(Date.now());
                      accumulatedTranscript.current = "";
                      if (speechRecognitionRef.current) {
                        try { speechRecognitionRef.current.start(); } catch(e: any){}
                      }
                    } else {
                      await handleStopListening(false);
                    }
                  }}
                  disabled={isTalking}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border bg-zinc-900 cursor-pointer ${isListening ? 'border-red-500 text-red-500 scale-105' : 'border-white/10 text-accent-teal hover:border-accent-teal'}`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button onClick={handleFinishPitch} className="w-10 h-10 rounded-full border border-white/5 bg-zinc-900 text-accent-teal hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'analytics':
        const avgAnswerLength = userAnswers.length > 0 ? userAnswers.reduce((acc, curr) => acc + curr.length, 0) / userAnswers.length : 0;
        
        // Sekarang sistem akan gagal jika jawaban < 15 karakter ATAU terdeteksi [TERDIAM] / [WAKTU HABIS]
        const hasEmptyAnswers = userAnswers.some(ans => ans.length < 15 || ans.includes("[TERDIAM]") || ans.includes("[WAKTU HABIS]"));
        
        let efficiency = hasEmptyAnswers ? 0 : Math.min(95, Math.floor(50 + (avgAnswerLength / 500) * 45));
        let confidence = hasEmptyAnswers ? 0 : Math.min(95, Math.floor(60 + (avgAnswerLength / 500) * 35));
        
        let verdictText = hasEmptyAnswers 
          ? "Terdeteksi Anda terdiam, durasi habis, atau jawaban terlalu singkat. Juri menilai mental Anda runtuh di bawah tekanan." 
          : "Selamat! Semua pertanyaan kritis telah Anda hadapi dengan argumentasi yang sangat baik.";

        
        return (
          <motion.div key="analytics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-6xl mx-auto w-full py-8 md:py-12">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 pb-6 border-b border-white/5">
              <div className="text-center md:text-left">
                 <span className="text-accent-teal font-semibold text-xs tracking-wider uppercase mb-1 block">Rapor Analisis</span>
                 <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight uppercase text-white leading-none">EVALUASI AKHIR</h1>
              </div>
              <button onClick={() => setScreen('briefing')} className="bg-accent-teal hover:bg-accent-teal/90 text-black px-8 py-3 rounded-lg font-bold text-xs tracking-wider transition-all uppercase cursor-pointer">MULAI SESI BARU</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#1F2937] border border-white/5 p-6 rounded-lg flex flex-col items-center">
                <span className="text-zinc-500 text-[10px] font-bold mb-3 uppercase tracking-wider">Efisiensi Jawaban</span>
                <span className="text-4xl font-black text-accent-teal">{efficiency}%</span>
              </div>
              <div className="bg-[#1F2937] border border-white/5 p-6 rounded-lg flex flex-col items-center">
                <span className="text-zinc-500 text-[10px] font-bold mb-3 uppercase tracking-wider">Kepercayaan Diri</span>
                <span className="text-4xl font-black text-white">{confidence}%</span>
              </div>
              <div className="bg-[#1F2937] border border-white/5 p-6 rounded-lg flex flex-col items-center">
                <span className="text-zinc-500 text-[10px] font-bold mb-3 uppercase tracking-wider">Tingkat Ancaman</span>
                <span className={`text-3xl font-extrabold uppercase ${efficiency > 80 ? 'text-emerald-500' : efficiency > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {efficiency > 80 ? 'STABIL' : efficiency > 40 ? 'RENTAN' : 'KRITIS'}
                </span>
              </div>
            </div>

            <div className="bg-[#1F2937] border border-white/5 rounded-lg p-6 mb-8 relative overflow-hidden">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <Sparkles size={18} className="text-accent-teal" /> Keputusan Juri
              </h3>
              <p className="text-base mb-6 italic text-zinc-300">"{verdictText}"</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[50%] h-[50%] bg-accent-teal/5 blur-[120px] rounded-full opacity-40 pointer-events-none" />
      </div>
      <TopBar setDraft={setDraft} />
      <main className={`${screen === 'landing' ? 'p-0' : screen === 'arena' ? 'p-0 bg-[#061F24]' : 'px-4 md:px-8'} flex-1 flex flex-col relative z-10 w-full`}>
        <AnimatePresence mode="wait">
          {screen === 'landing' ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] px-4 text-center relative overflow-hidden">
              
              {/* --- BACKGROUND BARU: LEBIH TERANG & JELAS --- */}
              {/* 1. Grid Pattern Dinamis */}
              <div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, rgba(20, 184, 166, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 184, 166, 0.15) 1px, transparent 1px)', 
                  backgroundSize: '50px 50px',
                  // Membuat efek pudar di bagian ujung layar agar fokus ke tengah
                  maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)'
                }}
              />
              
              {/* 2. Pendaran Aura Besar yang Bernapas */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  // Memastikan warnanya cerah dan blurnya lebar
                  className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-[#14B8A6] blur-[120px]"
                />
              </div>
              {/* ------------------------------------------- */}

              <div className="flex flex-col items-center justify-center max-w-xl relative z-10">
                <span className="text-[#14B8A6] font-semibold text-xs tracking-[0.25em] uppercase mb-4 block">AI-POWERED INTERROGATION</span>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase drop-shadow-2xl">PITCHPERFECT</h1>
                <TypewriterSubtitle text="Latih ketajaman logika dan mental Anda." onComplete={() => setSubtitleComplete(true)} />
                <div className="h-[52px] flex items-center justify-center mt-4">
                  <AnimatePresence>
                    {subtitleComplete && (
                      <motion.button key="start-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={() => setScreen('briefing')} className="bg-accent-teal hover:bg-accent-teal/90 text-black px-8 py-3.5 rounded-lg font-bold text-xs uppercase cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(20,184,166,0.6)]">
                        MULAI SIMULASI
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
          ) : screen === 'briefing' ? (
            <motion.div key="briefing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 py-12">
              <div className="w-full bg-[#1F2937] border border-white/5 rounded-lg p-8 flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-extrabold uppercase text-white">ADVANCED PITCH SIMULATOR</h1>
                  <p className="text-zinc-400 text-xs mt-1">Uji Ide Anda di Hadapan Juri Virtual</p>
                </div>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tempelkan draf presentasi Anda di sini..." className="w-full min-h-[250px] bg-white/5 border border-white/10 rounded-lg p-4 text-white/90 outline-none focus:border-accent-teal" />
                <button disabled={!draft.trim()} onClick={handleProceedToRoster} className="bg-accent-teal text-black px-8 py-3 rounded-lg font-bold text-xs uppercase disabled:opacity-30 cursor-pointer ml-auto">
                  PILIH JURI
                </button>
              </div>
              {/* Right Column (Info Panel) yang Diperbarui */}
              
              <div className="w-full bg-gradient-to-b from-[#1F2937] to-[#0A0A0A] border border-white/10 rounded-lg p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                {/* Efek cahaya redup di pojok */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-teal/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Apa itu PitchPerfect?</h3>
                  </div>
                  
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6 text-justify">
                    PitchPerfect adalah simulator presentasi canggih berbasis <strong>Kecerdasan Buatan (AI)</strong> yang dirancang secara khusus untuk menguji batas kesiapan mental dan ketajaman logika Anda. 
                    <br/><br/>
                    Alih-alih sekadar berlatih di depan cermin, Anda akan berhadapan langsung dengan dewan juri virtual berkarakteristik unik. Sistem ini akan menginterogasi, memberikan pertanyaan jebakan (<em>curveball</em>), dan menilai efisiensi serta tingkat kepercayaan diri Anda dari setiap kata yang Anda ucapkan secara <em>real-time</em>.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wider text-zinc-400 uppercase">🧠 Uji Mental</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wider text-zinc-400 uppercase">⚡ Real-time AI</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-wider text-accent-teal/80 border-accent-teal/20 uppercase">📊 Analisis Rinci</span>
                  </div>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-white/5 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-accent-teal shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                    <Zap size={14} />
                  </div>
                </div>
              </div>

            </motion.div>
          ) : renderScreen()}
        </AnimatePresence>
      </main>
    </div>
  );
}