export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData);
    return response.data.url;
  } catch (error) {
    console.error("Upload failed:", error);
    return "/default-thumbnail.jpg";
  }
}
