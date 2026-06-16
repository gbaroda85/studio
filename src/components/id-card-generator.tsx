"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function IdCardGenerator() {
    return (
        <Card className="w-full max-w-2xl border-orange-500/20 bg-orange-500/5 mx-auto mt-20">
            <CardContent className="p-12 text-center space-y-6">
                <div className="mx-auto size-20 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Info className="size-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black uppercase">Tool Removed</h2>
                <p className="text-muted-foreground">This tool has been removed from the studio. Please use our other document and image management utilities.</p>
            </CardContent>
        </Card>
    );
}
