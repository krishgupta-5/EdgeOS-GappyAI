"use client";

import { useEffect, useState } from "react";
import { cn } from "@/functions";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

export const DOCS_NAV = [
    {
        title: "Overview",
        items: [
            { name: "Introduction", href: "#introduction" },
            { name: "What is ProdMate?", href: "#what-is-ProdMate" },
            { name: "Who Is It For?", href: "#who-is-it-for" },
            { name: "Architecture & Security", href: "#architecture-security" },
        ]
    },
    {
        title: "Platform & Capabilities",
        items: [
            { name: "Core Artifacts", href: "#core-capabilities" },
            { name: "AI Project Assistant", href: "#ai-project-assistant" },
            { name: "How It Works", href: "#how-it-works" },
            { name: "Example Output", href: "#example-output" },
        ]
    },
    {
        title: "Integrations & Exporters",
        items: [
            { name: "Connect Any App (3 Steps)", href: "#quick-start-connect" },
            { name: "GitHub Repository Push", href: "#github-integration" },
            { name: "Notion Workspace Sync", href: "#notion-integration" },
            { name: "Jira Sprint Automation", href: "#jira-integration" },
            { name: "Gmail Stakeholder Updates", href: "#gmail-integration" },
            { name: "Google Calendar Scheduling", href: "#calendar-integration" },
        ]
    },
    {
        title: "Advanced & Setup",
        items: [
            { name: "Token Quotas & API Keys", href: "#token-quotas" },
            { name: "Getting Started", href: "#getting-started" },
            { name: "Current Status", href: "#current-status" },
        ]
    }
];

export const DocsSidebar = () => {
    const [activeSection, setActiveSection] = useState("introduction");
    const [isOpen, setIsOpen] = useState(false);

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

    const SidebarContent = () => (
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
                                        onClick={() => setIsOpen(false)}
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
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-32 h-max pb-0 self-start">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Trigger (Floating Action Button) */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button className="rounded-full shadow-2xl px-6 py-6 border border-white/10 bg-background/80 backdrop-blur-lg hover:bg-background/90 text-foreground font-medium text-base">
                            <Menu className="w-5 h-5 mr-2" />
                            Index
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[75vh] pt-8 px-6 overflow-y-auto rounded-t-3xl border-t border-white/10">
                        <SheetHeader className="mb-6 text-left">
                            <SheetTitle className="text-xl">Index</SheetTitle>
                        </SheetHeader>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
};
