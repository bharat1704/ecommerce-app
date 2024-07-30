import axios from "axios";
import {
  errorMessageToastNotificaton,
  successMessageToastNotificaton,
} from "../../utils/toastNotifications";
import { BASE_URL } from "../../constants";

export const fetchAllWishlistItems = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`${BASE_URL}/wishlist`, {
        withCredentials: true,
      });
      resolve(response.data);
    } catch (error) {
      if (error.response.data.error.statusCode === 401) {
        errorMessageToastNotificaton("Unauthorized");
      } else {
        errorMessageToastNotificaton();
      }
      reject(error.message);
    }
  });
};

export const addToWishlist = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/wishlist/add`,
        {
          productId,
        },
        {
          withCredentials: true,
        }
      );
      successMessageToastNotificaton("Successfully added");
      resolve(response.data);
    } catch (error) {
      if (error.response.data.error.statusCode === 401) {
        errorMessageToastNotificaton("Unauthorized");
      } else if (error.response.data.error.statusCode === 409) {
        errorMessageToastNotificaton("Already in Wishlist");
      } else {
        errorMessageToastNotificaton();
      }
      reject(error.message);
    }
  });
};

export const removeFromWishlist = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/wishlist/remove`,
        {
          productId,
        },
        {
          withCredentials: true,
        }
      );
      successMessageToastNotificaton("Successfully removed");
      resolve(response.data);
    } catch (error) {
      if (error.response.data.error.statusCode === 401) {
        errorMessageToastNotificaton("Unauthorized");
      } else {
        errorMessageToastNotificaton();
      }
      reject(error.message);
    }
  });
};
