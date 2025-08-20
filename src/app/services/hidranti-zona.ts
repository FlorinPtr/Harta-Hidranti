

import { firestore } from "../utils/firebase";
import "firebase/compat/firestore";
import { GeoFirestore } from "geofirestore";
import { Hidrant, Pressure } from "../models/hidrant";
import { GeoPoint } from "firebase/firestore";

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
  pressureFilter?: Pressure
): Promise<Hidrant[]> {
  // Query geografic
  let query = hydrantsCollection.near({
    center,
    radius: radiusKm,
  });

  // Filtrare după presiune (dacă e definită)
  if (pressureFilter) {
    query = query.where("pressure", "==", pressureFilter);
  }

  const snapshot = await query.get();

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

