"use client";

import { motion } from "framer-motion";
import { Cpu, Lightbulb, Rocket } from "lucide-react";
import Container from "../global/container";
import { cn } from "@/functions";

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------

const STEPS = [
    {
        id: "01",
        title: "Describe your product",
        description: "Share your idea in plain language. Explain what you're building, who it's for and the problem it solves.",
        icon: Lightbulb,
    },
    {
        id: "02",
        title: "Generate planning artifacts",
        description: "Edge OS creates roadmaps, user stories, API designs, database schemas, architecture plans and technical documentation.",
        icon: Cpu,
    },
    {
        id: "03",
        title: "Build with confidence",
        description: "Use the generated plans as a foundation for development and collaborate with your team more effectively.",
        icon: Rocket,
    }
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const HowItWorks = () => {
    return (
        <section className="relative w-full pt-12 pb-24 overflow-hidden md:pt-16 md:pb-32 bg-background border-y border-border/40">
            
            {/* Ambient Background Glows for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>

            <Container>
                <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
                    
                    {/* ========================================== */}
                    {/* HEADER SECTION                             */}
                    {/* ========================================== */}
                    <div className="flex flex-col items-center max-w-3xl mb-10 text-center lg:mb-16">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-foreground/5 border border-foreground/10 shadow-sm backdrop-blur-md"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(134,120,249,0.5)]"></div>
                            <span className="text-xs font-medium tracking-wide uppercase text-foreground/70">How It Works</span>
                        </motion.div>
                        
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-heading font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]"
                        >
                            From idea to development plan.
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mt-6 text-lg leading-relaxed md:text-xl text-muted-foreground"
                        >
                            Edge OS helps founders, developers and product teams transform ideas into structured product plans, technical documentation and engineering blueprints.
                        </motion.p>
                    </div>

                    {/* ========================================== */}
                    {/* MASSIVE HERO VIDEO (SIMPLE, CLEAN FRAME)   */}
                    {/* ========================================== */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full relative rounded-xl md:rounded-[1.5rem] bg-black overflow-hidden border border-foreground/10 shadow-2xl mb-20 lg:mb-32"
                    >
                        {/* Ambient Video Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full transition-colors duration-700 pointer-events-none"></div>

                        {/* Embedded Auto-Playing Video */}
                        <div className="relative w-full aspect-video">
                            <video 
                                src="https://pub-3b2ce5759e8b401ba99b5a001278e200.r2.dev/Final%20Bullxchange.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 object-cover w-full h-full rounded-xl md:rounded-[1.5rem]"
                            />

                            {/* Inner ring & vignette to make the video sit flush with the border */}
                            <div className="absolute inset-0 z-20 pointer-events-none rounded-xl md:rounded-[1.5rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10"></div>
                        </div>
                    </motion.div>

                    {/* ========================================== */}
                    {/* HORIZONTAL STEPS                           */}
                    {/* ========================================== */}
                    <div className="relative w-full">
                        
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-foreground/15 to-transparent -z-10"></div>
                        
                        <div className="grid w-full grid-cols-1 relative z-10 gap-12 md:grid-cols-3 lg:gap-16">
                            {STEPS.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <motion.div 
                                        key={step.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        {/* Icon Node */}
                                        <div className="relative flex items-center justify-center w-16 h-16 mb-8 overflow-hidden transition-colors duration-500 border rounded-2xl bg-background border-foreground/10 shadow-xl group-hover:border-primary/50">
                                            {/* Inner Glow on hover */}
                                            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-b from-primary/20 to-transparent group-hover:opacity-100"></div>
                                            <Icon className="relative z-10 w-6 h-6 transition-colors duration-500 text-foreground/50 group-hover:text-primary" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-mono font-bold text-primary/80 mb-3 tracking-[0.2em] px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                                                STEP {step.id}
                                            </span>
                                            <h3 className="mb-4 text-xl font-medium tracking-tight transition-colors duration-300 md:text-2xl font-heading text-foreground group-hover:text-primary">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed md:text-base text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;