import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import UIElementBase3D from './UIElementBase3D';
import { acceleratedRaycast } from 'three-mesh-bvh';
import { theme } from 'antd';
import { invalidate } from '@react-three/fiber';

interface ViewContentProps {
    cameraControlsRef: React.RefObject<CameraControls>;
    root: any;
}

const ViewerContent = function({cameraControlsRef, root}: ViewContentProps) {
    const mouse = useRef(new THREE.Vector2());
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
    const raycaster = useRef(new THREE.Raycaster());
    const [intersectedObject, setIntersectedObject] = useState<UIElementBase3D | null>(null);
    const { camera, scene, gl } = useThree();

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const canvas = gl.domElement;
            const rect = canvas.getBoundingClientRect();
            const canvasWidth = rect.width;
            const canvasHeight = rect.height;

            mouse.current.x = ((event.clientX - rect.left) / canvasWidth) * 2 - 1;
            mouse.current.y = -((event.clientY - rect.top) / canvasHeight) * 2 + 1;
        };
        raycaster.current.params.Line2 = { threshold: 10 };
        raycaster.current.layers.disable(0);
        raycaster.current.layers.enable(1);
        raycaster.current.layers.disable(2);
        cameraControlsRef.current?.camera.layers.enable(0);
        cameraControlsRef.current?.camera.layers.enable(1);
        cameraControlsRef.current?.camera.layers.disable(2);
        cameraControlsRef.current?.setPosition(100, 100, -100);
        if (cameraControlsRef.current) {
            cameraControlsRef.current.camera.near = 1;
            cameraControlsRef.current.camera.far = 1e6;
            camera.updateProjectionMatrix();
        }
        gl.domElement.addEventListener('pointermove', handlePointerMove);
        return () => {
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        };
    }, []);

    useFrame(() => {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            try {
                setIntersectedObject(
                    prev => {
                        if (prev !== null) {
                            prev.onLeave();
                        }
                        return intersects[0].object.parent as UIElementBase3D;
                    }
                );
                (intersects[0].object.parent as UIElementBase3D).onHover(intersects[0]);
            }
            catch(e) {
                setIntersectedObject(
                    prev => {
                        if (prev !== null) {
                            prev.onLeave();
                        }
                        return null;
                    }
                );
            }
        } else {
            setIntersectedObject(
                prev => {
                    if (prev !== null) {
                        prev.onLeave();
                    }
                    return null;
                }
            );
        }
    });

    return (
        <>
        <CameraControls ref={cameraControlsRef} />
        <ambientLight intensity={0.5} />
        {/* <directionalLight position={[0, 5, 10]} /> */}
        {/* <gridHelper args={[3000, 30]} /> */}
        {root.current}
        </>
    );
}

const ViewerEntity = function({ cameraControlsRef, root }: ViewContentProps) {
  const { token } = theme.useToken();
  return (
    <Canvas 
        style={{ 
            height: '100%', 
            width: '100%', 
            zIndex: 1, 
            background: `linear-gradient(to bottom,${token.colorBgLayout},${token.colorBorder})` 
        }}
        >
        <ViewerContent cameraControlsRef={cameraControlsRef} root={root} />
    </Canvas>
  );
};

export default ViewerEntity;