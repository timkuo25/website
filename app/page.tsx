import { Mail } from "lucide-react";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

      {/* Hero */}
      <section>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Chung-Chia Kuo
        </h1>
        <p className="mt-5 text-gray-600 leading-relaxed max-w-xl">
          Not completely a tech nerd.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <a
            href="mailto:timkuo860930@gmail.com"
            className="text-gray-400 hover:text-blue-500 transition-colors"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
          <a
            href="https://github.com/timkuo25"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon size={20} />
          </a>
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-6">
          Experience
        </h2>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">Perfect Corp. (玩美移動)</p>
              <p className="text-sm text-gray-500 mt-0.5">Software Engineer</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">National Taiwan University</p>
              <p className="text-sm text-gray-500 mt-0.5">B.B.A. &amp; M.B.A. in Information Management</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
