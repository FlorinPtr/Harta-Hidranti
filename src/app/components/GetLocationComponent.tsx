"use client";

import { init } from "next/dist/compiled/webpack/webpack";
import { useState, useEffect } from "react";

interface LocationSelectorProps {
  initialLat?: string;
  initialLng?: string;
  onLocationChange?: (lat: string, lng: string) => void;
}

export default function LocationSelector({
  initialLat,
  initialLng,
  onLocationChange,
}: LocationSelectorProps) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [lat, setLat] = useState(initialLat || "");
  const [lng, setLng] = useState(initialLng || "");

  const defaultPrecision =
  initialLat && initialLng
    ? `✅ Lat: ${initialLat}, Lng: ${initialLng} (Valori inițiale)`
    : null;
  const [precision, setPrecision] = useState<string | null>(defaultPrecision);
  console.log(defaultPrecision);

   

  // Emit values whenever they change
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  
  }, [lat, lng, onLocationChange]);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setPrecision("❌ Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude.toFixed(6);
        const newLng = pos.coords.longitude.toFixed(6);

        setLat(newLat);
        setLng(newLng);
        console.log(`Detected location: Lat ${newLat}, Lng ${newLng}`);

        setPrecision(
          `✅ Lat: ${newLat}, Lng: ${newLng}, Precision: ${pos.coords.accuracy.toFixed(
            1
          )} m`
        );
      },
      (err: GeolocationPositionError) => {
        console.error("Error getting location:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setPrecision(
            "❌ Location permission denied. Please enable it in your browser settings."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPrecision("❌ Location unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setPrecision("❌ Location request timed out.");
        } else {
          setPrecision("❌ Error: " + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-2xl shadow space-y-4">
      <h2 className="text-lg font-semibold">Select Location Mode</h2>

      {/* Radio Group */}
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="auto"
            checked={mode === "auto"}
            onChange={() => setMode("auto")}
          />
          <span>Auto</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="manual"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          <span>Manual</span>
        </label>
      </div>

      {/* Auto Mode */}
      {mode === "auto" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-200">
            {precision || "Press the button to detect your location"}
          </p>
          <button
            onClick={async () => {
              console.log("navigator.geolocation:", navigator.geolocation);

                const perm = await navigator.permissions?.query({
                  name: "geolocation",
                });
                console.log("Permission state:", perm?.state);
           

               handleGetLocation();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Check Location
          </button>
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
