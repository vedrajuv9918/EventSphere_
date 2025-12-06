exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl: url });
};
