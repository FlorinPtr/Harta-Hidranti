"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import SearchBarWithMap from "./components/SearchBarWithMap";

export default function Home() {
  const [showFullText, setShowFullText] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

 
  const description =
    "Această platformă este destinată adăugării, editării și identificării pe hartă a hidranților dintr-o anumită zonă.";
  return (
    <div>
    <main
      className="flex flex-col items-center min-h-screen bg-cover bg-center text-white"
      style={{
       // opacity: searchDone ? 0.4 : 0,   // conditional opacity
        backgroundImage: "url('/generic-map.png')", // pune un background în /public/bg-lake.jpg
      }}
    >
       {/* Conditional overlay */}
  <div
    className="absolute inset-0"
    style={{
      backgroundColor: "rgba(0,0,0,0.7)", // adjust opacity here
      opacity: searchDone ? 0.8 : 0,   // conditional opacity
      transition: "opacity 0.3s",
    }}
    onClick={() => setSearchDone(false)} // click to reset search
  />
        <Navbar />

      <div className={!searchDone? "bg-black/50 p-6 m-10 rounded-2xl shadow-lg max-w-xl w-full"
      : "bg-black/20 p-2 rounded-2xl shadow-lg max-w-xl w-full"}>
      <SearchBarWithMap
        onSearchStatusChange={(status: string) => {
          console.log("Search status changed:", status);
          if (status === "success") setSearchDone(true);
          else setSearchDone(false);
        }}
      />


        {true && (
          <div className="mt-4 text-center">
            <p>
              {showFullText
                ? description + "  Este un proiect open-source care își propune să ajute pompierii să aibă acces rapid la informații despre hidranți, facilitând astfel intervențiile în caz de urgență. In acest moment este in teste pentru orașul Lupeni."
                : description}
            </p>
            <button
              className="mt-2 text-sm text-blue-300 underline"
              onClick={() => setShowFullText(!showFullText)}
            >
              {showFullText ? "Restrange" : "Afișează mai mult"}
            </button>
          </div>
        )}

 
      </div>
     
    </main>
    </div>

  );


}

