import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Shield, Lock, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 border border-black bg-black" />
              <span className="font-display text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                AI Consultant Copilot
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm transition-opacity hover:opacity-60"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-black/90"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark */}
      <section className="relative overflow-hidden border-b border-black/5 bg-black pt-32 pb-24">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1
              className="mb-6 text-5xl leading-tight tracking-tight text-white lg:text-7xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              Turn messy briefs into structured consulting output
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70">
              Match prior work from your organization. Generate proposal starters, issue trees, and workplans in minutes. Private, precise, premium.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 border border-white bg-white px-8 py-4 text-base text-black transition-all hover:bg-white/90"
              >
                Start New Engagement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="inline-flex items-center gap-2 border border-white/20 bg-transparent px-8 py-4 text-base text-white transition-all hover:border-white/40 hover:bg-white/5">
                View Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
          >
            {[
              { icon: Shield, text: 'Private to your organization' },
              { icon: Lock, text: 'Not used to train public models' },
              { icon: FileCheck, text: 'Delete uploads anytime' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm"
              >
                <item.icon className="h-5 w-5 flex-shrink-0 text-white/60" />
                <span className="text-sm text-white/80">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-b border-black/5 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2
              className="mb-4 text-4xl tracking-tight text-black lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Three steps to structured output
            </h2>
            <p className="mx-auto max-w-2xl text-base text-black/60">
              Upload your brief, match prior work, generate consulting outputs
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Upload Brief',
                description: 'Drop in your RFP, client email chain, or rough opportunity notes',
              },
              {
                number: '02',
                title: 'Match Prior Work',
                description: 'AI finds relevant cases, proposals, and frameworks from your organization vault',
              },
              {
                number: '03',
                title: 'Generate & Export',
                description: 'Create proposal starters, issue trees, and workplans. Edit section by section.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="border border-black/5 bg-gradient-to-b from-white to-black/[0.01] p-8"
              >
                <div
                  className="mb-6 text-6xl tracking-tighter text-black/10"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
                >
                  {step.number}
                </div>
                <h3
                  className="mb-3 text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-black/60">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Outputs Section */}
      <section className="border-b border-black/5 bg-black/[0.02] py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2
              className="mb-4 text-4xl tracking-tight text-black lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Core consulting outputs
            </h2>
            <p className="mx-auto max-w-2xl text-base text-black/60">
              Generate the artifacts that matter, influenced by your organization's prior work
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Proposal Starter',
                description: 'Executive summary, approach, team structure, pricing framework',
              },
              {
                title: 'Issue Tree',
                description: 'Structured problem breakdown, hypothesis-driven framework, key questions',
              },
              {
                title: 'Workplan',
                description: 'Phased timeline, deliverables, resource allocation, milestone tracking',
              },
            ].map((output, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group border border-black/10 bg-white p-8 transition-all hover:border-black/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <h3
                  className="mb-3 text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {output.title}
                </h3>
                <p className="text-sm leading-relaxed text-black/60">{output.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="border-b border-black/5 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2
              className="mb-4 text-4xl tracking-tight text-black lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Not another generic AI tool
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              'Trained on your organization\'s prior work, not the public internet',
              'Structured consulting outputs, not generic chatbot responses',
              'Private workspace for sensitive client information',
              'Export-ready artifacts that match your firm\'s standards',
              'Issue trees and workplans, not just text generation',
              'Influenced by cases you\'ve actually won',
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-start gap-3 border-l border-black/10 pl-6"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-black" />
                <span className="text-sm leading-relaxed text-black/80">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="border-b border-black/5 bg-black py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2
              className="mb-6 text-4xl tracking-tight text-white lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Enterprise pricing
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/70">
              Custom pricing for organizations. Includes unlimited engagements, priority support, and dedicated security review.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border border-white bg-white px-8 py-4 text-base text-black transition-all hover:bg-white/90"
            >
              Request Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 border border-black bg-black" />
              <span className="text-sm text-black/60" style={{ fontFamily: 'var(--font-display)' }}>
                AI Consultant Copilot
              </span>
            </div>
            <div className="flex gap-8 text-sm text-black/60">
              <a href="#" className="transition-colors hover:text-black">Privacy</a>
              <a href="#" className="transition-colors hover:text-black">Terms</a>
              <a href="#" className="transition-colors hover:text-black">Security</a>
              <Link to="/design-system" className="transition-colors hover:text-black">Design System</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-black/40">
            © 2026 AI Consultant Copilot. Private to your organization.
          </div>
        </div>
      </footer>
    </div>
  );
}
