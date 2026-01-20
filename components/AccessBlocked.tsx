import React from "react";
import { ExternalLink, RefreshCw, LogOut, ShieldAlert } from "lucide-react";

const CHECKOUT_MENSAL = "https://pay.kiwify.com.br/VAGjfBk";
const CHECKOUT_ANUAL = "https://pay.kiwify.com.br/GAaTOPS";

interface AccessBlockedProps {
  email: string;
  status?: string | null;
  plan?: string | null;
  onRefresh: () => void;
  onSignOut: () => void;
}

const AccessBlocked: React.FC<AccessBlockedProps> = ({
  email,
  status,
  plan,
  onRefresh,
  onSignOut,
}) => {
  return (
    <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center px-6">
      <div className="w-full max-w-lg border border-gray-100 shadow-sm p-8">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Acesso bloqueado</h1>
          <p className="text-sm text-gray-500">
            Sua assinatura nao esta ativa para <strong>{email}</strong>.
          </p>
        </div>

        <div className="border border-gray-100 p-4 text-xs text-gray-500 space-y-1 mb-6">
          <p>Status: {status || "desconhecido"}</p>
          <p>Plano: {plan || "nao identificado"}</p>
        </div>

        <div className="grid gap-3">
          <a
            href={CHECKOUT_MENSAL}
            className="w-full border border-black text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            target="_blank"
            rel="noreferrer"
          >
            Assinar mensal
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={CHECKOUT_ANUAL}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            target="_blank"
            rel="noreferrer"
          >
            Assinar anual
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 uppercase tracking-widest font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            Verificar acesso
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 uppercase tracking-widest font-bold"
          >
            <LogOut className="w-3 h-3" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessBlocked;
