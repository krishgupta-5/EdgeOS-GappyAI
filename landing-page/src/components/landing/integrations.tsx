"use client";

import React from "react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { SectionBadge } from "../ui/section-bade";
import { ArrowRight } from "lucide-react";
import {
    SiGmail,
    SiGithub,
    SiNotion,
    SiGooglecalendar,
    SiJira
} from "react-icons/si";
import { IconType } from "react-icons";
import { cn } from "@/functions";

const integrations: { name: string; icon: IconType; color: string }[] = [
    { name: "Gmail", icon: SiGmail, color: "#EA4335" },
    { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
    { name: "Notion", icon: SiNotion, color: "#FFFFFF" },
    { name: "Calendar", icon: SiGooglecalendar, color: "#4285F4" },
    { name: "Jira", icon: SiJira, color: "#0052CC" },
];

const Integrations = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 w-full relative">
            <Container>
                <div className="flex flex-col items-center max-w-3xl mx-auto text-center mb-12 md:mb-16">
                    <SectionBadge title="Integrations" />
                    <h2 className="mt-6 text-3xl font-medium md:text-5xl lg:text-6xl font-heading !leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                        Works seamlessly with your development workflow
                    </h2>
                </div>
                <div className="flex flex-col lg:flex-row w-full border border-white/10 rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm">
                    {/* LEFT SIDE: Text and Button */}
                    <div className="flex flex-col justify-between p-8 md:p-12 lg:w-1/3 lg:border-r border-white/10">
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug">
                                Bring your entire workflow together
                            </h2>
                            <p className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed">
                                Automate GitHub repos, Jira tasks, Notion docs, Calendar meetings, and Gmail updates. Keep your product development connected in one AI workspace.
                            </p>
                        </div>
                        <div className="mt-8 lg:mt-12 bg-white/5 border border-white/10 p-4 rounded-xl max-w-fit">
                            <Button
                                variant="ghost"
                                className="group flex items-center gap-2 hover:bg-transparent text-white px-2 py-0 h-auto"
                                onClick={() => {
                                    const chatUrl = `${window.location.protocol}//${window.location.hostname}:3000/integrations`;
                                    window.location.href = chatUrl;
                                }}
                            >
                                View All Integrations
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Icons Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:w-2/3">
                        {[...integrations, ...Array.from({ length: 6 - integrations.length }).map(() => null)].map((Integration, idx) => (
                            <div
                                key={Integration?.name || `empty-${idx}`}
                                className={cn(
                                    "group flex items-center justify-center p-10 lg:p-14 border-white/10 transition-colors hover:bg-white/5",
                                    "border-r border-b",
                                    // Right borders
                                    (idx + 1) % 2 === 0 && "border-r-0 md:border-r",
                                    (idx + 1) % 3 === 0 && "md:border-r-0",
                                    // Bottom borders
                                    idx >= 4 && "border-b-0",
                                    idx === 3 && "md:border-b-0"
                                )}
                            >
                                {Integration ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Integration.icon
                                            className="w-12 h-12 md:w-14 md:h-14 opacity-80 group-hover:opacity-100 transition-opacity"
                                            style={{ color: Integration.color }}
                                        />
                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            {Integration.name}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Integrations;
