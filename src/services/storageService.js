import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadSolicitudFiles = async (solicitudId, files) => {
  if (!files || files.length === 0) return [];
  const storage = getStorage();
  const uploadedFiles = [];

  for (const file of files) {
    const fileRef = ref(storage, `solicitudes/${solicitudId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    uploadedFiles.push({ name: file.name, url, size: file.size, type: file.type });
  }
  return uploadedFiles;
};
