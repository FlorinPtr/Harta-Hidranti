import { Send } from "lucide-react";

interface GoToAddressButtonProps {
  lat: number;
  lng: number;
  text?: string;
}

export default function GoToAddressButton({ lat, lng, text }: GoToAddressButtonProps) {

  const handleClick = () => {
        const destinationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(destinationUrl, "_blank");
      }
    

  return (
    
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-4 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
      title="Navighează spre adresa"
    >
       <div className="flex flex-row items-center justify-center">
        {text && <span className="p-1 mr-1 font-semibold">{text}</span>}
       <Send className="w-4 h-4" />
      </div>

      {/* <span>Direcții</span> */}
    </button>
  );
}
