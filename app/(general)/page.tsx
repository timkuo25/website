import { Mail } from "lucide-react";
import GithubIcon from "@/components/GithubIcon";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

      {/* Hero */}
      <section>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
          哈囉 慢慢看
        </h1>
        <p className="mt-2 text-sm text-gray-400">📍 Taipei, Taiwan</p>
        <div className="mt-6 flex items-center gap-4">
          <a
            href="mailto:timkuo860930@gmail.com"
            className="text-black hover:text-blue-500 transition-colors"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>
      </section>

    </div>
  );
}
