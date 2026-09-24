import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Helmet from '../Composent/Helmet';
import { API_BASE_URL, imageUrl, parseJwt, uploadImage } from '../utils/images';

function ImagePage() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const profileId = useMemo(() => parseJwt(token)?.profileId, [token]);

  const [currentImage, setCurrentImage] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Photo actuelle du profil
  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setCurrentImage(imageUrl(data.profilePicture));
      } catch (err) {
        console.error('Erreur chargement photo :', err);
      }
    };

    fetchProfile();
  }, [profileId, token]);

  // Libère l'URL de l'aperçu quand il change
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const selectFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Choisis un fichier image valide.');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleSave = async () => {
    if (!file) return;

    if (!profileId) {
      setError('Profil introuvable, reconnecte-toi.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      await uploadImage(`/api/profile/${profileId}/image`, file, token);
      navigate('/profil');
    } catch (err) {
      console.error('Erreur upload photo :', err);
      setError(`L'envoi a échoué : ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const shown = preview || currentImage;

  return (
    <div className="image-page">
      <div className="image-card">
        <button type="button" className="back-link" onClick={() => navigate('/profil')}>
          ← Retour au profil
        </button>
        <h1>Photo de profil</h1>

        {error && <div className="error-message">{error}</div>}

        <div
          className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="image-avatar">
            {shown ? <img src={shown} alt="Photo de profil" /> : <Helmet size={150} />}
          </div>
          <p>Glisse une image ici ou clique pour choisir un fichier</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />

        <div className="image-actions">
          <button
            type="button"
            className="button button--blue"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Choisir une photo
          </button>
          <button
            type="button"
            className="button"
            onClick={handleSave}
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className="button-content">
                <span className="spinner"></span>
                Envoi...
              </span>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePage;
