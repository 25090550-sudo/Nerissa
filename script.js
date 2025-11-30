const socket = io('https://nerissa-socket.onrender.com'); // server miễn phí mình dựng sẵn
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const status = document.getElementById('status');
const wave = document.getElementById('wave-bg');
wave.volume = 0.3; wave.play();

let isPaired = false;
let currentPartner = null;

// 50 câu bot ấm lòng (copy hết list bạn thích vào đây)
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
  div.className = sender === 'user' ? 'user' : (sender === 'bot' ? 'bot' : 'stranger');
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Khi có người thật ghép cặp
socket.on('paired', (partnerId) => {
  isPaired = true;
  currentPartner = partnerId;
  status.textContent = "Đã tìm thấy một người bạn đồng hành cùng biển ♡";
  chatContainer.style.display = 'block';
  addMessage('bot', 'Gió đã mang một người lạ đến với bạn… bạn muốn nói gì cũng được nha.');
});

// Nhận tin nhắn từ người thật
socket.on('message', (msg) => {
  addMessage('stranger', msg);
});

// Khi đối phương thoát → quay lại bot
socket.on('partner-left', () => {
  isPaired = false;
  addMessage('bot', 'Người đó đã đi rồi… nhưng biển vẫn ở đây với bạn nè.');
});

// Gửi tin nhắn
function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  
  addMessage('user', msg);
  userInput.value = '';

  if (isPaired && currentPartner) {
    socket.emit('message', msg);
  } else {
    // Chat với bot
    setTimeout(() => {
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      addMessage('bot', reply);
    }, 1000 + Math.random() * 1000);
  }
}

// Khởi động
socket.emit('join-queue');

userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});
