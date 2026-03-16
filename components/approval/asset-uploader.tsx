"use client";

import { useState, useRef } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Asset {
  id: string;
  storage_url: string;
  asset_type: string;
  created_at: string;
}

interface Props {
  draftId: string;
  initialAssets?: Asset[];
}

export function AssetUploader({ draftId, initialAssets = [] }: Props) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const uploaded: Asset[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("asset_type", file.type.startsWith("video") ? "video" : "image");

        const res = await fetch(`${BASE_URL}/api/v1/drafts/${draftId}/assets`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`업로드 실패: ${text}`);
        }

        const asset = await res.json();
        uploaded.push(asset);
      }
      setAssets((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(assetId: string) {
    const res = await fetch(`${BASE_URL}/api/v1/drafts/${draftId}/assets/${assetId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">이미지 / 영상</span>
        </div>
        <span className="text-xs text-muted-foreground">{assets.length}개</span>
      </div>

      {/* Uploaded assets */}
      {assets.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {assets.map((asset) => (
            <div key={asset.id} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
              {asset.asset_type === "video" ? (
                <video
                  src={asset.storage_url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.storage_url}
                  alt="asset"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => handleDelete(asset.id)}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              클릭하거나 드래그하여 업로드
              <br />
              <span className="opacity-60">JPG, PNG, WEBP, MP4 · 최대 50MB</span>
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </Card>
  );
}
