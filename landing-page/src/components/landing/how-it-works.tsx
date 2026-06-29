"use client";

import { motion } from "framer-motion";
import { Cpu, Lightbulb, Rocket } from "lucide-react";
import Container from "../global/container";

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------

const STEPS = [
    {
        id: "01",
        title: "Describe your product",
        description: "Share your idea in plain language. Explain what you're building, who it's for, and the core problem it solves.",
        icon: Lightbulb,
    },
    {
        id: "02",
        title: "Generate artifacts",
        description: "ProdMate instantly creates roadmaps, user stories, API designs, schemas, and technical documentation.",
        icon: Cpu,
    },
    {
        id: "03",
        title: "Build with confidence",
        description: "Use the generated blueprints as a foundation for development and collaborate with your team effectively.",
        icon: Rocket,
    }
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const HowItWorks = () => {
    return (
        <section className="relative w-full pt-8 md:pt-12 pb-24 md:pb-32 bg-[#09090b] border-y border-white/[0.05]">
            <Container>
                <div className="flex flex-col items-center w-full max-w-5xl mx-auto">

                    {/* ========================================== */}
                    {/* HEADER SECTION                             */}
                    {/* ========================================== */}
                    <div className="flex flex-col items-center text-center max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-white/[0.03] border border-white/[0.08]"
                        >
                            <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#a1a1aa]">
                                Product Demo
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#ededed] leading-[1.15]"
                        >
                            From raw idea to <br className="hidden md:block" /> engineering blueprint.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-5 text-[15px] leading-relaxed md:text-base text-[#a1a1aa]"
                        >
                            Watch how ProdMate transforms a simple prompt into a structured, production-ready development architecture in seconds.
                        </motion.p>
                    </div>

                    {/* ========================================== */}
                    {/* SAFARI DEMO VIDEO FRAME                    */}
                    {/* ========================================== */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="w-full relative mt-16 md:mt-24 bg-[#0a0a0c] rounded-xl md:rounded-2xl border border-white/[0.08] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
                    >
                        {/* Authentic Dark Mode Safari Header */}
                        <div className="flex items-center w-full px-4 h-12 border-b border-[#000000] bg-[#1c1c1e] flex-shrink-0 relative shadow-[0_1px_0_rgba(255,255,255,0.05)]">

                            {/* macOS Traffic Light Controls */}
                            <div className="flex gap-2 absolute left-4 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 rounded-full bg-[#ED6A5E] border border-[#d24e43]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#F4BF4F] border border-[#d6a241]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#61C554] border border-[#4da841]"></div>
                            </div>

                            {/* Safari URL Bar */}
                            <div className="mx-auto flex items-center justify-center h-7 px-8 md:px-32 bg-[#09090b]/60 border border-white/[0.05] rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-1.5 text-white/40 text-[11px] md:text-xs font-medium tracking-wide">
                                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    prodmate.dev
                                </div>
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className="relative w-full aspect-video bg-black">
                            <video
                                src="https://pub-3b2ce5759e8b401ba99b5a001278e200.r2.dev/Final%20Bullxchange.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Inner ring to prevent video bleeding over the border curve */}
                            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/[0.05]"></div>
                        </div>
                    </motion.div>

                    {/* ========================================== */}
                    {/* CRISP 3-COLUMN GRID                        */}
                    {/* ========================================== */}
                    <div className="grid w-full grid-cols-1 gap-12 mt-16 md:mt-24 md:grid-cols-3 md:gap-8 lg:gap-12">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                                    className="flex flex-col items-start text-left"
                                >
                                    <div className="flex items-center justify-between w-full mb-6">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#a1a1aa]">
                                            <Icon className="w-5 h-5" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-xs font-mono font-medium text-[#71717a]">
                                            {step.id}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 text-base font-medium tracking-tight text-[#ededed]">
                                        {step.title}
                                    </h3>
                                    <p className="text-[14px] leading-relaxed text-[#a1a1aa]">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;