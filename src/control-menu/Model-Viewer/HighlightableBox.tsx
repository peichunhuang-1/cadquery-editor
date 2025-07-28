import { useRef, useEffect } from 'react';
import { Box, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LABEL_COLOR = '#222';
const HIGHLIGHT_COLOR = '#fefefe';
const DEFAULT_COLOR = '#ddd';

interface HighlightableBoxProps {
    name: string;
    position: THREE.Vector3  | [number, number, number];
    args: [number, number, number];
    rotation?: THREE.Euler | [number, number, number];
    onClick?: (event: THREE.Event) => void;
    isHighlighted: boolean;
    label?: string;
    label_position?: THREE.Vector3 | [number, number, number];
    label_rotation?: THREE.Euler | [number, number, number];
}

const HighlightableBox: React.FC<HighlightableBoxProps> = ({
    name,
    position,
    args,
    rotation = [0, 0, 0],
    onClick,
    isHighlighted,
    label,
    label_position,
    label_rotation,
}) => {
    const ref = useRef<THREE.Mesh>(null!);

    useEffect(() => {
      if (ref.current) {
        ref.current.name = name;
      }
    }, [name]);

    useFrame(() => {
      if (ref.current && ref.current.material instanceof THREE.MeshStandardMaterial) {
        ref.current.material.color.set(isHighlighted ? HIGHLIGHT_COLOR : DEFAULT_COLOR);
      }
    });

    return (
      <group>
        <Box
          ref={ref}
          position={position}
          args={args}
          rotation={rotation}
          onClick={onClick}
        >
          <meshStandardMaterial roughness={0.5} />
        </Box>
        {label && label_position && label_rotation && (
          <Text
            position={label_position}
            rotation={label_rotation}
            fontSize={0.4}
            color={LABEL_COLOR}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )}
      </group>
    );
};

export default HighlightableBox;