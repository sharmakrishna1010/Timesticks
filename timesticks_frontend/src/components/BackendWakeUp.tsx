import { useEffect, useState, useRef } from 'react';
import logo from '../assets/logo_noBG.png';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const POLL_INTERVAL_MS = 2000;     // ping every 2 seconds
const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes = give up

type Status = 'checking' | 'waking' | 'ready' | 'error';

interface BackendWakeUpProps {
  children: React.ReactNode;
  /** Force light theme on the wake-up/error screen (for auth pages) */
  forceLight?: boolean;
}

export default function BackendWakeUp({ children, forceLight = false }: BackendWakeUpProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [elapsed, setElapsed] = useState(0); // seconds shown in UI
  const startRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const ping = async (): Promise<boolean> => {
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 4000); // 4s per request
        const res = await fetch(`${BACKEND_URL}/health`, {
          signal: ctrl.signal,
          credentials: 'include',
        });
        clearTimeout(timeout);
        // Any real HTTP response (even 404) means server is awake
        return res.status < 600;
      } catch {
        return false;
      }
    };

    const run = async () => {
      // First immediate ping
      const alive = await ping();
      if (cancelled) return;

      if (alive) {
        setStatus('ready');
        return;
      }

      // Server is sleeping — show waking screen and start polling
      setStatus('waking');
      startRef.current = Date.now();

      // Elapsed seconds counter (for UX — "Waking up… 0:12")
      timerRef.current = setInterval(() => {
        if (cancelled) return;
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);

      // Poll every 2s
      intervalRef.current = setInterval(async () => {
        if (cancelled) return;

        const elapsed = Date.now() - startRef.current;
        if (elapsed >= TIMEOUT_MS) {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          setStatus('error');
          return;
        }

        const alive = await ping();
        if (cancelled) return;
        if (alive) {
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          setStatus('ready');
        }
      }, POLL_INTERVAL_MS);
    };

    run();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Apply / remove dark theme on body for the wake-up screen
  useEffect(() => {
    if (status === 'ready') return; // let the page component handle it
    if (forceLight) {
      document.body.classList.remove('dark-theme');
      return;
    }
    const stored = localStorage.getItem('timesticks_theme');
    if (stored === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }, [status, forceLight]);

  if (status === 'ready') return <>{children}</>;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  if (status === 'error') {
    return (
      <div className="wakeup-screen">
        <div className="wakeup-card">
          <div className="wakeup-error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="wakeup-title" style={{ color: 'var(--error)' }}>Internal Server Error</h1>
          <p className="wakeup-sub">
            The backend didn't respond after 3 minutes. It may be experiencing issues.
          </p>
          <button
            className="ts-btn ts-btn-primary"
            style={{ marginTop: '20px' }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 'checking' or 'waking'
  return (
    <div className="wakeup-screen">
      <div className="wakeup-card">
        <div className="wakeup-logo-wrap">
          <img src={logo} alt="Timesticks" className="wakeup-logo" />
        </div>
        <h1 className="wakeup-title">
          T<span style={{ color: 'var(--blue)' }}>i</span>mesticks
        </h1>
        {status === 'waking' ? (
          <>
            <p className="wakeup-sub">Waking up the backend…</p>
            <p className="wakeup-hint">
              Running on Render's free tier — cold starts can take up to a minute. Hang tight! ☕
            </p>
            <div className="wakeup-progress">
              <div className="wakeup-bar" />
            </div>
            <div className="wakeup-dots">
              <span /><span /><span />
            </div>
            <span className="wakeup-timer">{timeStr}</span>
          </>
        ) : (
          <>
            <p className="wakeup-sub">Connecting…</p>
            <div className="wakeup-dots">
              <span /><span /><span />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
