// pages/index.tsx

"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";

// Define the type for the PWA install event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Dynamically import SearchBarWithMap for performance optimization
const SearchBarWithMap = dynamic(() => import("./components/SearchBarWithMap"), {
  ssr: false,
  loading: () => <p className="text-center p-4">Loading Map...</p>,
});

export default function Home() {
  const [showFullText, setShowFullText] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const description =
    "Această platformă este destinată adăugării, editării și identificării pe hartă a hidranților dintr-o anumită zonă.";

  useEffect(() => {
    // Check localStorage on initial load to see if the user wants to hide the prompt
    const shouldHide = localStorage.getItem("hideInstallPrompt") === "true";
    if (shouldHide) {
      setDoNotShowAgain(true);
      return; // Exit if the prompt should be hidden
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt.");
        } else {
          console.log("User dismissed the install prompt.");
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleClosePrompt = () => {
     setDoNotShowAgain(true);
    setDeferredPrompt(null);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
          localStorage.setItem("hideInstallPrompt", "true");
    } else {
          localStorage.removeItem("hideInstallPrompt");
    }

  };

  return (
    <>
    <Head>
  <title>Harta Hidranti</title>
  <meta name="description" content="Aplicație pentru localizarea hidranților" />
  <meta name="theme-color" content="#da3939ff" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />

  {/* Open Graph Tags for Social Media Previews */}
  <meta property="og:title" content="Harta Hidranti" />
  <meta property="og:description" content="Aplicație pentru localizarea hidranților" />
  <meta property="og:image" content="https://hartahidranti.vercel.app/icons/icon-512.png" />
  <meta property="og:url" content="https://hartahidranti.vercel.app/" />
  <meta property="og:type" content="website" />
</Head>
      <main
        className="flex flex-col items-center min-h-screen bg-cover bg-center text-white"
        style={{
          backgroundImage: "url('/generic-map.png')",
        }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            searchDone ? "opacity-60 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSearchDone(false)}
        />
        <Navbar />

        {deferredPrompt && !doNotShowAgain && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-gray-500/90 rounded-lg shadow-xl text-white">
            <p className="mb-2">Instalează aplicația pe ecranul principal pentru acces rapid! </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto bg-white text-gray-800 font-bold py-1 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              >
                Instalează
              </button>
              <button
                onClick={handleClosePrompt}
                className="w-full sm:w-auto text-white bg-transparent border-2 border-white font-bold py-1 px-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
              >
                Închide
              </button>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="doNotShowAgain"
             //   checked={doNotShowAgain}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="doNotShowAgain" className="ml-2 text-sm text-white">
                Nu mai arăta
              </label>
            </div>
          </div>
        )}

        <div
          className={
            // !searchDone
            //   ? 
            //  "bg-black/50 p-6 m-10 rounded-xl shadow-lg max-w-xl w-full"
              "bg-black/50 mt-4 py-3 sm:p-2 rounded-xl shadow-lg max-w-xl w-full"
          }
        >
          <SearchBarWithMap
            onSearchStatusChange={(status: string) => {
              if (status === "success") {
                setSearchDone(true);
              } else {
                setSearchDone(false);
              }
            }}
          />
          <div className="mt-4 p-2 text-center">
            <p>
              {showFullText
                ? description +
                  "  Este un proiect open-source care își propune să ajute pompierii să aibă acces rapid la informații despre hidranți, facilitând astfel intervențiile în caz de urgență. Orice admin sau pompier poate adăuga sau edita hidranți, contribuind la o bază de date actualizată și precisă. Proiectul este momentan in faza de testare beta."
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
    </>
  );
}