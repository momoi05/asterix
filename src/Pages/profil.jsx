import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Importé pour navigate()

const Profil = (IdProfil) => {
  const token = localStorage.getItem("token");
  const payload = parseJwt(token);
  const userId = payload?.id;
  const [formData, setFormData] = useState({});
  const [placeData, setPlaceData] = useState([]);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Correction du useEffect pour le profil
  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile${IdProfil}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // body: "" supprimé car invalide sur du GET
        });
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Erreur chargement profil :", error);
      }
    };

    fetchProfil();
  }, [API_BASE_URL, token]);

  // Chargement des lieux au montage

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Correction de la suppression
  const handleDeletePlace = async (place) => {
    try {
      const response = await fetch(`${API_BASE_URL}/place/${place.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la suppression");
      }

      // Mise à jour de l'état local après suppression réussie
      setPlaceData((prev) => prev.filter((item) => item.id !== place.id));
    } catch (error) {
      console.error("Erreur suppression place :", error);
      alert("Erreur lors de la suppression de la place: " + error.message);
    }
  };

  return (
    <div className="modal-user">
      <img
        onClick={() => navigate('/image')}
        src={formData.photo}
        alt="avatar"
        style={{ width: 64, marginBottom: 16, cursor: 'pointer' }}
      />
      
      <h2 style={{ color: "#6c4ab6" }}>{formData.name}</h2>
      <p>Email : {formData.email}</p>
      <p>Rôle : {formData.role}</p>
      <p>Faction : {formData.faction}</p>

      {/* 4. Correction du .map() avec un return explicite et une clé key */}
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