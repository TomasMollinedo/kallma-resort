const API_URL = 'http://localhost:4000/api';

/**
 * Servicio de API para comunicación con el backend
 */

/**
 * Función para registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario (email, password, nombre, telefono, dni)
 * @returns {Promise} Respuesta del servidor
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función para hacer login
 * @param {Object} credentials - Credenciales del usuario (email, password)
 * @returns {Promise} Respuesta del servidor con token y datos del usuario
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función para hacer peticiones autenticadas
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP
 * @param {Object} body - Cuerpo de la petición
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta del servidor
 */
export const authenticatedRequest = async (endpoint, method = 'GET', body = null, token) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
