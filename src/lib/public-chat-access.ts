const COOKIE_PREFIX = "oh-chat-access";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export function getPublicChatAccessCookieName(uuid: string) {
  return `${COOKIE_PREFIX}-${uuid}`;
}

export function hasPublicChatAccessCookie(
  cookieStore: { get: (name: string) => { value?: string } | undefined },
  uuid: string
) {
  return cookieStore.get(getPublicChatAccessCookieName(uuid))?.value === "granted";
}

export function buildPublicChatAccessCookie(uuid: string) {
  return {
    name: getPublicChatAccessCookieName(uuid),
    value: "granted",
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  };
}
