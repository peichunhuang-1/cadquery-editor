import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import HighlightableBox from './HighlightableBox';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';


const LABEL_COLOR = '#222222';

const BoxDashedEdges = () => {
    const lineRef = useRef<THREE.LineSegments>(null!);

    const geometry = useMemo(() => {
      return new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 2.0, 2.0));
    }, []);
  
    const material = useMemo(() => {
      return new THREE.LineDashedMaterial({
        color: LABEL_COLOR,
        dashSize: 0.2,
        gapSize: 0.12,
      });
    }, []);
  
    useEffect(() => {
      if (lineRef.current) {
        lineRef.current.computeLineDistances();
      }
    }, []);

  return <lineSegments ref={lineRef} geometry={geometry} material={material} raycast={() => {}}/>;
};

interface CameraControllerProps {
  cameraControlsRef: React.RefObject<CameraControls>;
}

const CameraController: React.FC<CameraControllerProps> = ({ cameraControlsRef }) => {
  const mouse = useRef(new THREE.Vector2());
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const [intersectedObject, setIntersectedObject] = useState<string | null>(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      mouse.current.x = ((event.clientX - rect.left) / canvasWidth) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / canvasHeight) * 2 + 1;
    };

    gl.domElement.addEventListener('pointermove', handlePointerMove);
    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl.domElement]);

  const updateRaycaster = () => {
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      setIntersectedObject(intersects[0].object.name);
    } else {
      setIntersectedObject(null);
    }
  };

  useFrame(() => {
    updateRaycaster();
  });

  const handleClick = () => {
    if (intersectedObject && cameraControlsRef.current) {
      const obj = scene.getObjectByName(intersectedObject);
      if (obj) {
        cameraControlsRef.current.setTarget(0, 0, 0);
        cameraControlsRef.current.setPosition(obj.position.x * 100, obj.position.y * 100, obj.position.z * 100);
        cameraControlsRef.current.rotate(0, 0, true);
        cameraControlsRef.current.update(0);
      }
    }
  };

  return (
    <group>
      {[
        [0.8, 0.8, 0.8], [0.8, 0.8, -0.8], [0.8, -0.8, 0.8], [0.8, -0.8, -0.8],
        [-0.8, 0.8, 0.8], [-0.8, 0.8, -0.8], [-0.8, -0.8, 0.8], [-0.8, -0.8, -0.8]
      ].map((pos, index) => (
        <HighlightableBox
          key={`corner-${index}`}
          name={`corner-${index}`}
          position={pos as [number, number, number]}
          args={[0.4, 0.4, 0.4]}
          onClick={handleClick}
          isHighlighted={intersectedObject === `corner-${index}`}
        />
      ))}

      {[
        { position: [0.8, 0.8, 0.0], rotation: [0, 0, 0] },
        { position: [0.8, -0.8, 0.0], rotation: [0, 0, 0] },
        { position: [0.8, 0.0, 0.8], rotation: [Math.PI / 2, 0, 0] },
        { position: [0.8, 0.0, -0.8], rotation: [Math.PI / 2, 0, 0] },
        { position: [0.0, 0.8, 0.8], rotation: [0, Math.PI / 2, 0] },
        { position: [0.0, 0.8, -0.8], rotation: [0, Math.PI / 2, 0] },
        { position: [-0.8, 0.8, 0.0], rotation: [0, 0, 0] },
        { position: [-0.8, -0.8, 0.0], rotation: [0, 0, 0] },
        { position: [-0.8, 0.0, 0.8], rotation: [Math.PI / 2, 0, 0] },
        { position: [-0.8, 0.0, -0.8], rotation: [Math.PI / 2, 0, 0] },
        { position: [0.0, -0.8, 0.8], rotation: [0, Math.PI / 2, 0] },
        { position: [0.0, -0.8, -0.8], rotation: [0, Math.PI / 2, 0] }
      ].map((edge, index) => (
        <HighlightableBox
          key={`edge-${index}`}
          name={`edge-${index}`}
          position={edge.position as [number, number, number]}
          rotation={edge.rotation as [number, number, number]}
          args={[0.4, 0.4, 1.2]}
          onClick={handleClick}
          isHighlighted={intersectedObject === `edge-${index}`}
        />
      ))}

      {[
        { label: 'FRONT', position: [0, 0, 0.8], rotation: [0, 0, 0], label_position: [0, 0, 1.1], label_rotation: [0, 0, 0] },
        { label: 'BACK', position: [0, 0, -0.8], rotation: [0, 0, 0], label_position: [0, 0, -1.1], label_rotation: [-Math.PI, 0, Math.PI] },
        { label: 'TOP', position: [0, 0.8, 0], rotation: [Math.PI / 2, 0, 0], label_position: [0, 1.1, 0], label_rotation: [-Math.PI / 2, 0, 0] },
        { label: 'UNDER', position: [0, -0.8, 0], rotation: [Math.PI / 2, 0, 0], label_position: [0, -1.1, 0], label_rotation: [Math.PI / 2, 0, 0] },
        { label: 'RIGHT', position: [0.8, 0, 0], rotation: [0, Math.PI / 2, 0], label_position: [1.1, 0, 0], label_rotation: [0, Math.PI / 2, 0] },
        { label: 'LEFT', position: [-0.8, 0, 0], rotation: [0, Math.PI / 2, 0], label_position: [-1.1, 0, 0], label_rotation: [0, -Math.PI / 2, 0] }
      ].map((face, index) => (
        <HighlightableBox
          key={`face-${index}`}
          name={`face-${index}`}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          args={[1.2, 1.2, 0.4]}
          onClick={handleClick}
          isHighlighted={intersectedObject === `face-${index}`}
          label={face.label}
          label_position={face.label_position as [number, number, number]}
          label_rotation={face.label_rotation as [number, number, number]}
        />
      ))}
      <BoxDashedEdges/>
    </group>
  );
};

export default CameraController;
