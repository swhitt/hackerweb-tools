const COMFORT_CLASS = "hwt-comfort";

export function applyComfortMode(): void {
  document.documentElement.classList.add(COMFORT_CLASS);
}

export function removeComfortMode(): void {
  document.documentElement.classList.remove(COMFORT_CLASS);
}
