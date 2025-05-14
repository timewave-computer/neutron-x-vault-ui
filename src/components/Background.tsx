export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
      <div className="absolute inset-0">
        {/* Top row */}
        <p className="absolute -left-24 top-[8%] font-beast text-[42rem] text-accent-purple-light whitespace-pre tracking-[0.2em] rotate-[0deg]">
          ^^^~
        </p>
        <p className="absolute right-[-15%] top-[5%] font-beast text-[40rem] text-accent-purple-light whitespace-pre tracking-[0.25em] rotate-[90deg]">
          ~~~~
        </p>

        {/* Middle row */}
        <p className="absolute left-[8%] top-[35%] font-beast text-[44rem] text-accent-purple-light whitespace-pre tracking-[0.15em] rotate-[180deg]">
          ^^^
        </p>
        <p className="absolute right-[12%] top-[38%] font-beast text-[38rem] text-accent-purple-light whitespace-pre tracking-[0.2em] rotate-[270deg]">
          ~~~
        </p>

        {/* Lower middle row */}
        <p className="absolute -left-32 top-[65%] font-beast text-[46rem] text-accent-purple-light whitespace-pre tracking-[0.18em] rotate-[0deg]">
          ^^^^
        </p>
        <p className="absolute right-[-20%] top-[62%] font-beast text-[40rem] text-accent-purple-light whitespace-pre tracking-[0.22em] rotate-[90deg]">
          ~~~
        </p>

        {/* Bottom row */}
        <p className="absolute left-[15%] bottom-[8%] font-beast text-[42rem] text-accent-purple-light whitespace-pre tracking-[0.15em] rotate-[180deg]">
          ^^^~
        </p>
        <p className="absolute right-[18%] bottom-[12%] font-beast text-[44rem] text-accent-purple-light whitespace-pre tracking-[0.2em] rotate-[270deg]">
          ~~~
        </p>
      </div>
    </div>
  );
}
