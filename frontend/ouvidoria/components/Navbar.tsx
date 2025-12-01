"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";

type NavbarLink = {
  href: string;
  label: string;
};

type NavbarProps = {
  hideLinks?: boolean;
  links?: NavbarLink[];
  showLogout?: boolean;
};

const defaultLinks: NavbarLink[] = [
  { href: "/login", label: "Login" },
  { href: "/cadastro", label: "Cadastro" },
];

const Navbar = ({ hideLinks = false, links, showLogout = false }: NavbarProps) => {
  const router = useRouter();
  const { setEmail, setCpf, setIsFuncionario } = useUser();
  const items = links ?? defaultLinks;

  const handleLogout = () => {
    setEmail(null);
    setCpf(null);
    setIsFuncionario(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-semibold text-neutral-900 transition-colors hover:text-lime-600">
          Ouvidoria
        </Link>
        {!hideLinks && (
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-lime-500 px-4 py-2 text-neutral-900 transition-colors hover:bg-lime-500 hover:text-neutral-900"
              >
                {label}
              </Link>
            ))}
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-neutral-300 px-4 py-2 text-neutral-600 transition-colors hover:border-red-300 hover:text-red-500"
              >
                Sair
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
