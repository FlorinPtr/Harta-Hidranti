import { Send } from "lucide-react";

interface GoToAddressButtonProps {
  lat: number;
  lng: number;
}

export default function GoToAddressButton({ lat, lng }: GoToAddressButtonProps) {

  const handleClick = () => {
        const destinationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(destinationUrl, "_blank");
      }
    

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
