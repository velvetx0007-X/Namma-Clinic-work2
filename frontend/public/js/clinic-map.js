/**
 * Clinic Map Logic
 * Uses Leaflet.js, OpenStreetMap, and Overpass API
 */

let map;
let userMarker;
let markers = [];
const displayPanel = document.getElementById('info-panel');
const loader = document.getElementById('loader');

// Initialize map
function initMap() {
    // Default center (can be anywhere, we'll update with geolocation)
    const defaultCenter = [13.0827, 80.2707]; // Chennai
    
    map = L.map('map').setView(defaultCenter, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Initial Geolocation
    getCurrentLocation();
}

// Get user's current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    loader.style.display = 'flex';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            updateUserLocation(lat, lng);
            findNearbyClinics(lat, lng);
            loader.style.display = 'none';
        },
        (error) => {
            console.error("Error getting location:", error);
            loader.style.display = 'none';
            let msg = "Unable to retrieve your location.";
            if (error.code === 1) msg = "Location permission denied. You can still search manually using the search bar.";
            alert(msg);
        }
    );
}

// Search for a location using Nominatim API
async function searchLocation() {
    const query = document.getElementById('location-input').value;
    if (!query) return;

    loader.style.display = 'flex';
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            updateUserLocation(lat, lng);
            findNearbyClinics(lat, lng);
        } else {
            alert("Location not found. Please try a different search term.");
        }
    } catch (error) {
        console.error("Search error:", error);
        alert("Error performing search. Please try again.");
    } finally {
        loader.style.display = 'none';
    }
}

// Update user location marker
function updateUserLocation(lat, lng) {
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    const userIcon = L.divIcon({
        html: `<div style="background: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
        className: 'user-location-icon',
        iconSize: [15, 15]
    });

    userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map)
        .bindPopup("<b>You are here</b>").openPopup();
    
    map.setView([lat, lng], 14);
}

// Fetch nearby clinics using Overpass API
async function findNearbyClinics(lat, lng) {
    // Overpass QL query: find hospitals/clinics/dentists/doctors within 3000m
    const radius = 3000;
    const query = `
        [out:json];
        (
          node["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
          way["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
          relation["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
        );
        out center;
    `;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Clear old markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        data.elements.forEach(element => {
            const clinicLat = element.lat || element.center.lat;
            const clinicLng = element.lon || element.center.lng;
            const name = element.tags.name || "Medical Facility";
            const address = element.tags["addr:street"] || "Address not available";
            
            const distance = calculateDistance(lat, lng, clinicLat, clinicLng);
            
            addClinicMarker(clinicLat, clinicLng, name, address, distance);
        });
        
    } catch (error) {
        console.error("Error fetching clinics:", error);
    }
}

// Add marker for clinic
function addClinicMarker(lat, lng, name, address, distance) {
    // Clinic Icon (+ symbol)
    const clinicIcon = L.divIcon({
        html: `<div style="background: white; border: 2px solid #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </div>`,
        className: 'clinic-marker-icon',
        iconSize: [30, 30]
    });

    const marker = L.marker([lat, lng], { icon: clinicIcon }).addTo(map);
    
    marker.on('click', () => {
        showClinicDetails(name, address, distance, lat, lng);
    });

    markers.push(marker);
}

// Update details panel below map
function showClinicDetails(name, address, distance, lat, lng) {
    document.getElementById('display-name').textContent = name;
    document.getElementById('display-distance').textContent = `${distance} km away`;
    document.getElementById('display-address').textContent = address;
    
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    document.getElementById('link-directions').href = directionsUrl;
    
    displayPanel.style.display = 'block';
    displayPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Haversine formula to calculate distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
}

// Event Listeners
document.getElementById('btn-current-location').addEventListener('click', getCurrentLocation);
document.getElementById('search-btn').addEventListener('click', searchLocation);
document.getElementById('location-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchLocation();
    }
});

// Start
window.onload = initMap;
