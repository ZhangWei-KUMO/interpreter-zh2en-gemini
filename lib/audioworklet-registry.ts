/**
 * A registry to map attached worklets by their audio-context
 * any module using `audioContext.audioWorklet.addModule(` should register the worklet here
 */
export type WorkletGraph = {
  node?: AudioWorkletNode;
  handlers: Array<(this: MessagePort, ev: MessageEvent) => any>;
};

// Initialize registeredWorklets only on the client side
export const registeredWorklets: Map<
  AudioContext,
  Record<string, WorkletGraph>
> = typeof window !== 'undefined' ? new Map() : new Map();

/**
 * Creates a Blob URL for an AudioWorklet from a string source.
 * Note: The worklet source string should already include the `registerProcessor` call.
 * 
 * @param workletName The name of the worklet to register
 * @param workletSrc The source code of the worklet as a string
 * @returns A URL to the created blob
 */
export const createWorketFromSrc = (
  workletName: string,
  workletSrc: string,
) => {
  // Only run in browser context
  if (typeof window === 'undefined') {
    return '';
  }
  
  const script = new Blob(
    [workletSrc], // Use the worklet source directly - it already includes registerProcessor
    {
      type: "application/javascript",
    },
  );

  return URL.createObjectURL(script);
}; 