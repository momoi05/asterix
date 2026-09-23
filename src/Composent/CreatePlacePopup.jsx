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
        <form onSubmit={handleSubmit} style={{ minWidth: '180px' }}>
          <h4>Nouveau lieu</h4>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px' }}>Nom :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px' }}>Description :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" style={{ cursor: 'pointer', width: '100%' }}>
            Enregistrer
          </button>
        </form>
      </Popup>
    </Marker>
  );
}