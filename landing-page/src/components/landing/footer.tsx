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
                    <div className="flex flex-col items-start w-full sm:max-w-xs">

                        <div className="flex items-center gap-2">
                            <Icons.icon className="w-5 h-5" />
                            <span className="text-xl font-medium">
                                ProdMate
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 w-full md:max-w-lg mt-10 md:mt-0">
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
                        © {new Date().getFullYear()} ProdMate. All rights reserved.
                    </p>



                </Wrapper>
            </Container>
        </footer>
    );
};

export default Footer;
