const socket = io('https://nerissa-socket.up.railway.app'); // server luôn sống
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const status = document.getElementById('status');

const welcomeVoice = document.getElementById('welcome-voice');
const thankyouVoice = document.getElementById('thankyou-voice');
const wave = document.getElementById('wave-bg');

let isPaired = false;
let botTimeout = null;

// 10 câu ấm lòng của bạn
const botReplies = [
  "Biển nghe thấy bạn rồi… cứ khóc đi, sóng sẽ lau nước mắt hộ bạn.",
  "Hít một hơi thật sâu cùng mình nào… thở ra từ từ… tốt lắm.",
  "Bạn không cần phải mạnh mẽ đâu. Để biển ôm bạn một lúc nhé.",
  "Dù hôm nay có nặng đến mấy, mai mặt trời vẫn mọc. Biển hứa đấy.",
  "Bạn giỏi lắm vì đã dám mở Nerissa. Biển tự hào về bạn.",
  "Bạn không phải là gánh nặng của bất kỳ ai đâu.",
  "Bạn không làm phiền mình đâu, vinh hạn của Nerissa là được gặp bạn mà.",
  "Bạn đã đi được một chặng đường dài lắm rồi, nghỉ một chút đi, được không?",
  "Có những ngày chỉ cần tồn tại đã là rất dũng cảm rồi. Bạn làm được rồi đó.",
  "Bạn không hề yếu đuối, bạn chỉ đang mệt thôi. Nghỉ một chút đi nè.",
  "Biển sẽ giữ bí mật này thay bạn, mãi mãi."
];

function addMessage(sender, text) {
  const div = document.createElement('div');
  div.className = sender;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Phát âm thanh khi mở trang
document.body.addEventListener('click', () => {
  welcomeVoice.play();
  wave.volume = 0.25;
  wave.play();
}, { once: true });

// Tự động phát khi load (nếu trình duyệt cho phép)
setTimeout(() => { welcomeVoice.play().catch(()=>{}); wave.play().catch(()=>{}); }, 800);

// === LOGIC GHÉP CẶP + BOT ===
socket.emit('join');

socket.on('paired', () => {
  clearTimeout(botTimeout);
  isPaired = true;
  status.textContent = "Đã tìm thấy một người bạn đồng hành cùng biển ♡";
  chatContainer.style.display = 'block';
  addMessage('bot', 'Gió đã mang một người lạ đến với bạn… bạn muốn nói gì cũng được nha.');
});

socket.on('message', (msg) => {
  addMessage('stranger', msg);
});

socket.on('partner-left', () => {
  isPaired = false;
  addMessage('bot', 'Người đó vừa rời đi rồi… nhưng biển vẫn ở đây với bạn nè.');
  startBotFallback();
});

socket.on('connect_error', () => {
  status.textContent = "Đang kết nối lại…";
});

// Nếu 5 giây không ghép được → chuyển sang bot
function startBotFallback() {
  botTimeout = setTimeout(() => {
    if (!isPaired) {
      status.textContent = "Biển đang lắng nghe bạn ♡";
      chatContainer.style.display = 'block';
      addMessage('bot', 'Biển đây… bạn muốn nói gì cũng được, mình đang lắng nghe.');
    }
  }, 6000);
}
startBotFallback(); // bắt đầu đếm ngay khi vào trang

// Gửi tin nhắn
function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  addMessage('user', msg);
  userInput.value = '';

  if (isPaired) {
    socket.emit('message', msg);
  } else {
    // chat với bot
    setTimeout(() => {
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      addMessage('bot', reply);
    }, 1000 + Math.random() * 1200);
  }
}

userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

//Tiếng sóng (bạn có thể gọi hàm này từ nút khác)
function finishCheckin() {
  thankyouVoice.play();
  // … chuyển sang màn chat
}
}

// Khởi động
socket.emit('join-queue');

userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});
