import { createGlobalStyle } from 'styled-components';

// Paleta de colores de la aplicación
export const theme = {
  colors: {
    primary: '#00830e', // Color principal especificado
    primaryLight: '#41b549', // Versión más clara del color principal
    primaryDark: '#005a09', // Versión más oscura del color principal
    secondary: '#0b5394', // Color secundario
    accent: '#f7b825', // Color de acento
    background: '#f5f5f5', // Fondo claro
    card: '#ffffff', // Fondo de tarjetas
    text: '#333333', // Texto principal
    textLight: '#666666', // Texto secundario
    border: '#e0e0e0', // Bordes
    success: '#4CAF50', // Éxito
    error: '#f44336', // Error
    warning: '#ff9800', // Advertencia
    info: '#2196f3', // Información
    // Añadimos colores para botones de eliminación
    danger: '#dc3545',
    dangerDark: '#bd2130',
    dangerLight: '#f8d7da',
    dangerBorder: '#f5c6cb',
    dangerText: '#721c24',
    gray: '#6c757d',
  },
  fonts: {
    primary: "'Poppins', sans-serif", // Fuente principal
  },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    large: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    default: '0.3s ease',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    circular: '50%',
  },
};

// Estilos globales
const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: ${theme.fonts.primary};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: ${theme.spacing.md};
  }
  
  p {
    margin-bottom: ${theme.spacing.md};
  }
  
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.default};
    
    &:hover {
      color: ${theme.colors.primaryDark};
    }
  }
  
  ul, ol {
    margin-left: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.md};
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }

  /* ======== Estilos para borrado de usuarios ======== */
  /* DeleteUserButton.css */
  .delete-user-btn {
    background-color: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    border-radius: ${props => props.theme.borderRadius.small};
    padding: 5px 10px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background-color ${props => props.theme.transitions.default};
  }

  .delete-user-btn:hover {
    background-color: ${props => props.theme.colors.dangerDark};
  }

  .delete-confirmation {
    background-color: ${props => props.theme.colors.dangerLight};
    border: 1px solid ${props => props.theme.colors.dangerBorder};
    border-radius: ${props => props.theme.borderRadius.small};
    padding: 10px;
    margin: 10px 0;
  }

  .delete-confirmation p {
    color: ${props => props.theme.colors.dangerText};
    margin-bottom: 10px;
  }

  .delete-actions {
    display: flex;
    gap: 10px;
  }

  .btn-confirm {
    background-color: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    border-radius: ${props => props.theme.borderRadius.small};
    padding: 5px 10px;
    cursor: pointer;
  }

  .btn-cancel {
    background-color: ${props => props.theme.colors.gray};
    color: white;
    border: none;
    border-radius: ${props => props.theme.borderRadius.small};
    padding: 5px 10px;
    cursor: pointer;
  }

  .btn-confirm:disabled, .btn-cancel:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  /* ======== Estilos para la gestión de usuarios ======== */
  /* UserManagement.css */
  .user-management-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .search-input-group {
    display: flex;
    gap: 10px;
  }

  .search-input-group input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: ${props => props.theme.borderRadius.small};
  }

  .search-input-group button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: ${props => props.theme.borderRadius.small};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table th, 
  .users-table td {
    border: 1px solid #dee2e6;
    padding: 12px;
    text-align: left;
  }

  .users-table th {
    background-color: #f8f9fa;
  }

  .users-table tr:hover {
    background-color: #f8f9fa;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .admin-delete-btn {
    background-color: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: ${props => props.theme.borderRadius.small};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
  }

  .admin-delete-btn:hover {
    background-color: ${props => props.theme.colors.dangerDark};
  }

  .access-denied {
    text-align: center;
    margin: 50px auto;
    padding: 30px;
    background-color: ${props => props.theme.colors.dangerLight};
    color: ${props => props.theme.colors.dangerText};
    border: 1px solid ${props => props.theme.colors.dangerBorder};
    border-radius: ${props => props.theme.borderRadius.medium};
    max-width: 600px;
  }

  .no-results {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: ${props => props.theme.colors.textLight};
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: ${props => props.theme.colors.textLight};
  }

  /* ======== Estilos para el perfil de usuario ======== */
  /* UserProfile.css */
  .user-profile-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  .profile-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .profile-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: ${props => props.theme.borderRadius.medium};
    box-shadow: ${props => props.theme.shadows.small};
  }

  .roles-list {
    list-style-type: none;
    padding: 0;
  }

  .roles-list li {
    background-color: #e9ecef;
    padding: 5px 10px;
    margin-bottom: 5px;
    border-radius: ${props => props.theme.borderRadius.small};
    display: inline-block;
    margin-right: 5px;
  }

  .profile-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .profile-delete-btn {
    background-color: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: ${props => props.theme.borderRadius.small};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color ${props => props.theme.transitions.default};
  }

  .profile-delete-btn:hover {
    background-color: ${props => props.theme.colors.dangerDark};
  }
  
  .error {
    text-align: center;
    padding: 20px;
    color: ${props => props.theme.colors.error};
    font-style: italic;
  }
`;

export default GlobalStyles;
