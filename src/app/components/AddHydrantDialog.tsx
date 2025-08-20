import { SetStateAction, useState } from "react";
import { firestore } from "../utils/firebase";
import { collection, addDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import { Plus } from "lucide-react";
import { Hidrant, Pressure, toJSON, Type } from "../models/hidrant";
import GetLocationComponent from "./GetLocationComponent";
import LoginDialog from "./LoginDialog";
import { on } from "events";


type AddHydrantDialogProps = {
  isAdmin: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogin: (isAdmin: boolean) => void;
  onHydrantAdded: (hydrant: Hidrant) => void; // callback
};

export default function AddHydrantDialog({
  isAdmin,
  isOpen,
  onClose,
  onLogin,
  onHydrantAdded,
}: AddHydrantDialogProps) {
  
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [functional, setFunctional] = useState(true);
  const [type, setType] = useState(Type.SUPRATERAN);
  const [pressure, setPressure] = useState<Pressure>(Pressure.GOOD);
    const [showLogin, setShowLogin] = useState(false);
  
  const handleLogin = (status: boolean) => {
    if (status) {
      localStorage.setItem("isAdmin", "true");
      setOpen(true);
      setShowLogin(false);
      onLogin(status)
    } else {
      localStorage.removeItem("isAdmin");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {

      const clientSideTimpestamp = Date.now();
      const newHydrant: Hidrant = {
        
        location: new GeoPoint(parseFloat(lat), parseFloat(lng)),
        observatii: "",
        functional,
        tipul: type,
        presiune: pressure,
        lastUpdated: clientSideTimpestamp,
      }
      await addDoc(collection(firestore, "hydrants"), toJSON(newHydrant)).then((docRef) => {
        newHydrant.id = docRef.id; // update new hydrant with docRef ID
      onHydrantAdded(newHydrant); // call the callback with the new hydrant
      });

      setOpen(false);
      setLat("");
      setLng("");
    } catch (err) {
      console.error("Error adding hydrant:", err);
    }
  }

  return (
    <>
      {/* Floating + Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
        onClick={() => { 
          if(isAdmin){
          setOpen(true);
          } else {
            console.log("You need to be an admin to add hydrants.");
            setOpen(false);
            setShowLogin(true);
          }
        }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Adaugă un hidrant</h2>
            <form onSubmit={handleSubmit} className="space-y-2">
             <GetLocationComponent
                onLocationChange={(lat, lng) => {
                  setLat(lat.toString());
                  setLng(lng.toString());
              } 
                }
              />    

            <span className="block text-sm text-gray-300">
                Presiune
            </span>
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

              <span className="block text-sm text-gray-300">
                Tipul hidrantului
              </span>

                <select
                value={type}
                onChange={(e) => setType(e.target.value as Type)}
                className="w-full border rounded p-2"
              >
                <option value={Type.SUBTERAN}>Subteran</option>
                <option value={Type.SUPRATERAN}>Suprateran</option>
                <option value={Type.INTERIOR}>Interior</option>

              </select>

              <span className="block text-sm text-gray-300">
                Stare
              </span>
              <select
                value={functional ? "true" : "false"}
                onChange={(e) => setFunctional(e.target.value === "true")}
                className="w-full border rounded p-2"
              >
                <option value="true">Funcțional</option>
                <option value="false">Ne-funcțional</option>
              </select>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvează
                </button>
              </div>
            </form>
          </div>
             
        </div>
      )}
       {showLogin && (
                  <LoginDialog
                    onClose={() => setShowLogin(false)}
                    onLogin={handleLogin}
                  />
                )}
    </>
  );
}
