export default {
  init: function() {
    window.Howl = (function() {
      const HowlOLD = window.Howl;
      return function(options) {
        const theSound = new HowlOLD({
          src: options.src,
          volume: options.volume,
          loop: options.loop,
        });
        gm.audio.soundsPlaying.push({
          id: null,
          howl: theSound,
        });
        const theSoundIndex = gm.audio.soundsPlaying.length - 1;

        theSound.on('end', function() {
          delete gm.audio.soundsPlaying[theSoundIndex];
        });

        return theSound;
      };
    })();
  },
  preloadSounds: function(soundList) {
    for (let i = 0; i < soundList.length; i++) {
      const sound = soundList[i];
      if (!sound) continue;

      this.customSounds[sound.id] = 'data:audio/' + sound.extension + ';base64,' + sound.data;
    }
  },
  stopAllSounds: function() {
    for (let i = 0; i < this.soundsPlaying.length; i++) {
      if (!this.soundsPlaying[i]) continue;
      if (this.soundsPlaying[i].howl._src.includes('sound/')) continue;
      this.soundsPlaying[i].howl._emit('end');
      this.soundsPlaying[i].howl.stop();
      this.soundsPlaying[i].howl.unload();
    }
    this.soundsPlaying = [];
  },
  playSound: function(id, volume, panning) {
    if (!gm.config.saved.ingame.allowSounds) return;
    if (BonkUtils.mute || BonkUtils.preClickMute) return;
    if (window.gmReplaceAccessors.rollbacking) {
      for (let i = 0; i < gm.audio.soundsPlaying.length; i++) {
        if (gm.audio.soundsPlaying[i]?.id === id) return;
      }
    };

    const theSound = new Howl({
      src: this.customSounds[id] || GameResources.soundStrings[id],
      volume: volume,
    });
    theSound.stereo(panning);
    theSound.play();

    gm.audio.soundsPlaying.push({
      id: id,
      howl: theSound,
    });

    const theSoundIndex = gm.audio.soundsPlaying.length - 1;

    theSound.on('end', function() {
      delete gm.audio.soundsPlaying[theSoundIndex];
    });
  },
  customSounds: {},
  soundsPlaying: [],
  soundOverride: null,
};
