import axios from 'axios';

export const alexsys = axios.create({
    baseURL: "http://localhost:3000",
});

// Get all data
const getngp = async () => {
    try {
        const response = await alexsys.get('/data');
  
        return response.data;
    } catch (error) {
        console.error('Error fetching data list:', error);
        throw new Error('Failed to fetch data list');
    }
};

// Get data by filter
const filterngp = async (designationCommerciale) => {
    try {
        const response = await alexsys.get(`/data/filter?designationCommerciale=${designationCommerciale}`);
        return response.data;
    } catch (error) {
        console.error('Error filtering data:', error);
        throw new Error('Failed to filter data');
    }
};
const filterdup = async () => {
    try {
        const response = await alexsys.get('/data/filterDuplicates');
        return response.data;
    } catch (error) {
        console.error('Error filtering data:', error);
        throw new Error('Failed to filter data');
    }
};
// Create or Update data
const postngp = async (datat) => {
    try {
        const data = {
            "Désignation commerciale": datat.designiation,
            "Code NGP(à 10 chiffres)": datat.codeNGP,
            "TAUX": datat.TAUX
          };
        const response = await alexsys.post('/data', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw new Error('Failed to post data');
    }
};

// Delete all data
const deleteAllngp = async () => {
    try {
        const response = await alexsys.delete('/data');
        return response.data;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw new Error('Failed to delete data');
    }
};

// Delete specific data by Désignation commerciale and Code NGP
const deleteByCriteriaNgp = async (objectd) => {
    try {
        console.log(objectd);
        const response = await alexsys.delete('/data/delete', {
            data: objectd
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting data by criteria:', error);
        throw new Error('Failed to delete data by criteria');
    }
};

// Update specific data by Désignation commerciale and Code NGP
const updateByCriteriaNgp = async (designationCommerciale, codeNGP, updatedData) => {
    try {
      const dataToUpdate = {
        "Désignation commerciale": updatedData.designiation,
        "Code NGP(à 10 chiffres)": updatedData.codeNGP,
        "TAUX": updatedData.TAUX
      };
  
      const response = await alexsys.put('/data/update', {
        designationCommerciale,
        codeNGP,
        updatedData: dataToUpdate
      });
  
      return response.data; // Assuming your backend returns updated data
    } catch (error) {
      console.error('Error updating data by criteria:', error);
      throw new Error('Failed to update data by criteria');
    }
  };
  

export { getngp, filterngp, postngp, deleteAllngp, deleteByCriteriaNgp, updateByCriteriaNgp,filterdup };
