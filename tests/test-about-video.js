const http = require('http');

http.get('http://localhost:3000/about', res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    if (res.statusCode !== 200) {
      console.error('Failed to get 200 OK');
      process.exit(1);
    }

    // Check for unwanted names
    const hasMediaName = /Media 1|Media 1_1|Media 1_2|CUTE<\/span>|\(CUTE\)|\(Media/i.test(body);
    console.log('Has raw media/cute text in rendered page:', hasMediaName);

    // Check mute unmute elements
    const hasToggleBtn = body.includes('id="videoAudioToggleBtn"');
    const hasMutedIcon = body.includes('id="iconVolumeMuted"');
    const hasUnmutedIcon = body.includes('id="iconVolumeUnmuted"');
    console.log('Has videoAudioToggleBtn:', hasToggleBtn);
    console.log('Has iconVolumeMuted:', hasMutedIcon);
    console.log('Has iconVolumeUnmuted:', hasUnmutedIcon);

    // Check thumbs
    const thumbsCount = (body.match(/class="[^"]*about-video-thumb/g) || []).length;
    console.log('About thumbs count:', thumbsCount);

    if (hasMediaName) {
      console.error('TEST FAILED: Found raw media/cute names in about page!');
      process.exit(1);
    }
    if (!hasToggleBtn || !hasMutedIcon || !hasUnmutedIcon || thumbsCount !== 4) {
      console.error('TEST FAILED: Missing video audio toggle or thumbs count is not 4!');
      process.exit(1);
    }

    console.log('🌟 ALL ABOUT VIDEO AND AUDIO TOGGLE CHECKS PASSED!');
    process.exit(0);
  });
}).on('error', err => {
  console.error('Request error:', err);
  process.exit(1);
});
