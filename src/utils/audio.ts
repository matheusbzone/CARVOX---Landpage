/**
 * Audio helpers for raw PCM conversion and scheduled gapless playback.
 */

export function float32ToInt16(buffer: Float32Array): Int16Array {
  const l = buffer.length;
  const buf = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return buf;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function int16ToFloat32(buffer: Int16Array): Float32Array {
  const l = buffer.length;
  const buf = new Float32Array(l);
  for (let i = 0; i < l; i++) {
    buf[i] = buffer[i] / (buffer[i] < 0 ? 0x8000 : 0x7FFF);
  }
  return buf;
}

/**
 * Manages scheduling gapless playback of PCM raw chunks
 */
export class AudioPlayerQueue {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private analyser: AnalyserNode | null = null;

  init(ctx: AudioContext, analyser?: AnalyserNode) {
    this.ctx = ctx;
    this.analyser = analyser || null;
    this.nextStartTime = 0;
  }

  playChunk(base64Data: string) {
    if (!this.ctx) return;

    try {
      const arrayBuffer = base64ToArrayBuffer(base64Data);
      const int16Array = new Int16Array(arrayBuffer);
      const float32Array = int16ToFloat32(int16Array);

      // Create raw mono audio buffer at 24kHz (Gemini model default response rate)
      const audioBuffer = this.ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.ctx.destination);
      }

      const currentTime = this.ctx.currentTime;
      if (this.nextStartTime < currentTime) {
        // Schedule slightly in the future to account for jitter
        this.nextStartTime = currentTime + 0.05;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (e) {
      console.error("Erro ao reproduzir chunk de áudio:", e);
    }
  }

  stop() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }
}
