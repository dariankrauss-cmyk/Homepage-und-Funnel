#!/usr/bin/env python3
"""
Erzeugt die dezenten Marmor-Texturen der Website (dunkel und hell).

Die Bilder sind selbst gerechnet, es gibt also keine Bildrechte Dritter.
Aufruf (braucht numpy und Pillow, nur für dieses Werkzeug):

    python3 tools/marmor.py

Ergebnis: src/static/img/marmor-dunkel.webp und src/static/img/marmor-hell.webp
Gleicher Startwert = gleiches Bild. Für ein anderes Muster SEED ändern.
"""
from pathlib import Path

import numpy as np
from PIL import Image

SEED = 11
BREITE, HOEHE = 1920, 1200
ZIEL = Path(__file__).resolve().parent.parent / "src" / "static" / "img"


def glatt(rng, sigma):
    """Weiches Rauschen: weißes Rauschen, per FFT mit einer Gaußglocke geglättet."""
    z = rng.standard_normal((HOEHE, BREITE)).astype(np.float32)
    ky = np.fft.fftfreq(HOEHE)[:, None]
    kx = np.fft.rfftfreq(BREITE)[None, :]
    g = np.exp(-2 * (np.pi * sigma) ** 2 * (kx**2 + ky**2))
    out = np.fft.irfft2(np.fft.rfft2(z) * g, s=(HOEHE, BREITE))
    return (out / out.std()).astype(np.float32)


def fbm(rng, sigmas=(260, 130, 65, 32, 16), abfall=0.5):
    summe, amp, gesamt = 0.0, 1.0, 0.0
    for s in sigmas:
        summe = summe + amp * glatt(rng, s)
        gesamt += amp
        amp *= abfall
    return summe / gesamt


def adern(rng, winkel, frequenz, verbiegen, schaerfe):
    """Lange, fließende Adern: verzerrte Koordinaten, dann Nulldurchgänge eines Sinus."""
    y, x = np.mgrid[0:HOEHE, 0:BREITE].astype(np.float32)
    x = x + 120 * fbm(rng, (360, 180, 90))
    y = y + 120 * fbm(rng, (360, 180, 90))
    t = (x * np.cos(winkel) + y * np.sin(winkel)) / BREITE
    v = np.sin(2 * np.pi * (t * frequenz + verbiegen * fbm(rng)))
    linie = (1 - np.abs(v)) ** schaerfe
    hof = (1 - np.abs(v)) ** 5  # weicher Schimmer neben der Ader
    # Adern werden mal kräftiger, mal blasser, wie im echten Stein
    verlauf = np.clip(0.55 + 0.45 * fbm(rng, (240, 120)), 0, 1)
    return linie * verlauf, hof * verlauf


def marmor(dunkel):
    rng = np.random.default_rng(SEED + (0 if dunkel else 100))
    wolke = np.clip(0.5 + 0.22 * fbm(rng, (300, 150, 75, 38)), 0, 1)
    a1, h1 = adern(rng, 0.62, 2.1, 0.24, 30)  # wenige Hauptadern, diagonal
    a2, h2 = adern(rng, 0.95, 3.8, 0.34, 70)  # feine Nebenadern, nur stellenweise
    maske = np.clip(fbm(rng, (220, 110)) * 0.9 + 0.1, 0, 1)
    ader = np.clip(a1 + 0.55 * a2 * maske, 0, 1)
    hof = np.clip(h1 * 0.6 + 0.25 * h2 * maske, 0, 1)

    if dunkel:
        tief, hell = np.array([10, 9, 8], np.float32), np.array([24, 22, 19], np.float32)
        aderfarbe, staerke, hofstaerke = np.array([92, 82, 64], np.float32), 0.62, 0.10
    else:
        tief, hell = np.array([236, 231, 222], np.float32), np.array([248, 246, 241], np.float32)
        aderfarbe, staerke, hofstaerke = np.array([190, 180, 162], np.float32), 0.5, 0.1

    bild = tief + (hell - tief) * wolke[..., None]
    bild = bild * (1 - hofstaerke * hof[..., None]) + aderfarbe * hofstaerke * hof[..., None]
    bild = bild * (1 - staerke * ader[..., None]) + aderfarbe * staerke * ader[..., None]
    # Feines Korn wie im Stein; verhindert außerdem Farbstufen in dunklen Verläufen
    bild = bild + rng.normal(0, 1.1 if dunkel else 0.9, bild.shape[:2])[..., None]
    return Image.fromarray(np.clip(np.round(bild), 0, 255).astype(np.uint8), "RGB")


if __name__ == "__main__":
    ZIEL.mkdir(parents=True, exist_ok=True)
    for name, dunkel in (("marmor-dunkel", True), ("marmor-hell", False)):
        pfad = ZIEL / f"{name}.webp"
        marmor(dunkel).save(pfad, "WEBP", quality=82, method=6)
        print(f"{pfad.relative_to(ZIEL.parent.parent.parent)}: {pfad.stat().st_size // 1024} KB")
