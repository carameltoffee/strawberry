import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type LoginReq, type RegisterReq } from "../../api/api_client";
import { useNavigate } from 'react-router-dom';

type AuthMode = "login" | "register";

export default function AuthForm() {
     const navigate = useNavigate();
     const [searchParams] = useSearchParams();
     const modeFromUrl = searchParams.get("mode");

     const initialMode: AuthMode = modeFromUrl === "register" ? "register" : "login";
     const [authMode, setAuthMode] = useState<AuthMode>(initialMode);

     const [username, setUsername] = useState("");
     const [password, setPassword] = useState("");
     const [fullName, setFullName] = useState("");
     const [error, setError] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          if (modeFromUrl === "register" || modeFromUrl === "login") {
               setAuthMode(modeFromUrl);
               setUsername("");
               setPassword("");
               setFullName("");
               setError(null);
          }
     }, [modeFromUrl]);

     const toggleMode = () => {
          const newMode = authMode === "login" ? "register" : "login";
          setAuthMode(newMode);
          setUsername("");
          setPassword("");
          setFullName("");
          setError(null);
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          try {
               if (authMode === "login") {
                    const input: LoginReq = { username, password };
                    const { token } = await api.login(input);
                    localStorage.setItem("token", token);
                    console.log("Logged in with token:", token);
               } else {
                    const input: RegisterReq = {
                         full_name: fullName,
                         username,
                         password,
                    };
                    const { id } = await api.register(input);
                    console.log("Registered user ID:", id);
                    toggleMode();
               }
          } catch (err: any) {
               setError(err.message || "Something went wrong");
          } finally {
               setLoading(false);
          }
          navigate('/user');
     };

     return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
               <div className="w-full max-w-sm p-8 bg-white rounded shadow">
                    <h2 className="mb-6 text-2xl font-bold text-center">
                         {authMode === "login" ? "Login" : "Register"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         {authMode === "register" && (
                              <input
                                   type="text"
                                   placeholder="Full Name"
                                   value={fullName}
                                   onChange={(e) => setFullName(e.target.value)}
                                   required
                                   className="w-full px-4 py-2 border rounded"
                              />
                         )}
                         <input
                              type="text"
                              placeholder="Username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              className="w-full px-4 py-2 border rounded"
                         />
                         <input
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="w-full px-4 py-2 border rounded"
                         />
                         <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                         >
                              {loading
                                   ? "Please wait..."
                                   : authMode === "login"
                                        ? "Login"
                                        : "Register"}
                         </button>
                         {error && <p className="text-sm text-red-600">{error}</p>}
                    </form>
                    <p className="mt-4 text-center text-sm">
                         {authMode === "login"
                              ? "Don't have an account?"
                              : "Already have an account?"}{" "}
                         <button onClick={toggleMode} className="text-blue-600 underline">
                              {authMode === "login" ? "Register here" : "Login here"}
                         </button>
                    </p>
               </div>
          </div>
     );
}
