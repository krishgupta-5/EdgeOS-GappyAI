import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Particles } from "../ui/particles";
import RetroGrid from "../ui/retro-grid";

const CTA = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative">
            <Container>
                <div className="flex flex-col items-center justify-center text-center w-full py-16 md:py-24 px-6 md:px-12 mx-auto border border-foreground/10 rounded-3xl overflow-hidden relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-12 bg-violet-500 blur-[10rem]"></div>
                    
                    <div className="flex flex-col items-center justify-center w-full z-20">
                        <span className="px-4 py-1 rounded-full border border-primary/20 bg-primary/10 text-sm text-primary mb-6">
                            ✨ Join the Early Access Program
                        </span>

                        <h2 className="text-4xl md:text-6xl font-heading heading font-semibold !leading-tight mt-2 text-center max-w-4xl">
                            Ship your next software project with confidence
                        </h2>

                        <p className="text-base md:text-lg text-center text-accent-foreground/80 max-w-3xl mx-auto mt-6">
                            From idea to execution, ProdMate helps you generate everything your team needs—including PRDs, user stories, roadmaps, architecture, APIs, database schemas, testing strategies, and technical documentation—in one AI-powered workspace.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-6 mt-8">
                            <Button asChild size="lg" className="w-full md:w-max">
                                <Link href="https://chat.krishgupta.dev/">
                                    Start for Free
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="w-full md:w-max"
                            >
                                <Link href="#features">
                                    See How It Works
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <RetroGrid />
                    <Particles
                        refresh
                        ease={80}
                        color="#d4d4d8"
                        quantity={100}
                        className="size-full absolute inset-0"
                    />
                </div>
            </Container>
        </div>
    )
};

export default CTA;
