// Başlangıc Tanımlamaları...
let loginButton = document.getElementById("loginButton");
let faceIdButton = document.getElementById("faceIdButton");
let loginContainer = document.getElementById("loginContainer");
let videoContainer = document.getElementById("videoContainer");
let appContainer = document.getElementById("appContainer");
let faceIDResult = document.getElementById("faceIDResult");
const loginTimeElement = document.getElementById("login-time");


let isFaceIDActive = true;
faceIdButton.style.display = "block";

// FaceID için Gereken Kod Bloğu...
const localHost = "http://127.0.0.1:5502";
const video = document.getElementById("video");
let localStream = null;
let isModelsLoaded = true;
let LabeledFaceDescriptors = null; //fotoğraflardan çekip alıyor

// Modellerin yüklenmesi..
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(`${localHost}/models`),
  faceapi.nets.faceLandmark68Net.loadFromUri(`${localHost}/models`),
  faceapi.nets.faceRecognitionNet.loadFromUri(`${localHost}/models`),
  faceapi.nets.ssdMobilenetv1.loadFromUri(`${localHost}/models`)
]).then(initApp);

// initApp
async function initApp() {
  LabeledFaceDescriptors = await loadImages();
  faceIdButton.style.display = "block";
}
const userSchoolNumbers = {
  "Sabo": "703301012",
  "İclal": "193301095"
};
function loadImages() {
  const label = ["Sabo","İclal"];

  return Promise.all(
    label.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 3; i++) {
        const img = await faceapi.fetchImage(
          `${localHost}/admins/${label}/${i}.jpg`
        );

        const detections = await faceapi  
          .detectSingleFace(img)  
          .withFaceLandmarks()//yüz şekilleriyle ifade et
          .withFaceDescriptor();//yüzü etiketle
        descriptions.push(detections.descriptor);//1 tane tespit edieni aktar
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);//label ile yüzü return ediyoruz
    })
  );
}

function startCamera() {
  navigator.getUserMedia(
    {
      video: {}
    },
    stream => {
      localStream = stream;
      video.srcObject = stream;
    },
    err => console.log(err)
  );
}
function stopCamera() {
  video.pause();
  video.srcObject = null;
  localStream.getTracks().forEach(track => {
    track.stop();
  });
}

// FaceID Kullan/Kullanma...
faceIdButton.addEventListener("click", () => {
  isFaceIDActive = !isFaceIDActive;

  if (isFaceIDActive) {
    videoContainer.classList.add("faceIDShow");
    loginContainer.classList.add("faceIDActive");
    faceIdButton.classList.add("active");
    appContainer.style.backgroundColor = "#666";
    faceIdButton.lastElementChild.textContent = "FaceID Kullanma";
    startCamera();
  } else {
    videoContainer.classList.remove("faceIDShow");
    loginContainer.classList.remove("faceIDActive");
    faceIdButton.classList.remove("active");
    appContainer.style.backgroundColor = "#f4f4f4";
    faceIdButton.lastElementChild.textContent = "FaceID Kullan";
    faceIDResult.textContent = "";
    faceIDResult.style.display = "none";
    stopCamera();
  }
});

video.addEventListener("play", async () => {
  const boxSize = {
    width: video.width,
    height: video.height
  };

  let cameraInterval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, boxSize);

    const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6);

    const results = resizedDetections.map(d =>
      faceMatcher.findBestMatch(d.descriptor)
    );
//etiketi ismi yapıyor
if (
  results.length > 0 &&
  ["Sabo","İclal"].indexOf(results[0].label) > -1
) {
  // FaceID doğrulandı...
  const now = new Date();
  const loginTime = now.toLocaleTimeString(); // giriş saati
  faceIDResult.textContent = "FaceID doğrulandı.. Yönlendiriliyorsunuz.. " ;
  loginTimeElement.textContent = "Giriş Saati : "+loginTime;
faceIDResult.classList = [];
  faceIDResult.classList.add("success");
  faceIDResult.style.display = "block";
  clearInterval(cameraInterval);
  
  
  setTimeout(() => {
    location.href = "about.html";
  }, 10000);

  // Tanınan yüzün etiketini bir label olarak göster
const label = document.createElement("label");
const userSchoolNumber = userSchoolNumbers[results[0].label];
const labelText =  results[0].label + " \nOkul No: " + userSchoolNumber ;
label.textContent = labelText;
label.id = "username"; // id belirleme
userSchoolNumber.id = "Number";
appContainer.appendChild(label);
} else {
  // FaceID doğrulanamadı...
  faceIDResult.textContent = "FaceID doğrulanamadı...";
  faceIDResult.classList = [];
  faceIDResult.classList.add("error");
  faceIDResult.style.display = "block";
}
  }, 100);
});
