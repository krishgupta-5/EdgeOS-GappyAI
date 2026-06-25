"use client";

import React, { useId, useEffect, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/functions";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

const particlesInit = async (engine: Engine): Promise<void> => {
  await loadSlim(engine);
};

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps) => {

  const controls = useAnimation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  }, [isReady, controls]);

  const particlesLoaded = async (_container?: Container) => {
    setIsReady(true);
  };

  const generatedId = useId();

  return (
    <ParticlesProvider init={particlesInit}>
      <motion.div
        animate={controls}
        className={cn("opacity-0", className)}
      >
        <Particles
        id={id || generatedId}
        className="h-full w-full"
        particlesLoaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: background || "transparent",
            },
          },
          fullScreen: {
            enable: false,
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: particleColor || "#ffffff",
            },
            move: {
              enable: true,
              speed: speed || 1,
            },
            number: {
              value: particleDensity || 80,
            },
            opacity: {
              value: 1,
            },
            size: {
              value: {
                min: minSize || 1,
                max: maxSize || 3,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </motion.div>
    </ParticlesProvider>
  );
};