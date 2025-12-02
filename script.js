
const socket = io('https://nerissa-socket.up.railway.app');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const status = document.getElementById('status');
const micBtn = document.getElementById('mic-btn');
const muteBtn = document.getElementById('mute-btn');
const modeSwitch = document.getElementById('mode-switch');

const welcomeVoice = document.getElementById('welcome-voice');
const thankyouAudio = document.getElementById('thankyou-voice');
const waveBg = document.getElementById('wave-bg');

waveBg.volume = 0.3;
document.body.addEventListener('click', () => {
  welcomeVoice.play();
  waveBg.play();
}, { once: true });
setTimeout(() => { welcomeVoice.play().catch(()=>{}); waveBg.play().catch(()=>{}); }, 800);

const replies = [
  "Biển nghe thấy bạn rồi… cứ khóc đi, sóng sẽ lau nước mắt hộ bạn.",
  "Hít một hơi thật sâu cùng mình nào… thở ra từ từ… tốt lắm.",
  "Bạn không cần phải mạnh mẽ đâu. Để biển ôm bạn một lúc nhé.",
  "Dù hôm nay có nặng đến mấy, mai mặt trời vẫn mọc. Biển hứa đấy.",
  "Bạn giỏi lắm vì đã dám mở Nerissa. Biển tự hào về bạn.",
  "Bạn không phải là gánh nặng của bất kỳ ai đâu.",
  "Bạn không làm phiền mình đâu, vinh hạnh của Nerissa là được gặp bạn mà.",
  "Bạn đã đi được một chặng đường dài lắm rồi, nghỉ một chút đi, được không?",
  "Có những ngày chỉ cần tồn tại đã là rất dũng cảm rồi. Bạn làm được rồi đó.",
  "Bạn không hề yếu đuối, bạn chỉ đang mệt thôi. Nghỉ một chút đi nè.",
  "Biển sẽ giữ bí mật này thay bạn, mãi mãi."
];

const smartReplies = { /* giữ nguyên như trước nếu bạn muốn, hoặc bỏ cũng được */ };
const keywords = { /* giữ nguyên nếu cần */ };

let isPaired = false;
let isGroupMode = false;
let isMuted = false;
let recorder = null;
let audioChunks = [];
let botTimeout = null;

function addMessage(sender, text = '', audioUrl = null) {
  const div = document.createElement('div');
  div.className = sender;

  if (audioUrl) {
    div.innerHTML = `<span class="play-icon" onclick="playAudio(this)" data-url="${audioUrl}"></span> Voice Message`;
    div.classList.add('voice-message');
  } else {
    div.textContent = text;
  }

  div.style.margin = '10px 0';
  div.style.padding = '10px 15px';
  div.style.borderRadius = '18px';
  div.style.maxWidth = '80%';
  div.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
  div.style.background = sender === 'user' ? '#26a69a' : 'rgba(255,255,255,0.2)';
  div.style.color = '#e0f7fa';

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function playAudio(el) {
  if (isMuted) return;
  new Audio(el.dataset.url).play();
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream);
    recorder.start();
    audioChunks = [];
    recorder.addEventListener("dataavailable", e => audioChunks.push(e.data));
    micBtn.classList.add('recording');
  });
}
function stopRecording() {
  if (!recorder) return;
  recorder.stop();
  recorder.stream.getTracks().forEach(t => t.stop());
  recorder.addEventListener("stop", () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    addMessage('user', '', url);
    if (isPaired || isGroupMode) socket.emit('voice', blob);
    micBtn.classList.remove('recording');
  });
}

function toggleMode() {
  isGroupMode = !isGroupMode;

  if (isGroupMode) {
    socket.emit('join-group');
    status.textContent = "Đã vào Group Chat – Biển đang lắng nghe tất cả mọi người";
    chatContainer.style.display = 'block';
    modeSwitch.textContent = "Chuyển sang 1:1 Chat";
    addMessage('bot', 'Chào cả nhà! Biển đang ở đây cùng mọi người nè');
  } else {
    socket.emit('join-1to1');
    status.textContent = "Đang tìm một người bạn đồng hành cùng biển...";
    modeSwitch.textContent = "Chuyển sang Group Chat";
    isPaired = false;
    startBotFallback(); // quay lại cơ chế chờ 6s
  }
}

socket.emit('join-1to1');

socket.on('paired', () => {
  clearTimeout(botTimeout);
  isPaired = true;
  status.textContent = "Đã tìm thấy một người bạn đồng hành cùng biển";
  chatContainer.style.display = 'block';
  addMessage('bot', 'Gió đã mang một người lạ đến với bạn… bạn muốn nói gì cũng được nha.');
});

socket.on('message', msg => addMessage('stranger', msg));
socket.on('voice', blob => {
  const url = URL.createObjectURL(blob);
  addMessage('stranger', '', url);
});
socket.on('partner-left', () => {
  isPaired = false;
  addMessage('bot', 'Người đó vừa rời đi… nhưng biển vẫn ở đây với bạn nè.');
  if (!isGroupMode) startBotFallback();
});

function startBotFallback() {
  clearTimeout(botTimeout);
  botTimeout = setTimeout(() => {
    if (!isPaired && !isGroupMode) {
      status.textContent = "Biển đang lắng nghe bạn";
      chatContainer.style.display = 'block';
      addMessage('bot', 'Biển đây… bạn muốn nói gì cũng được, mình đang lắng nghe');
    }
  }, 6000);
}
startBotFallback();

function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  addMessage('user', msg);
  userInput.value = '';

  if (isPaired || isGroupMode) {
    socket.emit('message', msg);
  } else {
    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      addMessage('bot', reply);
    }, 1000 + Math.random() * 1200);
  }
}

function finishCheckin() {
  thankyouAudio.play();
  document.getElementById("checkin-section")?.style.display = "none";
  chatContainer.style.display = "block";
  addMessage("bot", "Biển đây… bạn muốn nói gì cũng được, mình đang lắng nghe");
}

function toggleMute() {
  isMuted = !isMuted;
  muteBtn.classList.toggle('muted');
  waveBg.volume = isMuted ? 0 : 0.3;
  muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
}

userInput.addEventListener'keypress', e => { if (e.key === 'Enter') sendMessage(); });
micBtn.addEventListener('mousedown', startRecording);
micBtn.addEventListener('mouseup', stopRecording);
micBtn.addEventListener('touchstart', e => { e.preventDefault(); startRecording(); });
micBtn.addEventListener('touchend', e => { e.preventDefault(); stopRecording(); });
