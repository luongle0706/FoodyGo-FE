import { post } from "../utils/request";

export const LoginAPI = async (params = {}) => {
  try {
    const response = await post("/api/v1/authentications/login", params);
    return response;
  } catch (error) {
    console.log("Error at LoginApi:", error);
  }
};
