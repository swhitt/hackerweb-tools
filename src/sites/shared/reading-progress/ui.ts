import { qs } from "../../../utils/dom-helpers";

const PROGRESS_BAR_CLASS = "hwt-progress-bar";
const PROGRESS_FILL_CLASS = "hwt-progress-bar-fill";

let progressBar: HTMLDivElement | null = null;
let progressFill: HTMLDivElement | null = null;
let rafId: number | null = null;

/**
 * Calculate the reading progress (0-100)
 */
function calculateProgress(): number {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  // Scrollable distance
  const scrollable = docHeight - winHeight;

  if (scrollable <= 0) return 100;

  const progress = (scrollTop / scrollable) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Update the progress bar width
 */
function updateProgressBar(): void {
  if (!progressFill) return;

  const progress = calculateProgress();
  progressFill.style.width = `${progress}%`;
}

/**
 * Handle scroll events with requestAnimationFrame
 */
function onScroll(): void {
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    updateProgressBar();
    rafId = null;
  });
}

/**
 * Create and inject the progress bar element
 */
export function createProgressBar(): void {
  // Check if already exists
  if (qs(`.${PROGRESS_BAR_CLASS}`)) return;

  progressBar = document.createElement("div");
  progressBar.className = PROGRESS_BAR_CLASS;

  progressFill = document.createElement("div");
  progressFill.className = PROGRESS_FILL_CLASS;

  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);

  // Initial update
  updateProgressBar();
}

/**
 * Set up scroll event listener
 */
export function setupScrollListener(): () => void {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgressBar, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", updateProgressBar);

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

/**
 * Remove the progress bar
 */
export function removeProgressBar(): void {
  progressBar?.remove();
  progressBar = null;
  progressFill = null;
}
