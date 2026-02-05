

export interface Location {
    latitude: number;
    longitude: number;
  }
  
  /**
   * Detects if the website is running inside a WebView.
   */
  export function isWebView(): boolean {
    const userAgent = navigator.userAgent || ''; // Get the userAgent string
  
    // Check for WebView on Android and iOS
    const isAndroidWebView = userAgent.includes('wv') && /Android/i.test(userAgent);
    const isIOSWebView = userAgent.includes('AppleWebKit') && /iPhone|iPad|iPod/i.test(userAgent);
  
    return isAndroidWebView || isIOSWebView;
  }

  export function isIosWebView(): boolean {
    const userAgent = navigator.userAgent || ''; // Get the userAgent string
  
    // Check for WebView on Android and iOS
    const isIOSWebView = userAgent.includes('AppleWebKit') && /iPhone|iPad|iPod/i.test(userAgent);
  
    return isIOSWebView;
  }
  
  
  /**
   * Requests the location from React Native if in WebView, otherwise uses HTML5 geolocation.
   */


  export function getLocationByIP(): Promise<Location | null> {
    return new Promise((resolve, reject) => {
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          if (data && data.latitude && data.longitude) {
            resolve({
              latitude: data.latitude,
              longitude: data.longitude,
            });
          } else {
            console.warn("IP-based location data is incomplete.");
            resolve(null);
          }
        })
        .catch(error => {
          console.error(new Error("Failed to fetch location from IP: " + error.message));
          resolve(null);
        });
    });
  }

  export function getLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (isWebView()) {
        // Listen for location response from React Native
        (window as any).receiveLocation = (location: Location) => {
          resolve(location);
        };
        
        // Request location from React Native
        (window as any).ReactNativeWebView?.postMessage("getLocation");
      } else if (navigator.geolocation) {
        // Use HTML5 geolocation
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error("Failed to get location: " + error.message));
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }

  export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const toRad = (value: number): number => (value * Math.PI) / 180; // Convert degrees to radians

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };
  
  /**
   * Handles the received location from either WebView or HTML5 geolocation.
   */
  export function handleLocation(location: Location): void {
    console.log("Final Location:", location.latitude, location.longitude);
    alert(`Latitude: ${location.latitude}, Longitude: ${location.longitude}`);
  }