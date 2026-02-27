import { mockApiCall } from "./api";

export interface UserSession {
    token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        institution: string;
    };
}

export async function login(email: string, password: string): Promise<UserSession> {
    if (!email || !password) {
        throw new Error("Invalid credentials");
    }

    const session: UserSession = {
        token: "mock-jwt-token-12345",
        user: {
            id: "u_8492",
            firstName: "Dr. Jane",
            lastName: "Smith",
            email: email,
            institution: "Stanford Medical Research",
        }
    };

    if (typeof window !== "undefined") {
        localStorage.setItem("session_token", session.token);
        localStorage.setItem("session_user", JSON.stringify(session.user));
        document.cookie = `session_token=${session.token}; path=/; max-age=86400`;
    }

    return await mockApiCall(session, 1200);
}

export async function register(data: Record<string, any>): Promise<UserSession> {
    const session: UserSession = {
        token: "mock-jwt-token-12345",
        user: {
            id: "u_" + Math.floor(Math.random() * 10000),
            firstName: data.firstName || "New",
            lastName: data.lastName || "User",
            email: data.email,
            institution: data.institution || "Independent Researcher",
        }
    };

    if (typeof window !== "undefined") {
        localStorage.setItem("session_token", session.token);
        localStorage.setItem("session_user", JSON.stringify(session.user));
        document.cookie = `session_token=${session.token}; path=/; max-age=86400`;
    }

    return await mockApiCall(session, 1500);
}

export function logout() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("session_token");
        localStorage.removeItem("session_user");
        document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

export function getSession(): UserSession | null {
    if (typeof window === "undefined") return null;

    try {
        const token = localStorage.getItem("session_token");
        const userStr = localStorage.getItem("session_user");

        if (token && userStr) {
            return {
                token,
                user: JSON.parse(userStr)
            };
        }
    } catch {
        return null;
    }
    return null;
}
