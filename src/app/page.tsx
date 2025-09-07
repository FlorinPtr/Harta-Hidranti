"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import SearchBarWithMap from "./components/SearchBarWithMap";
import Head from "next/head";

export default function Home() {
  const [showFullText, setShowFullText] = useState(false);
  const [searchDone, setSearchDone] = useState(false);


 
  const description =
    "Această platformă este destinată adăugării, editării și identificării pe hartă a hidranților dintr-o anumită zonă.";
  return (
    <div>
       <Head>
        <title>Harta Hidranti</title>
        <meta name="description" content="Aplicație pentru localizarea hidranților" />
        <meta name="theme-color" content="#1e3a8a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>
    <main
      className="flex flex-col items-center min-h-screen bg-cover bg-center text-white"
      style={{
       // opacity: searchDone ? 0.4 : 0,   // conditional opacity
        backgroundImage: "url('/generic-map.png')", // pune un background în /public/bg-lake.jpg
      }}
    >
       {/* Conditional overlay */}
  <div
    className={`absolute inset-0 transition-opacity duration-300 ${
    searchDone ? "opacity-60 pointer-events-auto" : "opacity-0 pointer-events-none"
  }`}
    onClick={() => setSearchDone(false)} // click to reset search
  />
        <Navbar/>

      <div className={!searchDone? "bg-black/50 p-6 m-10 rounded-xl shadow-lg max-w-xl w-full"
      : "bg-black/50 mt-4 py-3 sm:p-2 rounded-xl shadow-lg max-w-xl w-full"
}>
      <SearchBarWithMap
        onSearchStatusChange={(status: string) => {
          console.log("Search status changed:", status);
          if (status === "success") setSearchDone(true);
          else setSearchDone(false);
        }}
      />


          <div className="mt-4 p-2 text-center">
            <p>
              {showFullText
                ? description + "  Este un proiect open-source care își propune să ajute pompierii să aibă acces rapid la informații despre hidranți, facilitând astfel intervențiile în caz de urgență. Orice admin sau pompier poate adăuga sau edita hidranți, contribuind la o bază de date actualizată și precisă. Proiectul este momentan in faza de testare beta."
                : description}
            </p>
            <button
              className="mt-2 text-sm text-blue-300 underline"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Restrange" : "Afișează mai mult"}
            </button>
          </div>

 
      </div>
     
    </main>
    </div>

  );


}

