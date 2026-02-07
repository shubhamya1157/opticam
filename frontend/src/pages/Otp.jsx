import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Data passed from Login.jsx
  const {
    email, // 🟢 Get email
    collegeId,
    name,
    year,
    semester,
    branch,
    section,
    role
  } = location.state || {};

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email) { // 🟢 Check for email
      setError("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/verify-otp", {
        email, // 🟢 Send email
        otp,
        userDetails: {
          collegeId, // Pass collegeId in userDetails if needed
          name,
          year,
          semester,
          branch,
          section,
          role
        }
      });

      // 💾 Save Token & User
      if (res.data.token) {
        console.log("✅ Token received & saved:", res.data.token.substring(0, 10) + "...");
        localStorage.setItem("token", res.data.token);
      } else {
        console.error("❌ No token received from backend!");
      }
      localStorage.setItem("opticam_user", JSON.stringify(res.data.user));

      // ✅ OTP verified → go to dashboard
      console.log("navigating to dashboard");
      navigate("/dashboard", {
        state: { user: res.data.user }
      });

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center transition-colors duration-300">
      <div className="bg-[var(--bg-secondary)] p-8 rounded-xl w-80 shadow-xl border border-[var(--border-color)]">

        <h2 className="text-[var(--text-primary)] text-xl text-center mb-2 font-bold">
          Verify OTP
        </h2>

        <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
          OTP sent to your official college email
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-center tracking-widest outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
        />

        {error && (
          <p className="text-red-500 text-sm text-center mt-3 bg-red-100 dark:bg-red-500/10 p-1.5 rounded-lg">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-4 bg-[#1d9bf0] hover:bg-[#1a8cd8] py-2 rounded-lg text-white font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
