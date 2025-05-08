import axios from 'axios';
import { auth } from '@/plugins/firebase';

const API_URL = 'https://notemax.site/api/notes'; //Back to Local for Development (will switch from AWS to Azure)

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken(true);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Fetch all notes
export const getNotes = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(API_URL, headers);
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

// Create a new note
export const createNote = async (note) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(API_URL, note, headers);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    return null;
  }
};

// Update a note
export const updateNote = async (id, note) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/${id}`, note, headers);
    return response.data;
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    return null;
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/${id}`, headers);
    return response.data;
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return null;
  }
};
