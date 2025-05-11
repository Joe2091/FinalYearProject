import axios from 'axios';
import { auth } from '@/plugins/firebase';

const API_URL = 'https://www.notemax.site/api/notes'; // API Base notes URL

//function attaching Firebase token to all requests
const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  //fresh ID token from Firebase
  const token = await user.getIdToken(true);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Fetch all notes for authenticated user
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

// Update a note by ID
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

// Delete a note by ID
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
