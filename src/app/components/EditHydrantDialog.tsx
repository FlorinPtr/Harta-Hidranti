import { useState } from "react";
import { firestore } from "../utils/firebase";
import { doc, updateDoc, deleteDoc, GeoPoint } from "firebase/firestore";
import { Hidrant, Pressure, Type, saveUpdatedHydrantToFirestore, toJSON } from "../models/hidrant";
import GetLocationComponent from "./GetLocationComponent";

type EditHydrantDialogProps = {
  hydrant: Hidrant; // hidrantul existent care trebuie editat
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updatedHydrant: Hidrant = {
        ...hydrant,
        location: new GeoPoint(parseFloat(lat), parseFloat(lng)),
        functional,
        tipul: type,
        presiune: pressure,
        lastUpdated: Date.now(),
      };

      if (!hydrant.id) {
        console.error("Hydrant is missing ID, cannot update!");
        return;
      }

     const saved = await saveUpdatedHydrantToFirestore(updatedHydrant);
        if (!saved) {
            console.error("Failed to save updated hydrant to Firestore");
            return;
        }else{

         onHydrantUpdated(updatedHydrant);
         onClose();
        }
      
    } catch (err) {
      console.error("Error updating hydrant:", err);
    }
  }

  async function handleDelete() {
    try {
      if (!hydrant.id) {
        
        return;
      }
      const hydrantRef = doc(firestore, "hydrants", hydrant.id);
      await deleteDoc(hydrantRef).catch((err) => {
        console.error("Error deleting hydrant:", err);
        return;
      });
      onHydrantDeleted(hydrant.id);
      onClose();
    } catch (err) {
      console.error("Error deleting hydrant:", err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-96">
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

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Șterge
            </button>

            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Anulează
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
            
                Salvează
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
