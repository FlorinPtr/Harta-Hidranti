import { useEffect, useRef, useState } from "react";
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
import { Hidrant, saveUpdatedHydrantToFirestore } from "../models/hidrant";
import { getAllHydrants, getHydrantsNearby } from "../services/hidranti-zona";
import { GeoPoint, Timestamp } from "firebase/firestore";
import AddHydrantDialog from "./AddHydrantDialog";
import React from "react";
import EditHydrantDialog from "./EditHydrantDialog";
import LoginDialog from "./LoginDialog";
import Settings from "./Settings";
import FiltersBar from "./FiltersBar";

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
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [activeHydrantId, setActiveHydrantId] = useState<string | null>(null);
  const [hydrants, setHydrants] = useState<Hidrant[]>([]);
  const [zoom, setZoom] = useState(14); // Default zoom level
  const [showLogin, setShowLogin] = useState(false);
  const [editingHydrant, setEditingHydrant] = useState<Hidrant | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [originalPos, setOriginalPos] = useState<google.maps.LatLng | null>(
    null
  );
  const maxDistance = 0.1; // max distance in km (adjust as needed)

  const markersRef = useRef<{ [id: string]: google.maps.Marker | null }>({});
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // La mount, citim din localStorage
 

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
  async function fetchHydrants() {
    try {
      // 🔹 Get filters from localStorage
      if (!center) {
        return;
      }

      const range = localStorage.getItem("rang") || "10";
      const pressure = localStorage.getItem("pressureFilter") || "all";
      const status = localStorage.getItem("statusFilter") || "all";

      console.log("Applying filters:", { range, pressure, status });

      // Fetch hydrants (pass filters if your API supports them)
      const data = await getHydrantsNearby(
        center, // default center if null
        parseInt(range),
        pressure,
        status
      );

      console.log("Fetching hydrants...", JSON.stringify(data));
      setHydrants(data);
    } catch (err) {
      console.error("Error fetching hydrants", err);
    }
  }

  // fetch on mount
  fetchHydrants();

  // fetch again when filters change
  const handleFiltersChanged = () => {
    console.log("Filters updated, reloading hydrants...");
    fetchHydrants();
  };

  window.addEventListener("filtersUpdated", handleFiltersChanged);

  return () => {
    window.removeEventListener("filtersUpdated", handleFiltersChanged);
  };
}, [center]); // ✅ still dependent on center if hydrants depend on map center

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

  const FireTruck = {
    url: "/fire-truck.png",
    scaledSize: new google.maps.Size(60, 60),
  };

  type HydrantMarkerProps = {
    h: Hidrant;
    isAdmin: boolean;
    activeHydrantId: string | null;
    setActiveHydrantId: (id: string | null) => void;
  };

  // icons
  const normalIcon: google.maps.Icon = {
    url: "/hydrant.svg",
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(20, 40),
  };

  const enlargedIcon: google.maps.Icon = {
    url: "/hydrant.svg",
    scaledSize: new google.maps.Size(45, 45),
    anchor: new google.maps.Point(30, 60),
  };

  function haversineDistance(a: google.maps.LatLng, b: google.maps.LatLng) {
    const R = 6371e3; // Earth radius meters
    const dLat = (b.lat() - a.lat()) * (Math.PI / 180);
    const dLng = (b.lng() - a.lng()) * (Math.PI / 180);
    const lat1 = a.lat() * (Math.PI / 180);
    const lat2 = b.lat() * (Math.PI / 180);

    const hav =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(hav));
  }

  function handleEditHydrant(h: Hidrant): void {
    setEditingHydrant(h);
  }

  async function saveNewLocation(h: Hidrant, marker: google.maps.Marker) {
    try {
      const pos = marker.getPosition();
      if (!pos) {
        console.error("Marker position is null");
        return;
      }

      // Update hydrant location in Firestore (or your backend)
      const updatedHydrant: Hidrant = {
        ...h,
        location: new GeoPoint(pos.lat(), pos.lng()),
        lastUpdated: Date.now(),
      };

      const saved = await saveUpdatedHydrantToFirestore(updatedHydrant);
      if (!saved) {
        console.error("Failed to save updated hydrant to Firestore");
        return;
      }
      // Update local state

      // You may want to call an update service here, e.g.:
      // await updateHydrantLocation(h.id!, updatedHydrant.location);

      setHydrants((prev) =>
        prev.map((hydrant) =>
          hydrant.id === h.id ? updatedHydrant : hydrant
        )
      );
      setMovingId(null);
      setActiveHydrantId(h.id!);
    } catch (error) {
      console.error("Failed to save new location:", error);
    }
  }
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Input & Autocomplete */}
      <div className="relative w-full">
        <div className="flex items-center bg-white rounded-xl shadow-md px-4 py-2 mx-4 mx-auto ">
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
          <FiltersBar/>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            center={
              currentLocation
                ? {
                    lat: currentLocation.latitude ?? center.latitude,
                    lng: currentLocation.longitude ?? center.longitude,
                  }
                : {
                    lat: center.latitude,
                    lng: center.longitude,
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
              <Marker
                key={h.id}
                onLoad={(marker) => {
                  markersRef.current[h.id!] = marker; // store marker by id
                }}
                position={{
                  lat: h.location.latitude,
                  lng: h.location.longitude,
                }}
                icon={movingId == h.id ? enlargedIcon : normalIcon}
                draggable={localStorage.getItem("isAdmin") == "true" && movingId === h.id}
                onDragStart={() => {
                  const marker = markersRef.current[h.id!];
                  if (!marker) return;
                  currentMarkerRef.current = marker;
                  const pos = marker.getPosition();
                  if (pos) {
                    setOriginalPos(pos);
                  }
                }}
                onDrag={(e) => {
                  if (!e.latLng || !originalPos || !currentMarkerRef.current)
                    return;
                  const dist = haversineDistance(originalPos, e.latLng);
                  console.log("Distance moved (m):", dist);
                  if (dist > maxDistance * 1000) {
                    console.log("Max distance exceeded, reverting...");
                    currentMarkerRef.current.setPosition(originalPos);
                  }
                }}
                onDragEnd={() => {
                  if (currentMarkerRef.current) {
                    currentMarkerRef.current.setIcon(normalIcon);
                    currentMarkerRef.current = null;
                  }
                  setDragging(false);
                }}
                onClick={() => {
                  mapRef.current?.panTo({
                    lat: h.location.latitude,
                    lng: h.location.longitude,
                  });
                  setTimeout(() => {
                  setCurrentLocation(new GeoPoint(h.location.latitude, h.location.longitude));
                  }, 1000);
                  setActiveHydrantId(h.id!);
                }}
              >
                {activeHydrantId === h.id && (
                  <InfoWindow
                    options={{ pixelOffset: new google.maps.Size(0, -20) }}
                    position={{
                      lat: h.location.latitude,
                      lng: h.location.longitude,
                    }}
                    onCloseClick={() => setActiveHydrantId(null)}
                  >
                <div className="bg-gray-600 text-xs p-2 rounded-md text-white">
                  {h.id! == movingId ? (
                    <div >
                      <p className="text-yellow-300">
                        Apasa lung hidrantul si trage usor in locatia dorita apoi salveaza
                      </p>
                      <button
                        className="px-4 py-1 text-xs bg-gray-400 m-2 hover:bg-red-700 rounded-md"
                        onClick={async () => {
                          if (markersRef.current[h.id!]) {
                            markersRef.current[h.id!]!.setPosition(
                              new google.maps.LatLng(h.location.latitude, h.location.longitude)
                            );
                          }
                          setMovingId(null);
                        }}
                      >
                        Anuleaza
                      </button>
                      <button
                        className="px-4 py-1 text-xs bg-green-600 m-2 hover:bg-green-700 rounded-md"
                        onClick={async () => {
                          setCurrentLocation(new GeoPoint(markersRef.current[h.id!]!.getPosition()!.lat(), markersRef.current[h.id!]!.getPosition()!.lng()));
                          saveNewLocation(h, markersRef.current[h.id!]!);
                          setActiveHydrantId(null);
                        }}
                      >
                        Salveaza
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p>
                        <strong>Tip:</strong> {h.tipul}
                      </p>
                      <p>
                        <strong>Presiune:</strong> {h.presiune}
                      </p>
                      <p>
                        <strong>Funcțional:</strong>{" "}
                        {h.functional ? "✅" : "❌"}
                      </p>
                      <p>
                        <strong>Ultima actualizare:</strong>{" "}
                        {h.lastUpdated
                          ? new Date(h.lastUpdated).toLocaleString()
                          : "N/A"}
                      </p>
                      {localStorage.getItem("isAdmin") == "true" && (
                          <div className="flex flex-row m-2 gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-gray-500 rounded-md"
                            onClick={() => {
                              setMovingId(h.id!);
                              mapRef.current?.panTo({
                                lat: h.location.latitude,
                                lng: h.location.longitude,
                              });

                              mapRef.current?.setZoom(18);

                              // await than set current location
                               
                              setTimeout(() => {
                               setCurrentLocation(new GeoPoint(h.location.latitude, h.location.longitude));
                              }, 500);
                            }}
                          >
                            Ajusteaza pozitia
                          </button>
                            <button
                              className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-md"
                              onClick={() => handleEditHydrant(h)}
                            >
                              Editează
                            </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                  </InfoWindow>
                )}
              </Marker>
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
                setCurrentLocation(new GeoPoint(updatedHydrant.location.latitude, updatedHydrant.location.longitude));
                setActiveHydrantId(updatedHydrant.id!);
                setZoom(16);
              }}
              onHydrantDeleted={(hydrantId) => {
                setHydrants((prev) => prev.filter((h) => h.id !== hydrantId));
                setActiveHydrantId(null);
                setZoom(14);
              }}
              onClose={() => {
                setEditingHydrant(null)
               }
              }
            />
          )}
          <Settings />

          <AddHydrantDialog
            onHydrantAdded={(hydrant) => {
              setHydrants((prev) => [...prev, hydrant]);
              setCurrentLocation(new GeoPoint(hydrant.location.latitude, hydrant.location.longitude));
              setActiveHydrantId(hydrant.id!);
              setZoom(16);
            }}
          />

          {showLogin && (
            <LoginDialog
              onClose={() => setShowLogin(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
