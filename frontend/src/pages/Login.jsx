import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  IdCard,
  GraduationCap,
  BookOpen,
  Layers
} from "lucide-react";

import logo from "../assets/opticam-logo.png";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  // 🔹 form states
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 College ID format validation
  // example: 2025kucp1097
  const collegeIdRegex = /^[0-9]{4}[a-z]{4}[0-9]{4}$/;

  const handleContinue = async () => {
    // 1️⃣ check empty fields
    if (!name || !email || !collegeId || !year || !semester || !branch || !section) {
      setError("Please fill all required fields");
      return;
    }

    // 2️⃣ validate college id
    if (!collegeIdRegex.test(collegeId)) {
      setError("College ID format invalid (e.g. 2025kucp1097)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 3️⃣ Send email & collegeId to backend
      console.log("📤 Sending OTP Request:", { email, collegeId });
      const res = await api.post("/auth/send-otp", {
        email,
        collegeId
      });

      console.log("📥 Server Response Data:", res.data);

      if (res.data.success || res.data.msg === "OTP sent") {
        // 4️⃣ Go to OTP page
        navigate("/otp", {
          state: {
            email,
            collegeId,
            name,
            year,
            semester,
            branch,
            section,
            role
          }
        });
      } else {
        setError("Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        console.error("❌ Server Error Response:", err.response.data);
        setError(err.response.data?.message || err.response.data?.msg || "Server returned error");
      } else if (err.request) {
        console.error("❌ No Response from Server");
        setError("Network error: Server not reachable. Check if backend is running on port 5001.");
      } else {
        console.error("❌ Request Setup Error:", err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-8 border border-[var(--border-color)]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="OptiCam Logo"
            className="w-24 h-24 rounded-full border border-[var(--border-color)] p-1 bg-[var(--bg-tertiary)] mb-4"
          />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">OptiCam</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Optimize Your Campus Time
          </p>
        </div>

        {/* Role */}
        <div className="flex mb-6 bg-[var(--bg-tertiary)] rounded-xl p-1 border border-[var(--border-color)]">
          <button
            onClick={() => setRole("student")}
            className={`w-1/2 py-2 rounded-xl flex justify-center gap-2 font-medium transition-all ${role === "student"
              ? "bg-[#1d9bf0] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <User size={18} /> Student
          </button>

          <button
            onClick={() => setRole("cr")}
            className={`w-1/2 py-2 rounded-xl flex justify-center gap-2 font-medium transition-all ${role === "cr"
              ? "bg-[#1d9bf0] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Users size={18} /> CR
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Name */}
          <Field icon={<User size={18} />}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            />
          </Field>

          {/* College ID */}
          <Field icon={<IdCard size={18} />}>
            <input
              type="text"
              placeholder="College ID (2025kucp1097)"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value.toLowerCase())}
              className="w-full bg-transparent px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            />
          </Field>

          {/* Year */}
          <Select icon={<GraduationCap size={18} />} value={year} setValue={setYear}>
            <option value="">Select Year</option>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </Select>

          {/* Semester */}
          <Select icon={<BookOpen size={18} />} value={semester} setValue={setSemester}>
            <option value="">Select Semester</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 3</option>
            <option>Semester 4</option>
            <option>Semester 5</option>
            <option>Semester 6</option>
            <option>Semester 7</option>
            <option>Semester 8</option>
          </Select>

          {/* Branch */}
          <Select icon={<Layers size={18} />} value={branch} setValue={setBranch}>
            <option value="">Select Branch</option>
            <option>CSE</option>
            <option>AI-DE</option>
            <option>ECE</option>
          </Select>

          {/* Section */}
          <Select icon={<Users size={18} />} value={section} setValue={setSection}>
            <option value="">Select Section</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </Select>

          {/* Email */}
          <Field icon={<User size={18} />}>
            <input
              type="email"
              placeholder="Email (e.g. personal or college)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            />
          </Field>

        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center bg-red-100 dark:bg-red-500/10 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg ${loading
            ? "bg-[#1d9bf0]/50 cursor-not-allowed text-white/50"
            : "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white cursor-pointer shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Continue"
          )}
        </button>

        <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
          OTP will be sent to your official institute email
        </p>
      </div>
    </div>
  );
}

/* 🔹 Reusable components */

function Field({ icon, children }) {
  return (
    <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 transition-colors focus-within:border-[#1d9bf0] focus-within:ring-1 focus-within:ring-[#1d9bf0]">
      <span className="text-[var(--text-secondary)]">{icon}</span>
      {children}
    </div>
  );
}

function Select({ icon, value, setValue, children }) {
  return (
    <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 transition-colors focus-within:border-[#1d9bf0]">
      <span className="text-[var(--text-secondary)]">{icon}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent px-3 py-2 text-[var(--text-primary)] focus:outline-none cursor-pointer placeholder:text-[var(--text-secondary)]"
      >
        {children}
      </select>
    </div>
  );
}
