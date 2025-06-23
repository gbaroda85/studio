
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
import { useLanguage } from "@/contexts/language-context";

export function AboutDialog() {
  const { t } = useLanguage();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton size="lg" variant="outline" tooltip={t('about_tooltip')}>
          <Info className="size-5" />
          <span>{t('about_tooltip')}</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] shadow-primary/20 shadow-2xl ring-2 ring-primary/50 dark:shadow-primary/10">
        <DialogHeader>
          <DialogTitle>{t('about_shrinkray_title')}</DialogTitle>
          <DialogDescription>
            {t('tagline')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-center text-muted-foreground">
          <p>
            {t('developed_by')}{" "}
            <span className="font-semibold text-foreground">Gaurav S</span>.
          </p>
        </div>
        <DialogFooter>
          <Button asChild className="w-full">
            <a href="mailto:gaurav.thearmy@yahoo.com">
              <Send className="mr-2" /> {t('send_feedback')}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
