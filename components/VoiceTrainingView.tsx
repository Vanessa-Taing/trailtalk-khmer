
import React, { useState, useEffect, useRef } from 'react';

// --- Icons ---
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a8 8 0 0 0 7 7.93V22h2v-2.07A8 8 0 0 0 21 12v-2h-2z"></path>
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6V6z"></path>
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
);

interface VoiceTrainingViewProps {
  onClose: () => void;
}

const trainingText = "Hello, my name is TrailTalk. I am learning to recognize your voice to help with pronunciation practice. Please read this text clearly. The quick brown fox jumps over the lazy dog.";
type Status = 'idle' | 'listening' | 'processing' | 'playback' | 'confirmed' | 'complete';

export const VoiceTrainingView: React.FC<VoiceTrainingViewProps> = ({ onClose }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
    }
    setStatus('processing');
  };

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition for pause detection is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onspeechend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = window.setTimeout(stopRecording, 2000);
    };

    recognition.onspeechstart = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onend = () => {
      if (status === 'listening') {
        stopRecording();
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        setError(`Pause detection failed: ${event.error}`);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
         mediaRecorderRef.current.stop();
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) { /* ignore */ }
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, [status]); // Re-create if status changes, might not be necessary but safe

  const startTraining = async () => {
    if (status !== 'idle' && status !== 'confirmed') return;
    setError('');
    setAudioURL(null);
    audioChunksRef.current = [];
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = window.URL.createObjectURL(audioBlob);
            setAudioURL(url);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        if(recognitionRef.current) {
            recognitionRef.current.start();
        }
        setStatus('listening');
    } catch (err) {
        console.error("Failed to get user media", err);
        setError("Could not access the microphone. Please check permissions.");
        setStatus('idle');
    }
  };

  useEffect(() => {
    if (audioURL && audioPlayerRef.current) {
        setStatus('playback');
        audioPlayerRef.current.src = audioURL;
        audioPlayerRef.current.play().catch(e => {
            console.error("Playback failed:", e);
            setError("Could not play back audio.");
            setStatus('confirmed');
        });
    }
  }, [audioURL]);

  const handlePlaybackEnded = () => {
      setStatus('confirmed');
  };
  
  const handleConfirm = () => {
      setStatus('complete');
      setTimeout(onClose, 1500);
  };

  const renderStatusAndButton = () => {
    switch (status) {
        case 'idle':
            return (
                <>
                <p className="text-gray-600">Ready to calibrate.</p>
                <button onClick={startTraining} className="mt-4 w-full max-w-xs mx-auto py-3 px-6 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300">
                    <MicrophoneIcon className="w-6 h-6"/>
                    <span>Start Training</span>
                </button>
                </>
            );
        case 'listening':
            return (
                <>
                <p className="text-gray-600 animate-pulse">Listening...</p>
                <button onClick={stopRecording} className="mt-4 w-full max-w-xs mx-auto py-3 px-6 rounded-full text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300">
                    <StopIcon className="w-6 h-6"/>
                    <span>Stop</span>
                </button>
                </>
            );
        case 'processing':
            return <div className="flex items-center justify-center gap-2 text-gray-600"><Spinner /><span>Processing...</span></div>;
        case 'playback':
            return <p className="text-gray-600">Playing back recording...</p>;
        case 'confirmed':
            return (
                <>
                <p className="text-gray-600">Does this sound correct?</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button onClick={handleConfirm} className="py-2 px-6 rounded-full text-white font-bold bg-green-500 hover:bg-green-600">Sounds Good</button>
                    <button onClick={startTraining} className="py-2 px-6 rounded-full text-gray-700 font-bold bg-gray-200 hover:bg-gray-300">Try Again</button>
                </div>
                </>
            );
        case 'complete':
            return <div className="flex items-center justify-center gap-2 text-green-600"><CheckCircleIcon className="w-6 h-6" /><span>Calibration Complete!</span></div>;
        default: return null;
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[90] flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-transform duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Voice Training</h2>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Close voice training">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </header>
        <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">Read the paragraph below to help the app recognize your voice more accurately.</p>
            <div className="bg-gray-100 p-4 rounded-lg border">
                <p className="text-lg text-gray-800 leading-relaxed">{trainingText}</p>
            </div>
            <div className="mt-6 min-h-[76px] flex flex-col items-center justify-center">
                {error ? <p className="text-red-500">{error}</p> : renderStatusAndButton()}
            </div>
        </div>
        <audio ref={audioPlayerRef} onEnded={handlePlaybackEnded} className="hidden"></audio>
      </div>
    </div>
  );
};
