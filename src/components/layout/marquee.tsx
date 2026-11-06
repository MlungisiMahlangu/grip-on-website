const WORDS = ["Strength", "Discipline", "Community", "Grip on the work"];

export function Marquee() {
  return (
    <section className="overflow-hidden border-y border-ink/15 bg-light py-4 text-ink sm:py-5">
      <h2 className="sr-only">Strength. Discipline. Community.</h2>
      <div className="marquee-track flex w-max" aria-hidden="true">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center">
            {WORDS.map((word) => (
              <span key={`${group}-${word}`} className="flex items-center">
                <span className="display px-6 text-3xl sm:px-9 sm:text-5xl lg:text-6xl">{word}</span>
                <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent sm:h-2 sm:w-2" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
