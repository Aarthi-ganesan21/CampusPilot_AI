import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Home, Coffee, ClipboardList, Send, MapPin, Phone, Mail, ChevronRight, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HostelRequest {
  id: string;
  type: "Room Change" | "Outing Pass" | "Maintenance Complaint" | "Room Allocation";
  description: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  details?: string;
}

export default function StudentHostel() {
  const { showToast } = useToast();

  // Selected day for mess menu
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // Form states
  const [requestType, setRequestType] = useState<HostelRequest["type"]>("Outing Pass");
  const [description, setDescription] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // In-memory request history state
  const [history, setHistory] = useState<HostelRequest[]>([
    {
      id: "req1",
      type: "Outing Pass",
      description: "Weekend home visit outing pass.",
      date: "2026-07-10",
      status: "Approved",
      details: "Destination: Bangalore. Leaving on 10th morning, returning 12th evening."
    },
    {
      id: "req2",
      type: "Maintenance Complaint",
      description: "AC cooling issue in room 305-B.",
      date: "2026-07-03",
      status: "Pending",
      details: "Category: Electrical / AC unit. AC runs but compressor fails to blow cold air."
    }
  ]);

  // Realistic Mess Menu Catalog
  const messMenus: Record<string, { breakfast: string; lunch: string; snacks: string; dinner: string }> = {
    Monday: {
      breakfast: "Puri Masala, Fresh Fruit, Bread & Jam, Milk/Tea",
      lunch: "Steamed Rice, South Indian Sambar, Beetroot Poriyal, Rasam, Curd, Papad",
      snacks: "Samosa, Hot Filter Coffee/Tea",
      dinner: "Phulka Chapati, Dal Tadka, Veg Pulao, Butter Milk, Sweet Kesari"
    },
    Tuesday: {
      breakfast: "Idli & Vada, Coconut Chutney, Sambar, Milk/Tea",
      lunch: "Jeera Rice, Gujarati Kadhi, Aloo Gobbi Fry, Chapati, Rasam, Curd",
      snacks: "Veg Cutlet, Tea/Coffee",
      dinner: "Tandoori Roti, Paneer Butter Masala, Peas Pulao, Fruit Salad"
    },
    Wednesday: {
      breakfast: "Aloo Paratha with Curd, Pickle, Boiled Egg, Tea/Milk",
      lunch: "Steamed Rice, Kara Kuzhambu, Cabbage Carrot Poriyal, Appalam, Rasam, Curd",
      snacks: "Onion Pakoda, Ginger Tea/Coffee",
      dinner: "Naan, Malai Kofta Curry, Fried Rice, Ice Cream Cup"
    },
    Thursday: {
      breakfast: "Rava Upma with Chutney, Banana, Bread Toast, Tea/Milk",
      lunch: "Veg Biryani, Onion Raitha, Bread Halwa, Chapati with Dal, Curd",
      snacks: "Aloo Bonda, Tea/Coffee",
      dinner: "Chapati, Mixed Veg Sabzi, Steamed Rice, Tomato Rasam, Curd"
    },
    Friday: {
      breakfast: "Dosa with Tomato & Coconut Chutneys, Sambar, Milk/Tea",
      lunch: "Steamed Rice, Keerai Kootu, Potato Fry, Rasam, Butter Milk, Papad",
      snacks: "Sweet Kozhukattai, Tea/Coffee",
      dinner: "Phulka, Chana Masala, Jeera Rice, Fruit Custard"
    },
    Saturday: {
      breakfast: "Bread Omelette / Cheese Toast, Cornflakes, Tea/Milk",
      lunch: "Steamed Rice, Drumstick Sambar, Yam Fry, Rasam, Curd, Pickle",
      snacks: "Biscuits & Rusk, Tea/Coffee",
      dinner: "Rumali Roti, Egg Masala / Veg Kadhai, Veg Biryani, Raitha, Gulab Jamun"
    },
    Sunday: {
      breakfast: "Masala Dosa, Sambar, Mint Chutney, Tea/Coffee",
      lunch: "Special Chicken Biryani / Paneer Biryani, Raitha, Boiled Egg, Ice Cream",
      snacks: "Samosa / Puffs, Tea/Coffee",
      dinner: "Soft Chapati, Butter Chicken / Paneer Butter Masala, Ghee Rice, Rasam, Curd"
    }
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast("Please enter a short request description.", "error");
      return;
    }

    if (!requestDate) {
      showToast("Please pick a request date.", "error");
      return;
    }

    const newReq: HostelRequest = {
      id: "req_" + Math.random().toString(36).substr(2, 9),
      type: requestType,
      description,
      date: requestDate,
      status: "Pending",
      details: additionalDetails.trim() || undefined
    };

    setHistory((prev) => [newReq, ...prev]);
    setDescription("");
    setRequestDate("");
    setAdditionalDetails("");
    showToast(`${requestType} submitted successfully and logged in history!`, "success");
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="hostel-spec-container">
      {/* Top Dossier Title */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel & Housing Management</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Review hostel block specifications, track warden contact channels, filter weekly mess menus, and log support requests.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Hand: Hostel specs + Mess Menu */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Hostel specs and Warden contact */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm grid md:grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-6 translate-x-6"></div>
            
            {/* Housing specs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Home size={14} className="text-indigo-600" /> Housing Specifications
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Block / Hostel</span>
                  <span className="text-base font-extrabold text-slate-900">Aryabhata Block (Men's)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Room No</span>
                    <span className="text-sm font-extrabold text-slate-800">305-B (Third Floor)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sharing Type</span>
                    <span className="text-sm font-extrabold text-slate-800">2-Sharing (AC Deluxe)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warden Profile */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hostel Warden details</h4>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <p className="text-slate-800 font-extrabold">Dr. K. Raghavan</p>
                  <p className="text-[10px] text-slate-400 font-medium">Chief Block Warden</p>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <a href="tel:+919443210987" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <Phone size={12} className="text-slate-400" /> +91 94432 10987
                  </a>
                  <a href="mailto:warden.aryabhata@campuspilot.edu" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    <Mail size={12} className="text-slate-400" /> warden.aryabhata@campuspilot.edu
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* MESS MENU CONTAINER */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Coffee size={18} className="text-indigo-600" /> Mess Menu Catalog
              </h4>
              {/* Day filter buttons */}
              <div className="flex flex-wrap gap-1">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedDay === day ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-600"}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mess Menu items */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Breakfast", desc: messMenus[selectedDay].breakfast, iconBg: "bg-amber-50 text-amber-700 border-amber-100" },
                { title: "Lunch", desc: messMenus[selectedDay].lunch, iconBg: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { title: "Snacks", desc: messMenus[selectedDay].snacks, iconBg: "bg-orange-50 text-orange-700 border-orange-100" },
                { title: "Dinner", desc: messMenus[selectedDay].dinner, iconBg: "bg-indigo-50 text-indigo-700 border-indigo-100" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex gap-3 items-start">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${item.iconBg}`}>
                    {item.title}
                  </span>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-relaxed leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Submitting & Request History */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Support Ticket Submission form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-indigo-600" /> Hostel Requests Panel
            </h4>

            <form onSubmit={handleAddRequest} className="space-y-4">
              {/* Request Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as HostelRequest["type"])}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="Outing Pass">Outing Pass (Gate Clearance)</option>
                  <option value="Maintenance Complaint">Maintenance Complaint (AC, Electrical, Plumbing)</option>
                  <option value="Room Change">Room Change Petition</option>
                  <option value="Room Allocation">New Room Allocation request</option>
                </select>
              </div>

              {/* Request Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Target Date</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                />
              </div>

              {/* Short summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Short Summary</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Electrical fan speed regulator broken"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                />
              </div>

              {/* Description / details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Elaborate details (Optional)</label>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Provide precise details, room number reference, or contact preference..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                id="submit-hostel-req-btn"
              >
                <Send size={14} /> Submit Support Request
              </button>
            </form>
          </div>

          {/* REQUEST HISTORY LIST */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900">Request & Outing History</h4>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {history.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl space-y-2 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        {req.type}
                      </span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{req.description}</p>
                    </div>
                    {req.status === "Approved" ? (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <CheckCircle2 size={10} /> {req.status}
                      </span>
                    ) : req.status === "Rejected" ? (
                      <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <XCircle size={10} /> {req.status}
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <Clock size={10} /> {req.status}
                      </span>
                    )}
                  </div>
                  {req.details && (
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-white/65 p-2 rounded-lg border border-slate-100">
                      {req.details}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 font-bold">Submitted Date: {req.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
