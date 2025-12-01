import Link from "next/link";
import { ReactNode } from "react";

export type MenuCardProps = {
  title: string;
  description: string;
  href: string;
  accent?: "neutral" | "lime" | "dark";
  icon?: ReactNode;
};

const accentStyles: Record<NonNullable<MenuCardProps["accent"]>, string> = {
  neutral:
    "bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:shadow-[0_16px_40px_rgba(17,24,39,0.1)]",
  lime:
    "bg-lime-100 border-lime-300 text-neutral-900 hover:border-lime-400 hover:shadow-[0_16px_40px_rgba(199,255,107,0.5)]",
  dark:
    "bg-neutral-700 border-neutral-900 text-white hover:shadow-[0_16px_40px_rgba(17,24,39,0.4)]",
};

const MenuCard = ({ title, description, href, accent = "neutral", icon }: MenuCardProps) => {
  const descriptionClass =
    accent === "dark"
      ? "text-neutral-300 group-hover:text-neutral-100"
      : "text-neutral-600 group-hover:text-neutral-800";

  const actionClass =
    accent === "dark"
      ? "text-white group-hover:text-lime-400"
      : "text-neutral-900 group-hover:text-lime-600";

  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between overflow-hidden rounded-3xl border px-6 py-8 transition-all duration-200 ${accentStyles[accent]}`}
    >
      <div className="space-y-3">
        {icon && (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
            {icon}
            Opção
          </div>
        )}
        <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
        <p className={`text-sm ${descriptionClass}`}>{description}</p>
      </div>
      <span className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${actionClass}`}>
        Acessar
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-4 w-4"
        >
          <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
};

export default MenuCard;
