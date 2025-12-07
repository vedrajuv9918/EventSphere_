exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const relativePath = `/api/uploads/${req.file.filename}`;
  const origin =
    process.env.SERVER_PUBLIC_URL ||
    `${req.protocol}://${req.get("host")}`;
  const absoluteUrl = `${origin}${relativePath}`;

  res.json({ success: true, url: absoluteUrl, path: relativePath });
};
