"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    Users,
    Flame,
    TrendingUp,
} from "lucide-react";

const STATS = [
    {
        title: "Total Events",
        value: "0",
        icon: CalendarDays,
        change: "Get started by creating your first event",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        title: "Total Sign-ins",
        value: "0",
        icon: Users,
        change: "Visitors will appear here after sign-in",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        title: "Hot Leads",
        value: "0",
        icon: Flame,
        change: "AI-scored hot leads (Pro)",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
    {
        title: "Conversion Rate",
        value: "—",
        icon: TrendingUp,
        change: "Lead-to-showing conversion",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Overview of your Open House performance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                    <Card key={stat.title} className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Welcome Card */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                <CardContent className="flex items-center gap-6 p-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl">
                        🏠
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Welcome to OpenHouse Pro!</h3>
                        <p className="text-sm text-muted-foreground">
                            Create your first Open House event to start capturing leads. Share the QR code
                            at your next open house and watch the leads flow in.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                                Step 1: Create Event
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                Step 2: Share QR Code
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                Step 3: View Leads
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
