import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';

export default function CreatePlacePopup({ position, icon, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      lat: position.lat,
      long: position.lng,
    });
  };

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        add: (e) => e.target.openPopup(),
        popupclose: onClose,
      }}
    >
      <Popup>
        <form onSubmit={handleSubmit} className="popup-form">
          <h4>Nouveau lieu</h4>

          <div className="popup-field">
            <label className="popup-label" htmlFor="place-name">Nom :</label>
            <input
              id="place-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="popup-input"
            />
          </div>

          <div className="popup-field">
            <label className="popup-label" htmlFor="place-description">Description :</label>
            <textarea
              id="place-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="popup-textarea"
            />
          </div>

          <button type="submit" className="button popup-submit">
            Enregistrer
          </button>
        </form>
      </Popup>
    </Marker>
  );
}
