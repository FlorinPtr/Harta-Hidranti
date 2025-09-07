import { Send } from "lucide-react";

interface GoToAddressButtonProps {
  lat: number;
  lng: number;
}

export default function GoToAddressButton({ lat, lng }: GoToAddressButtonProps) {
  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocația nu este suportată de browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Link Google Maps cu plecare din coordonatele utilizatorului
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;

        window.open(mapsUrl, "_blank");
      },
      (err) => {
        console.error("Eroare la obținerea locației utilizatorului:", err);
        // Dacă utilizatorul refuză accesul la locație, se deschide doar destinația
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(fallbackUrl, "_blank");
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-4 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
      title="Navighează spre acest hidrant"
    >
      <Send className="w-4 h-4" />
      {/* <span>Direcții</span> */}
    </button>
  );
}
