import { FOOTER_LINKS } from "@/constants";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import { Particles } from "../ui/particles";


const Footer = () => {
    return (
        <footer className="w-full py-10 relative">
            <Container>
                <Wrapper className="relative flex flex-col md:flex-row justify-between pb-32 overflow-hidden footer">
                    
                    <Particles
                        className="absolute inset-0 w-full -z-10"
                        quantity={40}
                        ease={10}
                        color="#d4d4d8"
                        refresh
                    />

                    {/* Brand Section */}
                    <div className="flex flex-col items-start max-w-xs">
                        
                        <div className="flex items-center gap-2">
                            <Icons.icon className="w-5 h-5" />
                            <span className="text-xl font-medium">
                                Edge OS
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                            AI-powered product planning for modern software teams.
                        </p>

                        <Button className="mt-6">
                            <Link href="https://chat.krishgupta.dev/">
                                Start Planning Free
                            </Link>
                        </Button>

                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-md mt-10 md:mt-0">
                        {FOOTER_LINKS?.map((section, index) => (
                            <div key={index} className="flex flex-col gap-4">
                                
                                <h4 className="text-sm font-medium">
                                    {section.title}
                                </h4>

                                <ul className="space-y-3">
                                    {section.links.map((link, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Link href={link.href}>
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}
                    </div>

                </Wrapper>
            </Container>

            {/* Bottom Footer */}
            <Container>
                <Wrapper className="pt-8 flex items-center justify-between border-t border-border/50">

                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Edge OS. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">

                        {/* GitHub */}
                        <Link href="#" className="p-1">
                            <svg className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        </Link>

                        {/* X / Twitter */}
                        <Link href="#" className="p-1">
                            <Icons.twitter className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>

                    </div>

                </Wrapper>
            </Container>
        </footer>
    );
};

export default Footer;