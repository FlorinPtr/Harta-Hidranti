import { GeoPoint, Timestamp } from "firebase/firestore";

export enum Pressure {
    LOW = "Slabă",
    MEDIUM = "Medie",
    GOOD = "Bună",
    VERY_GOOD = "Foarte bună",
  }

  export enum Type {
    SUBTERAN = "Subteran",
    SUPRATERAN = "Suprateran",
    INTERIOR = "Interior",
  }

export interface Hidrant {
  id?: string;            // opțional, document ID
  location: GeoPoint;     // poziția GPS
  observatii?: string;   // alte detalii
  functional: boolean;    // hidrantul funcționează sau nu
  lastUpdated: number; // ultima actualizare
  tipul: Type;           // tipul hidrantului
  presiune: Pressure;       // presiunea apei
}

export function toJSON(h: Hidrant): Record<string, unknown> {
  return {
    location: h.location.toJSON(),
    observatii: h.observatii,
    functional: h.functional,
    lastUpdated: h.lastUpdated,
    tipul: h.tipul,
    presiune: h.presiune,
  };
}

export function fromJSON(data: Record<string, unknown>): Hidrant {
  const locationData = data.location as { latitude: number; longitude: number };
  return {
    id: data.id as string | undefined,
    location: new GeoPoint(locationData.latitude, locationData.longitude),
    observatii: data.observatii as string | undefined,
    functional: data.functional as boolean,
    lastUpdated: data.lastUpdated as number,
    tipul: data.tipul as Type,
    presiune: data.presiune as Pressure,
  };
}
