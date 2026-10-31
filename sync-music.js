const axios = require('axios');
const admin = require('firebase-admin');

// Đọc file serviceAccountKey.json để kết nối Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codingwebsite-4b864-default-rtdb.firebaseio.com" // Thay link Realtime Database của bạn vào đây
});

const db = admin.database();

async function syncMusicToFirebase() {
  try {
    // Thay chuỗi phía dưới bằng Client ID bạn vừa lấy từ Jamendo Developer Dashboard
    const clientId = '6111c205'; 
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=100&tags=chillout+ambient&audioformat=mp32`;

    console.log('Đang kết nối tới Jamendo API để lấy danh sách nhạc...');
    const response = await axios.get(url);
    const tracks = response.data.results;

    if (!tracks || tracks.length === 0) {
      console.log('Không tìm thấy bài hát nào!');
      return;
    }

    const musicData = {};
    tracks.forEach((track, index) => {
      musicData[`track_${index + 1}`] = {
        title: track.name,
        artist: track.artist_name,
        audioUrl: track.audio, // Đường dẫn stream file MP3 trực tiếp từ Jamendo
        duration: track.duration,
        image: track.image
      };
    });

    // Đẩy dữ liệu lên nhánh 'background_music' trong Firebase Realtime Database
    const ref = db.ref('background_music');
    await ref.set(musicData);
    
    console.log('Đã đồng bộ danh sách nhạc lên Firebase thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi đồng bộ nhạc:', error);
    process.exit(1);
  }
}

syncMusicToFirebase();