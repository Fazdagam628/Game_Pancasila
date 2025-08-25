const silaTexts = [
  "Ketuhanan Yang Maha Esa",
  "Kemanusiaan yang adil dan beradab",
  "Persatuan Indonesia",
  "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan",
  "Keadilan sosial bagi seluruh rakyat Indonesia",
];

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // ✅ Fullscreen
  height: window.innerHeight, // ✅ Fullscreen
  backgroundColor: "#f4f4f4",
  parent: "game",
  scene: { preload, create },
};

let correctCount = 0;
let statusText, flag, white;
let sfxCorrect, sfxWrong, sfxWin;
let bgm,
  bgmStarted = false;
let muteButton, restartButton;
let scoreText, progressBg, progressBar, progressGlow;
let victoryScreen, victoryText, playAgainButton;
let emitter;

const game = new Phaser.Game(config);

function preload() {
  // SFX
  this.load.audio("correct", "assets/correct.mp3");
  this.load.audio("wrong", "assets/wrong.mp3");
  this.load.audio("win", "assets/win.mp3");

  // Background music
  this.load.audio("bgm", "assets/bgm.mp3");

  // Ikon sila
  this.load.image("sila1icon", "assets/sila1.png");
  this.load.image("sila2icon", "assets/sila2.png");
  this.load.image("sila3icon", "assets/sila3.png");
  this.load.image("sila4icon", "assets/sila4.png");
  this.load.image("sila5icon", "assets/sila5.png");

  // 🔥 Buat texture konfeti
  let g = this.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture("confetti", 8, 8);
  g.destroy();
}

// 🔀 Shuffle Function (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function create() {
  const centerX = this.cameras.main.centerX;

  this.add
    .text(centerX, 30, "Bangun Pancasila 🇮🇩", {
      fontSize: "32px",
      color: "#d32f2f",
    })
    .setOrigin(0.5);

  this.add
    .text(
      centerX,
      70,
      "Seret teks sila ke kotak dengan simbol Pancasila yang benar!",
      {
        fontSize: "20px",
        color: "#333",
      }
    )
    .setOrigin(0.5);

  // 🔊 Sound Effects
  sfxCorrect = this.sound.add("correct");
  sfxWrong = this.sound.add("wrong");
  sfxWin = this.sound.add("win");

  // 🎶 Background Music (mulai hanya sekali setelah user gesture)
  if (!bgmStarted) {
    bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
    this.input.once("pointerdown", () => {
      bgm.play();
    });
    bgmStarted = true;
  }

  // Buat dropzones + ikon sila
  let dropzones = [];
  for (let i = 0; i < 5; i++) {
    let box = this.add
      .rectangle(centerX + 480, 150 + i * 100, 300, 80, 0xe3f2fd)
      .setStrokeStyle(2, 0x999999)
      .setInteractive({ dropZone: true });

    box.silaId = "sila" + (i + 1);
    dropzones.push(box);

    this.add
      .image(centerX + 280, 150 + i * 100, "sila" + (i + 1) + "icon")
      .setDisplaySize(60, 60);
  }
  // 🔀 Acak urutan teks sila
  let shuffledSila = shuffle([...silaTexts]);
  // Buat teks sila (draggable)
  shuffledSila.forEach((sila, i) => {
    let silaObj = this.add
      .text(50, 150 + i * 60, sila, {
        fontSize: "16px",
        backgroundColor: "#fff",
        padding: { left: 8, right: 8, top: 5, bottom: 5 },
        color: "#000",
      })
      .setInteractive({ draggable: true });

    // tetap pakai ID asli agar cocok dengan dropzone
    silaObj.silaId = "sila" + (silaTexts.indexOf(sila) + 1);
    this.input.setDraggable(silaObj);

    silaObj.on("drag", (pointer, dragX, dragY) => {
      silaObj.x = dragX;
      silaObj.y = dragY;
    });

    silaObj.on("dragstart", () => {
      silaObj.setDepth(100);
    });
  });

  // Highlight efek saat drag
  this.input.on("dragenter", (pointer, gameObject, dropZone) => {
    dropZone.setStrokeStyle(4, 0x2196f3);
  });
  this.input.on("dragleave", (pointer, gameObject, dropZone) => {
    dropZone.setStrokeStyle(2, 0x999999);
  });

  // Event drop
  this.input.on("drop", (pointer, gameObject, dropZone) => {
    if (dropZone.silaId === gameObject.silaId) {
      dropZone.fillColor = 0xa5d6a7;
      gameObject.x = dropZone.x - 120;
      gameObject.y = dropZone.y - 20;
      gameObject.disableInteractive();
      correctCount++;

      // Update progress bar
      let newWidth = (correctCount / 5) * 300;
      this.tweens.add({
        targets: progressBar,
        width: newWidth,
        duration: 300,
        ease: "Power2",
      });
      scoreText.setText(`${correctCount}/5`);

      sfxCorrect.play();

      // Bounce animasi
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 150,
        yoyo: true,
        ease: "Bounce.easeOut",
      });

      if (correctCount === 5) {
        statusText.setText("🎉 Selamat! Kamu berhasil menyusun Pancasila!");
        flag.setVisible(true);
        white.setVisible(true);
        sfxWin.play();

        // konfeti (Phaser 3.86 API baru)
        emitter.explode(200, centerX, 100);

        // Glow animasi progress bar
        this.tweens.add({
          targets: progressGlow,
          width: 300,
          alpha: { from: 0.3, to: 0 },
          duration: 800,
          repeat: -1,
          yoyo: true,
          ease: "Sine.easeInOut",
        });

        // Victory Screen fade-in
        this.time.delayedCall(1000, () => {
          victoryScreen.setVisible(true);
          victoryText.setVisible(true);
          playAgainButton.setVisible(true);

          this.tweens.add({
            targets: victoryScreen,
            alpha: 1,
            duration: 800,
            ease: "Power2",
          });
          this.tweens.add({
            targets: victoryText,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 600,
            ease: "Back.Out",
          });
          this.tweens.add({
            targets: playAgainButton,
            alpha: 1,
            duration: 800,
            delay: 300,
            ease: "Power2",
          });
        });
      }
    } else {
      statusText.setText("❌ Salah tempat, coba lagi!");
      sfxWrong.play();

      // Shake animasi
      this.tweens.add({
        targets: dropZone,
        x: dropZone.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          dropZone.x = centerX + 480;
        },
      });
    }

    dropZone.setStrokeStyle(2, 0x999999);
  });

  // Status text
  statusText = this.add
    .text(centerX, this.scale.height - 50, "", {
      fontSize: "20px",
      color: "#000",
    })
    .setOrigin(0.5);

  // Progress bar
  progressBg = this.add
    .rectangle(centerX - 150, this.scale.height - 90, 300, 25, 0xcccccc)
    .setOrigin(0, 0.5);
  progressBar = this.add
    .rectangle(centerX - 150, this.scale.height - 90, 0, 25, 0x2196f3)
    .setOrigin(0, 0.5);
  progressGlow = this.add
    .rectangle(centerX - 150, this.scale.height - 90, 0, 25, 0xffffff)
    .setOrigin(0, 0.5)
    .setAlpha(0);
  scoreText = this.add.text(centerX + 170, this.scale.height - 100, "0/5", {
    fontSize: "18px",
    color: "#000",
  });

  // Bendera
  flag = this.add
    .rectangle(centerX + 350, 250, 200, 120, 0xff0000)
    .setDepth(102)
    .setVisible(false);
  white = this.add
    .rectangle(centerX + 350, 280, 200, 60, 0xffffff)
    .setDepth(102)
    .setVisible(false);

  this.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      if (flag.visible) {
        flag.angle = Math.sin(Date.now() / 200) * 3;
        white.angle = flag.angle;
      }
    },
  });

  // Partikel konfeti (Phaser 3.86 API)
  emitter = this.add.particles(centerX, 0, "confetti", {
    speedY: { min: 200, max: 400 },
    speedX: { min: -100, max: 100 },
    scale: { start: 0.8, end: 0.2 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    gravityY: 300,
    quantity: 4,
    tint: [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff],
    emitting: false,
  });

  // Tombol mute/unmute
  let buttonBg = this.add
    .circle(this.scale.width - 60, 60, 25, 0x000000, 0.4)
    .setStrokeStyle(2, 0xffffff)
    .setInteractive({ useHandCursor: true });
  let buttonIcon = this.add.text(this.scale.width - 70, 50, "🔊", {
    fontSize: "20px",
    color: "#fff",
  });
  muteButton = { bg: buttonBg, icon: buttonIcon };
  buttonBg.on("pointerdown", () => {
    if (bgm.isPlaying) {
      bgm.pause();
      buttonIcon.setText("🔇");
    } else {
      bgm.resume();
      buttonIcon.setText("🔊");
    }
  });

  // Tombol restart game
  let restartBg = this.add
    .circle(this.scale.width - 60, 120, 25, 0x000000, 0.4)
    .setStrokeStyle(2, 0xffffff)
    .setInteractive({ useHandCursor: true });
  let restartIcon = this.add.text(this.scale.width - 75, 110, "🔄", {
    fontSize: "20px",
    color: "#fff",
  });
  restartButton = { bg: restartBg, icon: restartIcon };
  restartBg.on("pointerdown", () => {
    correctCount = 0; // reset score
    this.scene.restart();
  });

  // Victory Screen
  victoryScreen = this.add
    .rectangle(
      centerX,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    )
    .setAlpha(0)
    .setDepth(101)
    .setVisible(false);
  victoryText = this.add
    .text(centerX, this.scale.height / 2 - 100, "🎉 KAMU BERHASIL 🎉", {
      fontSize: "40px",
      color: "#fff",
      fontStyle: "bold",
    })
    .setDepth(102)
    .setOrigin(0.5)
    .setAlpha(0)
    .setVisible(false);
  playAgainButton = this.add
    .text(centerX, this.scale.height / 2, "🔄 Main Lagi", {
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#2196f3",
      padding: { left: 15, right: 15, top: 10, bottom: 10 },
    })
    .setDepth(102)
    .setOrigin(0.5)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);

  playAgainButton.on("pointerdown", () => {
    correctCount = 0; // reset score
    this.scene.restart();
  });
}
