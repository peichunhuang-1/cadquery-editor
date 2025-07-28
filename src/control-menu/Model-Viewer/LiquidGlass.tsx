import { useEffect, useRef, useState } from 'react';
import {captureDivAndExtractTint} from './AdaptiveTint';

function smoothStep(a: number, b: number, t: number) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number) {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number) {
  return { x, y };
}

function generateId() {
  return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
}

type LiquidGlassProperty = {
  width: number;
  height: number;
  borderRadius: number;
  constrainRef?: any;
  children?: any;
  onClick? : any;
}

export function LiquidGlass(props: LiquidGlassProperty) {
  const idRef = useRef(generateId());
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const feImageRef = useRef<any>(null);
  const feDisplacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasDPI = 1;
  const width = props.width;
  const height = props.height;
  const offset = 10;

  const constrainPosition = (x: number, y: number) => {
    var minX = offset;
    var maxX = window.innerWidth - width - offset;
    var minY = offset;
    var maxY = window.innerHeight - height - offset;
    if (props.constrainRef?.current) {
      const bounds = props.constrainRef.current.getBoundingClientRect();
      minX = bounds.left + offset;
      maxX = bounds.right - width - offset;
      minY = bounds.top + offset;
      maxY = bounds.bottom - height - offset;
    }
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  const updateShader = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = width * canvasDPI;
    const h = height * canvasDPI;
    const ctx = contextRef.current;
    if (!ctx) return;

    const data = new Uint8ClampedArray(w * h * 4);
    let maxScale = 0;
    const rawValues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = (() => {
        const uv = { x: x / w, y: y / h };
        const ix = uv.x - 0.5;
        const iy = uv.y - 0.5;
        const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.25);
        const scaled = smoothStep(0, 1, displacement);
        return texture(ix * scaled + 0.5, iy * scaled + 0.5);
      })();

      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;
    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    ctx.putImageData(new ImageData(data, w, h), 0, 0);
    feImageRef.current?.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    feDisplacementRef.current?.setAttribute('scale', (maxScale / canvasDPI).toString());
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pos = constrainPosition(rect.left, rect.top);
        containerRef.current.style.left = `${pos.x}px`;
        containerRef.current.style.top = `${pos.y}px`;
        containerRef.current.style.transform = 'none';
      }
    });
    props.constrainRef?.current && resizeObserver.observe(props.constrainRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!container || !ctx) return;
    contextRef.current = ctx;

    let isDragging = false;
    let startX = 0,
      startY = 0,
      initialX = 0,
      initialY = 0;

    let pressStartTime = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      container.style.cursor = 'grabbing';
      container.style.transform = 'scale(1.07)';
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      pressStartTime = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
      updateShader();
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        const pos = constrainPosition(newX, newY);
        container.style.left = `${pos.x}px`;
        container.style.top = `${pos.y}px`;
        container.style.transform = 'scale(1.07)';
        container.style.transition = 'none';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const heldTime = Date.now() - pressStartTime;
      var offsetX;
      var offsetY;
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const length = Math.max(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);
        offsetX = deltaX / length * 2;
        offsetY = deltaY / length * 2;
        if (props.constrainRef) {
            const rect = container.getBoundingClientRect();
            const bound = props.constrainRef.current.getBoundingClientRect();
            captureDivAndExtractTint(props.constrainRef.current, rect.left - bound.left - 20, rect.top - bound.top - 20, rect.width + 40, rect.height + 40).then((tint: string) =>{
                container.style.background = tint;
                container.style.transition = 'all 0.41s';
            });
        }
      } else {
        offsetX = 0;
        offsetY = 0;
      }
      isDragging = false;
      container.style.cursor = 'grab';
      container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`;
      container.style.transition = 'all 0.41s cubic-bezier(0.175, 1.3, 0.32, 2.5)';
      setTimeout(() => {
        container.style.transform = 'translate(0px, 0px) scale(1)';
      }, 300);
      if (heldTime < 200 && typeof props.onClick === 'function') {
        props.onClick(e);
      }
    };

    const onMouseOver = () => {
      container.style.transform = 'scale(1.07) translateY(-1px) translateX(1px)';
    };
    
    const onMouseOut = () => {
      container.style.transform = 'scale(1) translateY(1px) translateX(-1px)';
    };
    window.addEventListener('resize', () => {
      const rect = container.getBoundingClientRect();
      const pos = constrainPosition(rect.left, rect.top);
      container.style.left = `${pos.x}px`;
      container.style.top = `${pos.y}px`;
      container.style.transform = 'none';
    });
  
    container.addEventListener('mouseover', onMouseOver);
    container.addEventListener('mouseout', onMouseOut);
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    updateShader();

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width,
          height,
          inset: 0,
          borderRadius: props.borderRadius,
          overflow: 'hidden',
          background: `rgba(255, 255, 255, 0.2)`,
          boxShadow: `
          inset 0px 0px 3px 3px rgba(150, 150, 150, 0.1), 
          3px 3px 3px 3px rgba(10, 10, 10, .12), 
          inset -1px -1px 1px 1px rgba(190, 238, 255, 0.08), 
          inset 1px -1px 1px 1px rgba(221, 250, 254, 0.08), 
          inset .2px .2px .2px .2px rgba(254, 255, 240, .3),
          inset 1px 1px 1px 1px rgba(254, 255, 240, 0.12)`
          ,
          cursor: 'grab',
          backdropFilter: `url(#${idRef.current}_filter) blur(2.5px) contrast(1.3) brightness(1.3) saturate(1.8)`,
          zIndex: 9999,
          pointerEvents: 'auto',
          transition: 'all 0.41s cubic-bezier(0.175, 1.3, 0.32, 2.5)',
        }}
      >
        {props.children? props.children: null}
      </div>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="0"
        height="0"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none' }}
      >
        <defs>
          <filter
            id={`${idRef.current}_filter`}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width={width}
            height={height}
          >
            <feImage
              ref={feImageRef}
              id={`${idRef.current}_map`}
              width={width}
              height={height}
            />
            <feGaussianBlur
              in="turbulence" 
              stdDeviation="3" 
              result="softMap" 
            />
            <feDisplacementMap
              ref={feDisplacementRef}
              in="SourceGraphic"
              scale="150"
              in2={`${idRef.current}_map`}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        width={width * canvasDPI}
        height={height * canvasDPI}
        style={{ display: 'none' }}
      />
    </>
  );
}
