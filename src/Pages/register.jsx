import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Helmet from "../Composent/Helmet";

const FACTIONS = [
  { value: "gaulois", label: "Gaulois", emoji: "🛖", motto: "Le village résiste" },
  { value: "romain", label: "Romain", emoji: "🏛️", motto: "Ave César !" },
];

const Register = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    faction: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  //Action de création du compte
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation côté client
    if (!formData.email || !formData.password || !formData.faction || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      console.log('Tentative d\'inscription avec:', {
        email: formData.email,
        faction: formData.faction,
        password: '***'
      });

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faction: formData.faction,
          email: formData.email,
          password: formData.password,  
        }),
      });

      console.log('Statut de la réponse:', response.status);

      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        throw new Error('Le serveur a renvoyé une réponse invalide');
      }

      if (response.ok) {
        console.log('Inscription réussie:', data);
        setSuccess('Compte créé ! Vérifie tes emails pour confirmer ton adresse. Redirection vers la connexion…');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        if (response.status === 400) {
          setError(data.error || data.message || 'Données d\'inscription invalides');
        } else if (response.status === 409) {
          setError('Un compte avec cet email existe déjà');
        } else if (response.status === 500) {
          setError('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setError(data.error || data.message || 'Erreur lors de la création du compte');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setError(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">
      <div className="box">
        <div className="brand">
          <Helmet className="brand-helmet" size={84} />
          <p className="brand-kicker">Gaulois irréductible ou légionnaire de César ? Choisis ton camp.</p>
        </div>
        <h2 className="title">S'inscrire</h2>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div>
            <input
              type="email"
              id="signin-email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="signin-password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="signin-confirm-password"
              name="confirmPassword"
              placeholder="Confirmation mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <fieldset className="faction-picker">
            <legend>Faction</legend>
            <div className="faction-options">
              {FACTIONS.map((faction) => (
                <label key={faction.value} className="faction-option">
                  <input
                    type="radio"
                    name="faction"
                    value={faction.value}
                    checked={formData.faction === faction.value}
                    onChange={handleChange}
                    required
                  />
                  <span className={`faction-card faction-card--${faction.value}`}>
                    <span className="faction-emoji" aria-hidden="true">{faction.emoji}</span>
                    <span className="faction-name">{faction.label}</span>
                    <span className="faction-motto">{faction.motto}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="button" disabled={loading}>
            {loading ? (
              <span className="button-content">
                <span className="spinner"></span>
                Création en cours...
              </span>
            ) : (
              "Créer le compte"
            )}
          </button>
        </form>
        <Link to="/" className="text-link">
          Déjà du village ? Se connecter
        </Link>
      </div>
    </main>
  );
};

export default Register;
