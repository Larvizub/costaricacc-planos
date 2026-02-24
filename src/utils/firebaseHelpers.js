/**
 * Utilidades para operaciones comunes con Firebase
 */

import { ref, push, set, update, remove, get, query, orderByChild, equalTo } from 'firebase/database';
import { db, storage } from '../firebase/firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Crea un nuevo registro en la base de datos
 * @param {string} path - Ruta en la base de datos
 * @param {object} data - Datos a guardar
 * @returns {Promise<string>} ID del nuevo registro
 */
export const createRecord = async (path, data) => {
  try {
    const newRef = push(ref(db, path));
    await set(newRef, data);
    return newRef.key;
  } catch (error) {
    console.error('Error al crear registro:', error);
    throw error;
  }
};

/**
 * Actualiza un registro existente en la base de datos
 * @param {string} path - Ruta en la base de datos
 * @param {string} id - ID del registro
 * @param {object} data - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateRecord = async (path, id, data) => {
  try {
    const recordRef = ref(db, `${path}/${id}`);
    await update(recordRef, data);
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    throw error;
  }
};

/**
 * Elimina un registro de la base de datos
 * @param {string} path - Ruta en la base de datos
 * @param {string} id - ID del registro
 * @returns {Promise<void>}
 */
export const deleteRecord = async (path, id) => {
  try {
    const recordRef = ref(db, `${path}/${id}`);
    await remove(recordRef);
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    throw error;
  }
};

/**
 * Obtiene un registro por su ID
 * @param {string} path - Ruta en la base de datos
 * @param {string} id - ID del registro
 * @returns {Promise<object|null>} Datos del registro
 */
export const getRecordById = async (path, id) => {
  try {
    const recordRef = ref(db, `${path}/${id}`);
    const snapshot = await get(recordRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener registro:', error);
    throw error;
  }
};

/**
 * Busca registros por un campo específico
 * @param {string} path - Ruta en la base de datos
 * @param {string} field - Campo por el que filtrar
 * @param {any} value - Valor a buscar
 * @returns {Promise<object[]>} Lista de registros que cumplen el criterio
 */
export const findRecordsByField = async (path, field, value) => {
  try {
    const recordsRef = ref(db, path);
    const recordsQuery = query(recordsRef, orderByChild(field), equalTo(value));
    const snapshot = await get(recordsQuery);
    
    const records = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        records.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return records;
  } catch (error) {
    console.error('Error al buscar registros:', error);
    throw error;
  }
};

/**
 * Sube un archivo a Firebase Storage
 * @param {string} path - Ruta en Storage
 * @param {File} file - Archivo a subir
 * @returns {Promise<string>} URL del archivo
 */
export const uploadFile = async (path, file) => {
  try {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} path - Ruta del archivo en Storage
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
  try {
    const fileRef = storageRef(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};
