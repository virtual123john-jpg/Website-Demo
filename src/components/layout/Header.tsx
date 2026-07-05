import Image from "next/image";

export function Header() {
  return (
    <header className="bg-brand-navy-950 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo-placeholder.svg" alt="JAI logo" width={36} height={36} />
          <span className="text-lg font-semibold tracking-wide">
            JAI <span className="text-brand-cyan">Medicare</span> &amp;{" "}
            <span className="text-brand-purple">Medigap</span>
          </span>
        </div>
        <span className="hidden text-sm text-brand-light/70 sm:block">Educational Guide</span>
      </div>
    </header>
  );
}
