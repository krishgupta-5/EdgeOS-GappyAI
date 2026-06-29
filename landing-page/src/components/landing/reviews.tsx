import Container from "../global/container";
import Marquee from "../ui/marquee";
import { SectionBadge } from "../ui/section-bade";

const CAPABILITIES = [
    {
        title: "Product Requirements",
        description: "Complete PRDs with goals, features and requirements."
    },
    {
        title: "User Stories",
        description: "Sprint-ready stories with clear acceptance criteria."
    },
    {
        title: "Product Roadmaps",
        description: "Milestones, releases and development timelines."
    },
    {
        title: "System Architecture",
        description: "Scalable architecture for modern applications."
    },
    {
        title: "API Specifications",
        description: "REST APIs with endpoints and request models."
    },
    {
        title: "Database Design",
        description: "Production-ready database schemas and relationships."
    },
    {
        title: "Technical Documentation",
        description: "Structured engineering documentation in Markdown."
    },
    {
        title: "Testing Strategy",
        description: "Unit, integration and deployment testing plans."
    },
    {
        title: "Deployment Guide",
        description: "Deployment workflows and infrastructure planning."
    },
    {
        title: "Risk Analysis",
        description: "Identify technical and business risks early."
    },
    {
        title: "AI Project Chat",
        description: "Refine requirements and update plans naturally."
    },
    {
        title: "Workflow Automation",
        description: "Connect GitHub, Jira, Notion and more."
    }
];

const firstRow = CAPABILITIES.slice(0, CAPABILITIES.length / 2);
const secondRow = CAPABILITIES.slice(CAPABILITIES.length / 2);

const Capabilities = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full">
            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    <SectionBadge title="What You Get" />
                    
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6 text-foreground">
                        Everything your team needs before development begins
                    </h2>
                    
                    <p className="text-base md:text-lg text-center text-foreground/60 mt-6 leading-relaxed">
                        Turn a simple idea into engineering-ready deliverables. ProdMate generates the planning, documentation, architecture, and technical artifacts your team needs to build with confidence.
                    </p>
                </div>
            </Container>
            
            <Container>
                <div className="mt-16 w-full relative overflow-hidden">
                    <div className="relative flex flex-col items-center justify-center overflow-hidden">
                        
                        <Marquee pauseOnHover className="[--duration:40s]">
                            {firstRow.map((item) => (
                                <CapabilityCard key={item.title} {...item} />
                            ))}
                        </Marquee>
                        
                        <Marquee pauseOnHover reverse className="[--duration:40s] mt-4">
                            {secondRow.map((item) => (
                                <CapabilityCard key={item.title} {...item} />
                            ))}
                        </Marquee>

                        {/* Edge Gradients for smooth fade-out */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent"></div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent"></div>
                        
                        {/* Subtle Violet Ambient Glows */}
                        <div className="absolute hidden lg:block top-1/4 left-1/4 w-48 h-48 rounded-full bg-violet-500/10 -z-10 blur-[8rem]"></div>
                        <div className="absolute hidden lg:block top-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/10 -z-10 blur-[8rem]"></div>
                    </div>
                </div>
            </Container>
        </div>
    )
};

const CapabilityCard = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => {
    return (
        <figure className="relative w-80 overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 ease-out hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] group mx-2">
            
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                <h3 className="text-lg font-semibold text-foreground transition-colors duration-300">
                    {title}
                </h3>
                
                <p className="mt-3 text-sm text-foreground/60 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {description}
                </p>
            </div>
            
        </figure>
    );
};

export default Capabilities;
