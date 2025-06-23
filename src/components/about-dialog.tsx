
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Send } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton size="lg" variant="outline" tooltip="About">
          <Info className="size-5" />
          <span>About</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] shadow-primary/20 shadow-2xl ring-2 ring-primary/50 dark:shadow-primary/10">
        <DialogHeader>
          <DialogTitle>About ShrinkRay</DialogTitle>
          <DialogDescription>
            Your all-in-one tool for file manipulation. Fast, private, and easy
            to use. All processing is done directly in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-center text-muted-foreground">
          <p>
            Developed by{" "}
            <span className="font-semibold text-foreground">Gaurav S</span>.
          </p>
        </div>
        <DialogFooter>
          <Button asChild className="w-full">
            <a href="mailto:gaurav.thearmy@yahoo.com">
              <Send className="mr-2" /> Send Feedback
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
