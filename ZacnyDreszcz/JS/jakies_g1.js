/* ===== SIDEBAR (open/close) ===== */
(() => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const openBtn = document.getElementById("sidebarToggle");
  const closeBtn = document.getElementById("sidebarClose");

  if (!sidebar || !overlay || !openBtn || !closeBtn) return;

  const open = () => {
    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
  };

  const close = () => {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();


/* ===== THEME TOGGLE (dark/light) ===== */
(() => {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const KEY = "theme";

  function setTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }

  function initTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") {   // ✅ naprawione
      setTheme(saved);
      return;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDark ? "dark" : "light");
  }

  initTheme();

  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(KEY, next);
    });
  }
})();


/* ===== FLOATING FUN PANEL: DRAG + COLLAPSE (touch/mouse/pen) ===== */
(() => {
  const panel = document.querySelector(".fun-panel");
  const header = document.getElementById("funHeader");
  const statusEl = document.getElementById("funStatus"); // opcjonalnie do debug

  if (!panel || !header) return;

  let dragging = false;
  let moved = false;
  let startX = 0, startY = 0;
  let offsetX = 0, offsetY = 0;

  const MOVE_THRESHOLD = 6;     // px
  const PEN_PRESSURE_MIN = 0.05; // ✅ filtr hover rysika

  const debug = (e) => {
    // tylko jak chcesz zobaczyć w statusie co wchodzi (bezpieczne)
    if (!statusEl) return;
    statusEl.textContent = `Status: Input=${e.pointerType}, pressure=${(e.pressure ?? 0).toFixed(2)}`;
  };

  header.addEventListener("pointerdown", (e) => {
    if (!e.isPrimary) return;

    // ✅ RYSIK: ignoruj hover / mikro-dotyk bez nacisku
    if (e.pointerType === "pen" && (e.pressure ?? 0) < PEN_PRESSURE_MIN) return;

    dragging = true;
    moved = false;

    startX = e.clientX;
    startY = e.clientY;

    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;

    header.setPointerCapture(e.pointerId);
    e.preventDefault();

    debug(e);
  }, { passive: false });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    // (opcjonalnie) debug w statusie:
    // debug(e);

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) moved = true; // ✅ naprawione

    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top  = (e.clientY - offsetY) + "px";
    panel.style.right = "auto";

    e.preventDefault();
  }, { passive: false });

  header.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;

    // TAP (bez ruchu) = zwijanie/rozwijanie
    if (!moved) {
      panel.classList.toggle("collapsed");
      header.textContent = panel.classList.contains("collapsed")
        ? "Tryby zabawy ▲"
        : "Tryby zabawy ▼";
    }

    try { header.releasePointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  }, { passive: false });

  header.addEventListener("pointercancel", (e) => {
    dragging = false;
    try { header.releasePointerCapture(e.pointerId); } catch (_) {}
  }, { passive: false });
})();


/* ===== SIDEBAR FUN PANEL TOGGLE ===== */
(() => {
  const funPanel = document.querySelector(".fun-panel");
  const sidebarFunToggle = document.getElementById("sidebarFunToggle");

  if (sidebarFunToggle && funPanel) {
    sidebarFunToggle.addEventListener("click", () => {
      const hidden = funPanel.classList.toggle("is-hidden");
      sidebarFunToggle.textContent = hidden ? "🎛 Pokaż tryby zabawy" : "🎛 Tryby zabawy";
    });
  }
})();


/* ===== FUN BUTTONS PACK ===== */
(() => {
  const $ = (id) => document.getElementById(id);

  const status = $("funStatus");
  const countEl = $("clickCount");
  let count = 0;

  function setStatus(txt) {
    if (status) status.textContent = `Status: ${txt}`;
  }

  // 1) NIE KLIKAJ
  $("btnAlert")?.addEventListener("click", () => {
    alert("MÓWIŁEM 😡");
    setStatus("kliknąłeś NIE KLIKAJ.");
  });

  // 2) Uciekający
  const btnRunaway = $("btnRunaway");
  let runawayOn = false;

  btnRunaway?.addEventListener("click", () => {
    runawayOn = !runawayOn;
    btnRunaway.textContent = runawayOn ? "Uciekający: ON 🐭" : "Uciekający 🐭";
    setStatus(`uciekający ${runawayOn ? "ON" : "OFF"}.`);
    if (!runawayOn) btnRunaway.style.transform = "";
  });

  btnRunaway?.addEventListener("mouseenter", () => {
    if (!runawayOn) return;
    const x = Math.random() * 240 - 120;
    const y = Math.random() * 180 - 90;
    btnRunaway.style.transition = "transform 80ms linear";
    btnRunaway.style.transform = `translate(${x}px, ${y}px)`;
  });

  // 3) Licznik
  $("btnCounter")?.addEventListener("click", () => {
    count++;
    if (countEl) countEl.textContent = `Kliknięcia: ${count}`;
    if (count === 10) alert("OK, wystarczy 😐");
    if (count === 25) alert("Masz problem 😅");
    setStatus(`naklikane ${count}x.`);
  });

  // 4) Disco
  const btnDisco = $("btnDisco");
  let discoOn = false;

  function discoHandler() {
    document.body.style.background = `hsl(${Math.random() * 360}, 70%, 45%)`;
  }

  btnDisco?.addEventListener("click", () => {
    discoOn = !discoOn;
    btnDisco.textContent = discoOn ? "Disco: ON 🎨 (dblclick)" : "Disco tło 🎨";
    if (discoOn) document.body.addEventListener("dblclick", discoHandler);
    else {
      document.body.removeEventListener("dblclick", discoHandler);
      document.body.style.background = "";
    }
    setStatus(`disco ${discoOn ? "ON" : "OFF"}.`);
  });

  // 5) Kłamliwy h1
  const btnLiar = $("btnLiar");
  let liarOn = false;

  btnLiar?.addEventListener("click", () => {
    const h1 = document.querySelector(".card h1") || document.querySelector("h1"); // ✅ naprawione
    if (!h1) return;

    liarOn = !liarOn;
    btnLiar.textContent = liarOn ? "Kłamliwy: ON 🕵️" : "Kłamliwy h1 🕵️";

    if (liarOn) {
      h1.dataset.original = h1.textContent;
      h1.textContent = "Nie jestem Filip 👀";
    } else {
      h1.textContent = h1.dataset.original || "Cześć, jestem Filip"; // ✅ naprawione
    }
    setStatus(`kłamliwy h1 ${liarOn ? "ON" : "OFF"}.`);
  });

  // 6) Chaos
  $("btnChaos")?.addEventListener("click", () => {
    document.querySelectorAll("*").forEach(el => {
      el.style.transition = "transform 120ms ease";
      el.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    });
    setStatus("CHAOS MODE 🧨");
  });

  // 7) Troll F12
  $("btnConsole")?.addEventListener("click", () => {
    console.log("ERROR 404: Mózg nie znaleziony 🧠");
    console.log("Tip: jak to czytasz, to już jesteś devem 😎");
    setStatus("trolling w konsoli.");
  });

  // 8) Easter egg G
  const btnKey = $("btnKey");
  let keyOn = false;

  function keyHandler(e) {
    if (e.key.toLowerCase() === "g") {
      alert("G MODE ACTIVATED https://youtu.be/eCVlmiTOeIc?si=13PiP5F19sBUI-Gc 🔥");
      setStatus("G MODE ACTIVATED 🔥");
    }
  }

  btnKey?.addEventListener("click", () => {
    keyOn = !keyOn;
    btnKey.textContent = keyOn ? "Easter egg: ON 🎯 (G)" : "Easter egg (G) 🎯";
    if (keyOn) document.addEventListener("keydown", keyHandler);
    else document.removeEventListener("keydown", keyHandler);
    setStatus(`easter egg ${keyOn ? "ON" : "OFF"}.`);
  });

  // Reset
  $("btnReset")?.addEventListener("click", () => {
    document.querySelectorAll("*").forEach(el => {
      el.style.transform = "";
      el.style.transition = "";
    });
    document.body.style.background = "";
    count = 0;
    if (countEl) countEl.textContent = "Kliknięcia: 0";
    setStatus("zresetowane.");
  });
})();

/* ===== DRAW BOARD (canvas) ===== */
(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

const wrap = document.getElementById("boardWrap");
  const sidebarToggle = document.getElementById("sidebarBoardToggle");
  const sidebarSizeBtns = document.querySelectorAll("[data-board-size]");

  // UI in-canvas
  const toolToggle = document.getElementById("toolToggle");
  const toolbox = document.getElementById("toolbox");
  const clearBtn = document.getElementById("clear");
  const sizeEl = document.getElementById("size");
  const alphaEl = document.getElementById("alpha");
  const colorBtns = document.querySelectorAll(".toolbox .color");

  let color = "#38bdf8";
  let baseSize = sizeEl ? Number(sizeEl.value) : 6;
  let alpha = alphaEl ? Number(alphaEl.value) : 1;

 // ===== presety rozmiaru + zachowanie rysunku (CSS size -> canvas dopasowuje się do ekranu) =====
  const sizes = {
    s: { className: "size-s" },
    m: { className: "size-m" },
    l: { className: "size-l" },
  };

  function snapshotCanvas() {
    const old = document.createElement("canvas");
    old.width = canvas.width;
    old.height = canvas.height;
    old.getContext("2d").drawImage(canvas, 0, 0);
    return old;
  }

  function fitCanvasToDisplay(preserve = true, oldSnapshot = null) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const newW = Math.max(1, Math.round(rect.width * dpr));
    const newH = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width === newW && canvas.height === newH) {
      // i tak ustaw transform, żeby lineWidth był w CSS px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return;
    }

    const old = preserve ? (oldSnapshot || snapshotCanvas()) : null;
    const oldW = canvas.width, oldH = canvas.height;

    canvas.width = newW;
    canvas.height = newH;

    // rysowanie w "pikselach canvasa" (device px)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, newW, newH);

    if (old) {
      ctx.drawImage(old, 0, 0, oldW, oldH, 0, 0, newW, newH);
    }

    // od teraz rysujemy w CSS px
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setBoardSize(key) {
    if (!wrap || !sizes[key]) return;

    const old = snapshotCanvas();

    wrap.classList.remove("size-s", "size-m", "size-l");
    wrap.classList.add(sizes[key].className);

    // poczekaj na przeliczenie layoutu po zmianie klasy
    requestAnimationFrame(() => fitCanvasToDisplay(true, old));
  }

  // podpinamy przyciski S/M/L (to masz już, tylko zostaje)
  sidebarSizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setBoardSize(btn.dataset.boardSize));
  });

  // dopasuj canvas na starcie + przy resize (ważne dla L: max-width:92vw)
  requestAnimationFrame(() => fitCanvasToDisplay(true));
  window.addEventListener("resize", () => fitCanvasToDisplay(true), { passive: true });

  // ===== pozycja rysika w CSS px (a nie w skali canvasa) =====
  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left), y: (e.clientY - r.top) };
  }

// ===== sidebar: pokaż/ukryj tablicę =====
  if (sidebarToggle && wrap) {
    sidebarToggle.addEventListener("click", () => {
      wrap.classList.toggle("hidden");
    });
  }

  // ===== toolToggle: tap otwiera toolbox, drag przesuwa tablicę =====
  let draggingBoard = false;
  let movedBoard = false;
  let startBX = 0, startBY = 0;
  let offBX = 0, offBY = 0;
  const MOVE_T = 6;

  if (toolToggle && toolbox && wrap) {
    toolToggle.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) return;
      draggingBoard = true;
      movedBoard = false;

      startBX = e.clientX;
      startBY = e.clientY;

      const rect = wrap.getBoundingClientRect();
      offBX = e.clientX - rect.left;
      offBY = e.clientY - rect.top;

      toolToggle.setPointerCapture(e.pointerId);
      e.preventDefault();
    }, { passive: false });

    toolToggle.addEventListener("pointermove", (e) => {
      if (!draggingBoard || !wrap) return;

      const dx = Math.abs(e.clientX - startBX);
      const dy = Math.abs(e.clientY - startBY);
      if (dx > MOVE_T || dy > MOVE_T) movedBoard = true;

      // przesuwamy wrapper
      wrap.style.left = (e.clientX - offBX) + "px";
      wrap.style.top  = (e.clientY - offBY) + "px";
      wrap.style.transform = "none"; // bo normalnie centrowało translateX(-50%)
      wrap.style.right = "auto";

      e.preventDefault();
    }, { passive: false });

    toolToggle.addEventListener("pointerup", (e) => {
      if (!draggingBoard) return;
      draggingBoard = false;

      // tap (bez ruchu) = toggle toolbox
      if (!movedBoard) toolbox.hidden = !toolbox.hidden;

      try { toolToggle.releasePointerCapture(e.pointerId); } catch(_) {}
      e.preventDefault();
    }, { passive: false });

    toolToggle.addEventListener("pointercancel", (e) => {
      draggingBoard = false;
      try { toolToggle.releasePointerCapture(e.pointerId); } catch(_) {}
    }, { passive: false });
  }

  // sliders
  if (sizeEl) sizeEl.addEventListener("input", () => (baseSize = Number(sizeEl.value)));
  if (alphaEl) alphaEl.addEventListener("input", () => (alpha = Number(alphaEl.value)));

  // colors
  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      color = btn.dataset.color || color;
    });
  });

  // clear
  clearBtn?.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // drawing state
  let drawing = false;
  let lastX = 0, lastY = 0;

  // width smoothing (żeby nie było "bam")
  let currentWidth = baseSize;
  const SMOOTH = 0.18;
  
  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);

    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;

    // startowa grubość
    const pressure = e.pointerType === "pen" ? (e.pressure || 0) : 1;
    const targetWidth = baseSize * (0.3 + 0.7 * pressure);
    currentWidth = targetWidth;

    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;

    const p = getPos(e);

    const pressure = e.pointerType === "pen" ? (e.pressure || 0) : 1;
    const targetWidth = baseSize * (0.3 + 0.7 * pressure);

    // płynne przejście grubości
    currentWidth = currentWidth + (targetWidth - currentWidth) * SMOOTH;

    ctx.lineWidth = currentWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;

    // ✅ segment: rysujemy tylko nowy odcinek (nie przerysowujemy całej ścieżki)
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastX = p.x;
    lastY = p.y;

    e.preventDefault();
  }, { passive: false });

  const stop = (e) => {
    if (!drawing) return;
    drawing = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  };

  canvas.addEventListener("pointerup", stop, { passive: false });
  canvas.addEventListener("pointercancel", stop, { passive: false });

  // klik na canvas poza toolbox = schowaj
  document.addEventListener("pointerdown", (e) => {
    if (!toolbox || toolbox.hidden) return;
    if (e.target === toolToggle || toolbox.contains(e.target)) return;
    if (canvas.contains(e.target)) toolbox.hidden = true;
  });
})();