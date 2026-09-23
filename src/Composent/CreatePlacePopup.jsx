import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';

export default function CreatePlacePopup({ position, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      lat: position.lat,
      long: position.long,
    });
  };

  return (
    <Marker position={position}>
      <Popup defaultOpen onClose={onClose}>
        <form onSubmit={handleSubmit} className="popup-form">
          <h4>Nouveau lieu</h4>

          <div className="popup-field">
            <label className="popup-label">Nom :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="popup-input"
            />
          </div>

          <div className="popup-field">
            <label className="popup-label">Description :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="popup-textarea"
            />
          </div>

          <button type="submit" className="popup-submit">
            Enregistrer
          </button>
        </form>
      </Popup>
    </Marker>
  );
}