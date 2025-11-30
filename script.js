const replies = [
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

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const thankyouAudio = document.getElementById("thankyou-audio");
const waveBg = document.getElementById("wave-bg");

// Phát tiếng sóng nền nhẹ
waveBg.volume = 0.3;
waveBg.play();

// Khi hoàn thành Tiếng Sóng → phát giọng nói cảm ơn
function finishCheckin() {
  thankyouAudio.play();
  document.getElementById("checkin-section").style.display = "none";
  document.getElementById("chat-container").style.display = "block";
  addMessage("bot", "Biển đây… bạn muốn nói gì cũng được, mình đang lắng nghe ♡");
}

// Gửi tin nhắn
function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  addMessage("user", msg);
  userInput.value = "";

  // Bot trả lời sau 1-2 giây
  setTimeout(() => {
    const reply = replies[Math.floor(Math.random() * replies.length)];
    addMessage("bot", reply);
  }, 1000 + Math.random() * 1000);
}

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = sender;
  div.textContent = text;
  div.style.margin = "10px 0";
  div.style.padding = "10px 15px";
  div.style.borderRadius = "15px";
  div.style.maxWidth = "80%";
  div.style.marginLeft = sender === "user" ? "auto" : "0";
  div.style.background = sender === "user" ? "#26a69a" : "rgba(255,255,255,0.2)";
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enter để gửi
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
