"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AcmeHero() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="mx-auto">
      <main className="relative">
        <section className="w-full py-8 md:py-12 lg:py-16">
          <motion.div
            className="flex flex-col items-center space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {getGreeting()}, {displayName}
            </motion.h1>
            <motion.p
              className="mx-auto max-w-xl text-md sm:text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Manage{" "}
              <span className="font-semibold text-foreground">
                loan applications
              </span>
              ,{" "}
              <span className="font-semibold text-foreground">documents</span>
              {" & "}
              <span className="font-semibold text-foreground">students</span>
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link href="/loans">
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  View Loans
                  <div className="ml-2 space-x-1 hidden sm:inline-flex">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" className="rounded-xl">
                  Review Documents
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-col items-center space-y-3 pb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center space-x-4 text-sm">
                <Link href="/users" className="text-primary hover:text-primary/80 transition-colors">
                  Students
                </Link>
                <span className="text-muted-foreground/60">
                  Loans & Documents
                </span>
                <Link href="/referrals" className="text-primary hover:text-primary/80 transition-colors">
                  Referrals
                </Link>
              </div>
              <p className="text-sm text-muted-foreground/60">
                FundMyCampus Admin Panel
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
