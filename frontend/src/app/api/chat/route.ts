import { NextResponse } from "next/server";

// Stub API route — placeholder for future chat endpoint integration
export async function POST() {
    return NextResponse.json(
        { message: "Chat endpoint not yet implemented" },
        { status: 501 }
    );
}
