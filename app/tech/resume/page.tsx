export const metadata = {
  title: "Resume",
  description: "Chung-Chia Kuo's work and education history",
};

export default function Resume() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

      <section>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white">
          Resume
        </h1>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-6 dark:text-blue-300">
          Was at
        </h2>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Perfect Corp.</p>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">Frontend Engineer</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">National Taiwan University</p>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">B.B.A. &amp; M.B.A. in Information Management</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Abacus Inc.</p>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">Software Engineer Intern</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
