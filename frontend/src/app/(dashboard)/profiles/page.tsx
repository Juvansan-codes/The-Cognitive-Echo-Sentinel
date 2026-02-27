"use client";

import { useState } from "react";
import { Users, Trash2, Search } from "lucide-react";

export default function PatientProfilesPage() {
    const [patients, setPatients] = useState([
        { id: "PT-8491", name: "Robert Harrison", age: 68, gender: "M", status: "Active" },
        { id: "PT-8492", name: "Elena Rostova", age: 72, gender: "F", status: "Active" },
        { id: "PT-8504", name: "David Chen", age: 61, gender: "M", status: "Monitoring" },
        { id: "PT-8511", name: "Sarah Williams", age: 75, gender: "F", status: "Critical" },
    ]);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to remove this patient profile?")) {
            setPatients(patients.filter(p => p.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Patient Profiles</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage enrolled research participants</p>
                </div>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/50 border-b border-border text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Patient ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No patients found.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-foreground">
                                            {patient.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {patient.name}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {patient.age} yrs • {patient.gender}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    patient.status === 'Monitoring' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(patient.id)}
                                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
