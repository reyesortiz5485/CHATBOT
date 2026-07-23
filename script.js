<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AstroBot Avanzado - Con Reconocimiento y Salida de Voz</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .chat-container {
      width: 450px;
      max-width: 95%;
      height: 600px;
      background-color: #1e293b;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 15px 30px rgba(0,0,0,0.6);
      border: 1px solid #334155;
      overflow: hidden;
    }
    .chat-header {
      background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
      color: #0f172a;
      padding: 16px;
      text-align: center;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .chat-box {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      max-width: 82%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .user {
      background-color: #38bdf8;
      color: #0f172a;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .bot {
      background-color: #334155;
      color: #f8fafc;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .input-container {
      display: flex;
      padding: 12px;
      background-color: #0f172a;
      gap: 8px;
    }
    input[type="text"] {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      background-color: #1e293b;
      color: white;
      outline: none;
      font-size: 0.95rem;
    }
    button {
      background-color: #38bdf8;
      border: none;
      color: #0f172a;
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background-color: #818cf8;
      color: white;
    }
    .mic-btn {
      background-color: #e2e8f0;
    }
    .mic-btn.recording {
      background-color: #ef4444;
      color: white;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  </style>
</head>
<body>

<div class="chat-container">
  <div class="chat-header">🌌 AstroBot Pro (Voz Bidireccional)</div>
  <div class="chat-box" id="chatBox">
    <div class="message bot">¡Saludos! Soy AstroBot Avanzado. Pregúntame sobre galaxias, agujeros negros, planetas, nebulosas o el origen del universo. Puedes escribirme o usar el botón del micrófono 🎙️ para hablar.</div>
  </div>
  <div class="input-container">
    <input type="text" id="userInput" placeholder="Escribe o presiona el micro..." onkeypress="handleKeyPress(event)">
    <button class="mic-btn" id="micBtn" onclick="toggleVoiceInput()" title="Hablar por micrófono">🎙️</button>
    <button onclick="sendMessage()">Enviar</button>
  </div>
</div>

<script>
  // 1. Base de datos astronómica ampliada
  const knowledgeBase = [
    { keywords: ["hola", "saludos", "buenas"], response: "¡Hola, explorador del cosmos! ¿Qué misterio astronómico deseas investigar hoy?" },
    { keywords: ["sol", "estrella solar"], response: "El Sol es una estrella de tipo espectral G2V en el centro de nuestro sistema. Contiene el 99.86% de la masa total de todo el sistema solar." },
    { keywords: ["mercurio"], response: "Mercurio es el planeta más cercano al Sol. A pesar de su cercanía, no es el más caliente; ese título lo tiene Venus por su denso efecto invernadero." },
    { keywords: ["venus"], response: "Venus tiene una atmósfera densa y atrapa el calor en un efecto invernadero extremo, alcanzando temperaturas de más de 460 grados Celsius." },
    { keywords: ["tierra", "nuestro planeta"], response: "La Tierra es el único mundo conocido que alberga vida. Cerca del 71% de su superficie está cubierta por agua líquida." },
    { keywords: ["marte", "planeta rojo"], response: "Marte alberga el Monte Olimpo, el volcán más grande del sistema solar, tres veces más alto que el Monte Everest." },
    { keywords: ["jupiter"], response: "Júpiter es un gigante gaseoso tan masivo que podría contener a todos los demás planetas del sistema solar juntos dentro de él." },
    { keywords: ["saturno", "anillos"], response: "Saturno es famoso por su complejo sistema de anillos formados principalmente por partículas de hielo, polvo y rocas." },
    { keywords: ["urano"], response: "Urano es un gigante de hielo que orbita inclinado casi de lado, probablemente debido a una colisión masiva en su pasado distante." },
    { keywords: ["neptuno"], response: "Neptuno es el planeta más lejano del sistema solar y posee los vientos más rápidos registrados en nuestro sistema, superando los 2,000 kilómetros por hora." },
    { keywords: ["pluton", "planeta enano"], response: "Plutón fue clasificado como planeta enano en 2006. Se encuentra en el Cinturón de Kuiper, más allá de la órbita de Neptuno." },
    { keywords: ["luna", "satelite natural"], response: "La Luna no tiene atmósfera significativa, lo que provoca que las huellas dejadas por los astronautas del programa Apolo puedan conservarse por millones de años." },
    { keywords: ["agujero negro", "hoyo negro"], response: "Un agujero negro es una región del espacio con un campo gravitatorio tan intenso que nada, ni siquiera la luz, puede escapar tras cruzar el horizonte de sucesos." },
    { keywords: ["nebulosa"], response: "Las nebulosas son enormes nubes de gas y polvo en el espacio. Muchas de ellas son guarderías estelares donde nacen nuevas estrellas." },
    { keywords: ["galaxia", "via lactea"], response: "La Vía Láctea es nuestra galaxia espiral que contiene entre 100 mil y 400 mil millones de estrellas. La galaxia gigante más cercana a nosotros es Andrómeda." },
    { keywords: ["big bang", "origen del universo"], response: "La teoría del Big Bang sugiere que el universo se originó hace aproximadamente 13,800 millones de años a partir de una singularidad extremadamente densa y caliente." },
    { keywords: ["exoplaneta", "exoplanetas"], response: "Un exoplaneta es un planeta que orbita una estrella fuera de nuestro sistema solar. Se han descubierto miles de ellos desde los años 90." },
    { keywords: ["constelacion", "constelaciones"], response: "Las constelaciones son grupos aparentes de estrellas que forman figuras imaginarias en el cielo nocturno, usadas históricamente para la navegación y la astronomía." },
    { keywords: ["cometa", "cometas"], response: "Los cometas son cuerpos celestes formados por hielo, polvo y rocas. Al acercarse al Sol, el calor sublima sus hielos creando una brillante cabellera y cola." },
    { keywords: ["telescopio", "james webb", "hubble"], response: "Telescopios espaciales como el Hubble y el James Webb observan el universo en diferentes longitudes de onda para revelar detalles sobre las galaxias más antiguas." }
  ];

  const defaultResponse = "Ese es un tema cósmico interesante. El universo contiene billones de objetos fascinantes y sigo ampliando mis bases de datos sobre ellos.";

  // 2. Control de Salida de Voz (Síntesis)
  function speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Detener audios anteriores

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    }
  }

  // 3. Control de Entrada de Voz (Reconocimiento)
  let recognition = null;
  let isRecording = false;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
      isRecording = true;
      const micBtn = document.getElementById('micBtn');
      micBtn.classList.add('recording');
      micBtn.textContent = '🛑';
    };

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript;
      sendMessage();
    };

    recognition.onerror = function(event) {
      console.error("Error en reconocimiento de voz:", event.error);
      stopRecording();
    };

    recognition.onend = function() {
      stopRecording();
    };
  } else {
    document.getElementById('micBtn').style.display = 'none'; // Ocultar si el navegador no lo soporta
  }

  function toggleVoiceInput() {
    if (!recognition) {
      alert("Tu navegador no soporta entrada por micrófono. Intenta con Google Chrome o Microsoft Edge.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }

  function stopRecording() {
    isRecording = false;
    const micBtn = document.getElementById('micBtn');
    micBtn.classList.remove('recording');
    micBtn.textContent = '🎙️';
  }

  // 4. Lógica de Envío y Mensajería
  function sendMessage() {
    const inputField = document.getElementById('userInput');
    const rawText = inputField.value.trim();
    const userText = rawText.toLowerCase();

    if (userText === '') return;

    addMessage(rawText, 'user');
    inputField.value = '';

    setTimeout(() => {
      let botResponse = defaultResponse;

      for (let item of knowledgeBase) {
        if (item.keywords.some(keyword => userText.includes(keyword))) {
          botResponse = item.response;
          break;
        }
      }

      addMessage(botResponse, 'bot');
      speak(botResponse);
    }, 400);
  }

  function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
</script>

</body>
</html>