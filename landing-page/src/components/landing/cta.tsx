import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Particles } from "../ui/particles";
import RetroGrid from "../ui/retro-grid";

const CTA = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative">
            <Container>
                <div className="flex flex-col items-center justify-center text-center w-full px-4 md:px-0 mx-auto h-[500px] border border-foreground/10 rounded-3xl overflow-hidden relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-12 bg-violet-500 blur-[10rem]"></div>
                    
                    <div className="flex flex-col items-center justify-center w-full z-20">
                        <span className="px-4 py-1 rounded-full border border-foreground/10 bg-foreground/5 text-sm text-accent-foreground/80 mb-6">
                            Free During Early Access
                        </span>

                        <h2 className="text-4xl md:text-6xl font-heading heading font-semibold !leading-tight mt-2">
                            Your AI Product Manager <br className="hidden md:block" />
                            is ready to work
                        </h2>

                        <p className="text-base md:text-lg text-center text-accent-foreground/80 max-w-2xl mx-auto mt-6">
                            Stop spending hours creating roadmaps, PRDs, APIs and technical plans.
                            Let ProdMate generate the foundation of your next software product in minutes.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-6 mt-8">
                            <Button asChild size="lg" className="w-full md:w-max">
                                <Link href="https://chat.krishgupta.dev/">
                                    Start Planning Free
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="w-full md:w-max"
                            >
                                <Link href="#features">
                                    Explore Features
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
