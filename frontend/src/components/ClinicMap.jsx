import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import './ClinicMap.css';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 13);
        }
    }, [position, map]);
    return null;
};

// Component to handle routing
const RoutingControl = ({ userLocation, clinicLocation, onRouteFound }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!userLocation || !clinicLocation) return;

        // Remove existing routing control if any
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        // Create new routing control
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(clinicLocation.lat, clinicLocation.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#059669', weight: 4, opacity: 0.7 }]
            },
            createMarker: () => null, // Don't create markers, we have our own
        }).addTo(map);

        // Listen for route found event
        routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            if (onRouteFound) {
                onRouteFound({
                    distance: (summary.totalDistance / 1000).toFixed(2), // Convert to km
                    time: Math.round(summary.totalTime / 60) // Convert to minutes
                });
            }
        });

        routingControlRef.current = routingControl;

        // Cleanup on unmount
        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, userLocation, clinicLocation, onRouteFound]);

    return null;
};

const ClinicMap = ({ clinics, userLocation, getDirectionsUrl }) => {
    const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]); // Default: Chennai
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            setMapCenter([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation]);

    const handleClinicSelect = (clinic) => {
        setSelectedClinic(clinic);
        setRouteInfo(null); // Reset route info when selecting new clinic
    };

    const handleRouteFound = (info) => {
        setRouteInfo(info);
    };

    return (
        <div className="clinic-map-wrapper">
            <div className="map-container-inner">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="leaflet-container"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {userLocation && userLocation.lat && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>📍 You are here</Popup>
                        </Marker>
                    )}

                    {clinics.map((clinic) => (
                        <Marker
                            key={clinic._id}
                            position={[
                                clinic.location?.lat || 13.0827,
                                clinic.location?.lng || 80.2707
                            ]}
                            eventHandlers={{
                                click: () => handleClinicSelect(clinic)
                            }}
                        >
                            <Popup>
                                <div className="map-popup">
                                    <h3>{clinic.clinicName}</h3>
                                    <p><strong>Dr. {clinic.userName}</strong></p>
                                    <p>{clinic.specialization || 'General Clinic'}</p>
                                    {clinic.distance && (
                                        <p style={{ color: '#059669', fontWeight: 'bold' }}>
                                            📍 {clinic.distance} km away
                                        </p>
                                    )}
                                    <p>{clinic.address || 'Location details not provided'}</p>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button
                                            className="btn-book-map"
                                            onClick={() => window.location.hash = '#appointments'}
                                        >
                                            Book Appointment
                                        </button>
                                        {getDirectionsUrl && getDirectionsUrl(clinic) && (
                                            <a
                                                href={getDirectionsUrl(clinic)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    borderRadius: '5px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                🗺️ Directions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Show route when clinic is selected */}
                    {selectedClinic && selectedClinic.location?.lat && selectedClinic.location?.lng && (
                        <RoutingControl
                            userLocation={userLocation}
                            clinicLocation={selectedClinic.location}
                            onRouteFound={handleRouteFound}
                        />
                    )}

                    <RecenterMap position={mapCenter} />
                </MapContainer>
            </div>

            {selectedClinic && (
                <div className="clinic-details-overlay">
                    <button className="close-overlay" onClick={() => {
                        setSelectedClinic(null);
                        setRouteInfo(null);
                    }}>×</button>
                    <h2>{selectedClinic.clinicName}</h2>
                    <div className="detail-item">
                        <span>👨‍⚕️</span>
                        <p>Dr. {selectedClinic.userName}</p>
                    </div>
                    <div className="detail-item">
                        <span>🧪</span>
                        <p>{selectedClinic.specialization}</p>
                    </div>
                    {selectedClinic.distance && (
                        <div className="detail-item">
                            <span>📍</span>
                            <p><strong>{selectedClinic.distance} km away</strong></p>
                        </div>
                    )}
                    {routeInfo && (
                        <div className="detail-item" style={{ background: '#f0f7ff', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                            <span>🚗</span>
                            <div>
                                <p><strong>Route Distance: {routeInfo.distance} km</strong></p>
                                <p><strong>Estimated Time: {routeInfo.time} minutes</strong></p>
                            </div>
                        </div>
                    )}
                    <div className="detail-item">
                        <span>📍</span>
                        <p>{selectedClinic.address}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button className="btn-book-now">Request Appointment</button>
                        {getDirectionsUrl && getDirectionsUrl(selectedClinic) && (
                            <a
                                href={getDirectionsUrl(selectedClinic)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-book-now"
                                style={{ background: '#4CAF50', textAlign: 'center' }}
                            >
                                🗺️ Get Directions
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicMap;
