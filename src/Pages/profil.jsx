import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const parseJwt = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
};

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80';

const Profil = () => {
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  const userId = payload?.id || payload?.userId || payload?.sub;
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    name: payload?.name || payload?.email || 'Utilisateur',
    email: payload?.email || '',
    role: payload?.role || '',
    faction: payload?.faction || '',
    photo: payload?.photo || defaultAvatar,
  });
  const [placeData, setPlaceData] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchProfil = async () => {
      try {
        const baseUser = {
          name: payload?.name || payload?.email || 'Utilisateur',
          email: payload?.email || '',
          role: payload?.role || '',
          faction: payload?.faction || '',
          photo: payload?.photo || defaultAvatar,
        };

        setFormData(baseUser);

        if (!API_BASE_URL || !userId) return;

        const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          ...data,
          photo: data.photo || prev.photo || defaultAvatar,
        }));
      } catch (error) {
        console.error('Erreur chargement profil :', error);
      }
    };

    fetchProfil();
  }, [API_BASE_URL, navigate, payload, token, userId]);

  const handleDeletePlace = async (place) => {
    try {
      const response = await fetch(`${API_BASE_URL}/place/${place.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la suppression');
      }

      setPlaceData((prev) => prev.filter((item) => item.id !== place.id));
    } catch (error) {
      console.error('Erreur suppression place :', error);
      alert('Erreur lors de la suppression de la place: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login_check');
  };

  return (
    <div className="modal-user">
      <img
        onClick={() => navigate('/image')}
        src={formData.photo || defaultAvatar}
        alt="avatar"
        className="profile-avatar"
      />

      <h2 className="profile-name">{formData.name}</h2>
      <p>Email : {formData.email}</p>
      <p>Rôle : {formData.role}</p>
      <p>Faction : {formData.faction}</p>

      <button type="button" className="button logout-button" onClick={handleLogout}>
        Se déconnecter
      </button>

      {placeData.map((item) => (
        <div key={item.id || item.name}>
          <p>Nom : {item.name}</p>
          <p>Latitude : {item.lat}</p>
          <p>Longitude : {item.long}</p>
          <button
            onClick={() => handleDeletePlace(item)}
            className="Drop-place"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
};

export default Profil;