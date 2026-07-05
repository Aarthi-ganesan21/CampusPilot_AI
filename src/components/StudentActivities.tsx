import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Sparkles, Compass, Target, Users, Calendar, Trophy, BookOpen, ChevronRight } from "lucide-react";

interface ClubItem {
  id: string;
  name: string;
  category: "Clubs" | "Hackathons" | "NSS" | "NCC" | "Sports" | "Cultural Activities" | "Workshops";
  lead: string;
  description: string;
  members: number;
  joined: boolean;
}

export default function StudentActivities({ subTab = "Clubs" }: { subTab?: string }) {
  const { showToast } = useToast();

  const [activitiesList, setActivitiesList] = useState<ClubItem[]>([
    { id: "a1", name: "AI & Robotics Developers Club", category: "Clubs", lead: "Dr. Prem Kumar", description: "Build deep neural nets, edge intelligence systems, and competitive IoT prototypes.", members: 142, joined: false },
    { id: "a2", name: "CampusPilot AI-thon Hackathon", category: "Hackathons", lead: "Prof. Priya", description: "Vibrant 36-hour code sprint to ship next-gen full-stack generative-AI applications.", members: 310, joined: false },
    { id: "a3", name: "National Service Scheme (NSS Unit II)", category: "NSS", lead: "Dr. Suresh V.", description: "Community youth service, medical aid camps, and local rural development initiatives.", members: 180, joined: true },
    { id: "a4", name: "NCC Army Wing (2 TN Battalion)", category: "NCC", lead: "Lt. Col. Rajesh", description: "Elite leadership training, state parade clearance, and discipline bootcamps.", members: 75, joined: false },
    { id: "a5", name: "Varsity Athletic & Football Team", category: "Sports", lead: "Coach K. Mani", description: "Inter-collegiate championships, morning drill schedules, and track trials.", members: 48, joined: false },
    { id: "a6", name: "Symphony & Fine Arts Society", category: "Cultural Activities", lead: "Ms. Shalini", description: "Annual cultural gala coordinate, street theatre, and classic fusion music bands.", members: 120, joined: true }
  ]);

  const handleToggleJoin = (id: string, name: string, joined: boolean) => {
    setActivitiesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, joined: !joined } : item))
    );
    showToast(
      joined
        ? `Successfully left ${name}.`
        : `Successfully joined ${name}! Welcome aboard!`,
      "success"
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="activities-subtab-container">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">College Activities Hub</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Join interest clubs, register for multi-day hackathons, or enlist in national service branches.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Main interactive catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Student Societies & Programs Registry</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">ACTIVE REGISTRY</span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {activitiesList.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/10 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">{item.category}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.members} members</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-slate-800 leading-normal">{item.name}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed leading-normal">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100/55 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">Faculty Lead: {item.lead}</span>
                    <button
                      onClick={() => handleToggleJoin(item.id, item.name, item.joined)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${item.joined ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"}`}
                    >
                      {item.joined ? "Joined ✓" : "Enlist Society"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column highlights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Trophy size={16} className="text-indigo-600" /> Upcoming Culturals & Sports
            </h4>
            <div className="space-y-3">
              {[
                { title: "Annual Inter-Block Athletics Meet", date: "July 20, 2026", award: "Cash Prizes worth Rs. 20,000" },
                { title: "FUSION 2026: Intercollegiate Cultural Gala", date: "August 04, 2026", award: "Exclusive trophy & certificates" }
              ].map((ev, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-xs font-bold text-slate-800 leading-normal">{ev.title}</p>
                  <p className="text-[10px] text-indigo-600 font-extrabold">{ev.date}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{ev.award}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Target size={16} className="text-indigo-600" /> NSS & NCC Drill Schedules
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              NCC Cadet drills commence every Saturday morning at 06:30 AM at the varsity main athletics ground. NSS volunteers report to Seminar Hall A on Wednesday afternoon for community mapping.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
