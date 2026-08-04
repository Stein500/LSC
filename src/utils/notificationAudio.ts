export type NotificationAudioKind = "notification" | "success" | "error" | "warning" | "info" | "precommande" | "formation" | "contact" | "mood";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getAudioContext(): AudioContext | null {
  if (!isBrowser()) return null;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

function playTone(frequencies: number[], options: { duration: number; volume: number; type?: OscillatorType } ) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = Math.min(Math.max(options.volume, 0), 1);
  master.connect(ctx.destination);

  frequencies.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = options.type ?? "sine";
    oscillator.frequency.value = frequency;

    const start = now + index * 0.10;
    const end = start + options.duration;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.42, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });

  // Ferme le contexte après lecture pour éviter les fuites.
  window.setTimeout(() => {
    void ctx.close().catch(() => undefined);
  }, Math.max(250, options.duration * 1000 + 250));
}

export function playNotificationAudio(kind: NotificationAudioKind = "notification") {
  if (!isBrowser()) return;

  switch (kind) {
    case "success":
      // Petit carillon doux, un peu plus présent.
      playTone([740, 988, 1318], { duration: 0.17, volume: 1, type: "sine" });
      break;
    case "error":
      playTone([220, 196], { duration: 0.18, volume: 1, type: "triangle" });
      break;
    case "warning":
      playTone([523, 659, 784], { duration: 0.16, volume: 1, type: "sine" });
      break;
    case "precommande":
      playTone([523, 659, 784], { duration: 0.16, volume: 1, type: "sine" });
      break;
    case "formation":
      playTone([494, 622, 740], { duration: 0.16, volume: 1, type: "sine" });
      break;
    case "contact":
      playTone([587, 740, 880], { duration: 0.16, volume: 1, type: "sine" });
      break;
    case "mood":
      playTone([466, 587], { duration: 0.18, volume: 0.95, type: "sine" });
      break;
    case "info":
    case "notification":
    default:
      // Deux petits coups clairs, plus audibles.
      playTone([587, 784, 1046], { duration: 0.14, volume: 1, type: "sine" });
      break;
  }
}

export function speakSoft(message: string, options: { volume?: number; rate?: number; pitch?: number; lang?: string } = {}) {
  if (!isBrowser()) return;
  if (!("speechSynthesis" in window)) return;

  try {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = options.lang ?? "fr-BJ";
    utterance.volume = options.volume ?? 1;
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.22;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => /fr/i.test(voice.lang) && /female|femme|virginie|audrey|celine|lea|lea|lou|sophie|julie/i.test(`${voice.name} ${voice.lang}`))
      ?? voices.find((voice) => /fr/i.test(voice.lang))
      ?? voices[0];
    if (preferred) {
      utterance.voice = preferred;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Silence total si le navigateur refuse.
  }
}
