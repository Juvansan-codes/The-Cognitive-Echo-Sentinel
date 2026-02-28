import { supabase } from "@/lib/supabase";

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

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.session) {
        throw new Error(error?.message || "Login failed");
    }

    const { session } = data;

    return {
        token: session.access_token,
        user: {
            id: session.user.id,
            firstName: session.user.user_metadata?.firstName || "Unknown",
            lastName: session.user.user_metadata?.lastName || "",
            email: session.user.email || "",
            institution: session.user.user_metadata?.institution || "",
        }
    };
}

export async function register(data: Record<string, any>): Promise<UserSession> {
    const { email, password, firstName, lastName, institution } = data;

    if (!email || !password) {
        throw new Error("Email and password are required.");
    }

    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                firstName,
                lastName,
                institution
            }
        }
    });

    if (error || !authData.session) {
        throw new Error(error?.message || "Registration failed.");
    }

    const { session } = authData;

    return {
        token: session.access_token,
        user: {
            id: session.user.id,
            firstName: session.user.user_metadata?.firstName || "Unknown",
            lastName: session.user.user_metadata?.lastName || "",
            email: session.user.email || "",
            institution: session.user.user_metadata?.institution || "",
        }
    };
}

export async function logout() {
    await supabase.auth.signOut();
}

export async function getSession(): Promise<UserSession | null> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    return {
        token: session.access_token,
        user: {
            id: session.user.id,
            firstName: session.user.user_metadata?.firstName || "Unknown",
            lastName: session.user.user_metadata?.lastName || "",
            email: session.user.email || "",
            institution: session.user.user_metadata?.institution || "",
        }
    };
}
