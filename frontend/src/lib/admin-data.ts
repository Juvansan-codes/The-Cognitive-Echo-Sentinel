// ─── Admin Dashboard Mock Data ───────────────────────────────────────────────
// All data is local placeholder. Structured for future API integration.

export interface Patient {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    latestRiskLevel: "Baseline" | "Mild Deviation" | "Significant Deviation";
    lastAssessmentDate: string;
    reviewStatus: "Reviewed" | "Pending";
}

export interface Assessment {
    id: string;
    patientId: string;
    patientName: string;
    acousticRiskScore: number;
    cognitiveRiskScore: number;
    finalNeuroRisk: number;
    riskLevel: "Baseline" | "Mild Deviation" | "Significant Deviation";
    confidenceScore: number;
    date: string;
    reviewStatus: "Reviewed" | "Pending";
    transcript: string;
    audioDuration: string;
}

export interface ClinicalNote {
    id: string;
    text: string;
    timestamp: string;
}

export interface GuidanceMessage {
    id: string;
    text: string;
    timestamp: string;
    sentBy: string;
}

export interface TrendDataPoint {
    date: string;
    acousticRisk: number;
    cognitiveRisk: number;
    neuroRisk: number;
}

export interface AdminMessage {
    id: string;
    patientId: string;
    patientName: string;
    content: string;
    timestamp: string;
    type: "guidance" | "follow-up" | "notification";
    read: boolean;
}

// ─── Dummy Patients ──────────────────────────────────────────────────────────

export const patients: Patient[] = [
    {
        id: "p-001",
        name: "Eleanor Whitfield",
        email: "e.whitfield@example.com",
        age: 72,
        gender: "Female",
        latestRiskLevel: "Significant Deviation",
        lastAssessmentDate: "2026-02-26",
        reviewStatus: "Pending",
    },
    {
        id: "p-002",
        name: "James Hartley",
        email: "j.hartley@example.com",
        age: 68,
        gender: "Male",
        latestRiskLevel: "Mild Deviation",
        lastAssessmentDate: "2026-02-25",
        reviewStatus: "Reviewed",
    },
    {
        id: "p-003",
        name: "Maria Santos",
        email: "m.santos@example.com",
        age: 75,
        gender: "Female",
        latestRiskLevel: "Baseline",
        lastAssessmentDate: "2026-02-24",
        reviewStatus: "Reviewed",
    },
    {
        id: "p-004",
        name: "Robert Chen",
        email: "r.chen@example.com",
        age: 64,
        gender: "Male",
        latestRiskLevel: "Mild Deviation",
        lastAssessmentDate: "2026-02-23",
        reviewStatus: "Pending",
    },
    {
        id: "p-005",
        name: "Patricia Okonkwo",
        email: "p.okonkwo@example.com",
        age: 70,
        gender: "Female",
        latestRiskLevel: "Baseline",
        lastAssessmentDate: "2026-02-22",
        reviewStatus: "Reviewed",
    },
    {
        id: "p-006",
        name: "William Foster",
        email: "w.foster@example.com",
        age: 79,
        gender: "Male",
        latestRiskLevel: "Significant Deviation",
        lastAssessmentDate: "2026-02-21",
        reviewStatus: "Pending",
    },
    {
        id: "p-007",
        name: "Susan Nakamura",
        email: "s.nakamura@example.com",
        age: 66,
        gender: "Female",
        latestRiskLevel: "Baseline",
        lastAssessmentDate: "2026-02-20",
        reviewStatus: "Reviewed",
    },
    {
        id: "p-008",
        name: "David Kowalski",
        email: "d.kowalski@example.com",
        age: 71,
        gender: "Male",
        latestRiskLevel: "Mild Deviation",
        lastAssessmentDate: "2026-02-19",
        reviewStatus: "Pending",
    },
];

// ─── Dummy Assessments ───────────────────────────────────────────────────────

export const assessments: Assessment[] = [
    {
        id: "a-001",
        patientId: "p-001",
        patientName: "Eleanor Whitfield",
        acousticRiskScore: 78,
        cognitiveRiskScore: 82,
        finalNeuroRisk: 80,
        riskLevel: "Significant Deviation",
        confidenceScore: 0.91,
        date: "2026-02-26",
        reviewStatus: "Pending",
        transcript:
            "Doctor, I've been noticing some changes in my memory lately. Sometimes I walk into a room and completely forget why I went there. My daughter says I've been repeating stories more often. I used to be very sharp with numbers, but now I find myself struggling with basic calculations when I'm shopping. The other day, I couldn't remember the name of a restaurant we've been going to for twenty years. It's quite frustrating and a bit scary, to be honest. I've also been having trouble sleeping, which I think might be making things worse. My appetite has been okay, and I'm still taking my daily walks, though I sometimes lose track of which route I've taken.",
        audioDuration: "3:42",
    },
    {
        id: "a-002",
        patientId: "p-002",
        patientName: "James Hartley",
        acousticRiskScore: 45,
        cognitiveRiskScore: 52,
        finalNeuroRisk: 48,
        riskLevel: "Mild Deviation",
        confidenceScore: 0.87,
        date: "2026-02-25",
        reviewStatus: "Reviewed",
        transcript:
            "Well, I think I've been doing alright overall. I still drive to the grocery store and manage my own finances. My wife noticed that I sometimes pause longer when trying to find the right word, but I think that happens to everyone my age. I've been staying active, playing chess with my friends every Wednesday. I did forget about a dentist appointment last week, which isn't like me. But I wrote it down wrong in my calendar, so it might just have been a mistake. Overall, I feel good. I'm sleeping well and eating properly.",
        audioDuration: "2:58",
    },
    {
        id: "a-003",
        patientId: "p-003",
        patientName: "Maria Santos",
        acousticRiskScore: 18,
        cognitiveRiskScore: 15,
        finalNeuroRisk: 16,
        riskLevel: "Baseline",
        confidenceScore: 0.94,
        date: "2026-02-24",
        reviewStatus: "Reviewed",
        transcript:
            "I'm feeling very well, thank you. I keep myself busy with gardening, reading, and looking after my grandchildren on weekends. I haven't noticed any significant changes in my thinking or memory. I still do the crossword puzzle every morning and I'm currently reading three books. My sleep is good, about seven hours a night. I walk two miles every day with my neighbor. No complaints really, just the usual aches and pains that come with age.",
        audioDuration: "2:15",
    },
    {
        id: "a-004",
        patientId: "p-004",
        patientName: "Robert Chen",
        acousticRiskScore: 42,
        cognitiveRiskScore: 55,
        finalNeuroRisk: 49,
        riskLevel: "Mild Deviation",
        confidenceScore: 0.83,
        date: "2026-02-23",
        reviewStatus: "Pending",
        transcript:
            "I've been having some difficulty concentrating lately, especially when I'm trying to read for long periods. I used to be able to read for hours, but now I find my mind wandering after about thirty minutes. My son mentioned that I've been a bit more forgetful about taking my medications on time. I've started using a pill organizer to help with that. Other than that, I'm still very active. I golf twice a week and I volunteer at the library.",
        audioDuration: "2:30",
    },
    {
        id: "a-005",
        patientId: "p-006",
        patientName: "William Foster",
        acousticRiskScore: 85,
        cognitiveRiskScore: 79,
        finalNeuroRisk: 82,
        riskLevel: "Significant Deviation",
        confidenceScore: 0.89,
        date: "2026-02-21",
        reviewStatus: "Pending",
        transcript:
            "Things have been a bit difficult recently. I got lost driving home from the supermarket last week, a route I've taken hundreds of times. My wife has been handling more of the household decisions because I find it hard to plan things out. I sometimes mix up my grandchildren's names, which upsets me. I've stopped cooking because I forgot to turn off the stove twice last month. I know something is changing and it worries me greatly.",
        audioDuration: "3:10",
    },
];

// ─── Trend Data (per patient) ────────────────────────────────────────────────

export const trendData: Record<string, TrendDataPoint[]> = {
    "p-001": [
        { date: "Sep", acousticRisk: 35, cognitiveRisk: 30, neuroRisk: 32 },
        { date: "Oct", acousticRisk: 42, cognitiveRisk: 45, neuroRisk: 44 },
        { date: "Nov", acousticRisk: 55, cognitiveRisk: 58, neuroRisk: 57 },
        { date: "Dec", acousticRisk: 60, cognitiveRisk: 65, neuroRisk: 63 },
        { date: "Jan", acousticRisk: 72, cognitiveRisk: 75, neuroRisk: 74 },
        { date: "Feb", acousticRisk: 78, cognitiveRisk: 82, neuroRisk: 80 },
    ],
    "p-002": [
        { date: "Sep", acousticRisk: 22, cognitiveRisk: 20, neuroRisk: 21 },
        { date: "Oct", acousticRisk: 28, cognitiveRisk: 30, neuroRisk: 29 },
        { date: "Nov", acousticRisk: 32, cognitiveRisk: 35, neuroRisk: 34 },
        { date: "Dec", acousticRisk: 38, cognitiveRisk: 42, neuroRisk: 40 },
        { date: "Jan", acousticRisk: 40, cognitiveRisk: 48, neuroRisk: 44 },
        { date: "Feb", acousticRisk: 45, cognitiveRisk: 52, neuroRisk: 48 },
    ],
    "p-003": [
        { date: "Sep", acousticRisk: 12, cognitiveRisk: 10, neuroRisk: 11 },
        { date: "Oct", acousticRisk: 14, cognitiveRisk: 12, neuroRisk: 13 },
        { date: "Nov", acousticRisk: 13, cognitiveRisk: 14, neuroRisk: 14 },
        { date: "Dec", acousticRisk: 15, cognitiveRisk: 13, neuroRisk: 14 },
        { date: "Jan", acousticRisk: 16, cognitiveRisk: 14, neuroRisk: 15 },
        { date: "Feb", acousticRisk: 18, cognitiveRisk: 15, neuroRisk: 16 },
    ],
    "p-004": [
        { date: "Sep", acousticRisk: 20, cognitiveRisk: 25, neuroRisk: 23 },
        { date: "Oct", acousticRisk: 25, cognitiveRisk: 32, neuroRisk: 29 },
        { date: "Nov", acousticRisk: 30, cognitiveRisk: 38, neuroRisk: 34 },
        { date: "Dec", acousticRisk: 35, cognitiveRisk: 45, neuroRisk: 40 },
        { date: "Jan", acousticRisk: 38, cognitiveRisk: 50, neuroRisk: 44 },
        { date: "Feb", acousticRisk: 42, cognitiveRisk: 55, neuroRisk: 49 },
    ],
    "p-006": [
        { date: "Sep", acousticRisk: 40, cognitiveRisk: 35, neuroRisk: 38 },
        { date: "Oct", acousticRisk: 50, cognitiveRisk: 48, neuroRisk: 49 },
        { date: "Nov", acousticRisk: 58, cognitiveRisk: 55, neuroRisk: 57 },
        { date: "Dec", acousticRisk: 68, cognitiveRisk: 65, neuroRisk: 67 },
        { date: "Jan", acousticRisk: 78, cognitiveRisk: 72, neuroRisk: 75 },
        { date: "Feb", acousticRisk: 85, cognitiveRisk: 79, neuroRisk: 82 },
    ],
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const adminMessages: AdminMessage[] = [
    {
        id: "m-001",
        patientId: "p-001",
        patientName: "Eleanor Whitfield",
        content:
            "Please schedule a follow-up cognitive screening within the next two weeks. Consider referral to neurology if symptoms persist.",
        timestamp: "2026-02-26T14:30:00",
        type: "guidance",
        read: false,
    },
    {
        id: "m-002",
        patientId: "p-002",
        patientName: "James Hartley",
        content:
            "Mild word-finding difficulties noted. Continue monitoring with monthly assessments. Encourage cognitive engagement activities.",
        timestamp: "2026-02-25T10:15:00",
        type: "follow-up",
        read: true,
    },
    {
        id: "m-003",
        patientId: "p-004",
        patientName: "Robert Chen",
        content:
            "Attention difficulties reported. Recommend sleep hygiene assessment and medication adherence check.",
        timestamp: "2026-02-23T09:45:00",
        type: "guidance",
        read: false,
    },
    {
        id: "m-004",
        patientId: "p-006",
        patientName: "William Foster",
        content:
            "Significant navigational and planning difficulties. Urgent referral recommended. Discuss safety measures with family.",
        timestamp: "2026-02-21T16:00:00",
        type: "guidance",
        read: false,
    },
    {
        id: "m-005",
        patientId: "p-003",
        patientName: "Maria Santos",
        content:
            "Assessment within normal range. Continue annual screening. No action required at this time.",
        timestamp: "2026-02-24T11:20:00",
        type: "notification",
        read: true,
    },
];

// ─── Risk Distribution ───────────────────────────────────────────────────────

export const riskDistribution = [
    { name: "Baseline", value: 3, color: "#12B76A" },
    { name: "Mild Deviation", value: 3, color: "#F79009" },
    { name: "Significant Deviation", value: 2, color: "#D92D20" },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getPatientById(id: string): Patient | undefined {
    return patients.find((p) => p.id === id);
}

export function getAssessmentsByPatientId(patientId: string): Assessment[] {
    return assessments.filter((a) => a.patientId === patientId);
}

export function getLatestAssessment(
    patientId: string
): Assessment | undefined {
    const patientAssessments = getAssessmentsByPatientId(patientId);
    return patientAssessments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
}

export function getTrendData(patientId: string): TrendDataPoint[] {
    return trendData[patientId] || [];
}
