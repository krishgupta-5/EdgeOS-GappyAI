import React from "react";
import { Background, Container } from "@/components";
import { DocsSidebar } from "@/components/landing/docs-sidebar";

const DocsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Background>
            <div className="flex justify-center min-h-screen pt-32 lg:pt-40 pb-24 w-full relative">
                <Container className="max-w-7xl w-full px-4 md:px-12 flex flex-col lg:flex-row items-start gap-0 lg:gap-12 relative z-10">
                    <DocsSidebar />
                    <main className="flex-1 flex flex-col w-full pb-24 max-w-4xl lg:pl-4">
                        {children}
                    </main>
                </Container>
            </div>
        </Background>
    );
};

export default DocsLayout;
