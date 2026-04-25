import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function AuthChoice() {
  const { continueAsGuest } = useUser();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      
      <h1 className="text-2xl font-bold text-lavender">
        Welcome to Rithuma 🌸
      </h1>

      <button
        onClick={() => {
          continueAsGuest();
          navigate("/");
        }}
        className="bg-lavender text-white px-6 py-3 rounded-xl"
      >
        Continue as Guest
      </button>

      <button
        onClick={() => navigate("/auth")}
        className="border border-lavender text-lavender px-6 py-3 rounded-xl"
      >
        Login / Signup
      </button>
    </div>
  );
}