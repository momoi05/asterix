import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import CreatePlacePopup from '../Composent/CreatePlacePopup';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Import du hook de navigation

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MyMap() {
  const defaultPosition = [48.8566, 2.3522];
  const [userPosition, setUserPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const token = localStorage.getItem("token");
  const [places, setPlaces] = useState([48.8566, 2.3522]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  
  const navigate = useNavigate(); // Hook pour la redirection

  // Composant interne pour forcer l'animation de centrage
  function RecenterMap({ position }) {
    const map = useMap();

    useEffect(() => {    
      if (!token) {
        navigate('/');
        return;
      }

      if (position) {
        map.flyTo(position, 15, { duration: 1 });
      }
    }, [position, map]);
    return null;
  }

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('longitude latitude :', longitude, latitude );
        setUserPosition([latitude, longitude]);
        setErrorMsg(null);
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error);
        setErrorMsg("Impossible de récupérer votre position (accès refusé ou indisponible).");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchPlaces = useCallback(async () => {
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
      setPlaces(data);
    } catch (err) {
      console.error("Erreur chargement des points :", err);
    }
  }, [token]);

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
    } finally {
      setSelectedCoords(null);
    }
  };

  return (
    <div className='map'>
      <MapContainer
        className='lien-map'
        center={userPosition || defaultPosition}
        zoom={13}
        scrollWheelZoom={false}
      >
        <div className='geoloc'>
          <button
            onClick={handleLocateUser}
            className='button-geoloc'
          >
            📍 Me géolocaliser
          </button>

          <button
            onClick={() => navigate('/profil')}
            className='profile-btn'
            title="Voir mon profil"
          >
            <img
              src="https://via.placeholder.com/150"
              alt="Profil"
              className='profile-img'
            />
          </button>
        </div>

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && <RecenterMap position={userPosition} />}

        {userPosition && (
          <Marker position={userPosition} />
        )}

        <ClickHandler onMapClick={(latlng) => setSelectedCoords(latlng)} />

        {places.map((item, index) => {
          const lat = item.lat || item.latitude;
          const lng = item.lng || item.long || item.longitude;

          if (!lat || !lng) return null;

          return (
            <Marker key={item.id || item._id || index} position={[lat, lng]}>
              <Popup>
                <strong>{item.name || "Lieu"}</strong>
                {item.description && <p>{item.description}</p>}
              </Popup>
            </Marker>
          );
        })}

        {selectedCoords && (
          <CreatePlacePopup
            position={selectedCoords}
            onClose={() => setSelectedCoords(null)}
            onSubmit={handleCreatePlace}
          />
        )}
      </MapContainer>
    </div>
  );
}