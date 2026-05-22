
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function WordToPdfConverter() {
    return (
        <Card className="w-full max-w-2xl border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-12 text-center space-y-6">
                <div className="mx-auto size-20 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Info className="size-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black uppercase">Tool Removed</h2>
                <p className="text-muted-foreground">This tool is currently under maintenance or has been removed. Please use our other PDF tools.</p>
            </CardContent>
        </Card>
    );
}
