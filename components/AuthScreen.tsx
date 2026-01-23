import React, { useEffect, useState } from "react";
import { Mail, Key, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../services/supabaseClient";

const CHECKOUT_MENSAL = "https://pay.kiwify.com.br/cNl8xfF";
const CHECKOUT_ANUAL = "https://pay.kiwify.com.br/SImGRn4";

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMessage(null);
    if (mode === "signin") {
      setConfirmPassword("");
    }
  }, [mode]);

  const handlePassword = async () => {
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Preencha email e senha." });
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas nao conferem." });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "ok",
      text:
        mode === "signup"
          ? "Senha criada. Confirme seu email para acessar."
          : "Login realizado.",
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
          <p className="text-gray-400 text-xs mt-2">
            Primeiro acesso? Clique em <span className="font-semibold">Criar senha</span>.
          </p>
          <p className="text-gray-400 text-[11px] mt-2">
            Ainda nao assinou?{" "}
            <a
              href={CHECKOUT_MENSAL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-black hover:underline"
            >
              Quero assinar
            </a>
            <span className="text-gray-300"> · </span>
            <a
              href={CHECKOUT_ANUAL}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Ver outras opcoes
            </a>
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 border ${
              mode === "signin" ? "border-black text-black" : "border-gray-200 text-gray-400"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 border ${
              mode === "signup" ? "border-black text-black" : "border-gray-200 text-gray-400"
            }`}
          >
            Criar senha
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
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Confirmar senha
              </label>
              <div className="flex items-center border border-gray-200 px-3 py-3">
                <Key className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="********"
                  className="ml-3 flex-1 outline-none text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePassword}
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Enviando..." : mode === "signup" ? "Criar senha" : "Entrar"}
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
