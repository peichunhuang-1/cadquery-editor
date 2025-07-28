import html2canvas from 'html2canvas';

export async function captureDivAndExtractTint(
  div: HTMLElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): Promise<string> {
  const canvas = await html2canvas(div, {
    backgroundColor: null,
    scale: 1,
    useCORS: true,
  });
  const ctx = canvas.getContext('2d');
  const imgData = ctx?.getImageData(Math.max(sx / 1.0, 0), Math.max(sy / 1.0, 0), Math.min(sw / 1.0, canvas.width), Math.min(sh / 1.0, canvas.height));
  if (!imgData) return 'rgba(0,0,0,0.2)'; 
  let r = 0,
      g = 0,
      b = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    r += imgData.data[i];
    g += imgData.data[i + 1];
    b += imgData.data[i + 2];
  }

  const pixelCount = imgData.data.length / 4;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const isBright = brightness > 80;
  const contrastColor = isBright
    ? `rgba(40, 40, 40, 0.6)` 
    : `rgba(255, 255, 255, 0.2)`;
  return contrastColor;
}