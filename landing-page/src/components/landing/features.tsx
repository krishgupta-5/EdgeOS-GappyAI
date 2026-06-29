"use client";

import { motion } from "framer-motion";
import {
    Blocks,
    Code2,
    Database,
    FileText,
    GitMerge,
    CheckCircle2,
    Terminal,
    Sparkles,
    Cpu
} from "lucide-react";
import Container from "../global/container";
import MagicCard from "../ui/magic-card";
import { Ripple } from "../ui/ripple";
import { SectionBadge } from "../ui/section-bade";
import { cn } from "@/functions";

// ----------------------------------------------------------------------
// HIGH-END VISUAL COMPONENTS
// ----------------------------------------------------------------------

const ArchitectureVisual = () => (
    <div className="absolute inset-0 flex items-end justify-center w-full h-full gap-2 p-4 md:gap-4 overflow-hidden">
        {[40, 85, 55].map((height, i) => (
            <motion.div
                key={i}
                className="relative flex items-end justify-center w-12 pb-4 md:w-16 rounded-t-2xl group"
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                animate={i === 1 ? { y: [0, -8, 0] } : { y: [0, -4, 0] }}
                transition={{
                    height: { duration: 0.8, delay: i * 0.15, ease: "easeOut" },
                    y: { repeat: Infinity, duration: 4 + i, ease: "easeInOut", delay: i * 0.5 },
                }}
                viewport={{ once: true }}
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-t-2xl transition-all duration-500 border border-b-0",
                        i === 1
                            ? "bg-gradient-to-t from-primary/10 to-primary/30 border-primary/50 shadow-[0_-10px_40px_rgba(134,120,249,0.3)]"
                            : "bg-gradient-to-t from-white/0 to-white/5 border-white/10 group-hover:to-white/10"
                    )}
                ></div>
                {i === 1 && <Blocks className="relative z-10 w-6 h-6 mb-3 text-primary drop-shadow-[0_0_10px_rgba(134,120,249,0.8)]" />}
            </motion.div>
        ))}
        {/* Floor Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-primary/20 blur-[60px] rounded-full z-0"></div>
    </div>
);

const RoadmapVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full p-6">
        <div className="flex flex-col gap-5 w-full max-w-[180px] relative z-10">
            {[1, 2, 3].map((_, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-4 p-2.5 border rounded-xl bg-black/40 backdrop-blur-md border-white/5 shadow-lg relative group/item"
                    animate={{ x: [0, 5, 0] }}
                    whileHover={{ x: 10, borderColor: "rgba(134,120,249,0.4)", backgroundColor: "rgba(134,120,249,0.05)" }}
                    transition={{
                        x: { repeat: Infinity, duration: 4, delay: i * 0.4, ease: "easeInOut" },
                    }}
                >
                    <div
                        className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full border transition-colors duration-300",
                            i === 0
                                ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(134,120,249,0.4)]"
                                : "bg-white/5 border-white/10 text-white/30 group-hover/item:text-primary/50 group-hover/item:border-primary/30"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-col flex-1 gap-1.5 flex hidden sm:flex">
                        <div className={cn("h-2 rounded-full transition-all duration-300", i === 0 ? "w-full bg-primary/60" : "w-3/4 bg-white/10 group-hover/item:w-full group-hover/item:bg-white/20")}></div>
                    </div>
                </motion.div>
            ))}
            {/* Pulsing Timeline Line */}
            <motion.div
                className="absolute left-[1.35rem] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent -z-10 rounded-full"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            ></motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -z-10"></div>
    </div>
);

const CentralScannerVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full overflow-hidden opacity-30 pointer-events-none rounded-xl">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        {/* Scanning Laser */}
        <motion.div
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px] shadow-[0_0_20px_rgba(134,120,249,0.8)]"
            animate={{ y: ["-100px", "100px"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatType: "reverse" }}
        />
    </div>
);

const RingsVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full overflow-hidden">
        {/* Outer Ring */}
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} className="absolute w-52 h-52 md:w-64 md:h-64 border border-dashed border-primary/20 rounded-full" />
        {/* Inner Ring */}
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute w-36 h-36 md:w-44 md:h-44 border border-primary/30 rounded-full flex items-center justify-center">
            {/* Orbiting Dot */}
            <div className="absolute -top-1.5 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(134,120,249,0.8)]"></div>
        </motion.div>
        
        {/* Center Icon */}
        <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-black/40 border border-primary/20 backdrop-blur-xl shadow-[0_0_30px_rgba(134,120,249,0.2)]"
        >
            <Cpu className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(134,120,249,0.5)]" />
        </motion.div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[50px] rounded-full -z-10"></div>
    </div>
);

const WorkflowVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full px-4 overflow-hidden">
        <div className="flex items-center justify-center w-full gap-6 z-10 max-w-[280px]">
            {/* Node 1 */}
            <motion.div className="flex items-center justify-center w-12 h-12 border rounded-xl shadow-lg bg-black/50 border-white/10 backdrop-blur-md" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                <Code2 className="w-5 h-5 text-white/60" />
            </motion.div>
            
            {/* Central Hub */}
            <motion.div className="z-20 flex items-center justify-center w-16 h-16 border-2 rounded-2xl bg-primary/20 border-primary/50 backdrop-blur-xl shadow-[0_0_30px_rgba(134,120,249,0.4)] relative" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <GitMerge className="w-7 h-7 text-primary" />
                {/* Data Packet pinging from center */}
                <motion.div className="absolute w-full h-full rounded-2xl border border-primary/50" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2 }}></motion.div>
            </motion.div>

            {/* Node 2 */}
            <motion.div className="flex items-center justify-center w-12 h-12 border rounded-xl shadow-lg bg-black/50 border-white/10 backdrop-blur-md" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
                <Terminal className="w-5 h-5 text-white/60" />
            </motion.div>
        </div>

        {/* Animated Connection Lines */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[200px] h-2 -z-10 overflow-visible">
            <line x1="0" y1="4" x2="200" y2="4" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <motion.line x1="0" y1="4" x2="200" y2="4" stroke="rgba(134,120,249,0.8)" strokeWidth="2" strokeDasharray="10 10" animate={{ strokeDashoffset: [0, -40] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/15 blur-[60px] rounded-full -z-20"></div>
    </div>
);

const DocsVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full p-4">
        <motion.div
            className="w-full max-w-[200px] aspect-[4/3] rounded-2xl border border-white/10 bg-[#09090b]/90 shadow-2xl relative z-10 overflow-hidden flex flex-col p-5 gap-3 backdrop-blur-xl"
            whileHover={{ scale: 1.05, y: -5 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}
        >
            <div className="flex items-center gap-3 pb-3 mb-2 border-b border-white/10">
                <div className="p-1.5 rounded-md bg-primary/20">
                    <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="w-20 h-2 rounded-full bg-white/20"></div>
            </div>
            {[1, 2, 3].map((_, i) => (
                <motion.div
                    key={i}
                    className="h-1.5 rounded-full bg-white/10"
                    initial={{ width: 0 }}
                    animate={{ width: i === 2 ? ["0%", "50%", "50%"] : ["0%", "100%", "100%"] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>
            ))}
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -z-10"></div>
    </div>
);

const DatabaseVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full p-4">
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 w-full">
            {[1, 2, 3].map((_, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "flex items-center justify-start px-4 w-3/4 max-w-[160px] h-12 border backdrop-blur-xl rounded-xl transition-colors duration-300",
                        i === 1 ? "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(134,120,249,0.3)]" : "bg-black/50 border-white/10 hover:border-white/20"
                    )}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.3, ease: "easeInOut" }}
                >
                    <div className="flex items-center gap-3 w-full">
                        <Database className={cn("w-4 h-4", i === 1 ? "text-primary drop-shadow-[0_0_5px_rgba(134,120,249,0.8)]" : "text-white/30")} />
                        <div className={cn("flex-1 h-1.5 rounded-full", i === 1 ? "bg-primary" : "bg-white/10")}></div>
                    </div>
                </motion.div>
            ))}
            {/* Glowing Central Spine */}
            <motion.div
                className="absolute w-1 h-[140px] bg-gradient-to-b from-transparent via-primary/80 to-transparent -z-10 rounded-full shadow-[0_0_15px_rgba(134,120,249,0.5)]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            ></motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -z-10"></div>
    </div>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const Features = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">

            {/* Ambient Background Blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-20"></div>

            <Container>
                <div className="flex flex-col items-center max-w-4xl mx-auto text-center">

                    <SectionBadge title="Everything You Need" />

                    <h2 className="mt-6 text-3xl font-medium md:text-5xl lg:text-6xl font-heading !leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                        One workspace for your entire product development lifecycle
                    </h2>

                </div>
            </Container>

            <div className="w-full mt-16 md:mt-24">
                <div className="flex flex-col items-center w-full gap-5 lg:gap-6">

                    {/* FIRST ROW */}
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] w-full gap-5 lg:gap-6">

                            <MagicCard particles={true} className="flex flex-col items-start size-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden text-center min-h-[340px] group rounded-2xl">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <motion.div 
                                        className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors duration-500 mb-6"
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                    >
                                        <Sparkles className="w-10 h-10 text-white/50 group-hover:text-primary transition-colors duration-500 drop-shadow-md" />
                                    </motion.div>

                                    <div className="relative z-10 px-8">
                                        <h4 className="text-2xl font-medium font-heading tracking-tight">
                                            AI Product Planning
                                        </h4>
                                        <p className="max-w-md mt-3 text-sm md:text-base text-muted-foreground/80 leading-relaxed mx-auto">
                                            Describe your idea in plain English and instantly generate a complete product plan ready for engineering.
                                        </p>
                                    </div>
                                    <Ripple className="opacity-40" />
                                </div>
                            </MagicCard>

                            <MagicCard particles={true} className="flex flex-col items-start w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[340px] group">
                                    <div className="relative w-full flex-1 bg-black/40 border-b border-white/5 min-h-[180px] overflow-hidden">
                                        <ArchitectureVisual />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 opacity-50 group-hover:opacity-20 transition-opacity"></div>
                                    </div>
                                    <div className="flex flex-col p-6 lg:p-8 bg-[#09090b]/50 backdrop-blur-sm z-10">
                                        <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                            System Architecture
                                        </h4>
                                        <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                            Design scalable software architecture, define services, and build a solid technical foundation.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>

                        </div>
                    </Container>

                    {/* SECOND ROW */}
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-5 lg:gap-6">

                            <MagicCard particles={true} className="flex flex-col items-start w-full row-span-1 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[420px] group">
                                    <div className="relative w-full flex-1 bg-black/40 border-b border-white/5 min-h-[200px] overflow-hidden">
                                        <RoadmapVisual />
                                    </div>
                                    <div className="flex flex-col p-6 lg:p-8 mt-auto bg-[#09090b]/50 backdrop-blur-sm">
                                        <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                            Roadmaps & User Stories
                                        </h4>
                                        <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                            Generate product roadmaps, milestones, epics, and sprint-ready user stories.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>

                            {/* CENTER COLUMN (2 Stacked Cards) */}
                            <div className="grid gap-5 grid-rows-2 lg:gap-6 h-full">

                                <MagicCard particles={true} className="flex flex-col items-start w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 h-full border-white/5">
                                    <div className="relative flex items-center justify-center w-full h-full p-8 overflow-hidden rounded-2xl min-h-[200px] group">
                                        <CentralScannerVisual />
                                        <p className="relative z-20 text-sm font-medium leading-relaxed text-center md:text-base text-muted-foreground/90 group-hover:text-white transition-colors duration-500">
                                            Generate every planning artifact—from PRDs and docs to architecture, APIs, and database schemas.
                                        </p>
                                    </div>
                                </MagicCard>

                                <MagicCard particles={true} className="flex flex-col items-start w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 h-full border-white/5">
                                    <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[200px] group">
                                        <div className="relative w-full flex-1 bg-black/40 border-b border-white/5 min-h-[140px] overflow-hidden">
                                            <RingsVisual />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 opacity-50 group-hover:opacity-20 transition-opacity"></div>
                                        </div>
                                        <div className="flex flex-col p-6 mt-auto bg-[#09090b]/50 backdrop-blur-sm z-10 text-center">
                                            <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                                AI Project Brain
                                            </h4>
                                            <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                                Every document stays connected. Update one requirement and AI keeps your entire project consistent.
                                            </p>
                                        </div>
                                    </div>
                                </MagicCard>

                            </div>

                            <MagicCard particles={true} className="flex flex-col items-start w-full row-span-1 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[420px] group">
                                    <div className="flex flex-col p-6 lg:p-8 mb-auto bg-[#09090b]/50 backdrop-blur-sm z-10">
                                        <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                            💬 AI Project Assistant
                                        </h4>
                                        <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                            Chat with your project to refine requirements, add features, or update architecture without starting over.
                                        </p>
                                    </div>
                                    <div className="relative w-full flex-1 bg-black/40 border-t border-white/5 min-h-[200px] overflow-hidden">
                                        <WorkflowVisual />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-0 opacity-50 group-hover:opacity-20 transition-opacity"></div>
                                    </div>
                                </div>
                            </MagicCard>

                        </div>
                    </Container>

                    {/* THIRD ROW */}
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] w-full gap-5 lg:gap-6">

                            <MagicCard particles={true} className="flex flex-col items-start w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[340px] group">
                                    <div className="relative w-full flex-1 bg-black/40 border-b border-white/5 min-h-[180px] overflow-hidden">
                                        <DocsVisual />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 opacity-50 group-hover:opacity-20 transition-opacity"></div>
                                    </div>
                                    <div className="flex flex-col p-6 lg:p-8 mt-auto bg-[#09090b]/50 backdrop-blur-sm z-10">
                                        <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                            Technical Documentation
                                        </h4>
                                        <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                            Generate clean, structured documentation including PRDs, specs, and deployment guides.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>

                            <MagicCard particles={true} className="flex flex-col items-start w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-0 border-white/5">
                                <div className="flex flex-col w-full h-full rounded-2xl overflow-hidden min-h-[340px] group">
                                    <div className="relative w-full flex-1 bg-black/40 border-b border-white/5 min-h-[180px] overflow-hidden">
                                        <DatabaseVisual />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 opacity-50 group-hover:opacity-20 transition-opacity"></div>
                                    </div>
                                    <div className="flex flex-col p-6 lg:p-8 mt-auto bg-[#09090b]/50 backdrop-blur-sm z-10">
                                        <h4 className="text-xl font-medium font-heading heading tracking-tight group-hover:text-primary transition-colors">
                                            Architecture, APIs & Database
                                        </h4>
                                        <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                                            Generate scalable database schemas, REST APIs, and backend architecture in minutes.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>

                        </div>
                    </Container>

                </div>
            </div>
        </div>
    );
};

export default Features;
