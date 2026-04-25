import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { login, signup } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (mode === "login") {
        await login(email, password);
        alert("Signed in successfully ✅");
      } else {
        await signup(email, password);
        alert("Account created successfully ✅");
      }

      navigate("/", { replace: true });

    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm">

        <div className="text-center space-y-1 mb-6">
          <h2 className="text-2xl font-semibold text-lavender">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>

          <p className="text-sm text-gray-500">
            {mode === "login"
              ? "Sign in to sync your data"
              : "Create an account to protect your data"}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-lavender outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-lavender outline-none pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-lavender mt-2"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-lavender text-white py-2 rounded-xl"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          {mode === "login"
            ? "Don’t have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setMode(mode === "login" ? "signup" : "login")
            }
            className="ml-2 text-lavender font-medium"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
}
