const express = require('express');
const router = express.Router();
const { getTranscript } = require('../services/transcript');
const { generateCaptions } = require('../services/captions');

router.post('/', async (req, res) => {
  const { videoUrl } = req.body;

  // Step 1: Get transcript (mocked)
  const transcript = await getTranscript(videoUrl);

  // Step 2: Clip detection (mocked 30-sec chunk)
  const clip = {
    timestamp: '00:01:15 - 00:01:45',
    caption: 'This moment changed everything...'
  };

  // Step 3: Generate captions per platform
  const captions = await generateCaptions(clip.caption);

  res.json({


    clips: [
      {
        ...clip,
        platforms: captions
      }
    ]
  });
});

module.exports = router;