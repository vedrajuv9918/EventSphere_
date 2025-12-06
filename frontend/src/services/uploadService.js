import { apiClient } from "./apiClient";

export const UploadService = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return apiClient.upload("/upload/image", form);
  },
};
