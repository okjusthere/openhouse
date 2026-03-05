"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Performance metrics across all your Open Houses
                </p>
            </div>
            <Card className="border-dashed border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Analytics coming soon</h3>
                    <p className="text-sm text-muted-foreground">
                        Charts and insights will populate as you host more Open Houses
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
