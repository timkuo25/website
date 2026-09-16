import Header from "@/components/Header";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        homeHref="/tech"
        links={[
          { label: "Resume", href: "/tech/resume" },
          { label: "Blog", href: "/tech/blog" },
        ]}
      />
      <main className="flex-1">{children}</main>
    </>
  );
}
