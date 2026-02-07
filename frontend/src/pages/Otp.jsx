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

      // ✅ OTP verified → go to dashboard
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-[#0f1419] p-8 rounded-xl w-80">

        <h2 className="text-white text-xl text-center mb-2">
          Verify OTP
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          OTP sent to your official college email
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full p-2 rounded bg-black border border-gray-700 text-white text-center tracking-widest"
        />

        {error && (
          <p className="text-red-400 text-sm text-center mt-3">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-4 bg-[#1d9bf0] py-2 rounded text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

