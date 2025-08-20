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

export function toJSON(h: Hidrant): Record<string, any> {
  return {
    location: h.location.toJSON(),
    observatii: h.observatii,
    functional: h.functional,
    lastUpdated: h.lastUpdated,
    tipul: h.tipul,
    presiune: h.presiune,
  };
}

export function fromJSON(data: Record<string, any>): Hidrant {
  return {
    id: data.id,
    location: new GeoPoint(data.location.latitude, data.location.longitude),
    observatii: data.observatii,
    functional: data.functional,
    lastUpdated: data.lastUpdated,
    tipul: data.tipul,
    presiune: data.presiune,
  };
}
