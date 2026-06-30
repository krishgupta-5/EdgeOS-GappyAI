import { ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Cover } from "../ui/cover";
import { CHAT_URL } from "@/constants";

const Hero = () => {
    return (
        <div className="relative z-40 flex flex-col items-center w-full max-w-5xl mx-auto my-24 text-center">

            <Container delay={0.0}>
                {/* Refined Top Badge */}
                <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/20 backdrop-blur-md cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)]">

                    <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-primary/20">
                        <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full animate-ping bg-primary/60"></div>
                        <div className="absolute top-1/2 left-1/2 flex items-center justify-center w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"></div>
                    </div>

                    <span className="inline-flex items-center justify-center gap-2 font-medium tracking-tight bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-[200%_auto] bg-clip-text text-sm text-transparent animate-text-gradient">
                        Built for founders & developers
                    </span>
                </div>
            </Container>

            {/* High-Contrast Heading with Aceternity Cover */}
            <Container delay={0.1}>
                <h1 className="max-w-4xl mx-auto mt-8 text-4xl font-bold tracking-tighter text-center md:text-6xl lg:text-7xl relative z-20 leading-[1.1]">
                    <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                        Turn your software idea
                    </span>
                    <Cover>into a development plan</Cover>
                </h1>
            </Container>

            {/* Highlighted Subtitle */}
            <Container delay={0.2}>
                <p className="max-w-2xl mx-auto mt-6 text-base leading-relaxed sm:text-lg lg:text-xl text-muted-foreground">
                    One idea. One workspace. Everything your team needs—from{" "}
                    <span className="font-medium text-foreground">product planning</span> and{" "}
                    <span className="font-medium text-foreground">technical documentation</span> to{" "}
                    <span className="font-medium text-foreground">GitHub</span>,{" "}
                    <span className="font-medium text-foreground">Jira</span>,{" "}
                    <span className="font-medium text-foreground">Notion</span>, and{" "}
                    <span className="font-medium text-foreground">team collaboration</span>.
                </p>
            </Container>

            {/* Polished Call to Actions */}
            <Container delay={0.3}>
                <div className="flex flex-col items-center justify-center mt-10 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">

                    <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-[0_0_40px_rgba(134,120,249,0.3)] group transition-all duration-300 hover:shadow-[0_0_60px_rgba(134,120,249,0.4)] hover:-translate-y-0.5">
                        <Link href={CHAT_URL}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Planning
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full h-12 px-8 text-base border-foreground/10 hover:bg-foreground/5 group transition-all duration-300"
                    >
                        <Link href="#">
                            See How It Works
                            <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Button>

                </div>
            </Container>

            {/* Dashboard Mockup with Upgraded Glow */}
            <Container delay={0.4}>
                <div className="relative mx-auto max-w-7xl rounded-[24px] lg:rounded-[40px] border border-foreground/10 p-2 backdrop-blur-xl bg-background/50 md:p-4 mt-20 shadow-2xl">

                    {/* Multi-stop ambient glow */}
                    <div className="absolute top-1/2 left-1/2 -z-10 w-[80%] -translate-x-1/2 h-[60%] -translate-y-1/2 inset-0 blur-[120px] bg-gradient-to-tr from-primary/30 via-purple-500/20 to-blue-500/30 opacity-70 animate-pulse-slow"></div>

                    <div className="p-2 border rounded-[16px] lg:rounded-[32px] border-foreground/10 bg-background/80 shadow-inner">
                        <div className="w-full aspect-video rounded-[12px] lg:rounded-[24px] border border-foreground/5 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <span className="text-muted-foreground/50 font-medium">Dashboard Interface</span>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Hero;
