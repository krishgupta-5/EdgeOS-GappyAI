"use client";

import { useEffect, useState } from "react";
import { cn } from "@/functions";
import { ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";
import Container from "../global/container";

// ----------------------------------------------------------------------
// DOCUMENTATION NAVIGATION
// ----------------------------------------------------------------------
// Note: We removed the hardcoded 'active' properties since state is now dynamic
const DOCS_NAV = [
    {
        title: "Overview",
        items: [
            { name: "Introduction", href: "#introduction" },
            { name: "What is ProdMate?", href: "#what-is-ProdMate" },
            { name: "Who Is It For?", href: "#who-is-it-for" },
        ]
    },
    {
        title: "Platform",
        items: [
            { name: "Core Capabilities", href: "#core-capabilities" },
            { name: "How It Works", href: "#how-it-works" },
            { name: "Example Output", href: "#example-output" },
        ]
    },
    {
        title: "Resources",
        items: [
            { name: "Getting Started", href: "#getting-started" },
            { name: "Current Status", href: "#current-status" },
        ]
    }
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
const Documentation = () => {
    // State to track the currently visible section ID
    const [activeSection, setActiveSection] = useState("introduction");

    useEffect(() => {
        // Set up the IntersectionObserver
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // When a section intersects our threshold, set it as active
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                // Triggers when the section hits the top 20% of the viewport
                rootMargin: "-20% 0px -80% 0px",
            }
        );

        // Target all the specific IDs we defined in the DOM
        const sectionIds = DOCS_NAV.flatMap(section => section.items.map(item => item.href.replace("#", "")));
        
        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => {
            sectionIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element) observer.unobserve(element);
            });
        };
    }, []);

    return (
        <div className="flex justify-center min-h-screen py-12 md:py-24 w-full relative bg-background">
            <Container className="max-w-7xl w-full flex flex-col lg:flex-row gap-12 lg:gap-16 relative z-10">
                
                {/* ULTRA-CLEAN SIDEBAR
                */}
                <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-max pb-6 lg:pb-0">
                    <div className="flex flex-col gap-10">
                        {DOCS_NAV.map((section, idx) => (
                            <div key={idx} className="flex flex-col gap-4">
                                <h4 className="text-sm font-medium text-foreground tracking-wide">
                                    {section.title}
                                </h4>
                                <ul className="flex flex-col gap-3">
                                    {section.items.map((item, itemIdx) => {
                                        const isActive = activeSection === item.href.replace("#", "");

                                        return (
                                            <li key={itemIdx}>
                                                <Link 
                                                    href={item.href}
                                                    className={cn(
                                                        "text-sm transition-all duration-300 block border-l pl-4 -ml-[1px]",
                                                        isActive 
                                                            ? "text-primary font-medium border-primary" 
                                                            : "text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                                                    )}
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* MAIN CONTENT AREA
                */}
                <main className="flex-1 flex flex-col w-full pb-24 max-w-4xl lg:pl-12">
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span>Overview</span>
                    </div>

                    <h1 id="introduction" className="text-3xl md:text-5xl font-heading font-medium text-foreground tracking-tight scroll-mt-32">
                        Introduction to ProdMate
                    </h1>
                    
                    <p className="text-lg md:text-xl text-muted-foreground mt-6 leading-relaxed">
                        ProdMate is an AI-powered product development planning platform that helps founders, developers, and product teams transform ideas into structured development plans.
                    </p>
                    <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                        Instead of starting from a blank page, ProdMate generates the planning artifacts needed to move from concept to execution, including product requirements, roadmaps, user stories, API designs, database schemas, architecture plans, testing strategies, and deployment planning.
                    </p>

                    <div className="w-full h-px bg-border/40 my-12" />

                    {/* Prose Styling Content */}
                    <div className="flex flex-col gap-16 text-muted-foreground leading-relaxed">
                        
                        {/* Section: What is ProdMate */}
                        <section id="what-is-ProdMate" className="flex flex-col gap-5 scroll-mt-32">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">What is ProdMate?</h2>
                            <p>
                                Building software products requires extensive planning before development begins. Teams often spend days or weeks creating requirement documents, defining features, designing APIs, planning databases, and aligning stakeholders.
                            </p>
                            <p>
                                ProdMate simplifies this process by generating structured planning outputs from a simple product idea. Describe what you want to build, and ProdMate helps create the foundation required for development.
                            </p>
                        </section>

                        {/* Section: Who Is It For? */}
                        <section id="who-is-it-for" className="flex flex-col gap-6 scroll-mt-32">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Who Is ProdMate For?</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                                    <h4 className="font-medium text-foreground mb-2">Founders</h4>
                                    <p className="text-sm">Quickly validate and structure product ideas before hiring a team.</p>
                                </div>
                                <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                                    <h4 className="font-medium text-foreground mb-2">Developers</h4>
                                    <p className="text-sm">Reduce planning time and start development with clearer requirements.</p>
                                </div>
                                <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                                    <h4 className="font-medium text-foreground mb-2">Product Managers</h4>
                                    <p className="text-sm">Generate documentation and planning artifacts significantly faster.</p>
                                </div>
                                <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                                    <h4 className="font-medium text-foreground mb-2">Startups</h4>
                                    <p className="text-sm">Create standardized planning processes without needing large product teams.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section: Core Capabilities */}
                        <section id="core-capabilities" className="flex flex-col gap-6 scroll-mt-32">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Core Capabilities</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">Product Requirements (PRD)</h3>
                                    <p className="text-sm mb-3">Generate detailed Product Requirement Documents including:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Product overview & problem statement</li>
                                        <li>Goals and objectives</li>
                                        <li>Functional & non-functional requirements</li>
                                        <li>Success metrics, assumptions, and constraints</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">Roadmap Generation</h3>
                                    <p className="text-sm mb-3">Create structured product roadmaps with:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Milestones & release planning</li>
                                        <li>Feature prioritization</li>
                                        <li>Development phases</li>
                                        <li>Estimated timelines</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">API Design</h3>
                                    <p className="text-sm mb-3">Generate API planning documents including:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Endpoints & request structures</li>
                                        <li>Response formats</li>
                                        <li>Authentication requirements</li>
                                        <li>Error handling strategies</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">Database Schema Planning</h3>
                                    <p className="text-sm mb-3">Create database structures with:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Entities & relationships</li>
                                        <li>Tables & collections</li>
                                        <li>Data models</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">Architecture Planning</h3>
                                    <p className="text-sm mb-3">Generate system architecture guidance including:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Frontend & backend architecture</li>
                                        <li>Service interactions</li>
                                        <li>Infrastructure recommendations</li>
                                        <li>Architecture Decision Records (ADR)</li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                                    <h3 className="text-lg font-medium text-foreground mb-3">User Stories & Testing</h3>
                                    <p className="text-sm mb-3">Generate actionable development tickets and tests:</p>
                                    <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                        <li>Story descriptions & acceptance criteria</li>
                                        <li>Priority levels & dependencies</li>
                                        <li>Unit, integration, and E2E testing plans</li>
                                        <li>Performance and security considerations</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section: How It Works */}
                        <section id="how-it-works" className="flex flex-col gap-6 scroll-mt-32">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">How It Works</h2>
                            
                            <div className="flex flex-col gap-6 relative mt-4 border-l border-border/50 ml-3 pl-8">
                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-mono text-foreground">1</div>
                                    <h3 className="text-lg font-medium text-foreground">Describe Your Idea</h3>
                                    <p className="mt-2">Explain your product in plain language.</p>
                                    <div className="mt-3 p-4 rounded-lg bg-[#0a0a0a] border border-border/50 font-mono text-sm text-muted-foreground">
                                        <span className="text-primary mr-2">Example:</span>
                                        "Build a clinic management platform where patients can book appointments, doctors can manage schedules, and administrators can oversee operations."
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-mono text-foreground">2</div>
                                    <h3 className="text-lg font-medium text-foreground">Generate Planning Artifacts</h3>
                                    <p className="mt-2">ProdMate analyzes your idea and generates product requirements, roadmaps, user stories, API specifications, database schemas, architecture plans, and testing plans.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-mono text-foreground">3</div>
                                    <h3 className="text-lg font-medium text-foreground">Review & Refine</h3>
                                    <p className="mt-2">Review generated outputs and customize them according to your business and technical requirements.</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-mono text-foreground">4</div>
                                    <h3 className="text-lg font-medium text-foreground">Build</h3>
                                    <p className="mt-2">Use the generated planning artifacts as a foundation for development.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section: Example Output Visual */}
                        <section id="example-output" className="flex flex-col gap-5 mt-4 scroll-mt-32">
                            <h2 className="text-2xl font-medium text-foreground tracking-tight">Example Output</h2>
                            <p>
                                When you input a Product Idea like <strong>"Create a clinic appointment management platform"</strong>, ProdMate instantly generates a complete suite of documents.
                            </p>
                            
                            <div className="mt-4 rounded-xl border border-border bg-[#0a0a0a] overflow-hidden shadow-2xl">
                                <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                    <Terminal className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-mono">ProdMate-output.json</span>
                                </div>
                                <div className="p-6 overflow-x-auto">
                                    <pre className="text-sm font-mono text-white/80 leading-loose">
                                        <code>
<span className="text-white/40">{"{"}</span>{"\n"}
{"  "}<span className="text-blue-400">"status"</span>: <span className="text-emerald-400">"success"</span>,{"\n"}
{"  "}<span className="text-blue-400">"generated_outputs"</span>: <span className="text-white/40">{"["}</span>{"\n"}
{"    "}<span className="text-emerald-400">"Product Requirement Document"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"User Stories"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"Roadmap"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"API Design"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"Database Schema"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"Architecture Plan"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"Testing Strategy"</span>,{"\n"}
{"    "}<span className="text-emerald-400">"Deployment Plan"</span>{"\n"}
{"  "}<span className="text-white/40">{"]"}</span>{"\n"}
<span className="text-white/40">{"}"}</span>
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </section>

                        {/* Section: Getting Started */}
                        <section id="getting-started" className="flex flex-col gap-5 scroll-mt-32">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Getting Started</h2>
                            <ul className="space-y-3 list-decimal list-inside">
                                <li><strong>Create a project</strong> in your workspace.</li>
                                <li><strong>Describe your product idea</strong> using plain language.</li>
                                <li><strong>Generate planning artifacts</strong> with a single click.</li>
                                <li><strong>Refine the generated outputs</strong> to match your specific needs.</li>
                                <li><strong>Begin development</strong> with a structured, professional plan.</li>
                            </ul>
                            <p className="mt-4 font-medium text-foreground">
                                ProdMate helps teams move from idea to execution with clarity, consistency, and AI-assisted planning.
                            </p>
                        </section>

                        {/* Section: Current Status */}
                        <section id="current-status" className="flex flex-col gap-4 p-6 rounded-xl bg-primary/5 border border-primary/20 scroll-mt-32 mt-4">
                            <h3 className="text-lg font-medium text-primary">Current Status</h3>
                            <p className="text-sm text-foreground/80">
                                ProdMate is currently available in <strong>Early Access</strong>. The platform focuses heavily on planning and documentation generation. Future versions may include collaboration, workflow integrations, and advanced automation capabilities.
                            </p>
                        </section>

                    </div>

                    {/* Pagination / Next Steps */}
                    <div className="flex items-center justify-end w-full mt-20 pt-8 border-t border-border/50">
                        <Link 
                            href="#" 
                            className="flex flex-col items-end gap-1 group"
                        >
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">Next</span>
                            <span className="text-base font-medium text-foreground flex items-center gap-1">
                                Create your first project <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                            </span>
                        </Link>
                    </div>

                </main>
            </Container>
        </div>
    );
};

export default Documentation;
