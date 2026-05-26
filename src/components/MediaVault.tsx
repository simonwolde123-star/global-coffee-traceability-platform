/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Image, Video, Camera, Plus, Trash2, CloudCheck, CloudLightning, Globe } from "lucide-react";
import { MediaItem, Farm } from "../types";

interface MediaVaultProps {
  media: MediaItem[];
  farms: Farm[];
  onAddMedia: (item: MediaItem) => void;
  onRemoveMedia: (id: string) => void;
  isOffline: boolean;
}

export default function MediaVault({
  media,
  farms,
  onAddMedia,
  onRemoveMedia,
  isOffline
}: MediaVaultProps) {
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || "");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [mimeType, setMimeType] = useState<any>("image/jpeg");
  const [customFileBase64, setCustomFileBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomFileBase64(reader.result as string);
      setMimeType(file.type.includes("video") ? "video/mp4" : "image/jpeg");
      if (!title) {
        setTitle(file.name.split(".")[0]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Default coffee visual fallback if no custom loaded image
    const randomFallbackImg = "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop";

    const newMedia: MediaItem = {
      id: "media-" + Math.floor(1000 + Math.random() * 9000),
      farmId: selectedFarmId,
      title,
      mimeType,
      url: customFileBase64 || randomFallbackImg,
      createdAt: new Date().toISOString(),
      caption: caption || "Captured organically by drone extension team.",
      status: isOffline ? "pending" : "synced"
    };

    onAddMedia(newMedia);
    setTitle("");
    setCaption("");
    setCustomFileBase64(null);
    setFormMsg(isOffline ? "Media queued offline! Keep in local memory for syncing." : "Media synchronized successfully with cloud storage.");
    setTimeout(() => setFormMsg(""), 4000);
  };

  return (
    <div id="media-vault-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#2D2926]">
      {/* 1. Add Media Forms & Drag-Drop Panel */}
      <div className="lg:col-span-1 p-5 bg-white border border-gray-200 rounded-2xl space-y-4 text-xs text-left shadow-sm">
        <div className="flex items-center gap-1.5 text-[#C5A059] border-b border-gray-150 pb-2 font-bold">
          <Camera size={16} />
          <h4 className="text-sm font-bold font-sans">Crop Progress Documentation</h4>
        </div>

        <form onSubmit={handleAddMediaSubmit} className="space-y-4 text-left">
          
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative ${
              dragActive 
                ? "border-[#C5A059] bg-[#FAF0DD]/20" 
                : customFileBase64 
                  ? "border-emerald-300 bg-emerald-55/10" 
                  : "border-gray-250 bg-gray-50/50 hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              id="media-file-picker"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            {customFileBase64 ? (
              <div className="space-y-1.5 py-2">
                <span className="text-emerald-800 font-mono font-bold block">✓ File Loaded Successfully</span>
                <span className="text-[9px] text-gray-400 block truncate font-mono font-bold">Ready to upload to database</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomFileBase64(null);
                  }}
                  className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[10px] relative z-30 cursor-pointer border border-gray-300"
                >
                  Clear File
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Image className="mx-auto text-gray-400 mb-1" size={24} />
                <p className="text-gray-700 font-bold">Drag & drop crop image / video file</p>
                <p className="text-[10px] text-gray-400 font-medium font-mono font-bold">or Tap to select from device gallery</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Attach to Specialty Farm*</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded cursor-pointer text-xs focus:bg-white focus:border-[#C5A059]"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Media Title / Subject Name*</label>
            <input
              type="text"
              required
              placeholder="e.g. Drone crop inspection spot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-305 text-gray-800 p-2 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Observations / Caption</label>
            <textarea
              placeholder="Record tree health index, shade leaf density, altitude context, or wet mill moisture parameters..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-50 border border-gray-305 text-gray-800 p-2 h-16 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3D5A40] hover:bg-[#2F4632] text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-xs"
          >
            <Plus size={14} /> Commit Media Attachment
          </button>

          {formMsg && (
            <p className="p-2 rounded bg-emerald-50 border border-emerald-250 text-center font-mono text-[10px] text-emerald-800 font-bold animate-fade-in">
              {formMsg}
            </p>
          )}

        </form>
      </div>

      {/* 2. Media Gallery Feed layout */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono font-bold">
          <span className="text-gray-400 block">AGRICULTURE TELEMETRY GALLERY FEED</span>
          <span className="text-gray-400 flex items-center gap-1 font-bold">
            <Globe className="text-[#C5A059]" size={13} />
            Storage Node: Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">
          {media.map((item) => {
            const matchedFarm = farms.find(f => f.id === item.farmId);
            const isPending = item.status === "pending";
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:border-[#C5A059]/40 transition-all flex flex-col justify-between shadow-sm"
              >
                {/* Visual Image / Video slot */}
                <div className="relative h-44 bg-gray-100 overflow-hidden select-none">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
                    {isPending ? (
                      <span className="bg-[#FAF0DD] border border-[#C5A059]/45 text-[#C5A059] font-mono font-bold uppercase text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                        <CloudLightning size={10} /> Pending Sync
                      </span>
                    ) : (
                      <span className="bg-emerald-50 border border-emerald-250 text-emerald-800 font-mono font-bold uppercase text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                        <CloudCheck size={10} /> Cloud Sync
                      </span>
                    )}

                    <span className="bg-gray-900/80 text-white font-mono text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">
                      {item.mimeType === "video/mp4" ? "Video" : "Photo"}
                    </span>
                  </div>
                </div>

                <div className="p-4 text-left space-y-1.5 font-sans">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-gray-800 text-xs leading-tight truncate">{item.title}</h5>
                    <button
                      onClick={() => onRemoveMedia(item.id)}
                      className="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-gray-50 shrink-0 cursor-pointer"
                      title="De-attach Media"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 leading-normal line-clamp-2 italic font-medium">"{item.caption}"</p>

                  <div className="border-t border-gray-150 pt-2.5 flex justify-between items-center text-[9px] font-mono text-gray-400 font-bold">
                    <span>Farm: {matchedFarm ? matchedFarm.name : "Community Shared"}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
