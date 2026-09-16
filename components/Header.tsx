import Link from "next/link";

interface HeaderLink {
  label: string;
  href: string;
}

export default function Header({
  homeHref,
  homeLabel = "Home",
  links,
}: {
  homeHref: string;
  homeLabel?: string;
  links: HeaderLink[];
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-blue-50">
      <nav className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href={homeHref}
          className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          {homeLabel}
        </Link>
        <div className="flex gap-6 text-sm text-gray-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
