import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-6 py-16 md:flex-row md:items-center lg:gap-20">
      <div className="flex-1 space-y-6 text-center md:text-left">
        <span className="inline-flex items-center rounded-full border border-lime-500 bg-lime-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-600">
          Plataforma institucional
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
          Ouvidoria
        </h1>
        <p className="text-lg text-neutral-600">vamos preencher depois</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <button className="rounded-full border border-lime-500 bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-lime-500 hover:text-neutral-900">
            Enviar manifestação
          </button>
          <button className="rounded-full border border-lime-500 px-8 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-lime-500 hover:text-neutral-900">
            Conhecer serviços
          </button>
        </div>
      </div>
      <div className="flex-1">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-40">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} className="border border-neutral-200" />
            ))}
          </div>
          <Image
            src="/hero-illustration.svg"
            alt="Ilustração de cidadãos e governo colaborando"
            fill
            className="object-contain p-8"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
