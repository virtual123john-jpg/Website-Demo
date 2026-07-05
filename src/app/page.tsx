import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const TOPICS = [
  {
    title: "Medicare Part A & B",
    body: "Original Medicare covers hospital stays (Part A) and outpatient/doctor visits (Part B), each with its own deductibles and coinsurance.",
  },
  {
    title: "Medicare Advantage (Part C)",
    body: "An alternative to Original Medicare offered by private insurers, often bundling Part D drug coverage and extra benefits.",
  },
  {
    title: "Part D Drug Coverage",
    body: "Optional prescription drug coverage, available as a standalone plan or bundled into a Medicare Advantage plan.",
  },
  {
    title: "Medigap (Supplement) Plans",
    body: "Standardized plans (A-N) sold by private insurers that help cover the gaps left by Original Medicare, like copays and coinsurance.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-brand-gradient px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">Understand Medicare &amp; Medigap, clearly.</h1>
            <p className="mt-4 text-lg text-white/90">
              A free educational guide to Medicare Parts A-D and Medigap supplement plans — with an
              interactive assistant to answer your questions and help interpret documents you upload.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-brand-navy-950">Key topics</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {TOPICS.map((topic) => (
              <div key={topic.title} className="rounded-xl border border-brand-navy-900/10 bg-white p-6">
                <h3 className="font-semibold text-brand-blue">{topic.title}</h3>
                <p className="mt-2 text-sm text-brand-navy-900/80">{topic.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
