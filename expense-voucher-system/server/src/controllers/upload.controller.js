const supabase = require('../config/supabase');
const multer = require('multer');

// Use memory storage — file goes straight to Supabase, not disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/signature
const uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const ext = req.file.originalname.split('.').pop();
    const fileName = `signature-${req.user.id}-${Date.now()}.${ext}`;

    // Upload to Supabase Storage bucket named "signatures"
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({ error: 'Failed to upload signature.' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload.' });
  }
};

module.exports = { upload, uploadSignature };
