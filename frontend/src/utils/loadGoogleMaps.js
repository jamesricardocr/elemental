/**
 * Carga el script de Google Maps API dinámicamente
 */
let isLoading = false;
let isLoaded = false;

export function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    // Si ya está cargado, resolver inmediatamente
    if (isLoaded && window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Si ya se está cargando, esperar
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (isLoaded && window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 100);
      return;
    }

    isLoading = true;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY no está configurada');
      isLoading = false;
      reject(new Error('Google Maps API key no configurada'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve(window.google.maps);
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Error al cargar Google Maps'));
    };

    document.head.appendChild(script);
  });
}
