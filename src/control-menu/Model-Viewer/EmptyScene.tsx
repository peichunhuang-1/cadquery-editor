import { useRef } from 'react';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { CameraControls } from '@react-three/drei';
import CameraEntity from './CameraEntity';
import ViewerEntity from './ViewerEntity';

const EmptyScene = ({root}: {root: any}) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);

  return (
    <>
      <div
        style={{
          left: 0,
          width: '100%',
          height: '9vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '10px',
          paddingLeft: '10px',
          zIndex: 2,
          position: 'absolute'
        }}
      >
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            top: '0vh',
          }}
          onClick={() => {
            cameraControlsRef.current?.reset(true);
            cameraControlsRef.current?.setPosition(100, 100, -100);
          }}
        />
        <div style={{ width: '90%' }} />
        <CameraEntity cameraControlsRef={cameraControlsRef} />
      </div>

      <ViewerEntity cameraControlsRef={cameraControlsRef} root={root}/>
    </>
  );
};

export default EmptyScene;
