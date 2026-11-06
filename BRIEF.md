# Build: Nerve Force 2.0 iPhone app (static PWA)

Build a polished, installable iPhone web app (PWA) in THIS folder (~/nerve-force-app) for Brett's 13-minute morning routine. It must be plain static files (index.html, app.js, styles.css, manifest.webmanifest, sw.js, icons/) with NO build step and NO external JS deps, so it can be hosted on GitHub Pages from the repo root. Use relative paths only.

## Features
- Home screen: title "Nerve Force 2.0", total 13:00, big Start button, "See all 19 steps" list, and a "How to breathe" card (slow nasal breathing, relaxed posture, long exhale).
- Player: current step name, big countdown ring for the step, overall time remaining, next-up preview, Pause/Resume, Back, Next, Restart. Auto-advance with a short chime plus optional spoken cue (speechSynthesis: say the step name and a one-line cue at each step start, plus "10 seconds" warning). Voice toggle saved in localStorage. Auto-pause when the page is hidden (visibilitychange). Keep screen awake with the Wake Lock API when available.
- Each step has a "Watch how" button that opens an embedded YouTube video (youtube-nocookie.com embed in a modal, with a fallback "Open in YouTube" link). Pressing it pauses the timer.
- Step list: each row shows time, name, how-to text, and the video button.
- Setup banner at start: "Red light on. Steps 1–4 (optionally 5–6) on the vibration plate, then step off."
- Mobile-first, dark calm theme, big tap targets, safe-area insets, works offline after first load (service worker caches app shell). Apple touch icon and apple-mobile-web-app meta tags so "Add to Home Screen" launches full-screen. Generate simple PNG icons (180, 192, 512) yourself (e.g. with a tiny Python/PIL or a canvas-drawn SVG converted; any clean simple mark is fine).
- Log each completed run date in localStorage and show a small streak count on home.

## The routine (exact)
| # | Time | Step | How |
|---|---|---|---|
| 1 | 0:00–1:00 | Recuperative breathing | Slow nasal breathing, relaxed posture |
| 2 | 1:00–2:00 | Lymphatic drainage routine | Your own routine (no video needed; still allow a video if found) |
| 3 | 2:00–2:40 | Lymphatic hops | Gentle bounce, soft knees, loose arms |
| 4 | 2:40–3:20 | Side-to-side arm swings | Long relaxed arms swing together side to side (Qi Gong) |
| 5 | 3:20–4:00 | Body waves | Soft forward fold, roll up through the spine, arms sweep overhead |
| 6 | 4:00–4:30 | Shallow squats (6 reps) | Slow, controlled |
| 7 | 4:30–5:00 | Calf raises | Controlled up and down |
| 8 | 5:00–5:30 | Extend & contract | Extend a muscle group, deliberately tense, release; slow (Dumont) |
| 9 | 5:30–6:00 | Full-body stretch | Waking-up style reach, gentle tense, release |
| 10 | 6:00–6:40 | Opposite arm swings | One straight arm overhead while the other travels toward the knee; alternate |
| 11 | 6:40–7:20 | T-shape rotations | Arms out in a T; rotate one palm up while the other turns down |
| 12 | 7:20–7:50 | Hip & abdominal movement | Hip circles / pelvic and core movement |
| 13 | 7:50–8:30 | Alternating knee march | Knee up, opposite hand taps inside of knee, same-side hand toward glute |
| 14 | 8:30–9:10 | Conor McGregor swings | Rotate torso, one palm toward chest, other hand toward low back, head forward |
| 15 | 9:10–9:50 | Elbow-over-shoulder rotations | Rotate, sending one elbow toward/over the opposite shoulder |
| 16 | 9:50–10:30 | Hinged trunk twists | Hip hinge, long spine, rotate shoulders like a golf swing |
| 17 | 10:30–11:30 | Bar hang | Relax into a dead hang; break into sets if needed |
| 18 | 11:30–12:00 | Neck movements | Gentle, controlled neck mobility |
| 19 | 12:00–13:00 | Final recuperative breathing | Slow breathing, bring heart rate down |

Put the routine in a single data array (routine.js or inside app.js) with fields: name, seconds, how, cue, videoId, videoTitle, videoStart (optional seconds offset).

## Videos (important)
For each step pick the BEST SHORT YouTube demo (ideally under ~3 minutes, or a YouTube Short, clear form demonstration, reputable creator). Use web search to find candidates and VERIFY each video ID is real and embeddable by fetching https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json (must return 200 with a title). Never invent IDs. If a long video is the best, set videoStart to the moment the move is shown. Record the chosen title, channel, and length in VIDEOS.md with one line of why.

## Done when
- All files exist, index.html opens and works locally (sanity check with a quick `python3 -m http.server` + curl), every videoId passed the oEmbed check, `git init` done with everything committed on branch main.
- Print a final summary: files created, list of 19 steps with chosen video title + ID, and any step where no good video was found.
Do not publish anywhere, do not push, do not create accounts.
