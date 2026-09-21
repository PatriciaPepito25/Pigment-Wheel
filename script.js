// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (!navToggle || !mobileNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
  });

  // Close the menu when a link is clicked (useful for single-page anchors)
  mobileNav.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
});

// Pigment Wheel — wedge generation, pop animation, auto-demo

const CENTER = { x: 210, y: 210 };
const RADIUS = 190;
const POP_DISTANCE = 34; // how far a wedge slides outward when "popped"

// Colors ordered clockwise from top
const WEDGES = [
  { base: "#F4C21A", light: "#FFE580", dark: "#B88E00" },
  { base: "#E8791A", light: "#FFB35C", dark: "#A6520A" },
  { base: "#3E7D32", light: "#7ABF63", dark: "#1F4A18" },
  { base: "#1E5FA8", light: "#5C9BE0", dark: "#0E3766" },
  { base: "#3B1E5E", light: "#6B4A93", dark: "#1E0E33" },
  { base: "#8B1A2B", light: "#C24A5A", dark: "#4E0A14" },
];

document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("wheelSvg");
  if (!svg) return; 

  const n = WEDGES.length;
  const anglePer = (2 * Math.PI) / n;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svg.appendChild(defs);

  const wedgeEls = [];
  let activeLabel = null;

  function polar(cx, cy, r, angle) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function wedgePath(cx, cy, r, startAngle, endAngle) {
    const p0 = polar(cx, cy, r, startAngle);
    const p1 = polar(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M${cx},${cy} L${p0.x},${p0.y} A${r},${r} 0 ${largeArc} 1 ${p1.x},${p1.y} Z`;
  }

  function setLabel(text) {
    const label = document.getElementById("label");
    if (label) label.textContent = text;
  }

  function popOut(group, on) {
    const dx = parseFloat(group.dataset.dx) * POP_DISTANCE;
    const dy = parseFloat(group.dataset.dy) * POP_DISTANCE;
    group.classList.toggle("popped", on);
    group.style.transform = on
      ? `translate(${dx}px, ${dy}px) scale(1.06)`
      : "translate(0,0) scale(1)";
  }

  function toggleWedge(group, label) {
    const isActive = group.classList.contains("popped");
    wedgeEls.forEach(w => popOut(w, false));
    if (!isActive) {
      popOut(group, true);
      activeLabel = label;
      setLabel(label);
    } else {
      activeLabel = null;
      setLabel("Wedge");
    }
  }

  /* ---------- Build wedges ---------- */
  WEDGES.forEach((w, i) => {
    const startAngle = -Math.PI / 2 + i * anglePer; // start at top, go clockwise
    const endAngle = startAngle + anglePer;
    const midAngle = (startAngle + endAngle) / 2;

    const gradId = `grad-${i}`;
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("cx", "35%");
    grad.setAttribute("cy", "30%");
    grad.setAttribute("r", "85%");
    grad.innerHTML = `
      <stop offset="0%" stop-color="${w.light}"/>
      <stop offset="55%" stop-color="${w.base}"/>
      <stop offset="100%" stop-color="${w.dark}"/>
    `;
    defs.appendChild(grad);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "wedge");
    group.dataset.index = i;
    group.dataset.dx = Math.cos(midAngle);
    group.dataset.dy = Math.sin(midAngle);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", wedgePath(CENTER.x, CENTER.y, RADIUS, startAngle, endAngle));
    path.setAttribute("fill", `url(#${gradId})`);
    group.appendChild(path);

    group.addEventListener("click", () => toggleWedge(group, w.label));
    group.addEventListener("mouseenter", () => setLabel(w.label));
    group.addEventListener("mouseleave", () => setLabel(activeLabel || "Wedge"));

    svg.appendChild(group);
    wedgeEls.push(group);
  });

  /* ---------- Auto-demo on load (stops on first real click) ---------- */
  function autoDemo() {
    let i = 0;
    const interval = setInterval(() => {
      wedgeEls.forEach(w => popOut(w, false));
      popOut(wedgeEls[i], true);
      setLabel(WEDGES[i].label);
      activeLabel = WEDGES[i].label;
      i = (i + 1) % wedgeEls.length;
    }, 1400);
    svg.addEventListener("click", () => clearInterval(interval), { once: true });
  }
  autoDemo();
});
