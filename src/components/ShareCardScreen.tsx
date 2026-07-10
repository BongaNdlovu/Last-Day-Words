import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { UserProgress } from "../types";
import { milestoneTitle, STREAK_MILESTONES } from "../utils/streaks";

interface ShareCardScreenProps {
  progress: UserProgress;
  onBack: () => void;
}

export default function ShareCardScreen({ progress, onBack }: ShareCardScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const streak = progress.dailyChallengeStreak ?? 0;
  const reached = [...STREAK_MILESTONES].reverse().find((m) => streak >= m);
  const title = reached ? milestoneTitle(reached) : "Lamp Keeper";

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#2a2018");
    grad.addColorStop(1, "#5c3d1e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 42px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("LAST DAY WORDS", w / 2, 160);

    ctx.fillStyle = "#f8f1e3";
    ctx.font = "28px Georgia, serif";
    ctx.fillText("Prophetic Study Streak", w / 2, 230);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 160px Georgia, serif";
    ctx.fillText(String(streak), w / 2, 480);

    ctx.fillStyle = "#f8f1e3";
    ctx.font = "36px Georgia, serif";
    ctx.fillText(streak === 1 ? "DAY" : "DAYS", w / 2, 540);

    ctx.fillStyle = "#f4dca6";
    ctx.font = "italic 40px Georgia, serif";
    ctx.fillText(`“${title}”`, w / 2, 640);

    ctx.fillStyle = "#cbb487";
    ctx.font = "24px sans-serif";
    ctx.fillText(`Speed best: ${progress.speedRoundHighScore}`, w / 2, 740);
    ctx.fillText(`${progress.solvedWordIds.length} terms deciphered`, w / 2, 780);

    ctx.fillStyle = "#e6c98a";
    ctx.font = "22px sans-serif";
    ctx.fillText("Sabbath School · Youth Group · Family", w / 2, 920);
    ctx.fillText("last-day-words", w / 2, 960);

    return canvas;
  };

  const handleDownload = () => {
    const canvas = draw();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `last-day-words-streak-${streak}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    setStatus("Image downloaded.");
  };

  const handleShare = async () => {
    const canvas = draw();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!blob) return;
    const file = new File([blob], `streak-${streak}.png`, { type: "image/png" });
    const text = `Day ${streak} of Last Day Words — ${title}. Join me in prophetic word study!`;
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Last Day Words", text });
        setStatus("Shared!");
      } else if (navigator.share) {
        await navigator.share({ title: "Last Day Words", text });
        setStatus("Shared text (image download available separately).");
      } else {
        await navigator.clipboard.writeText(text);
        setStatus("Share text copied. Download the image for WhatsApp.");
      }
    } catch {
      setStatus("Share cancelled.");
    }
  };

  // Preview draw on mount
  useEffect(() => {
    draw();
  });

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2 px-2">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#c9c2b4] font-medium cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-display font-bold tracking-[0.1em] text-[#f4f1ea]">SHARE CARD</h2>
        <div className="w-12" />
      </div>

      <canvas ref={canvasRef} className="w-full rounded-2xl border border-white/10 shadow-lg" />

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#101014] text-[#f8f1e3] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.08] border border-white/10 text-[#f4f1ea] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
      {status && <p className="text-center text-sm text-[#c9c2b4]">{status}</p>}
    </div>
  );
}
