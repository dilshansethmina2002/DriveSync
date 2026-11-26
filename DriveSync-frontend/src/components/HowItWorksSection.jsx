import { motion } from 'framer-motion';
import { CalendarCheck, KeyRound, Search } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    label: 'STEP 01',
    title: 'Browse & Compare',
    description:
      'Filter our live fleet by category, transmission, and location, and compare transparent LKR daily rates.',
    icon: Search,
    offsetClass: 'md:mt-6',
    lineHeightClass: 'md:h-6',
  },
  {
    number: '02',
    label: 'STEP 02',
    title: 'Sign In & Book',
    description:
      'Sign in to your DriveSync account, pick your dates or rental package, and confirm securely online.',
    icon: CalendarCheck,
    offsetClass: 'md:mt-16',
    lineHeightClass: 'md:h-16',
  },
  {
    number: '03',
    label: 'STEP 03',
    title: 'Pick Up & Drive',
    description:
      'Collect your sanitized, fully insured vehicle at your chosen hub or request doorstep delivery and enjoy the ride.',
    icon: KeyRound,
    offsetClass: 'md:mt-28',
    lineHeightClass: 'md:h-28',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-[#040B1A] via-[#06132B] to-[#0A1F44] py-24 text-white"
    >
      {/* Subtle Geometric Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 229, 255, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.35) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Ambient Cyan Glows */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-72 w-[34rem] rounded-full bg-[#00E5FF]/12 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-block rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#00E5FF]">
            RENTAL JOURNEY
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            How DriveSync Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            A streamlined, transparent three-step process from browsing our fleet to hitting the road.
          </p>
        </motion.div>

        {/* Cascading 3-Step Timeline */}
        <div className="relative mt-16">
          {/* Horizontal Dashed Line across Step Pills (Desktop) */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block absolute top-3.5 left-[10%] right-[10%] border-t border-dashed border-[#00E5FF]/35 origin-left z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {STEPS.map(({ number, label, title, description, icon: Icon, offsetClass, lineHeightClass }, index) => (
              <div key={number} className="relative flex flex-col items-center">
                {/* Step Pill Node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="relative z-10 rounded-full border border-[#00E5FF]/35 bg-[#06132B] px-4 py-1 text-[11px] font-bold tracking-widest text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                >
                  {label}
                </motion.div>

                {/* Vertical Dashed Drop Line (Desktop Cascading) */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.18 + 0.1 }}
                  className={`hidden md:block w-px border-l border-dashed border-[#00E5FF]/35 origin-top ${lineHeightClass}`}
                />

                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, y: 36, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`w-full mt-4 md:mt-0 rounded-2xl border border-[#00E5FF]/20 bg-[#0A1F44]/60 backdrop-blur-md p-7 shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:border-[#00E5FF]/60 hover:shadow-[0_0_32px_rgba(0,229,255,0.2)] hover:-translate-y-1.5 transition-all duration-300 ${
                    index === 0 ? '' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-b from-white via-[#7DD3FC] to-[#00E5FF] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(0,229,255,0.45)]">
                      {number}
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#00E5FF]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-extrabold uppercase tracking-wide text-white">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
