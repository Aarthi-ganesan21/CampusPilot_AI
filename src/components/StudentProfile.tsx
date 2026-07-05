import React, { useState, useRef, useEffect } from "react";
import { User, UserRole } from "../types";
import { useToast } from "../context/ToastContext";
import { Camera, User as UserIcon, Mail, Phone, Calendar, MapPin, Trash2, ShieldCheck, CheckCircle, HeartPulse, CreditCard } from "lucide-react";

interface StudentProfileProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

export default function StudentProfile({ user, onUpdateUser }: StudentProfileProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile local states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state with user prop on load/change
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "9876543210");
      setDob(user.dob || "2004-05-15");
      setGender(user.gender || "Female");
      setAddress(user.address || "123, Scholars Block, Campus Hostels, Chennai, India");
      setEmergencyContact(user.emergencyContact || "9876543212");
      setAvatar(user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "User")}`);
    }
  }, [user, isEditing]); // Reset when canceling or when user changes

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "9876543210");
      setDob(user.dob || "2004-05-15");
      setGender(user.gender || "Female");
      setAddress(user.address || "123, Scholars Block, Campus Hostels, Chennai, India");
      setEmergencyContact(user.emergencyContact || "9876543212");
      setAvatar(user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "User")}`);
    }
    setIsEditing(false);
    showToast("Profile changes discarded.", "info");
  };

  // Handle Photo Select & Preview before saving
  const handlePhotoChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        showToast("Profile photo preview updated. Click 'Save Changes' to apply.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handlePhotoChange(files[0]);
    }
  };

  const handleRemovePhoto = () => {
    const defaultPic = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "User")}`;
    setAvatar(defaultPic);
    showToast("Profile photo preview cleared. Save to confirm.", "info");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Name cannot be empty.", "error");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    if (!emergencyContact.trim()) {
      showToast("Emergency contact is required.", "error");
      return;
    }

    const updated: User = {
      ...user!,
      name,
      email,
      phone,
      dob,
      gender,
      address,
      emergencyContact,
      avatarUrl: avatar,
    };

    onUpdateUser(updated);
    setIsEditing(false);
    showToast("Your profile has been updated successfully!", "success");
  };

  // Determine user ID label
  const isStudent = user?.role === UserRole.STUDENT;
  const idLabel = isStudent ? "Register Number" : "Employee ID";
  const idValue = isStudent ? (user?.rollNo || "N/A") : (user?.employeeId || "N/A");

  return (
    <div className="space-y-6 animate-fadeIn" id="student-profile-content">
      {/* Top Title Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Profile</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage your personal details, academic identification, and contact information.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
            id="profile-toggle-edit-btn"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800"
              id="profile-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              id="profile-save-btn"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Card: Avatar and Quick Stats */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center justify-between text-center space-y-6">
          <div className="w-full flex flex-col items-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full text-left mb-4">Profile Photo</h4>
            
            {/* Avatar upload region */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`relative group w-36 h-36 rounded-full flex items-center justify-center border-2 border-dashed transition-all ${isDragging ? "border-indigo-500 bg-indigo-50/50 scale-105" : "border-slate-200 hover:border-indigo-400"} ${isEditing ? "cursor-pointer" : ""}`}
              id="avatar-dropzone"
            >
              <img src={avatar} alt={name} className="w-32 h-32 rounded-full object-cover shadow-inner bg-slate-50" referrerPolicy="no-referrer" />
              
              {isEditing && (
                <div className="absolute inset-2 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity gap-1 p-2">
                  <Camera size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Upload / Drop</span>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && handlePhotoChange(e.target.files[0])}
              className="hidden" 
              accept="image/*"
            />

            {isEditing && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Choose File
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}

            <div className="mt-4">
              <h5 className="text-base font-extrabold text-slate-800">{name}</h5>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{user?.role} | Dept. of {user?.department}</p>
            </div>
          </div>

          {/* Academic Badge */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{idLabel}</span>
              <span className="text-slate-800 font-bold">{idValue}</span>
            </div>
            {isStudent && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Academic Year</span>
                <span className="text-slate-800 font-bold">{user?.yearSemester || "3rd Year / 6th Sem"}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Current Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <CheckCircle size={10} /> {user?.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Personal Information fields */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(e); }} className="space-y-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">Personal & Academic Specifications</h4>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <UserIcon size={14} className="text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> College Email ID
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* ID Display */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-400" /> {idLabel}
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={idValue}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-500 transition-all cursor-not-allowed"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-slate-400" /> Assigned Role
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={user?.role || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-500 transition-all cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> Mobile Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* DOB */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> Date of Birth
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Gender</label>
                <select
                  disabled={!isEditing}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-rose-500 animate-pulse" /> Emergency Contact
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                  placeholder="Primary Guardian contact number"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Academic Department</label>
                <input
                  type="text"
                  disabled={true}
                  value={user?.department || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-500 transition-all cursor-not-allowed"
                  title="Department can only be modified by system administrators."
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> Correspondence Address
              </label>
              <textarea
                disabled={!isEditing}
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all resize-none"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
