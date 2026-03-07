"use client";

import { FormEvent, useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EventInfo {
    propertyAddress: string;
    aiQaEnabled: boolean;
    chatUnlocked: boolean;
    branding: { primaryColor?: string } | null;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export default function PublicPropertyChatPage({
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const { uuid } = use(params);
    const [event, setEvent] = useState<EventInfo | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);

    const sessionStorageKey = useMemo(() => `oh-chat-session-${uuid}`, [uuid]);
    const primaryColor = event?.branding?.primaryColor || "#10b981";

    useEffect(() => {
        fetch(`/api/public/event/${uuid}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Event not found");
                return res.json();
            })
            .then((data) => {
                setEvent(data);
            })
            .catch(() => {
                toast.error("Failed to load event");
            })
            .finally(() => {
                setLoadingEvent(false);
            });
    }, [uuid]);

    useEffect(() => {
        if (!event?.chatUnlocked) {
            setLoadingHistory(false);
            return;
        }

        const existingSessionId = window.localStorage.getItem(sessionStorageKey);
        if (!existingSessionId) {
            setLoadingHistory(false);
            return;
        }

        setSessionId(existingSessionId);
        fetch(`/api/public/event/${uuid}/chat?sessionId=${encodeURIComponent(existingSessionId)}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to load history");
                return res.json();
            })
            .then((data: { messages?: ChatMessage[] }) => {
                if (Array.isArray(data.messages)) {
                    setMessages(
                        data.messages.filter(
                            (msg): msg is ChatMessage =>
                                (msg.role === "user" || msg.role === "assistant") &&
                                typeof msg.content === "string"
                        )
                    );
                }
            })
            .catch(() => {
                window.localStorage.removeItem(sessionStorageKey);
                setSessionId(null);
            })
            .finally(() => {
                setLoadingHistory(false);
            });
    }, [event?.chatUnlocked, sessionStorageKey, uuid]);

    async function handleSend(eventForm: FormEvent) {
        eventForm.preventDefault();
        const content = input.trim();
        if (!content || sending) return;

        const nextMessages = [...messages, { role: "user" as const, content }];
        setMessages(nextMessages);
        setInput("");
        setSending(true);

        try {
            const res = await fetch(`/api/public/event/${uuid}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    sessionId,
                    history: messages.slice(-12),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to chat");
            }

            if (data.sessionId && typeof data.sessionId === "string") {
                setSessionId(data.sessionId);
                window.localStorage.setItem(sessionStorageKey, data.sessionId);
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply || "I couldn't generate a response." },
            ]);
        } catch (error) {
            setMessages(messages);
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setSending(false);
        }
    }

    if (loadingEvent || loadingHistory) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="w-full max-w-lg">
                    <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">Event not found.</p>
                        <Link href="/" className="inline-block mt-4">
                            <Button variant="outline">Back Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!event.aiQaEnabled) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>AI Chat Not Enabled</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            The listing agent has not enabled AI Property Q&A for this event.
                        </p>
                        <Link href={`/oh/${uuid}`}>
                            <Button variant="outline">Back to Sign-in</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!event.chatUnlocked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Sign In First</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            AI Home Q&A unlocks after the visitor completes the sign-in form.
                        </p>
                        <Link href={`/oh/${uuid}`}>
                            <Button variant="outline">Back to Sign-in</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div
                className="border-b border-border/40 px-4 py-4"
                style={{ background: `linear-gradient(135deg, ${primaryColor}18, ${primaryColor}06)` }}
            >
                <div className="mx-auto max-w-3xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={`/oh/${uuid}`}>
                            <Button variant="ghost" size="icon" aria-label="Back">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold">{event.propertyAddress}</h1>
                            <p className="text-xs text-muted-foreground">AI Property Q&A</p>
                        </div>
                    </div>
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                    </Badge>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-6">
                <Card className="border-border/50">
                    <CardContent className="p-4 space-y-4">
                        <div className="h-[55vh] overflow-y-auto rounded-lg border border-border/40 bg-muted/20 p-3 space-y-3">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-center px-6">
                                    <p className="text-sm text-muted-foreground">
                                        Ask anything about the property, neighborhood, or next steps.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={`${message.role}-${index}`}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${message.role === "user"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-card border border-border/40"
                                                }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))
                            )}
                            {sending && (
                                <div className="flex justify-start">
                                    <div className="rounded-xl px-3 py-2 text-sm bg-card border border-border/40">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={sending}
                            />
                            <Button type="submit" disabled={sending || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
