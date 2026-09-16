import Header from "@/components/Header";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header homeHref="/" links={[{ label: "Blog", href: "/blog" }]} />
      <main className="flex-1">{children}</main>
    </>
  );
}
