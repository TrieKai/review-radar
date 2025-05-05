"use client";

import { useEffect } from "react";

export default function ClientWarmup() {
  useEffect(() => {
    const warmup = async (): Promise<void> => {
      try {
        const routes = ["/api/place-reviews", "/api/analysis"];
        console.log("Warmup started");
        await Promise.allSettled(
          routes.map((route) =>
            fetch(`${window.location.origin}${route}`, {
              method: "HEAD",
            })
          )
        );
        console.log("Warmup completed");
      } catch (error) {
        console.error("Warmup error:", error);
      }
    };

    void warmup();
  }, []);

  return null;
}
