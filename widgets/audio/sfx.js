/******************************************************************************/
if (!window.mainAudioCtx) {
  window.mainAudioCtx = new (window.AudioContext ||
    window.webkitAudioContext)();
  window.mainGain = window.mainAudioCtx.createGain();
  window.mainGain.gain.setValueAtTime(0.2, window.mainAudioCtx.currentTime);
}

const delay = (ctx, input, options) => {
  const leftDelay = ctx.createDelay();
  const rightDelay = ctx.createDelay();
  const feedback = ctx.createGain();
  const dryMix = ctx.createGain();
  const wetMix = ctx.createGain();
  const output = ctx.createGain();
  const merger = ctx.createChannelMerger(2);

  leftDelay.delayTime.value = options.time;
  rightDelay.delayTime.value = options.time;

  feedback.gain.value = options.feedback;
  dryMix.gain.value = options.dry;
  wetMix.gain.value = options.wet;

  input.connect(dryMix);
  input.connect(feedback);

  feedback.connect(leftDelay);
  leftDelay.connect(rightDelay);
  rightDelay.connect(feedback);

  leftDelay.connect(merger, 0, 0);
  rightDelay.connect(merger, 0, 1);
  merger.connect(wetMix);

  dryMix.connect(output);
  wetMix.connect(output);

  return output;
};

class SFX {
  constructor(
    seq = [],
    pitch = 1,
    type = 'sine',
    delayOptions = {
      time: 0.1,
      feedback: 0.2,
      wet: 1,
      dry: 1,
    }
  ) {
    this.ctx = window.mainAudioCtx;
    this.LA = 432 * Math.pow(2, 1);
    this.seq = seq;
    this.type = type;
    this.delayOptions = delayOptions;
    this.pitch = pitch;
  }

  get time() {
    return this.ctx.currentTime;
  }

  osc(note) {
    const osc = this.ctx.createOscillator();
    osc.type = this.type;
    osc.frequency.setValueAtTime(note, this.time);
    const delayed = delay(this.ctx, osc, this.delayOptions);
    delayed.connect(window.mainGain);
    return osc;
  }

  tr(x) {
    return Math.pow(Math.pow(2, 1 / 12), -x);
  }

  base(x) {
    return this.LA * this.tr(x);
  }

  play() {
    let timeline = 0;
    Array.from(this.seq).map((notes) =>
      Array.from(notes)
        .map((n) => {
          n = n.toLowerCase();
          let note;
          let duration = 100;
          switch (n) {
            case ' ':
              //tick blank note 200ms
              note = 0;
              duration = 0;
              timeline += 200;
              break;
            case '.':
              //tick blank note 100ms
              note = 0;
              duration = 0;
              timeline += 100;
              break;
            case '+':
              //merge note
              note = 0;
              break;
            default:
              //tick note at 20ms
              note = this.base(-parseInt(n) * this.pitch);
              timeline += 20;
          }

          const noteOsc = this.osc(note);
          const harmOsc = this.osc(note * 2);
          const bassOsc = this.osc(note / 4);
          const atTime = timeline;
          return () => {
            setTimeout(() => {
              setTimeout(() => noteOsc.stop(), duration);
              setTimeout(() => harmOsc.stop(), duration);
              setTimeout(() => bassOsc.stop(), duration);
              noteOsc.start(this.time);
              harmOsc.start(this.time);
              bassOsc.start(this.time);
            }, atTime);
          };
        })
        .map((n) => n())
    );
  }
}

const tuludu = new SFX(['444', '..6', '8..'], -2, 'sine', {
  time: 0.1,
  feedback: 0.1,
  wet: 0.1,
  dry: 0.1,
});

const zim = new SFX(['..6', '8..'], 4, 'sine', {
  time: 0.1,
  feedback: 0.1,
  wet: 0.1,
  dry: 0.1,
});

const blip = new SFX(['4 8+4'], -8, 'sine', {
  time: 0,
  feedback: 0.1,
  wet: 1,
  dry: 0.3,
});

const blop = new SFX(['1+3+9999'], -24, 'sine', {
  time: 0,
  feedback: 0.1,
  wet: 1,
  dry: 0.3,
});

const bop = new SFX(['1'], -18, 'sine', {
  time: 0.0004,
  feedback: 0.1,
  wet: 1,
  dry: 0.3,
});

const intro = new SFX(['00+22', '66+66', '...8'], 2, 'square', {
  time: 0.2,
  feedback: 0.1,
  wet: 1,
  dry: 0.3,
});
/******************************************************************************/

export default {intro, tuludu, zim, blop, blip, bop};
