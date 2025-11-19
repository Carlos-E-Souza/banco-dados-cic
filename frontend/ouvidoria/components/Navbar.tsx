import Link from "next/link";

type NavbarLink = {
  href: string;
  label: string;
};

type NavbarProps = {
  hideLinks?: boolean;
  links?: NavbarLink[];
};

const defaultLinks: NavbarLink[] = [
  { href: "/login", label: "Login" },
  { href: "/cadastro", label: "Cadastro" },
];

const Navbar = ({ hideLinks = false, links }: NavbarProps) => {
  const items = links ?? defaultLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-semibold text-neutral-900">Ouvidoria</span>
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
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
