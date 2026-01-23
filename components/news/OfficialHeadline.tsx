import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type HeadlineData = {
  title: string;
  url: string;
  date?: string | null;
};

const OfficialHeadline: React.FC = () => {
  const [data, setData] = useState<HeadlineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/newsroom");
        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const payload = (await response.json()) as HeadlineData;
        setData(payload);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="p-6 md:p-8 bg-white border-b border-black">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Oficial TikTok
          </p>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            Ultima manchete publicada
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-400">Newsroom</span>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
        </div>
      ) : error || !data ? (
        <p className="text-sm text-gray-500">Nao foi possivel carregar a manchete agora.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold text-black hover:underline flex items-center gap-2"
          >
            {data.title}
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
            <span>{data.date || "Atualizado"}</span>
            <span>•</span>
            <span>Ler no site oficial</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default OfficialHeadline;
