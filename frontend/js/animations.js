export function initRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));
}

export function initContributionGrid() {
  const grid = document.querySelector("#contribution-grid");
  if (!grid) return;
  const levels = Array.from({ length: 364 }, (_, index) => {
    const wave = Math.sin(index * 0.31) + Math.sin(index * 0.073);
    const level =
      wave > 1.05
        ? 4
        : wave > 0.35
          ? 3
          : wave > -0.35
            ? 2
            : wave > -1.05
              ? 1
              : 0;
    const cell = document.createElement("i");
    cell.className = `level-${level}`;
    cell.title = `${level * 3 + (index % 4)} contributions`;
    grid.append(cell);
    return cell;
  });
  return levels;
}
