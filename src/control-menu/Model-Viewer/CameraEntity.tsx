import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import CameraController from './CameraControl';
import { useEffect, useRef } from 'react';

const CameraEntity = ({ cameraControlsRef }: { cameraControlsRef: React.RefObject<CameraControls> }) => {
    const targetRef = useRef<CameraControls>(null);
    useEffect(()=>{
        const updatePreviewCamera = () => {
            if (targetRef.current && cameraControlsRef.current) {
                let lookAt: THREE.Vector3 = new THREE.Vector3();
                let position: THREE.Vector3 = new THREE.Vector3();
                cameraControlsRef.current.camera.getWorldPosition(position);
                cameraControlsRef.current.camera.lookAt(lookAt);
                let targetPosition: THREE.Vector3 = position.clone().sub(lookAt);
                targetPosition = targetPosition.normalize();
                targetPosition.multiplyScalar(5);
                targetRef.current?.setLookAt(
                    targetPosition.x, targetPosition.y, targetPosition.z,
                    0, 0, 0,
                    false 
                );
            }
            requestAnimationFrame(updatePreviewCamera);
        };
        updatePreviewCamera();
    }, [cameraControlsRef]);
  return (
    <Canvas
      style={{
        height: '18vh',
        width: '18vh',
        top: 0,
        right: 0,
        zIndex: 3,
      }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
    >
      <directionalLight position={[2, 3, 4]} intensity={1} castShadow />
      <CameraController cameraControlsRef={cameraControlsRef} />
      <CameraControls ref={targetRef} maxDistance={5} minDistance={5} makeDefault/>
      <ambientLight intensity={0.8} />
    </Canvas>
  );
};

export default CameraEntity;
