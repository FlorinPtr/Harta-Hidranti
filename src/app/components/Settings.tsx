import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const [open, setOpen] = useState(false);

  // State pentru setări
  const [range, setRange] = useState("10");
  const [pressure, setPressure] = useState("all");
  const [status, setStatus] = useState("all");

  // Load din localStorage
  useEffect(() => {
    const savedRange = localStorage.getItem("rang");
    const savedPressure = localStorage.getItem("pressureFilter");
    const savedStatus = localStorage.getItem("statusFilter");

    if (savedRange) setRange(savedRange);
    if (savedPressure) setPressure(savedPressure);
    if (savedStatus) setStatus(savedStatus);
  }, []);

  const handleSave = () => {
    localStorage.setItem("rang", range);
    localStorage.setItem("pressureFilter", pressure);
    localStorage.setItem("statusFilter", status);
    window.dispatchEvent(new Event("filtersUpdated"));

    setOpen(false);
  };

  return (
    <>
      {/* Butonul care deschide meniul */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 p-3 rounded-full border-2 border-black bg-white shadow-lg hover:bg-gray-100 z-40"
      >
        <SettingsIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Meniul */}
      {open && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-600 rounded-2xl shadow-lg p-6 w-[380px]">
            <h2 className="text-lg font-semibold text-white mb-4">
              Filtre Hidranți
            </h2>

            {/* Secțiune Rază */}
            <div className="mb-6">
              <p className="text-white font-medium mb-2">
                Raza de afișare
              </p>
              <div className="flex justify-around">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="5"
                    checked={range === "5"}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <span>5 km</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="10"
                    checked={range === "10"}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <span>10 km</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="20"
                    checked={range === "20"}
                    onChange={(e) => setRange(e.target.value)}
                  />
                  <span>20 km</span>
                </label>
              </div>
            </div>

            {/* Secțiune Filtru Presiune */}
            <div className="mb-6">
              <p className="text-white font-medium mb-2">Filtru după presiune</p>
              <select
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">Toți hidranții</option>
                <option value="medium">De la medie în sus</option>
                <option value="good">De la bună în sus</option>
              </select>
            </div>

            {/* Secțiune Filtru Status */}
            <div className="mb-6">
              <p className="text-white font-medium mb-2">Filtru după status</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">Toți</option>
                <option value="functional">Funcționali</option>
                <option value="non-functional">Ne-funcționali</option>
              </select>
            </div>

            {/* Butoane */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
