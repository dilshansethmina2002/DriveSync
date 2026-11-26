import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Zap } from 'lucide-react';

const BENEFITS = [
  {
    title: '24/7 Roadside Support',
    description:
      'Dedicated support team available around the clock for emergencies or trip changes.',
    icon: Headphones,
  },
  {
    title: 'Fully Insured Fleet',
    description:
      'Every vehicle is comprehensively insured and undergoes strict multi-point safety checks.',
    icon: ShieldCheck,
  },
  {
    title: 'Transparent LKR Pricing',
    description:
      'Clear daily and package rates with zero hidden fees or surprise charges.',
    icon: BadgeCheck,
  },
  {
    title: 'Instant Confirmation',
    description:
      'Real-time vehicle availability with fast digital booking and instant confirmation.',
    icon: Zap,
  },
];

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function WhyChooseSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-[#00B4D8]">
            THE DRIVESYNC ADVANTAGE
          </span>
          <h2 className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1F44]">
            Why Drivers Trust DriveSync
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-500">
            Built for reliability, transparency, and effortless mobility across every journey.
          </p>
        </motion.div>

        {/* 4-Column Bento Trust Cards */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
        >
          {BENEFITS.map(({ title, description, icon: Icon }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#00B4D8]/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 text-[#00B4D8] flex items-center justify-center">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#0A1F44]">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Compact Dark Navy CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 rounded-[2rem] bg-gradient-to-r from-[#06132B] via-[#0A1F44] to-[#0D2B5E] p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          {/* Ambient Cyan Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00E5FF]/20 blur-3xl" />

          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to hit the road?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
              Sign up in seconds and book your next vehicle with DriveSync.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] px-6 py-3.5 text-sm font-bold text-[#0A1F44] shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20 cursor-pointer"
            >
              Browse Vehicles
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
