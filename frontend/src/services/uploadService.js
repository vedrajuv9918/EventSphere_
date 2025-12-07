import { apiClient } from "./apiClient";

export const UploadService = {
  uploadImage: async (file) => {
    const form = new FormData();
    form.append("image", file);
    const response = await apiClient.upload("/upload/image", form);
    const url = response?.url || response?.imageUrl;
    if (!url) {
      throw new Error("Upload did not return an image URL");
    }
    return { url, raw: response };
  },
};
