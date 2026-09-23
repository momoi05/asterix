import { useRef, useState } from 'react';

const defaultImage =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80';

function ImagePage() {
  const inputRef = useRef(null);
  const [image, setImage] = useState(defaultImage);
  const [isDragging, setIsDragging] = useState(false);

  const updateImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez choisir un fichier image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    updateImage(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    updateImage(file);
  };

  return (
    <div className="image-page">
      <div className="image-card">
        <h1>Photo de profil</h1>

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
            <img src={image} alt="Photo de profil" />
          </div>
          <p>Glissez une image ici ou cliquez pour choisir un fichier</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="image-button"
          onClick={() => inputRef.current?.click()}
        >
          Choisir une photo
        </button>
      </div>
    </div>
  );
}

export default ImagePage;
