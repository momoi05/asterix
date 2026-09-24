export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const parseJwt = (token) => {
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

// URL publique d'une image servie par VichUploader (uri_prefix: /images)
export const imageUrl = (image) =>
  image?.imageName ? `${API_BASE_URL}/images/${image.imageName}` : null;

// Réduit l'image avant l'envoi : PHP refuse par défaut les fichiers de plus de 2 Mo
const MAX_SIZE = 1600;

export const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Impossible de convertir l'image"))),
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Fichier image illisible'));
    };
    img.src = url;
  });

// Envoie une image sur une route d'upload de l'API (champ "imageFile")
export const uploadImage = async (path, file, token) => {
  const blob = await resizeImage(file);
  const body = new FormData();
  body.append('imageFile', blob, 'image.jpg');

  // Pas de Content-Type : le navigateur ajoute lui-même le boundary multipart
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erreur ${response.status}`);
  }

  return data;
};
