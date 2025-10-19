// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      setError("❌ Туура эмес логин же сырсөз");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetEmail) {
      setError("❌ Email дарегиңизди киргизиңиз");
      return;
    }

    try {
      // Firebase'ке туташууну текшерүү
      await sendPasswordResetEmail(auth, resetEmail, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });
      
      setSuccess("✅ Сырсөздү калыбына келтирүү үчүн шилтеме email'ге жөнөтүлдү!");
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail("");
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Reset error:", err);
      
      if (err.code === "auth/user-not-found") {
        setError("❌ Бул email табылган жок");
      } else if (err.code === "auth/invalid-email") {
        setError("❌ Туура эмес email формат");
      } else if (err.code === "auth/network-request-failed") {
        setError("❌ Интернет байланышы жок. Текшериңиз");
      } else if (err.code === "auth/too-many-requests") {
        setError("❌ Өтө көп аракет. Бир аздан кийин кайталаңыз");
      } else {
        setError(`❌ Ката: ${err.message || "Кайра аракет кылыңыз"}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-[400px] flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🔑 Кирүү</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Сырсөз"
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold transition"
        >
          Кирүү
        </button>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="text-sm text-blue-600 hover:text-blue-800 underline transition"
        >
          Сырсөздү унуттуңузбу?
        </button>
      </form>

      {/* Password Reset Modal */}
      {showResetModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowResetModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handlePasswordReset}
              className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-[400px] flex flex-col gap-5"
            >
              <h3 className="text-xl font-bold text-center text-gray-800">
                🔄 Сырсөздү калыбына келтирүү
              </h3>
              
              <p className="text-sm text-gray-600 text-center">
                Email дарегиңизди киргизиңиз. Сизге сырсөздү калыбына келтирүү үчүн шилтеме жөнөтөбүз.
              </p>
              
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {success && <p className="text-green-500 text-sm text-center">{success}</p>}
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition"
                >
                  Жөнөтүү
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetEmail("");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md font-semibold transition"
                >
                  Жокко чыгаруу
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;