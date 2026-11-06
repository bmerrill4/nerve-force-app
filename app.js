(() => {
  const $ = id => document.getElementById(id);
  const TOTAL = ROUTINE.reduce((a, s) => a + s.seconds, 0);
  const CIRC = 2 * Math.PI * 90;
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  let idx = 0, remaining = 0, running = false, last = 0, timer = null, warned = false, wake = null, audio = null;
  let voice = ls.get("nf_voice", true);

  // ---------- home ----------
  function dayKey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function streak() {
    const days = new Set(ls.get("nf_runs", []));
    const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderStreak() {
    const n = streak();
    const t = n ? "🔥 " + n + "-day streak" : "No streak yet. Start today.";
    $("streak").textContent = t; $("streak2").textContent = t;
  }
  function renderList() {
    let at = 0;
    $("stepList").innerHTML = "";
    ROUTINE.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="t"></span><span class="n"></span><span class="v"></span><span class="h"></span>';
      li.children[0].textContent = fmt(at) + "–" + fmt(at + s.seconds);
      li.children[1].textContent = (i + 1) + ". " + s.name;
      li.children[3].textContent = s.how;
      const b = document.createElement("button");
      b.className = "btn sm"; b.textContent = "Watch how";
      b.onclick = () => openVideo(i);
      li.children[2].appendChild(b);
      $("stepList").appendChild(li);
      at += s.seconds;
    });
  }
  function show(id) { ["home", "player", "done"].forEach(x => $(x).classList.toggle("hidden", x !== id)); window.scrollTo(0, 0); }

  // ---------- audio / voice ----------
  function unlockAudio() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
    } catch (e) {}
  }
  function chime() {
    if (!audio) return;
    const t = audio.currentTime;
    [660, 880].forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.5);
      o.connect(g); g.connect(audio.destination);
      o.start(t + i * 0.18); o.stop(t + i * 0.18 + 0.55);
    });
  }
  function speak(text) {
    if (!voice || !("speechSynthesis" in window)) return;
    try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) {}
  }

  // ---------- wake lock ----------
  async function lockWake() {
    try { if ("wakeLock" in navigator && !wake) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } } catch (e) {}
  }
  function unlockWake() { try { if (wake) wake.release(); } catch (e) {} wake = null; }

  // ---------- player ----------
  function beginStep(i, announce) {
    idx = i; remaining = ROUTINE[i].seconds; warned = false;
    render();
    if (announce) { chime(); speak(ROUTINE[i].name + ". " + ROUTINE[i].cue); }
  }
  function render() {
    const s = ROUTINE[idx];
    $("stepNum").textContent = "Step " + (idx + 1) + " of " + ROUTINE.length;
    $("stepName").textContent = s.name;
    $("stepHow").textContent = s.how;
    $("nextName").textContent = ROUTINE[idx + 1] ? ROUTINE[idx + 1].name : "Finish";
    paint();
  }
  function paint() {
    const s = ROUTINE[idx];
    let after = 0; for (let j = idx + 1; j < ROUTINE.length; j++) after += ROUTINE[j].seconds;
    $("time").textContent = fmt(remaining);
    $("overall").textContent = fmt(after + remaining) + " left";
    $("prog").style.strokeDasharray = CIRC;
    $("prog").style.strokeDashoffset = CIRC * (1 - remaining / s.seconds);
    $("pauseBtn").textContent = running ? "Pause" : "Resume";
  }
  function tick() {
    const now = performance.now();
    remaining -= (now - last) / 1000; last = now;
    if (!warned && remaining <= 10 && ROUTINE[idx].seconds > 20 && remaining > 0) { warned = true; speak("10 seconds"); }
    if (remaining <= 0) {
      if (idx + 1 < ROUTINE.length) beginStep(idx + 1, true); else finish();
      return;
    }
    paint();
  }
  function play() { if (running) return; running = true; last = performance.now(); timer = setInterval(tick, 250); lockWake(); paint(); }
  function pause() { if (!running) return; running = false; clearInterval(timer); unlockWake(); try { speechSynthesis.cancel(); } catch (e) {} paint(); }
  function start() {
    unlockAudio();
    show("player");
    beginStep(0, true);
    play();
  }
  function finish() {
    pause();
    const runs = ls.get("nf_runs", []), k = dayKey(new Date());
    if (!runs.includes(k)) { runs.push(k); ls.set("nf_runs", runs); }
    chime(); speak("Routine complete.");
    renderStreak(); show("done");
  }
  function quit() { pause(); renderStreak(); show("home"); }

  // ---------- video modal ----------
  function openVideo(i) {
    if (!$("player").classList.contains("hidden")) pause();
    const s = ROUTINE[i];
    const q = s.videoStart ? "?start=" + s.videoStart + "&rel=0" : "?rel=0";
    $("vidTitle").textContent = s.videoTitle;
    $("vframe").src = "https://www.youtube-nocookie.com/embed/" + s.videoId + q;
    $("ytLink").href = "https://www.youtube.com/watch?v=" + s.videoId + (s.videoStart ? "&t=" + s.videoStart + "s" : "");
    $("modal").classList.remove("hidden");
  }
  function closeVideo() { $("modal").classList.add("hidden"); $("vframe").src = "about:blank"; }

  // ---------- wiring ----------
  $("voiceToggle").checked = voice;
  $("voiceToggle").onchange = e => { voice = e.target.checked; ls.set("nf_voice", voice); };
  $("startBtn").onclick = start;
  $("pauseBtn").onclick = () => { unlockAudio(); running ? pause() : play(); };
  $("nextBtn").onclick = () => { if (idx + 1 < ROUTINE.length) beginStep(idx + 1, true); else finish(); if (running) last = performance.now(); };
  $("backBtn").onclick = () => { beginStep(Math.max(0, idx - (ROUTINE[idx].seconds - remaining > 3 ? 0 : 1)), true); if (running) last = performance.now(); };
  $("restartBtn").onclick = () => { beginStep(0, true); if (!running) play(); else last = performance.now(); };
  $("quitBtn").onclick = quit;
  $("homeBtn").onclick = () => show("home");
  $("watchBtn").onclick = () => openVideo(idx);
  $("closeModal").onclick = closeVideo;
  $("modal").onclick = e => { if (e.target === $("modal")) closeVideo(); };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (running) pause(); }
  });

  renderList(); renderStreak();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
