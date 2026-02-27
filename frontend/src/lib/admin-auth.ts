// ─── Admin Auth Context (Frontend Mock) ──────────────────────────────────────
// Simulated user role for frontend-only role-based access.
// Replace with real auth context when backend is connected.

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "clinician" | "viewer";
    avatar?: string;
}

// Mock admin user — used for role-based sidebar rendering
export const currentUser: AdminUser = {
    id: "u-001",
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@cogecho.health",
    role: "admin",
};

// Role-based nav visibility config
export const rolePermissions: Record<string, string[]> = {
    admin: [
        "Dashboard",
        "Patients",
        "Assessments",
        "Messages",
        "Reports",
        "Settings",
    ],
    clinician: ["Dashboard", "Patients", "Assessments", "Messages", "Reports"],
    viewer: ["Dashboard", "Reports"],
};

export function canAccessNavItem(
    role: AdminUser["role"],
    itemName: string
): boolean {
    return rolePermissions[role]?.includes(itemName) ?? false;
}
