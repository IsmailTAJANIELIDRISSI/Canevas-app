import { alexsys } from "./envirenment";
const token = localStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "multipart/form-data"
};
const getClientList = async () => {
  try { 
    const response = await alexsys.get('/clients/',{headers});
    return response.data;
  } catch (error) { 
    console.error('Error fetching client list:', error);
    throw new Error('Failed to fetch client list');
  }
}; 
const createClient = async (clientData) => {
  try {
    
    const response = await alexsys.post('/clients/', clientData,{headers});
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw new Error('Failed to create client');
  }
};  
const showclient = async (idcl) => {
  try {
    const response = await alexsys.get(`/clients/show/${idcl}/`,{headers});
    return response.data;
  } catch (error) {
    console.error('Error fetching client :', error);
    throw new Error('Failed to fetch client');
  }
};
const updateClient = async (clientId, clientData) => {
  try {
    const response = await alexsys.put(`/clients/${clientId}/`, clientData,{headers});
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw new Error('Failed to update client');
  }
};

const deleteClient = async (clientId) => {
  try {
    await alexsys.delete(`/clients/${clientId}/`,{headers});
  } catch (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }
};

export { getClientList, createClient, updateClient, deleteClient,showclient };
