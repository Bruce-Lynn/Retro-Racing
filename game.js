class RetroRacingGame extends Phaser.Scene {
  constructor() {
    super({ key: 'RetroRacingGame' });
    this.player = null;
    this.cursors = null;
    this.enemies = null;
    this.coins = null;
    this.roadLines = null;
    this.speed = 0;
    this.maxSpeed = 300;
    this.acceleration = 5;
    this.deceleration = 3;
    this.score = 0;
    this.distance = 0;
    this.gameOver = false;
    this.scoreText = null;
    this.speedText = null;
    this.distanceText = null;
    this.gameOverText = null;
    this.restartText = null;
    this.roadSpeed = 0;
    this.enemySpawnTimer = 0;
    this.coinSpawnTimer = 0;
    this.backgroundMusic = null;
  }

  preload() {
    // Create simple colored rectangles for cars
    this.load.image('road', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // Create player car (blue)
    this.add.graphics()
      .fillStyle(0x0080ff)
      .fillRect(0, 0, 40, 80)
      .fillStyle(0x004080)
      .fillRect(5, 10, 30, 60)
      .fillStyle(0x00ff88)
      .fillRect(15, 5, 10, 15)
      .fillStyle(0x333333)
      .fillRect(8, 20, 8, 12)
      .fillRect(24, 20, 8, 12)
      .fillRect(8, 48, 8, 12)
      .fillRect(24, 48, 8, 12)
      .generateTexture('playerCar', 40, 80);

    // Create enemy car (red)
    this.add.graphics()
      .fillStyle(0xff0040)
      .fillRect(0, 0, 40, 80)
      .fillStyle(0x800020)
      .fillRect(5, 10, 30, 60)
      .fillStyle(0xff8800)
      .fillRect(15, 65, 10, 10)
      .fillStyle(0x333333)
      .fillRect(8, 20, 8, 12)
      .fillRect(24, 20, 8, 12)
      .fillRect(8, 48, 8, 12)
      .fillRect(24, 48, 8, 12)
      .generateTexture('enemyCar', 40, 80);

    // Create coin
    this.add.graphics()
      .fillStyle(0xffff00)
      .fillCircle(15, 15, 15)
      .fillStyle(0xffd700)
      .fillCircle(15, 15, 10)
      .fillStyle(0xffff00)
      .fillCircle(15, 15, 5)
      .generateTexture('coin', 30, 30);

    // Create road line
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 8, 40)
      .generateTexture('roadLine', 8, 40);
  }

  create() {
    // Create road background
    this.add.rectangle(400, 300, 800, 600, 0x333333);
    this.add.rectangle(400, 300, 400, 600, 0x444444);
    
    // Create road lines group
    this.roadLines = this.add.group();
    for (let i = 0; i < 20; i++) {
      const line = this.add.image(400, i * 40 - 200, 'roadLine');
      this.roadLines.add(line);
    }

    // Create player car
    this.player = this.add.image(400, 500, 'playerCar');
    this.player.setScale(0.8);

    // Create enemy cars group
    this.enemies = this.add.group();

    // Create coins group
    this.coins = this.add.group();

    // Create cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create UI text
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontSize: '24px',
      fill: '#00ff88',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.speedText = this.add.text(20, 50, 'SPEED: 0 KM/H', {
      fontSize: '20px',
      fill: '#88ffaa',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.distanceText = this.add.text(20, 80, 'DISTANCE: 0 M', {
      fontSize: '20px',
      fill: '#88ffaa',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Add retro sound effects
    this.createSounds();
  }

  createSounds() {
    // Create simple beep sounds using Web Audio API
    this.engineSound = {
      play: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80 + this.speed * 0.5, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    };

    this.coinSound = {
      play: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    };

    this.crashSound = {
      play: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(50, audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    };
  }

  update(time, delta) {
    if (this.gameOver) {
      if (this.cursors.space.isDown) {
        this.restartGame();
      }
      return;
    }

    this.handleInput();
    this.updateRoad();
    this.spawnEnemies(time);
    this.spawnCoins(time);
    this.updateEnemies();
    this.updateCoins();
    this.checkCollisions();
    this.updateUI();
    this.updateDistance(delta);

    // Play engine sound occasionally
    if (this.speed > 0 && Math.random() < 0.02) {
      this.engineSound.play();
    }
  }

  handleInput() {
    // Acceleration and braking
    if (this.cursors.up.isDown) {
      this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
    } else if (this.cursors.down.isDown) {
      this.speed = Math.max(this.speed - this.deceleration * 2, -50);
    } else {
      this.speed = Math.max(this.speed - this.deceleration, 0);
    }

    // Steering
    if (this.cursors.left.isDown && this.player.x > 250) {
      this.player.x -= 5;
    }
    if (this.cursors.right.isDown && this.player.x < 550) {
      this.player.x += 5;
    }

    // Update road speed based on car speed
    this.roadSpeed = this.speed * 0.5;
  }

  updateRoad() {
    // Move road lines
    this.roadLines.children.entries.forEach(line => {
      line.y += this.roadSpeed * 0.016;
      if (line.y > 650) {
        line.y = -50;
      }
    });
  }

  spawnEnemies(time) {
    if (time > this.enemySpawnTimer) {
      const enemy = this.add.image(
        Phaser.Math.Between(280, 520),
        -50,
        'enemyCar'
      );
      enemy.setScale(0.8);
      this.enemies.add(enemy);
      
      // Spawn rate increases with speed
      this.enemySpawnTimer = time + Phaser.Math.Between(1000, 3000) - (this.speed * 2);
    }
  }

  spawnCoins(time) {
    if (time > this.coinSpawnTimer) {
      const coin = this.add.image(
        Phaser.Math.Between(280, 520),
        -30,
        'coin'
      );
      coin.setScale(0.8);
      this.coins.add(coin);
      
      this.coinSpawnTimer = time + Phaser.Math.Between(2000, 4000);
    }
  }

  updateEnemies() {
    this.enemies.children.entries.forEach(enemy => {
      enemy.y += (this.roadSpeed + 100) * 0.016;
      
      if (enemy.y > 650) {
        enemy.destroy();
        this.score += 10; // Points for passing cars
      }
    });
  }

  updateCoins() {
    this.coins.children.entries.forEach(coin => {
      coin.y += this.roadSpeed * 0.016;
      coin.rotation += 0.1;
      
      if (coin.y > 650) {
        coin.destroy();
      }
    });
  }

  checkCollisions() {
    // Check collision with enemies
    this.enemies.children.entries.forEach(enemy => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        enemy.getBounds()
      )) {
        this.crashSound.play();
        this.endGame();
      }
    });

    // Check collision with coins
    this.coins.children.entries.forEach(coin => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        coin.getBounds()
      )) {
        this.coinSound.play();
        coin.destroy();
        this.score += 50;
      }
    });
  }

  updateDistance(delta) {
    this.distance += (this.speed * delta) / 1000;
  }

  updateUI() {
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.speedText.setText(`SPEED: ${Math.round(this.speed)} KM/H`);
    this.distanceText.setText(`DISTANCE: ${Math.round(this.distance)} M`);
  }

  endGame() {
    this.gameOver = true;
    
    // Stop all moving objects
    this.enemies.children.entries.forEach(enemy => enemy.setTint(0x666666));
    this.coins.children.entries.forEach(coin => coin.setTint(0x666666));
    this.player.setTint(0xff0000);

    // Show game over text
    this.gameOverText = this.add.text(400, 250, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0040',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(400, 300, `FINAL SCORE: ${this.score}`, {
      fontSize: '24px',
      fill: '#00ff88',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(400, 330, `DISTANCE: ${Math.round(this.distance)} M`, {
      fontSize: '24px',
      fill: '#00ff88',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.restartText = this.add.text(400, 380, 'PRESS SPACEBAR TO RESTART', {
      fontSize: '20px',
      fill: '#88ffaa',
      fontFamily: 'Orbitron',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Add blinking effect to restart text
    this.tweens.add({
      targets: this.restartText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  restartGame() {
    // Reset game state
    this.gameOver = false;
    this.speed = 0;
    this.score = 0;
    this.distance = 0;
    this.enemySpawnTimer = 0;
    this.coinSpawnTimer = 0;

    // Reset player
    this.player.x = 400;
    this.player.y = 500;
    this.player.clearTint();

    // Clear enemies and coins
    this.enemies.clear(true, true);
    this.coins.clear(true, true);

    // Remove game over text
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.restartText) this.restartText.destroy();

    // Remove any other text elements that might have been added
    this.children.list.forEach(child => {
      if (child.type === 'Text' && 
          child !== this.scoreText && 
          child !== this.speedText && 
          child !== this.distanceText) {
        child.destroy();
      }
    });
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-canvas',
  backgroundColor: '#000000',
  scene: RetroRacingGame,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// Start the game
const game = new Phaser.Game(config);
