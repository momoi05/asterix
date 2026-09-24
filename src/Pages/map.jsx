import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import CreatePlacePopup from '../Composent/CreatePlacePopup';
import Helmet from '../Composent/Helmet';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const markerEmoji = { gaulois: '🛖', romain: '🏛️', new: '✍️' };

const placeIcon = (faction) => L.divIcon({
  className: '',
  html: `<div class="place-marker place-marker--${faction}"><span>${markerEmoji[faction] || '📜'}</span></div>`,
  iconSize: [40, 40],
  iconAnchor: [4, 40],
  popupAnchor: [16, -36],
});

const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-marker"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Composant interne pour forcer l'animation de centrage
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, { duration: 1 });
  }, [position, map]);

  return null;
}

export default function MyMap() {
  const defaultPosition = [48.8566, 2.3522];
  const [userPosition, setUserPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locating, setLocating] = useState(false);
  const token = localStorage.getItem("token");
  const [places, setPlaces] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur serveur lors de la récupération");

        const data = await res.json();
        setPlaces(data.places || []);

        const imageName = data.profile?.profilePicture?.imageName;
        if (imageName) setAvatar(`${API_BASE_URL}/images/${imageName}`);
      } catch (err) {
        console.error("Erreur chargement des points :", err);
      }
    };

    fetchPlaces();
  }, [token]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);
        setErrorMsg(null);
        setLocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error);
        setErrorMsg("Impossible de récupérer votre position (accès refusé ou indisponible).");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCreatePlace = async (placeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/places/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(placeData),
      });

      if (!response.ok) throw new Error("Erreur lors de la création du lieu");

      const createdPlace = await response.json();
      setPlaces((prev) => [...prev, createdPlace]);
    } catch (err) {
      console.error("Erreur création :", err);
      setErrorMsg("Le lieu n'a pas pu être créé.");
    } finally {
      setSelectedCoords(null);
    }
  };

  return (
    <div className='map'>
      {/* Hors du MapContainer : un clic ici ne remonte plus jusqu'à la carte */}
      <div className='geoloc'>
        <div className='geoloc-brand'>
          <Helmet size={44} />
          <span className='geoloc-title'>Le Village</span>
        </div>

        <button
          type="button"
          onClick={handleLocateUser}
          className='button button--blue button-geoloc'
          disabled={locating}
        >
          {locating ? 'Recherche...' : '📍 Me géolocaliser'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/profil')}
          className='profile-btn'
          title="Voir mon profil"
          aria-label="Voir mon profil"
        >
          {avatar ? (
            <img src={avatar} alt="" className='profile-img' />
          ) : (
            <Helmet size={34} />
          )}
        </button>
      </div>

      {errorMsg && (
        <div className='map-toast' role="alert">
          <div className='error-message'>{errorMsg}</div>
        </div>
      )}

      {!selectedCoords && (
        <p className='map-hint'>Clique sur la carte pour ajouter un lieu</p>
      )}

      <MapContainer
        className='lien-map'
        center={defaultPosition}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && <RecenterMap position={userPosition} />}

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}

        <ClickHandler onMapClick={(latlng) => setSelectedCoords(latlng)} />

        {places.map((item, index) => {
          const lat = item.lat || item.latitude;
          const lng = item.lng || item.long || item.longitude;

          if (!lat || !lng) return null;

          return (
            <Marker
              key={item.id || item._id || index}
              position={[lat, lng]}
              icon={placeIcon(item.faction)}
            >
              <Popup>
                <strong>{item.name || "Lieu"}</strong>
                {item.description && <p>{item.description}</p>}
              </Popup>
            </Marker>
          );
        })}

        {selectedCoords && (
          <CreatePlacePopup
            key={`${selectedCoords.lat},${selectedCoords.lng}`}
            position={selectedCoords}
            icon={placeIcon('new')}
            onClose={() => setSelectedCoords(null)}
            onSubmit={handleCreatePlace}
          />
        )}
      </MapContainer>
    </div>
  );
}
