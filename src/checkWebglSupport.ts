export default function checkWebglSupport() {
  try {
    const canvas = document.createElement('canvas')
    return (
      // @ts-ignore
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )

  } catch (e) {
    return false
  }
}
