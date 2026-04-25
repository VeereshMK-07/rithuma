import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();

  if (!email) {
    setError("Email is required");
    setMessage("");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    setError("");
    setMessage("If an account exists, a reset link has been sent 📩");


  } catch (error) {
    setMessage("");

    if (error.code === "auth/user-not-found")
      setError("No account found with this email");

    else if (error.code === "auth/invalid-email")
      setError("Invalid email address");

    else
      setError("Something went wrong. Try again.");
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm space-y-6">

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-lavender">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter your registered email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-lavender outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}

          <button
            type="submit"
            className="w-full bg-lavender text-white py-2 rounded-xl"
          >
            Send Reset Link
          </button>
        </form>

        <button
          onClick={() => navigate("/auth")}
          className="text-sm text-lavender text-center w-full"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
