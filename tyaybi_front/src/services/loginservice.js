import { alexsys } from "./envirenment";
const login = async (email, password) => {
  try {
    const response = await alexsys.post(`/login`, { email, password });
    console.log(response.data.token);
    return response.data.token;
  } catch (error) {
    console.log("error login", error);
    throw new Error('Invalid email or password');
  }
}; 
const register = async (username, email, password,city) => {
  try {
    const response = await alexsys.post(`/register/`, { username, email, password,city });
    console.log("register");
      const resp = await login(email, password);
      return resp;
  } catch (error) {
    console.log("error register", error);
    throw new Error('Registration failed');
  }
};
const logout = async (token) => {
  try {
    console.log("logout");
    const response = await alexsys.post(`/logout/`, { token });
    return response.data.message;
  } catch (error) {
    console.log("error logout", error);
    throw new Error('Logout failed');
  }
};


export { login, register,logout};
