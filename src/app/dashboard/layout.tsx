"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CalendarDays,
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Plus,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
    { href: "/dashboard/leads", icon: Users, label: "Leads" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isPro = session?.user?.subscriptionTier === "pro";

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl md:block">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-6 py-5 border-b border-border/40">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs">
                            OH
                        </div>
                        <span className="text-lg font-bold tracking-tight">OpenHouse</span>
                        {isPro && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
                                PRO
                            </Badge>
                        )}
                    </div>

                    {/* New Event Button */}
                    <div className="px-4 py-4">
                        <Link href="/dashboard/events?new=1">
                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0">
                                <Plus className="mr-2 h-4 w-4" />
                                New Open House
                            </Button>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Upgrade banner for free users */}
                    {!isPro && (
                        <div className="mx-4 mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium">Upgrade to Pro</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                Get AI lead scoring, data enrichment, and automated follow-ups.
                            </p>
                            <Link href="/dashboard/settings">
                                <Button size="sm" variant="outline" className="w-full text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                    View Plans
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* User Profile */}
                    <div className="border-t border-border/40 p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session?.user?.image || ""} />
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs">
                                            {session?.user?.name?.[0] || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium truncate max-w-[140px]">
                                            {session?.user?.name || "Agent"}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                            {session?.user?.email}
                                        </span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen">
                <div className="p-6 md:p-8">{children}</div>
            </main>
        </div>
    );
}
