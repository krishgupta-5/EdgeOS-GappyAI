"use client";

import { cn } from "@/functions";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import { SectionBadge } from "../ui/section-bade";
import { CHAT_URL } from "@/constants/links";

const PLANS = [
    {
        id: "starter",
        title: "Starter",
        desc: "Everything you need to plan your next software project.",
        features: [
            "Unlimited AI Project Planning",
            "PRDs & User Stories",
            "Roadmaps & Timelines",
            "Architecture & API Design",
            "Database Schema Generation",
            "Technical Documentation",
            "Basic Workflow Automation"
        ]
    },
    {
        id: "pro",
        title: "Pro",
        desc: "For growing teams building production-ready software.",
        features: [
            "Everything in Starter",
            "GitHub Integration",
            "Jira Automation",
            "Notion Sync",
            "Email & Calendar Integration",
            "AI Project Assistant",
            "Advanced Collaboration",
            "Priority Support"
        ]
    },
    {
        id: "team",
        title: "Team",
        desc: "Built for startups and engineering teams.",
        features: [
            "Everything in Pro",
            "Shared Workspaces",
            "Role-Based Access",
            "Organization Management",
            "Custom AI Workflows",
            "Enterprise Integrations",
            "Admin Dashboard",
            "Dedicated Support"
        ]
    }
];

const Pricing = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative">
            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    <SectionBadge title="Pricing" />

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6 text-foreground">
                        Start free. Scale when you're ready.
                    </h2>
                    
                    <p className="text-base md:text-lg text-center text-foreground/60 mt-6 leading-relaxed max-w-2xl">
                        Join the beta today. Pro and Team plans are coming soon.
                    </p>
                </div>
            </Container>

            <div className="mt-8 w-full relative flex flex-col items-center justify-center">
                <div className="absolute hidden lg:block top-1/2 right-2/3 translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-primary/15 blur-[10rem] -z-10"></div>
                <div className="absolute hidden lg:block top-1/2 left-2/3 -translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-violet-500/15 blur-[10rem] -z-10"></div>

                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-10">
                        {PLANS.map((plan, index) => (
                            <Plan
                                key={index}
                                index={index}
                                {...plan}
                            />
                        ))}
                    </div>
                </Container>
            </div>
        </div>
    )
};

const Plan = ({
    id,
    title,
    desc,
    features,
    index,
}: {
    id: string;
    title: string;
    desc: string;
    features: string[];
    index: number;
}) => {
    const isStarter = id === "starter";

    return (
        <div key={index} className="w-full relative flex flex-col saturate-150 rounded-2xl">
            <div
                className={cn(
                    "flex flex-col size-full border rounded-2xl relative p-3 [background-image:linear-gradient(345deg,rgba(255,255,255,0.01)_0%,rgba(255,255,255,0.03)_100%)] overflow-hidden",
                    isStarter ? "border-primary/50" : "border-border/20 bg-transparent",
                )}
            >
                {/* 
                  HEAVY BLUR APPLIED HERE:
                  blur-[8px] completely scrambles the text visibility.
                  opacity-40 and grayscale keep it looking clean and abstract.
                */}
                <div className={cn("flex flex-col h-full transition-all duration-300", !isStarter && "opacity-40 blur-[8px] grayscale select-none pointer-events-none")}>

                    <div className="flex flex-col p-3 w-full">
                        <h2 className="text-xl font-medium">
                            {title}
                        </h2>
                        <p className="text-sm mt-2 text-muted-foreground break-words">
                            {desc}
                        </p>
                    </div>

                    <hr className="shrink-0 border-none w-full h-px bg-border/50" role="separator" />

                    <div className="relative flex flex-col flex-1 align-top w-full p-3 h-full break-words text-left gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <div className="flex items-end gap-1 w-full">
                                    <span className={cn("font-bold", isStarter ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>
                                        {isStarter ? "₹0" : "Coming Soon"}
                                    </span>
                                    {isStarter && (
                                        <span className="text-lg text-muted-foreground font-medium font-heading">
                                            / month
                                        </span>
                                    )}
                                </div>
                            </div>

                            {isStarter && (
                                <span className="inline-flex mt-2 max-w-fit px-2 py-1 text-xs rounded-full bg-primary/15 text-primary border border-primary/20">
                                    Free During Beta
                                </span>
                            )}
                        </div>

                        <ul className="flex flex-col gap-2 mt-2">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <CheckIcon aria-hidden="true" className="w-5 h-5 text-primary" />
                                    <p className="text-sm md:text-base text-muted-foreground">
                                        {feature}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-3 h-auto flex w-full items-center relative z-20 mt-auto">
                        <Button
                            asChild
                            variant={isStarter ? "default" : "secondary"}
                            className="w-full hover:scale-100 hover:translate-y-0 shadow-none"
                        >
                            <Link href={CHAT_URL}>
                                {isStarter ? "Start for Free" : "Upgrade"}
                            </Link>
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
};

export default Pricing;
