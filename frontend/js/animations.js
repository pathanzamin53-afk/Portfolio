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
  const render = () => {
    const fragment = document.createDocumentFragment();
    const levels = [];
    for (let index = 0; index < 364; index += 1) {
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
      fragment.append(cell);
      levels.push(cell);
    }
    grid.append(fragment);
    return levels;
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(render, { timeout: 1200 });
  } else {
    window.setTimeout(render, 0);
  }
}
