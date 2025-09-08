// =================== Data ===================
const silaTexts = [
  "Ketuhanan Yang Maha Esa",
  "Kemanusiaan yang adil dan beradab",
  "Persatuan Indonesia",
  "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyarawatan perwakilan",
  "Keadilan sosial bagi seluruh rakyat Indonesia",
];

const boxPosX = 420;
const imagePosX = 110;

// Satu-satunya musik global (hindari duplikat)
let bgm = null;
let bgmStarted = false;

// =================== Intro Scene ===================
class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  preload() {
    // Muat BGM di sini (cukup di Intro)
    this.load.audio("bgm", "assets/bgm.mp3");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add
      .text(centerX, 120, "🌟 Kisah Bangun Pancasila 🌟", {
        fontSize: "32px",
        color: "#d32f2f",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const story =
      "Di sebuah negeri bernama Nusantara,\n" +
      "rakyat hidup damai dengan pedoman luhur.\n\n" +
      "Namun, nilai-nilai Pancasila tercerai-berai.\n" +
      "Tugasmu adalah menyusun kembali sila-sila\n" +
      "agar persatuan dan keadilan tetap terjaga!";

    this.add
      .text(centerX, centerY - 40, story, {
        fontSize: "20px",
        color: "#333",
        align: "center",
        wordWrap: { width: this.scale.width - 100 },
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(centerX, centerY + 150, "▶ Mulai Perjuangan", {
        fontSize: "26px",
        color: "#fff",
        backgroundColor: "#2196f3",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Inisialisasi & play BGM hanya SEKALI
    if (!bgmStarted) {
      bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
      // Peraturan browser: mulai audio setelah gesture user
      this.input.once("pointerdown", () => {
        if (!bgm.isPlaying) bgm.play();
      });
      bgmStarted = true;
    }

    startButton.on("pointerdown", () => {
      this.scene.start("MainGameScene");
    });
  }
}

// =================== Main Game Scene ===================
class MainGameScene extends Phaser.Scene {
  constructor() {
    super("MainGameScene");
  }

  preload() {
    // SFX
    this.load.audio("correct", "assets/correct.mp3");
    this.load.audio("wrong", "assets/wrong.mp3");
    this.load.audio("win", "assets/win.mp3");

    // Ikon sila
    this.load.image("sila1icon", "assets/sila1.png");
    this.load.image("sila2icon", "assets/sila2.png");
    this.load.image("sila3icon", "assets/sila3.png");
    this.load.image("sila4icon", "assets/sila4.png");
    this.load.image("sila5icon", "assets/sila5.png");

    // Tekstur konfeti
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("confetti", 8, 8);
    g.destroy();
  }

  // Fisher-Yates shuffle
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  create() {
    const centerX = this.cameras.main.centerX;

    // State lokal scene (reset saat restart)
    let correctCount = 0;

    // Judul & instruksi
    this.add
      .text(centerX, 30, "Bangun Pancasila", {
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

    // SFX
    const sfxCorrect = this.sound.add("correct");
    const sfxWrong = this.sound.add("wrong");
    const sfxWin = this.sound.add("win");

    // JANGAN buat bgm baru di sini → hindari duplikasi

    // Dropzones + ikon
    const dropzones = [];
    for (let i = 0; i < 5; i++) {
      const box = this.add
        .rectangle(centerX + boxPosX, 150 + i * 100, 530, 80, 0xe3f2fd)
        .setStrokeStyle(2, 0x999999)
        .setInteractive({ dropZone: true });

      box.silaId = "sila" + (i + 1);
      dropzones.push(box);

      this.add
        .image(centerX + imagePosX, 150 + i * 100, "sila" + (i + 1) + "icon")
        .setDisplaySize(60, 60);
    }

    // Teks sila acak (draggable)
    const shuffledSila = this.shuffle([...silaTexts]);
    shuffledSila.forEach((sila, i) => {
      const silaObj = this.add
        .text(50, 150 + i * 60, sila, {
          fontSize: "16px",
          backgroundColor: "#fff",
          padding: { left: 8, right: 8, top: 5, bottom: 5 },
          color: "#000",
        })
        .setInteractive({ draggable: true });

      // ID asli untuk kecocokan
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

    // Highlight dropzone saat drag
    this.input.on("dragenter", (pointer, gameObject, dropZone) => {
      dropZone.setStrokeStyle(4, 0x2196f3);
    });
    this.input.on("dragleave", (pointer, gameObject, dropZone) => {
      dropZone.setStrokeStyle(2, 0x999999);
    });

    // UI status & progress
    const statusText = this.add
      .text(centerX, this.scale.height - 50, "", {
        fontSize: "20px",
        color: "#000",
      })
      .setOrigin(0.5);

    const progressBg = this.add
      .rectangle(centerX - 150, this.scale.height - 90, 300, 25, 0xcccccc)
      .setOrigin(0, 0.5);
    const progressBar = this.add
      .rectangle(centerX - 150, this.scale.height - 90, 0, 25, 0x2196f3)
      .setOrigin(0, 0.5);
    const progressGlow = this.add
      .rectangle(centerX - 150, this.scale.height - 90, 0, 25, 0xffffff)
      .setOrigin(0, 0.5)
      .setAlpha(0);
    const scoreText = this.add.text(
      centerX + 170,
      this.scale.height - 100,
      "0/5",
      {
        fontSize: "18px",
        color: "#000",
      }
    );

    // Bendera Indonesia (muncul saat menang)
    const flag = this.add
      .rectangle(centerX + 350, 250, 200, 120, 0xff0000)
      .setVisible(false)
      .setDepth(102);
    const white = this.add
      .rectangle(centerX + 350, 280, 200, 60, 0xffffff)
      .setVisible(false)
      .setDepth(103);

    // Animasi goyangan bendera (aktif kalau visible)
    this.time.addEvent({
      delay: 16, // ~60 FPS
      loop: true,
      callback: () => {
        if (flag.visible) {
          const angle = Math.sin(this.time.now / 200) * 3;
          flag.setAngle(angle);
          white.setAngle(angle);
        }
      },
    });

    // Partikel konfeti
    const emitter = this.add.particles(centerX, 0, "confetti", {
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

    // Tombol mute BGM (pakai instance global)
    const muteBg = this.add
      .circle(this.scale.width - 60, 60, 25, 0x000000, 0.4)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const muteIcon = this.add.text(
      this.scale.width - 70,
      50,
      bgm && bgm.isPlaying ? "🔊" : "🔇",
      {
        fontSize: "20px",
        color: "#fff",
      }
    );
    muteBg.on("pointerdown", () => {
      if (!bgm) return;
      if (bgm.isPlaying) {
        bgm.pause();
        muteIcon.setText("🔇");
      } else {
        bgm.resume();
        muteIcon.setText("🔊");
      }
    });

    // Tombol restart
    const restartBg = this.add
      .circle(this.scale.width - 60, 120, 25, 0x000000, 0.4)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(this.scale.width - 75, 110, "🔄", {
      fontSize: "20px",
      color: "#fff",
    });
    restartBg.on("pointerdown", () => {
      this.scene.restart();
    });

    // Victory overlay (mulai dari alpha 0 biar bisa di-tween)
    const victoryScreen = this.add
      .rectangle(
        centerX,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.8
      )
      .setAlpha(0)
      .setDepth(101);
    const victoryText = this.add
      .text(centerX, this.scale.height / 2 - 100, "🎉 KAMU BERHASIL 🎉", {
        fontSize: "40px",
        color: "#fff",
        fontStyle: "bold",
      })
      .setDepth(102)
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);
    const playAgainButton = this.add
      .text(centerX, this.scale.height / 2, "🔄 Main Lagi", {
        fontSize: "28px",
        color: "#fff",
        backgroundColor: "#2196f3",
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
      })
      .setDepth(102)
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    playAgainButton.on("pointerdown", () => {
      this.scene.restart();
    });

    // Logika drop
    this.input.on("drop", (pointer, gameObject, dropZone) => {
      if (dropZone.silaId === gameObject.silaId) {
        dropZone.fillColor = 0xa5d6a7;
        gameObject.x = dropZone.x - 250;
        gameObject.y = dropZone.y - 10;
        gameObject.disableInteractive();
        correctCount++;

        // Tween progress bar
        const newWidth = (correctCount / 5) * 300;
        this.tweens.add({
          targets: progressBar,
          width: newWidth,
          duration: 300,
          ease: "Power2",
        });
        scoreText.setText(`${correctCount}/5`);

        sfxCorrect.play();

        // Bounce kecil pada kartu yang benar
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

          // Konfeti
          emitter.explode(200, centerX, 100);

          // Tampilkan overlay kemenangan dengan tween
          this.time.delayedCall(600, () => {
            this.tweens.add({
              targets: victoryScreen,
              alpha: 1,
              duration: 600,
              ease: "Power2",
            });
            this.tweens.add({
              targets: victoryText,
              alpha: 1,
              scale: 1,
              duration: 600,
              ease: "Back.Out",
            });
            this.tweens.add({
              targets: playAgainButton,
              alpha: 1,
              duration: 600,
              delay: 200,
              ease: "Power2",
            });
          });
        }
      } else {
        statusText.setText("❌ Salah tempat, coba lagi!");
        sfxWrong.play();

        // Shake dropzone
        this.tweens.add({
          targets: dropZone,
          x: dropZone.x + 10,
          duration: 50,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            dropZone.x = centerX + boxPosX;
          },
        });
      }

      dropZone.setStrokeStyle(2, 0x999999);
    });
  }
}

// =================== Config & Boot ===================
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#f4f4f4",
  parent: "game",
  scene: [IntroScene, MainGameScene],
};

new Phaser.Game(config);
