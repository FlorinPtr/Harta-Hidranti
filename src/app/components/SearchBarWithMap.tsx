import { useEffect, useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { Search } from "lucide-react";
import { Hidrant } from "../models/hidrant";
import { getAllHydrants } from "../services/hidranti-zona";
import { GeoPoint, Timestamp } from "firebase/firestore";
import AddHydrantDialog from "./AddHydrantDialog";
import React from "react";
import EditHydrantDialog from "./EditHydrantDialog";
import LoginDialog from "./LoginDialog";

const libraries: "places"[] = ["places"];

type SearchBarWithMapProps = {
  onSearchStatusChange?: (status: "success" | "loading" | "error") => void;
};

export default function SearchBarWithMap({
  onSearchStatusChange,
}: SearchBarWithMapProps) {
  // ✅ Always call hooks at the top level
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  if (loadError) return <p>❌ Error loading Google Maps</p>;
  if (!isLoaded) return <p>⏳ Loading Google Maps...</p>;

  return <LoadedSearchBarWithMap onSearchStatusChange={onSearchStatusChange} />;
}
function LoadedSearchBarWithMap({
  onSearchStatusChange,
}: SearchBarWithMapProps) {
  const [center, setCenter] = useState<GeoPoint | null>(null);
  const [activeHydrantId, setActiveHydrantId] = useState<string | null>(null);
  const [hydrants, setHydrants] = useState<Hidrant[]>([]);
  const [zoom, setZoom] = useState(14); // Default zoom level
  const [isAdmin, setIsAdmin] = useState(false); // Simulate admin check
  const [showLogin, setShowLogin] = useState(false);
  const [editingHydrant, setEditingHydrant] = useState<Hidrant | null>(null);



  // La mount, citim din localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    if (storedAdmin === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (status: boolean) => {
    if (status) {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(status);

    } else {
      localStorage.removeItem("isAdmin");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: new google.maps.LatLng(45.0, 25.0), // center of Romania
      radius: 200 * 1000, // 200 km
    },
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  const updateStatus = (newStatus: "success" | "loading" | "error") => {
    if (onSearchStatusChange) onSearchStatusChange(newStatus);
  };

  useEffect(() => {
    if (!!center) return;

    async function fetchHydrants() {
      try {
        const data = await getAllHydrants();
        console.log("Fetching hydrants..." + JSON.stringify(data));
        setHydrants(data);
      } catch (err) {
        console.error("Error fetching hydrants", err);
      }
    }

    fetchHydrants();
  }, [center]); // ✅ removed hydrants from deps (avoids infinite loop)

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setCenter(new GeoPoint(lat, lng));
      updateStatus("success");
    } catch (error) {
      console.error("Error fetching location:", error);
      updateStatus("error");
    }
  };

  const hydrantIcon = {
    url: "/hydrant.svg",
    scaledSize: new google.maps.Size(40, 30),
  };

  const FireTruck = {
    url: "/fire-truck.png",
    scaledSize: new google.maps.Size(60, 60),
  };

  function handleEditHydrant(h: Hidrant): void {
        setEditingHydrant(h);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Input & Autocomplete */}
      <div className="relative w-full">
        <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full">
          <input
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Caută oraș sau obiectiv"
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <Search size={20} className="text-gray-500" />
        </div>

        {status === "OK" && (
          <ul className="absolute z-10 bg-gray-600 w-full text-white shadow-md rounded-b-md max-h-60 overflow-auto mt-1">
            {data.map((item) => (
              <li
                key={item.place_id}
                className="px-4 py-2 hover:bg-gray-400 cursor-pointer"
                onClick={() => handleSelect(item.description)}
              >
                {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      {center && (
        <div className="w-full mt-6">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            center={ 
 activeHydrantId
                ? {
                    lat:
                      hydrants.find((h) => h.id === activeHydrantId)
                        ?.location.latitude ?? center.latitude,
                    lng:
                      hydrants.find((h) => h.id === activeHydrantId)
                        ?.location.longitude ?? center.longitude,
                  }
                : { 
                  lat: center.latitude, lng: center.longitude 
                }                
              }
            zoom={zoom}
          >
            <Marker
              position={
                new google.maps.LatLng(center.latitude, center.longitude)
              }
              icon={FireTruck}
              
            />
            {hydrants.map((h) => (
              <React.Fragment key={h.id}>
                <Marker
                  position={{
                    lat: h.location.latitude,
                    lng: h.location.longitude,
                  }}
                  icon={hydrantIcon}
                  onClick={() => {
                    setActiveHydrantId(h.id!);
                  }
                  }
                />
                {activeHydrantId === h.id && (
                <InfoWindow
  options={{ pixelOffset: new google.maps.Size(0, -20) }} // 20px above marker
  position={{
    lat: h.location.latitude,
    lng: h.location.longitude,
  }}
  onCloseClick={() => setActiveHydrantId(null)}
>
  <div className="bg-gray-600 text-sm p-2 rounded-md text-white">
    <p>
      <strong>Tip:</strong> {h.tipul}
    </p>
    <p>
      <strong>Presiune:</strong> {h.presiune}
    </p>
    <p>
      <strong>Funcțional:</strong> {h.functional ? "✅" : "❌"}
    </p>
    <p>
      <strong>Ultima actualizare:</strong>{" "}
      {h.lastUpdated ? new Date(h.lastUpdated).toLocaleString() : ""}
    </p>

    {/* Buton editare vizibil doar pentru admin */}
    {isAdmin && (
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => handleEditHydrant(h)} // funcția care deschide dialogul de editare
          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-md"
        >
          Editează
        </button>
      </div>
    )}
  </div>
</InfoWindow>

                )}
              </React.Fragment>
            ))}
          </GoogleMap>
{editingHydrant && (
        <EditHydrantDialog
         isOpen={!!editingHydrant}
          hydrant={editingHydrant}
          onHydrantUpdated={(updatedHydrant) => {
            setHydrants((prev) =>
              prev.map((h) =>
                h.id === updatedHydrant.id ? updatedHydrant : h
              )
            );
            setActiveHydrantId(updatedHydrant.id!);
            setZoom(16);
          }}
          onHydrantDeleted={(hydrantId) => {
            setHydrants((prev) => prev.filter((h) => h.id !== hydrantId));
            setActiveHydrantId(null);
            setZoom(14);
          }}
          onClose={() => setEditingHydrant(null)}
        />
      )}
          <AddHydrantDialog
            onLogin={handleLogin}
            isAdmin={isAdmin}
            onHydrantAdded={(hydrant) => {
              setHydrants((prev) => [...prev, hydrant]);
              setActiveHydrantId(hydrant.id!);
              setZoom(16);
            }}
          />

           {showLogin && (
        <LoginDialog
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}
          
        </div>
      )}
    </div>
  );
}
