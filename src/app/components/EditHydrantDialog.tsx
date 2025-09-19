"use client";

import { useState } from "react";
import { firestore } from "../utils/firebase";
import { doc, deleteDoc, GeoPoint } from "firebase/firestore";
import {
  Administrator,
  Hidrant,
  Pressure,
  Type,
  saveUpdatedHydrantToFirestore,
} from "../models/hidrant";
import GetLocationComponent from "./GetLocationComponent";
import { Operator } from "./LoginHelper";



type EditHydrantDialogProps = {
  hydrant: Hidrant;
  isOpen: boolean;
  onClose: () => void;
  onHydrantUpdated: (hydrant: Hidrant) => void;
  onHydrantDeleted: (id: string) => void;
};

export default function EditHydrantDialog({
  hydrant,
  isOpen,
  onClose,
  onHydrantUpdated,
  onHydrantDeleted,
}: EditHydrantDialogProps) {
  const [lat, setLat] = useState(hydrant.location.latitude.toString());
  const [lng, setLng] = useState(hydrant.location.longitude.toString());
  const [functional, setFunctional] = useState(hydrant.functional);
  const [type, setType] = useState<Type>(hydrant.tipul);
  const [pressure, setPressure] = useState<Pressure>(hydrant.presiune);
  const [administrator, setAdministrator] = useState<Administrator>(
    (hydrant.administrator as Administrator) || Administrator.COMPANIA_DE_APE
  );

  // Popup state for delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updatedHydrant: Hidrant = {
        ...hydrant,
        location: new GeoPoint(parseFloat(lat), parseFloat(lng)),
        functional,
        tipul: type,
        presiune: pressure,
        administrator,
        lastUpdated: Date.now(),
      };

      if (!hydrant.id) {
        console.error("Hydrant is missing ID, cannot update!");
        return;
      }
     const operator = localStorage.getItem("operator") as Operator?? Operator.ISU;
      const saved = await saveUpdatedHydrantToFirestore(updatedHydrant, operator);
      if (!saved) {
        console.error("Failed to save updated hydrant to Firestore");
        return;
      } else {
        onHydrantUpdated(updatedHydrant);
        onClose();
      }
    } catch (err) {
      console.error("Error updating hydrant:", err);
    }
  }

  async function handleDeleteConfirmed() {
    try {
      if (!hydrant.id) return;
      const hydrantRef = doc(firestore, "hydrants", hydrant.id);
      await deleteDoc(hydrantRef).catch((err) => {
        console.error("Error deleting hydrant:", err);
        return;
      });
      onHydrantDeleted(hydrant.id);
      onClose();
    } catch (err) {
      console.error("Error deleting hydrant:", err);
    } finally {
      setShowConfirmDelete(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-700 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto p-6">

        <h2 className="text-xl font-bold mb-4">Editează hidrant</h2>
        <div className="space-y-2">
          <GetLocationComponent
            initialLat={lat}
            initialLng={lng}
            onLocationChange={(lat, lng) => {
              setLat(lat.toString());
              setLng(lng.toString());
            }}
          />

          <span className="block text-sm text-gray-300">Presiune</span>
          <select
            value={pressure}
            onChange={(e) => setPressure(e.target.value as Pressure)}
            className="w-full border rounded p-2"
          >
            <option value={Pressure.LOW}>Slabă</option>
            <option value={Pressure.MEDIUM}>Medie</option>
            <option value={Pressure.GOOD}>Bună</option>
            <option value={Pressure.VERY_GOOD}>Foarte bună</option>
          </select>

          <span className="block text-sm text-gray-300">Tipul hidrantului</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Type)}
            className="w-full border rounded p-2"
          >
            <option value={Type.SUBTERAN}>Subteran</option>
            <option value={Type.SUPRATERAN}>Suprateran</option>
            <option value={Type.INTERIOR}>Interior</option>
          </select>

          <span className="block text-sm text-gray-300">Stare</span>
          <select
            value={functional ? "true" : "false"}
            onChange={(e) => setFunctional(e.target.value === "true")}
            className="w-full border rounded p-2"
          >
            <option value="true">Funcțional</option>
            <option value="false">Ne-funcțional</option>
          </select>

          <span className="block text-sm text-gray-300">Administrator</span>
          <select
            value={administrator}
            onChange={(e) => setAdministrator(e.target.value as Administrator)}
            className="w-full border rounded p-2"
          >
            <option value={Administrator.COMPANIA_DE_APE}>
              Compania de apă
            </option>
            <option value={Administrator.PRIMARIA}>Primaria</option>
            <option value={Administrator.PRIVAT}>Privat</option>
          </select>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Șterge
            </button>

            <div className="space-x-1">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 border rounded hover:bg-gray-100"
              >
                Anulează
              </button>
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Ești sigur că dorești să ștergi acest hidrant?
            </h3>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-black border rounded hover:bg-gray-100"
                onClick={() => setShowConfirmDelete(false)}
              >
                Anulează
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteConfirmed}
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
