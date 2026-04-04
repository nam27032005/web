try {
  require('./models/User');
  console.log('User OK');
} catch(e) { console.error('User ERR:', e.message); }
try {
  require('./models/Room');
  console.log('Room OK');
} catch(e) { console.error('Room ERR:', e.message); }
try {
  require('./models/Review');
  console.log('Review OK');
} catch(e) { console.error('Review ERR:', e.message); }
try {
  require('./models/ChatMessage');
  console.log('ChatMessage OK');
} catch(e) { console.error('ChatMessage ERR:', e.message); }
try {
  require('./models/Notification');
  console.log('Notification OK');
} catch(e) { console.error('Notification ERR:', e.message); }
try {
  require('./models/Report');
  console.log('Report OK');
} catch(e) { console.error('Report ERR:', e.message); }
try {
  require('./models/Otp');
  console.log('Otp OK');
} catch(e) { console.error('Otp ERR:', e.message); }
