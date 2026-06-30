"use client";

import { cn } from "@/functions";
import { useClickOutside } from "@/hooks";
import { motion } from "framer-motion";
import { ArrowRightIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import { CHAT_URL } from "@/constants/links";

// ----------------------------------------------------------------------
// DESKTOP MENU (SIMPLE LINKS, NO POPUPS)
// ----------------------------------------------------------------------

const DesktopMenu = () => {
    return (
        <nav>
            <ul className="flex items-center gap-1">
                <li>
                    <Link href="/how-it-works" className="h-9 px-4 py-2 text-sm font-medium rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 transition-colors duration-200 ease-out inline-flex">
                        How it works
                    </Link>
                </li>
                <li>
                    <Link href="/#features" className="h-9 px-4 py-2 text-sm font-medium rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 transition-colors duration-200 ease-out inline-flex">
                        Features
                    </Link>
                </li>
                <li>
                    <Link href="/#pricing" className="h-9 px-4 py-2 text-sm font-medium rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 transition-colors duration-200 ease-out inline-flex">
                        Pricing
                    </Link>
                </li>
                <li>
                    <Link href="/docs" className="h-9 px-4 py-2 text-sm font-medium rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 transition-colors duration-200 ease-out inline-flex">
                        Documentation
                    </Link>
                </li>
            </ul>
        </nav>
    )
};

// ----------------------------------------------------------------------
// MOBILE MENU COMPONENT (SIMPLE LINKS)
// ----------------------------------------------------------------------

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu = ({ isOpen, setIsOpen }: MobileMenuProps) => {

    const ref = useClickOutside(() => setIsOpen(false));

    const variants = {
        open: { opacity: 1, y: 10 },
        closed: { opacity: 0, y: 0 },
    };

    return (
        <div
            ref={ref}
            className={cn(
                "w-full h-auto px-4 pt-2 pb-6 z-[9999] bg-transparent flex-col mt-4",
                isOpen ? "flex" : "hidden"
            )}
        >
            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={variants}
                transition={{
                    type: "spring",
                    bounce: 0.15,
                    duration: 0.3,
                }}
                className="size-full flex flex-col justify-start"
            >
                <ul className="flex flex-col items-start flex-1 w-full space-y-2 pt-2">
                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 text-lg font-medium transition-all duration-200 rounded-xl cursor-pointer text-foreground/80 hover:text-foreground text-start hover:bg-white/5"
                    >
                        <Link href="/how-it-works" className="flex items-center w-full text-start">
                            How it works
                        </Link>
                    </li>

                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 text-lg font-medium transition-all duration-200 rounded-xl cursor-pointer text-foreground/80 hover:text-foreground text-start hover:bg-white/5"
                    >
                        <Link href="/#features" className="flex items-center w-full text-start">
                            Features
                        </Link>
                    </li>

                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 text-lg font-medium transition-all duration-200 rounded-xl cursor-pointer text-foreground/80 hover:text-foreground text-start hover:bg-white/5"
                    >
                        <Link href="/#pricing" className="flex items-center w-full text-start">
                            Pricing
                        </Link>
                    </li>

                    <li
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 text-lg font-medium transition-all duration-200 rounded-xl cursor-pointer text-foreground/80 hover:text-foreground text-start hover:bg-white/5"
                    >
                        <Link href="/docs" className="flex items-center w-full text-start">
                            Documentation
                        </Link>
                    </li>

                    <li className="w-full mt-4 pt-4 border-t border-white/10">
                        <Button
                            variant="white"
                            className="w-full rounded-full py-6 text-lg"
                            onClick={() => {
                                window.location.href = CHAT_URL;
                                setIsOpen(false);
                            }}
                        >
                            Start for free
                        </Button>
                    </li>
                </ul>
            </motion.div>
        </div>
    )
};

// ----------------------------------------------------------------------
// MAIN NAVBAR COMPONENT (PREMIUM FROSTED UI)
// ----------------------------------------------------------------------

const Navbar = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className="relative w-full h-full">
            {/* Softened Background Gradient Mask for smoother blending */}
            <div className="z-[50] fixed pointer-events-none inset-x-0 h-[140px] bg-[rgba(10,10,10,0.6)] backdrop-blur-md [mask:linear-gradient(to_bottom,#000_10%,transparent_calc(100%-10%))]"></div>

            <header
                className={cn(
                    "fixed top-4 inset-x-0 mx-auto max-w-6xl px-4 md:px-12 z-[100] transform transition-all duration-500 ease-out",
                    isOpen ? "h-auto" : "h-16 md:h-20"
                )}
            >
                <Wrapper className={cn(
                    "w-full bg-white/5 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)] px-5 md:px-8 transition-all duration-500 relative z-[100]",
                    isOpen ? "flex flex-col items-start justify-start py-4 pb-6" : "flex items-center justify-start h-full"
                )}>
                    <div className="flex items-center justify-between w-full relative">
                        <div className="flex items-center flex-1 lg:flex-none">
                            <Link href="/" className="text-lg font-semibold text-foreground transition-transform hover:scale-105 duration-300 ease-out">
                                <Icons.icon className="w-auto h-7 md:h-8 drop-shadow-md" />
                            </Link>
                            <div className="items-center hidden ml-10 lg:flex">
                                <DesktopMenu />
                            </div>
                        </div>
                        <div className="items-center flex gap-3 lg:gap-5">
                            <Button
                                variant="white"
                                onClick={() => {
                                    window.location.href = CHAT_URL;
                                }}
                                className="hidden sm:flex group rounded-full px-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
                            >
                                Start for free
                                <ArrowRightIcon className="w-4 h-4 ml-2 hidden lg:block transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="lg:hidden p-2 w-11 h-11 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all focus:ring-2 focus:ring-white/20 active:scale-95"
                            >
                                {isOpen ? <XIcon className="w-5 h-5 duration-300" /> : <Icons.menu className="w-6 h-6 duration-300" />}
                            </Button>
                        </div>
                    </div>
                    <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
                </Wrapper>
            </header>

        </div>
    )
};

export default Navbar;
