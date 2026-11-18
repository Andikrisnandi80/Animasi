"""Synthesized score + SFX for the family short (15 s, 48 kHz stereo). Original, warm and light:
a plucked melody over soft pad chords (C - Am - F - G), shaker, plus whooshes on cuts, boings on the hops and chimes
for the hearts. Timings are frames at 30 fps from story.ts."""
import numpy as np, wave, sys

SR, DUR, FPS = 48000, 15.0, 30
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a=0.005, d=0.25, s=0.0, r=0.05):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * (s + (1 - s) * np.exp(-t / d))
    rel = int(r * SR)
    if rel < n:
        e[-rel:] *= np.linspace(1, 0, rel)
    return e


def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def pluck(f, dur=0.6, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum((bright ** k) / k * np.sin(2 * np.pi * f * k * t) for k in range(1, 6))
    return s * env_adsr(n, 0.003, 0.22, 0.0, 0.04)


def bell(f, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15) + 0.3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.08)
    return s * env_adsr(n, 0.002, 0.45, 0, 0.1)


def pad(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            s += np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6.28))
    e = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    return s * e / (3 * len(freqs))


bpm = 112
beat = 60 / bpm
music = np.zeros(N)
# chords per bar (4 beats): C, Am, F, G
chords = [[48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]]
bar = 4 * beat
nbars = int(DUR / bar) + 1
for b in range(nbars):
    ch = chords[b % 4]
    add(music, 0.22 * pad([midi(m + 12) for m in ch[1:]], bar), b * bar)
    # bass on 1 and 3
    for k in (0, 2):
        add(music, 0.32 * pluck(midi(ch[0] - 12), beat * 1.6, 0.4), b * bar + k * beat)
# melody (scale degrees in C major, beats): a simple, happy original line
mel = [(76, 1), (79, 0.5), (76, 0.5), (74, 1), (72, 1),
       (72, 1), (76, 0.5), (74, 0.5), (72, 1), (69, 1),
       (69, 1), (72, 0.5), (74, 0.5), (77, 1), (76, 1),
       (74, 1), (76, 0.5), (74, 0.5), (71, 1), (67, 1)]
t = beat * 4  # melody enters after the intro bar
while t < DUR - 1.0:
    for m, d in mel:
        if t >= DUR - 1.0:
            break
        add(music, 0.26 * pluck(midi(m), max(0.35, d * beat * 1.4), 0.6), t)
        t += d * beat
# shaker on the off-beats
nsh = int(0.06 * SR)
for k in range(int(DUR / (beat / 2))):
    if k % 2 == 1:
        sh = rng.normal(0, 1, nsh) * np.exp(-np.arange(nsh) / SR / 0.018)
        sh = np.diff(np.concatenate([[0], sh]))  # brighter
        add(music, 0.05 * sh, k * beat / 2)
# final chord ring-out
add(music, 0.25 * pad([midi(m) for m in (60, 64, 67, 72)], 2.2), DUR - 2.2)

sfx = np.zeros(N)


def whoosh(dur=0.45):
    n = int(dur * SR)
    x = rng.normal(0, 1, n)
    # moving one-pole low-pass
    out = np.zeros(n)
    y = 0
    for i in range(n):
        a = 0.02 + 0.25 * np.sin(np.pi * i / n)
        y += a * (x[i] - y)
        out[i] = y
    return out * np.sin(np.pi * np.arange(n) / n) ** 2 * 2.2


def boing(f0=300, dur=0.35):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-tt / 0.05)) * (1 + 0.05 * np.sin(2 * np.pi * 14 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_adsr(n, 0.003, 0.12, 0, 0.05)


def pop():
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    f = 900 * np.exp(-tt / 0.02) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.02)


for fr in (100, 190, 285):
    add(sfx, 0.35 * whoosh(), fr / FPS - 0.2)
for fr in (222, 242, 318, 336, 354):
    add(sfx, 0.35 * boing(320 if fr < 300 else 380), fr / FPS)
add(sfx, 0.3 * pop(), 140 / FPS)  # Kakak's laugh beat
for i, fr in enumerate(range(330, 430, 9)):
    add(sfx, 0.12 * bell(midi([84, 88, 91, 96, 91, 88][i % 6]), 0.9), fr / FPS + rng.uniform(0, 0.08))
# hand waves: tiny soft ticks with each wag
for fr in range(112, 180, 6):
    add(sfx, 0.04 * pop(), fr / FPS)

# mix: music +3 dB, SFX -6 dB (skill standard), then normalize to about -14 LUFS-ish peak-safe level
mix = music * 10 ** (3 / 20) + sfx * 10 ** (-6 / 20)
# fade in / out
fade = np.ones(N)
fi, fo = int(0.3 * SR), int(1.2 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.85
# light stereo: music slightly wide via a short delay
L = mix.copy()
R = np.concatenate([np.zeros(int(0.008 * SR)), mix])[:N]
st = np.stack([L * 0.9 + R * 0.1, R * 0.9 + L * 0.1], 1)
out = sys.argv[1] if len(sys.argv) > 1 else "mix.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
print("wrote", out, st.shape[0] / SR, "s")
