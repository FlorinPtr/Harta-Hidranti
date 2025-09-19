import { collection, doc, GeoPoint, updateDoc } from "firebase/firestore";
import { firestore } from "../utils/firebase";
import { geohashForLocation, distanceBetween, geohashQueryBounds } from "geofire-common";
import {Operator } from "../components/LoginHelper";


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

export enum Administrator {
  COMPANIA_DE_APE = "Compania de apă",
  PRIMARIA = "Primăria",
  PRIVAT = "Privat",
}

export interface Hidrant {
  id?: string;
  location: GeoPoint;   // poziția GPS
  geohash: string;     // geohash pentru interogări spațiale
  observatii?: string;
  functional: boolean;
  lastUpdated: number;
  tipul: Type;
  presiune: Pressure;
  administrator?: string;
  operator?: string;
}

// Convert Hidrant to Firestore-friendly JSON including geohash
export function toJSON(h: Hidrant): Record<string, unknown> {
  const lat = h.location.latitude;
  const lng = h.location.longitude;

  return {
    location: h.location.toJSON(),
    geohash: geohashForLocation([lat, lng]),
    observatii: h.observatii,
    functional: h.functional,
    lastUpdated: h.lastUpdated,
    tipul: h.tipul,
    presiune: h.presiune,
    administrator: h.administrator,
    operator: h.operator
  };
}

// Convert JSON from Firestore into Hidrant object
export function fromJSON(data: Record<string, unknown>): Hidrant {
  const locationData = data.location as { latitude: number; longitude: number };
  return {
    id: data.id as string | undefined,
    location: new GeoPoint(locationData.latitude, locationData.longitude),
    geohash: data.geohash as string,
    observatii: data.observatii as string | undefined,
    functional: data.functional as boolean,
    lastUpdated: data.lastUpdated as number,
    tipul: data.tipul as Type,
    presiune: data.presiune as Pressure,
    administrator: data.administrator as Administrator,
    operator: data.operator as string | undefined
  };
}


// Save updates to Firestore, automatically updating lastUpdated and geohash
export async function saveUpdatedHydrantToFirestore(h: Hidrant, operator: string): Promise<boolean> {
  try {
    const hydrantRef = doc(firestore, "hydrants", h.id!);
    const data = toJSON({ ...h, lastUpdated: Date.now(), operator: operator });
    await updateDoc(hydrantRef, data as Partial<Hidrant>);
    console.log("Updated hydrant: " + JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("Error updating hydrant:", err);
    return false;
  }
}
