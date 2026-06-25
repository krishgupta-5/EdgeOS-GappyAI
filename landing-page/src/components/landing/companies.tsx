"use client";

import Marquee from "../ui/marquee";

// ----------------------------------------------------------------------
// COMPANY DATA (Uppercase for heavy tech aesthetic)
// ----------------------------------------------------------------------

const COMPANIES = [
    "BULLXCHANGE",
    "EDUGUIDE",
    "VAKEEL DAIRY",
    "MARKAIGE",
    "OPENFORGE"
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const Companies = () => {
    return null;
    return (
        <div className="flex w-full py-16 md:py-24">
            <div className="flex flex-col items-center justify-center w-full py-2 text-center">
                
                <h2 className="mb-4 text-sm font-medium tracking-widest uppercase md:text-base text-muted-foreground/60">
                    Trusted by innovative teams
                </h2>
                
                <div className="relative w-full mt-8 overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:40s]">
                        <div className="flex items-center px-8 gap-16 md:gap-32">
                            {/* Rendering the array twice ensures the marquee is filled on ultra-wide screens */}
                            {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                                <div key={idx} className="flex items-center justify-center cursor-default group">
                                    <span 
                                        className="text-2xl whitespace-nowrap md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground/20 group-hover:text-foreground/80 transition-colors duration-500"
                                    >
                                        {/* Optional: You can split the text here if you want to make half of the logo bold and half normal, but keeping it all black-weight looks very clean */}
                                        {company}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Marquee>
                    
                    {/* Gradient Masks for smooth fading on the edges */}
                    <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none sm:w-1/4 bg-gradient-to-r from-background to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none sm:w-1/4 bg-gradient-to-l from-background to-transparent"></div>
                </div>

            </div>
        </div>
    );
};

export default Companies;