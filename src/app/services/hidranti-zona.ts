

import { firestore } from "../utils/firebase";
import "firebase/compat/firestore";
import { GeoFirestore } from "geofirestore";
import { Hidrant, Pressure } from "../models/hidrant";
import { GeoPoint } from "firebase/firestore";
import { stat } from "fs";
import { distanceBetween, geohashQueryBounds } from "geofire-common";

const geoFirestore = new GeoFirestore(firestore);
const hydrantsCollection = geoFirestore.collection("hydrants");

/**
 * Obține hidranti într-o anumită rază și cu presiune filtrată
 * @param center - GeoPoint centru
 * @param radiusKm - raza în km
 * @param pressureFilter - opțional, presiunea dorită
 */
export async function getHydrantsNearby(
  center: GeoPoint,
  radiusKm: number,
  pressureFilter?: string,
  statusFilter?: string
): Promise<Hidrant[]> {
  // Query geografic


const bounds = geohashQueryBounds([center.latitude, center.longitude], radiusKm);
const queries = bounds.map(b => 
  hydrantsCollection
    // .where('geohash', '>=', b[0])
    // .where('geohash', '<=', b[1])
);

const snapshots = await Promise.all(queries.map(q => q.get()));

const seenIds = new Set<string>();
const matchingHydrants: Hidrant[] = [];
snapshots.forEach(snap => {
  snap.docs.forEach(doc => {
    const data = doc.data();
     const docLatLng: [number, number] = [
      data.location.latitude,
      data.location.longitude,
    ];
    const dist = distanceBetween([center.latitude, center.longitude], docLatLng);
      if (dist <= radiusKm && !seenIds.has(doc.id)) {
      matchingHydrants.push({ id: doc.id, ...(data as unknown as Hidrant) });
      seenIds.add(doc.id);
    }
  });
});

  console.log("Found hydrants:", matchingHydrants.length);

  // Filtrare după presiune
  let filteredHydrants = matchingHydrants;

  if (pressureFilter && pressureFilter !== "all") {
    if (pressureFilter === "medium") {
      filteredHydrants = filteredHydrants.filter(
        (h) =>
          h.presiune === Pressure.MEDIUM ||
          h.presiune === Pressure.GOOD ||
          h.presiune === Pressure.VERY_GOOD
      );
    } else if (pressureFilter === "good") {
      filteredHydrants = filteredHydrants.filter(
        (h) => h.presiune === Pressure.GOOD || h.presiune === Pressure.VERY_GOOD
      );
    }
  }

  // Filtrare după status
  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "functional") {
      filteredHydrants = filteredHydrants.filter((h) => h.functional === true);
    } else if (statusFilter === "non-functional") {
      filteredHydrants = filteredHydrants.filter((h) => h.functional === false);
    }
  }

  return filteredHydrants; // ✅ return the filtered result, not the original
}




export async function getAllHydrants(): Promise<Hidrant[]> {
  const snapshot = await hydrantsCollection.get();

  const hydrants: Hidrant[] = [];

  snapshot.docs.forEach((doc) => {
    // create object starting with id
    const hydrant: Hidrant = {
      id: doc.id,
      ...(doc.data() as unknown as Hidrant),
    };

    hydrants.push(hydrant);
  });

  return hydrants;
}

