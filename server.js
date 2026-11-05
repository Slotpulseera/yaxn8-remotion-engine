const express = require('express');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

let bundleLocation = null;

// Sunucu ayağa kalkarken Remotion React kodlarını bir kez paketler
const init = async () => {
  console.log("Remotion Mastering motoru paketleniyor...");
  try {
    bundleLocation = await bundle({
      entryPoint: path.resolve('./src/index.ts'),
      webpackOverride: (config) => config,
    });
    console.log("Paketleme başarılı:", bundleLocation);
  } catch (err) {
    console.error("Paketleme hatası:", err);
  }
};

// n8n'den tetiklenecek ana render endpoint'i
app.post('/render', async (req, res) => {
  try {
    const inputProps = req.body; // n8n'den gelen video, müzik ve overlay verileri
    const outputFilename = `master_${Date.now()}.mp4`;
    const publicDir = path.resolve('./public');
    
    if (!fs.existsSync(publicDir)){
      fs.existsSync(publicDir) || fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const outputPath = path.join(publicDir, outputFilename);

    if (!bundleLocation) {
      return res.status(500).json({ status: 'error', message: 'Remotion bundle henüz hazır değil.' });
    }

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'Yaxn8Commercial',
      inputProps,
    });

    console.log("Master video render işlemi başlatılıyor...");
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    });

    console.log("Render tamamlandı:", outputFilename);
    const downloadUrl = `${req.protocol}://${req.get('host')}/videos/${outputFilename}`;
    
    res.json({ status: 'success', video_url: downloadUrl });
  } catch (error) {
    console.error("Render sırasında hata oluştu:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Üretilen videoların dışarıya sunulduğu statik klasör
app.use('/videos', express.static(path.resolve('./public')));

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  await init();
  console.log(`YAXN8 Remotion Engine ${PORT} portunda aktif!`);
});
