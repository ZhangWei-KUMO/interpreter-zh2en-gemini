export type GetAudioContextOptions = AudioContextOptions & {
  id?: string;
};

const map: Map<string, AudioContext> = new Map();

export const audioContext: (
  options?: GetAudioContextOptions,
) => Promise<AudioContext> = (() => {
  // Only run browser-specific code on the client side
  const isClient = typeof window !== 'undefined';
  
  // Create a dummy promise that resolves immediately for server-side rendering
  const didInteract = isClient 
    ? new Promise<void>((res) => {
        window.addEventListener("pointerdown", () => res(), { once: true });
        window.addEventListener("keydown", () => res(), { once: true });
      }) 
    : Promise.resolve();

  return async (options?: GetAudioContextOptions) => {
    // Early return with a dummy AudioContext during SSR
    if (!isClient || typeof AudioContext === 'undefined') {
      return {} as AudioContext;
    }
    
    try {
      const a = new Audio();
      a.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      await a.play();
      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id);
        if (ctx) {
          return ctx;
        }
      }
      const ctx = new AudioContext(options);
      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    } catch (e) {
      await didInteract;
      if (options?.id && map.has(options.id)) {
        const ctx = map.get(options.id);
        if (ctx) {
          return ctx;
        }
      }
      const ctx = new AudioContext(options);
      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    }
  };
})();

export const blobToJSON = (blob: Blob) => {
  // Only run browser-specific code on the client side
  if (typeof window === 'undefined') {
    return Promise.resolve({});
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        try {
          const json = JSON.parse(reader.result as string);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      } else {
        reject("No result from FileReader");
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(blob);
  });
};

export function base64ToArrayBuffer(base64: string) {
  // Only run browser-specific code on the client side
  if (typeof window === 'undefined' || typeof atob === 'undefined') {
    return new ArrayBuffer(0);
  }
  
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
} 