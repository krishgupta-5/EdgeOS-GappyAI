"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Terminal } from "lucide-react";
import Link from "next/link";
import { DOCS_NAV } from "./docs-sidebar";

const Documentation = () => {
    const [activeSection, setActiveSection] = useState("introduction");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -80% 0px",
            }
        );

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

    let activeItemName = "Overview";
    DOCS_NAV.forEach(section => {
        section.items.forEach(item => {
            if (item.href === `#${activeSection}`) {
                activeItemName = item.name;
            }
        });
    });

    return (
        <>
            {/* Breadcrumbs */}
            <div className="sticky top-[5rem] md:top-[6.5rem] z-30 inline-flex w-max items-center gap-2 text-sm text-muted-foreground mb-8 py-2 px-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
                <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{activeItemName}</span>
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

                {/* Section: Architecture & Security */}
                <section id="architecture-security" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Architecture & Security</h2>
                    <p>
                        Unlike monolithic AI generators that attempt to output entire codebases at once (often leading to timeouts or hallucinations), ProdMate utilizes a <strong>decoupled 9-artifact generation pipeline</strong>. Each technical blueprint is generated independently by specialized backend controllers.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                            <h4 className="font-medium text-foreground mb-2">Clerk Enterprise Auth</h4>
                            <p className="text-sm">Secure user sign-up, session management, and role-based access control with Google and GitHub OAuth.</p>
                        </div>
                        <div className="p-5 rounded-lg bg-foreground/[0.02] border border-border/50">
                            <h4 className="font-medium text-foreground mb-2">Firebase Cloud Storage</h4>
                            <p className="text-sm">Real-time persistence and workspace synchronization powered by Firebase Firestore, ensuring your blueprints are always backed up.</p>
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

                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                            <h3 className="text-lg font-medium text-foreground mb-3">Folder Structure Planning</h3>
                            <p className="text-sm mb-3">Generate idiomatic repo layouts:</p>
                            <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                <li>Framework-tailored directory trees</li>
                                <li>Component and service organization</li>
                                <li>Configuration and asset hierarchy</li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50">
                            <h3 className="text-lg font-medium text-foreground mb-3">DevOps & CI/CD Pipelines</h3>
                            <p className="text-sm mb-3">Production-ready containerization and automation:</p>
                            <ul className="text-sm space-y-1.5 list-disc list-inside text-muted-foreground/80">
                                <li>Multi-stage Dockerfile configs</li>
                                <li>Multi-service docker-compose.yml setups</li>
                                <li>GitHub Actions continuous deployment workflows</li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50 col-span-1 md:col-span-2">
                            <h3 className="text-lg font-medium text-foreground mb-3">Master Unified Blueprint</h3>
                            <p className="text-sm mb-2">A consolidated master Markdown document synthesizing all 8 technical artifacts. Easily downloadable or exportable directly to your repository's root README.md.</p>
                        </div>
                    </div>
                </section>

                {/* Section: AI Project Assistant */}
                <section id="ai-project-assistant" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Interactive AI Project Assistant</h2>
                    <p>
                        ProdMate features an embedded conversational AI assistant connected directly to your project workspace. Instead of regenerating an entire project when requirements shift slightly, you can iterate interactively in real time.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50">
                        <h4 className="font-medium text-foreground mb-2">Example Assistant Queries</h4>
                        <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground/90">
                            <li><em>"Add an is_favorite boolean column and tags array to the bookmarks database schema."</em></li>
                            <li><em>"Why did you choose PostgreSQL over MongoDB for this specific architecture?"</em></li>
                            <li><em>"Write a Jest unit test suite for the user authentication API endpoint."</em></li>
                        </ul>
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

                {/* Section: Quick Start Connect */}
                <section id="quick-start-connect" className="flex flex-col gap-6 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Quick-Start: How to Connect Any App in 3 Simple Steps</h2>
                    <p>
                        Connecting external tools like GitHub, Notion, Jira, Gmail, or Google Calendar takes less than <strong>30 seconds</strong>. No coding or manual API key entry required—just click, authorize, and export!
                    </p>
                    <div className="grid grid-cols-1 gap-4 mt-2">
                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                            <h4 className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono">1</span>
                                Open Your Project Workspace
                            </h4>
                            <p className="text-sm text-muted-foreground/90">
                                Once your blueprint is generated, look at the <strong>Top Export Toolbar</strong> in your dashboard. You will see action buttons for all supported apps:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono">
                                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white flex items-center gap-1.5">Export to GitHub</span>
                                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white flex items-center gap-1.5">Sync to Notion</span>
                                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white flex items-center gap-1.5">Export to Jira</span>
                                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white flex items-center gap-1.5">Notify via Gmail</span>
                                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white flex items-center gap-1.5">Schedule Sprints</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                            <h4 className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-mono">2</span>
                                Click to Connect (One-Click Sign-In)
                            </h4>
                            <p className="text-sm text-muted-foreground/90">
                                Click on any tool you want to connect (for example, <strong>Notion</strong> or <strong>GitHub</strong>). A secure pop-up window will appear asking you to log into your account. Click <strong>"Allow / Authorize"</strong>—that's it! ProdMate is now securely linked to your account.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-foreground/[0.02] border border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
                            <h4 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 text-xs font-mono">3</span>
                                Choose Your Options & Watch the Magic!
                            </h4>
                            <div className="space-y-3 text-sm text-muted-foreground/90">
                                <p><strong className="text-foreground">For GitHub:</strong> Type your new repo name and choose Public/Private. Click Create Repository—within 5 seconds, your entire folder structure, Docker files, and README are live on GitHub!</p>
                                <p><strong className="text-foreground">For Notion:</strong> Pick your Notion workspace page and click Sync Docs. Your PRDs, roadmaps, and architecture tables instantly turn into clean, organized Notion pages!</p>
                                <p><strong className="text-foreground">For Jira:</strong> Select your Jira Project (e.g., MVP). Click Generate Tickets. ProdMate automatically creates an Epic and populates your Sprint Board with estimated User Stories!</p>
                                <p><strong className="text-foreground">For Gmail:</strong> Type recipient email addresses and click Send. An automated executive summary with the blueprint is delivered immediately!</p>
                                <p><strong className="text-foreground">For Google Calendar:</strong> Select your start date and click Schedule Sprints. All sprint review meetings and milestone deadlines are automatically added to your calendar!</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: GitHub Integration */}
                <section id="github-integration" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">GitHub Repository Automation</h2>
                    <p>
                        Powered by <strong>@octokit/rest</strong> and GitHub OAuth, this integration turns your blueprint into a live GitHub repository with a single click.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                        <h4 className="font-medium text-foreground">How It Works:</h4>
                        <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground/90">
                            <li>Click the <strong>Export to GitHub</strong> button in your workspace toolbar.</li>
                            <li>Authorize the ProdMate OAuth app and enter a repository name and visibility (Public/Private).</li>
                            <li>ProdMate initializes the repository on your GitHub account, builds the directory tree, and pushes the generated <code>Dockerfile</code>, <code>docker-compose.yml</code>, and <code>README.md</code> directly to main branch.</li>
                        </ol>
                    </div>
                </section>

                {/* Section: Notion Integration */}
                <section id="notion-integration" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Notion Documentation Sync</h2>
                    <p>
                        Powered by <strong>@notionhq/client</strong>, export your Product Requirement Documents and roadmaps directly into formatted Notion pages.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                        <h4 className="font-medium text-foreground">Capabilities:</h4>
                        <p className="text-sm text-muted-foreground/90">
                            Converts raw Markdown tables into native Notion database tables, Mermaid architecture diagrams into code blocks, and user stories into interactive toggle lists inside your team's Notion workspace.
                        </p>
                    </div>
                </section>

                {/* Section: Jira Integration */}
                <section id="jira-integration" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Jira Sprint Automation</h2>
                    <p>
                        Connect directly to Atlassian Jira Cloud via REST API to eliminate manual ticket writing.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                        <h4 className="font-medium text-foreground">Automated Workflow:</h4>
                        <p className="text-sm text-muted-foreground/90">
                            ProdMate parses your generated User Stories & Acceptance Criteria, creating a parent <strong>Epic</strong> for the project and generating individual <strong>Story</strong> and <strong>Task</strong> issues assigned directly to your active sprint board with estimated story points.
                        </p>
                    </div>
                </section>

                {/* Section: Gmail Integration */}
                <section id="gmail-integration" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Gmail Stakeholder Updates</h2>
                    <p>
                        Powered by Google Workspace OAuth via Gmail API, keep your engineering team, founders, and stakeholders aligned.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                        <h4 className="font-medium text-foreground">Capabilities:</h4>
                        <p className="text-sm text-muted-foreground/90">
                            Compile executive summaries and attach complete project blueprints directly into automated emails sent from your authenticated Google account to any team member or client.
                        </p>
                    </div>
                </section>

                {/* Section: Calendar Integration */}
                <section id="calendar-integration" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Google Calendar Scheduling</h2>
                    <p>
                        Turn static project timelines into scheduled calendar commitments using Google Workspace OAuth via Calendar API.
                    </p>
                    <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                        <h4 className="font-medium text-foreground">Automated Booking:</h4>
                        <p className="text-sm text-muted-foreground/90">
                            ProdMate reads roadmap milestones and automatically books calendar events for Sprint Kickoffs, Mid-Sprint Check-ins, Code Freeze Deadlines, and Final Demo Reviews on your primary Google Calendar.
                        </p>
                    </div>
                </section>

                {/* Section: Token Quotas */}
                <section id="token-quotas" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Token Quotas & API Keys</h2>
                    <p>
                        To ensure high-throughput concurrent generation across all 9 technical artifacts without rate-limiting, ProdMate supports dedicated per-artifact Groq API keys in your environment configuration:
                    </p>
                    <div className="p-4 rounded-lg bg-[#0a0a0a] border border-border/50 font-mono text-xs text-muted-foreground overflow-x-auto">
                        <code>
                            GROQ_API_KEY_MARKDOWN=gsk_...<br />
                            GROQ_API_KEY_APIDESIGN=gsk_...<br />
                            GROQ_API_KEY_FOLDERSTRUCTURE=gsk_...<br />
                            GROQ_API_KEY_DOCKER=gsk_...
                        </code>
                    </div>
                </section>

                {/* Section: Getting Started */}
                <section id="getting-started" className="flex flex-col gap-5 scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">Getting Started</h2>
                    <ul className="space-y-3 list-decimal list-inside">
                        <li><strong>Create a project</strong> in your workspace dashboard.</li>
                        <li><strong>Describe your product idea</strong> using plain language.</li>
                        <li><strong>Generate 9 modular planning artifacts</strong> with a single click.</li>
                        <li><strong>Iterate in real time</strong> with the interactive AI project assistant.</li>
                        <li><strong>Export directly to GitHub, Notion, Jira, Gmail, and Calendar</strong> to kickstart development!</li>
                    </ul>
                    <p className="mt-4 font-medium text-foreground">
                        ProdMate helps teams move from idea to execution with clarity, consistency, and AI-assisted planning.
                    </p>
                </section>

                {/* Section: Current Status */}
                <section id="current-status" className="flex flex-col gap-4 p-6 rounded-xl bg-primary/5 border border-primary/20 scroll-mt-32 mt-4">
                    <h3 className="text-lg font-medium text-primary">Current Status</h3>
                    <p className="text-sm text-foreground/80">
                        ProdMate is currently available with fully implemented <strong>9-artifact generation pipelines</strong>, an interactive <strong>conversational AI assistant</strong>, and live execution exporters for <strong>GitHub, Notion, Jira, Gmail, and Google Calendar</strong>.
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
        </>
    );
};

export default Documentation;
