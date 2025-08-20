import Image from "next/image";

type AvatarWidgetProps = {
  name: string;
  imageUrl?: string;
};

export default function AvatarWidget({ name, imageUrl }: AvatarWidgetProps) {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <Image
        src={imageUrl || "/default-avatar.png"} // fallback dacă nu există poza
        alt={`${name} Avatar`}
        width={57}
        height={57}
        className="rounded-full border border-gray-300"
      />
      <span className="text-gray-700 font-medium">{name??""}</span>
    </div>
  );
}
