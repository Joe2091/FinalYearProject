import axios from "axios";

const API_URL = "http://16.170.146.39/api/notes"; //Note for future, Update this when deploying

// Fetch all notes
export const getNotes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

// Create a new note
export const createNote = async (note) => {
  try {
    const response = await axios.post(API_URL, note);
    return response.data;
  } catch (error) {
    console.error("Error creating note:", error);
    return null;
  }
};

// Update a note
export const updateNote = async (id, note) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, note);
    return response.data;
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    return null;
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return null;
  }
};
