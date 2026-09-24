import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, imageUrl, parseJwt, uploadImage } from "../utils/images";

const FACTION_NAMES = { 1: 'gaulois', 2: 'romain' };

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80';

const Profil = () => {
  const token = localStorage.getItem("token");
  const payload = useMemo(() => parseJwt(token), [token]);
  const profileId = payload?.profileId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: payload?.name || payload?.email || 'Utilisateur',
    email: payload?.email || '',
    role: payload?.roles?.join(', ') || '',
    faction: payload?.faction || '',
    photo: payload?.photo || defaultAvatar,
  });
  const [placeData, setPlaceData] = useState([]);
  const [uploadingPlaceId, setUploadingPlaceId] = useState(null);
  const [placeError, setPlaceError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchProfil = async () => {
      try {
        if (!API_BASE_URL || !profileId) {
          console.warn('Profil non chargé : API_BASE_URL ou profileId manquant (reconnecte-toi)', { API_BASE_URL, profileId, payload });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/profile/${profileId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.warn('Profil non chargé : réponse', response.status, await response.text());
          return;
        }

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          name: data.pseudo || prev.name,
          faction: data.faction ?? prev.faction,
          photo: imageUrl(data.profilePicture) || prev.photo,
        }));
        setPlaceData(data.places || []);
      } catch (error) {
        console.error('Erreur chargement profil :', error);
      }
    };

    fetchProfil();
  }, [navigate, payload, profileId, token]);

  const handleDeletePlace = async (place) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/places/delete/${place.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Échec de la suppression');
      }

      setPlaceData((prev) => prev.filter((item) => item.id !== place.id));
    } catch (error) {
      console.error('Erreur suppression place :', error);
      alert('Erreur lors de la suppression de la place: ' + error.message);
    }
  };

  const handlePlaceImage = async (place, file) => {
    if (!file) return;

    setUploadingPlaceId(place.id);
    setPlaceError('');
    try {
      const updatedPlace = await uploadImage(`/api/places/${place.id}/image`, file, token);
      setPlaceData((prev) => prev.map((item) => (item.id === place.id ? { ...item, ...updatedPlace } : item)));
    } catch (error) {
      console.error('Erreur upload image du lieu :', error);
      setPlaceError(`L'image de « ${place.name} » n'a pas pu être envoyée : ${error.message}`);
    } finally {
      setUploadingPlaceId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login_check');
  };

  const factionKey = FACTION_NAMES[formData.faction] || formData.faction;
  const factionLabel = factionKey === 'gaulois' ? 'Gaulois' : factionKey === 'romain' ? 'Romain' : factionKey;

  return (
    <main className="profile-page">
      <div className="modal-user">
        <div className="profile-top">
          <button type="button" className="back-link" onClick={() => navigate('/map')}>
            ← Retour à la carte
          </button>
          {factionLabel && (
            <span className={`faction-badge faction-badge--${factionKey}`}>{factionLabel}</span>
          )}
        </div>

        <div className="avatar-wrap">
          <img
            onClick={() => navigate('/image')}
            src={formData.photo || defaultAvatar}
            alt="avatar"
            className="profile-avatar"
          />
          <button
            type="button"
            className="avatar-edit"
            onClick={() => navigate('/image')}
            aria-label="Changer la photo de profil"
          >
            ✏️
          </button>
        </div>

        <h2 className="profile-name">{formData.name}</h2>

        <dl className="profile-info">
          <div>
            <dt>Email</dt>
            <dd>{formData.email || '—'}</dd>
          </div>
          <div>
            <dt>Rôle</dt>
            <dd>{formData.role || '—'}</dd>
          </div>
          <div>
            <dt>Faction</dt>
            <dd>{factionLabel || '—'}</dd>
          </div>
        </dl>

        <h3 className="section-title">Mes lieux</h3>
        {placeError && <div className="error-message">{placeError}</div>}
        {placeData.length === 0 ? (
          <p className="empty-state">Aucun lieu pour l'instant. Clique sur la carte pour en ajouter un.</p>
        ) : (
          <ul className="places-list">
            {placeData.map((item) => {
              const picture = imageUrl(item.picture);
              const uploading = uploadingPlaceId === item.id;

              return (
                <li key={item.id || item.name} className="place-item">
                  <div className="place-thumb">
                    {picture ? <img src={picture} alt={item.name} /> : <span aria-hidden="true">🛖</span>}
                  </div>
                  <div className="place-item-body">
                    <p className="place-item-name">{item.name}</p>
                    <p className="place-item-coords">{item.lat}, {item.long}</p>
                  </div>
                  <div className="place-item-actions">
                    <label className={`button button--blue place-upload ${uploading ? 'is-busy' : ''}`}>
                      {uploading ? <span className="spinner"></span> : '📷'}
                      <span>{picture ? 'Changer' : 'Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={(e) => {
                          handlePlaceImage(item, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeletePlace(item)}
                      className="button button--red Drop-place"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button type="button" className="button logout-button" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>
    </main>
  );
};

export default Profil;