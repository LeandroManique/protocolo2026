import React, { useState } from "react";
import { Mail, Key, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../services/supabaseClient";

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Informe seu email." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "ok", text: "Link enviado. Verifique seu email." });
  };

  const handlePassword = async () => {
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Preencha email e senha." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const authFn = isSignUp
      ? supabase.auth.signUp({ email: email.trim(), password })
      : supabase.auth.signInWithPassword({ email: email.trim(), password });
    const { error } = await authFn;
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "ok",
      text: isSignUp ? "Conta criada. Verifique seu email." : "Login realizado.",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-gray-100 shadow-sm p-8">
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            Acesso
          </p>
          <h1 className="text-4xl font-black tracking-tight">Arthur</h1>
          <p className="text-gray-500 text-sm mt-2">
            Entre para acessar o app. Use o mesmo email da compra.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("magic")}
            className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 border ${
              mode === "magic" ? "border-black text-black" : "border-gray-200 text-gray-400"
            }`}
          >
            Link
          </button>
          <button
            onClick={() => setMode("password")}
            className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 border ${
              mode === "password" ? "border-black text-black" : "border-gray-200 text-gray-400"
            }`}
          >
            Senha
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
              Email
            </label>
            <div className="flex items-center border border-gray-200 px-3 py-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="ml-3 flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Senha
              </label>
              <div className="flex items-center border border-gray-200 px-3 py-3">
                <Key className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="ml-3 flex-1 outline-none text-sm"
                />
              </div>
              <button
                onClick={() => setIsSignUp((prev) => !prev)}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                {isSignUp ? "Ja tenho conta" : "Criar conta"}
              </button>
            </div>
          )}

          <button
            onClick={mode === "magic" ? handleMagicLink : handlePassword}
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Continuar"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div
            className={`mt-6 text-xs font-medium border px-3 py-2 flex items-center gap-2 ${
              message.type === "ok"
                ? "border-green-200 text-green-700 bg-green-50"
                : "border-red-200 text-red-700 bg-red-50"
            }`}
          >
            {message.type === "ok" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
