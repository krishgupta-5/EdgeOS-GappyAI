import { PERKS } from "@/constants";
import { cn } from "@/functions";
import type { LucideIcon } from "lucide-react";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";

const Perks = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full">

            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">

                    <SectionBadge title="Why ProdMate" />

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6 text-foreground">
                        Everything you need to build better software
                    </h2>

                    <p className="text-base md:text-lg text-center text-foreground/60 mt-6">
                        Plan smarter with AI. Generate PRDs, roadmaps, architecture, APIs, database schemas, and technical documentation—all in one workspace.
                    </p>

                </div>
            </Container>

            <Container>
                <div className="mt-16 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full relative">
                        {PERKS.map((perk, index) => (
                            <Perk
                                key={index}
                                index={index}
                                title={perk.title}
                                description={perk.description}
                                icon={perk.icon}
                            />
                        ))}
                    </div>
                </div>
            </Container>

        </div>
    );
};

const Perk = ({
    title,
    description,
    icon: Icon,
    index,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r transform-gpu py-10 relative group/feature border-white/10",
                (index === 0 || index === 3) && "lg:border-l",
                index < 3 && "lg:border-b"
            )}
        >
            {/* Premium minimal purple glow on hover */}
            {index < 3 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-500 absolute inset-0 h-full w-full bg-gradient-to-t from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            )}

            {index >= 3 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-500 absolute inset-0 h-full w-full bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="group-hover/feature:-translate-y-1 transform-gpu transition-all duration-300 flex flex-col w-full">

                <div className="mb-4 relative z-10 px-10">
                    <Icon
                        strokeWidth={1.5}
                        // Icon transitions to a crisp theme-matching purple
                        className="w-10 h-10 origin-left transform-gpu text-foreground/40 transition-all duration-300 ease-in-out group-hover/feature:scale-90 group-hover/feature:text-violet-400"
                    />
                </div>

                <div className="text-lg font-medium font-heading mb-2 relative z-10 px-10">
                    {/* The side accent line lights up neon purple on hover */}
                    <div className="absolute left-0 -inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-white/10 group-hover/feature:bg-violet-500 group-hover/feature:shadow-[0_0_12px_rgba(139,92,246,0.6)] transition-all duration-500 origin-center" />

                    <span className="transition-colors duration-500 inline-block heading text-foreground/90 group-hover/feature:text-white">
                        {title}
                    </span>
                </div>

                <p className="text-sm text-foreground/50 max-w-xs relative z-10 px-10 leading-relaxed transition-colors duration-500 group-hover/feature:text-foreground/70">
                    {description}
                </p>

            </div>
        </div>
    );
};

export default Perks;
