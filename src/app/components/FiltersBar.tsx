import { stat } from "fs";
import { useEffect, useState } from "react";

export default function FiltersBar() {
  const [range, setRange] = useState("10");
  const [pressure, setPressure] = useState("all");
  const [status, setStatus] = useState("all");

  // traduceri
  const pressureLabels: Record<string, string> = {
    all: "Toți hidranții",
    medium: "Presiune de la medie în sus",
    good: "Presiune de la bună în sus",
  };

  const statusLabels: Record<string, string> = {
    all: "Toți hidranții",
    functional: "Funcțional",
    "non-functional": "Ne-funcțional",
  };

  useEffect(() => {
    const loadFilters = () => {
      setRange(localStorage.getItem("rang") || "10");
      setPressure(localStorage.getItem("pressureFilter") || "all");
      setStatus(localStorage.getItem("statusFilter") || "all");
    };

    console.log("Loading filters from localStorage...");
    console.log("Range:", localStorage.getItem("rang"));
    console.log("Pressure:", localStorage.getItem("pressureFilter"));
    console.log("Status:", localStorage.getItem("statusFilter"));

    // load initial
    loadFilters();

    // listen for updates
    window.addEventListener("filtersUpdated", loadFilters);
    return () => window.removeEventListener("filtersUpdated", loadFilters);
  }, []);

  return (
    <div className="w-full bg-gray-100 px-4 py-1 flex flex-wrap items-center gap-1 text-xs text-gray-700">
      <span className="font-bold">Filtre:</span>
      <span className="font-bold">Rază:</span>
      <span>{range} km</span>
      <span className="font-bold">Presiune:</span>
      <span>{pressureLabels[pressure]}</span>
      <span className="font-bold">Status:</span>
      <span
        className={
          status === "all"
            ? "text-gray-700"
            : status === "functional"
            ? "text-green-500"
            : "text-red-500"
        }
      >
        {statusLabels[status]}
      </span>{" "}
    </div>
  );
}
