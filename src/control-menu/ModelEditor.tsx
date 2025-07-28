import { useEffect, useRef, useState } from "react";
import { CoordinateElement3DComponent } from "./Model-Viewer/CoordinateElement3D";
import { Quaternion, Vector3 } from "three";
import EmptyScene from "./Model-Viewer/EmptyScene";
import { LiquidGlass } from './Model-Viewer/LiquidGlass';
import { EllipsisOutlined, EditOutlined, SelectOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useModelStore } from "../hook/ModelStore";
export function ModelEditor() {
    const containerRef = useRef<HTMLDivElement>(null);
    const {setRoot} = useModelStore();
    const root = useRef<any>();
    useEffect(() => {
        root.current = 
        <CoordinateElement3DComponent
            uuid="root"
            position={new Vector3(0, 0, 0)}
            orientation={new Quaternion(-0.7071068, 0, 0, 0.7071068)}
            isHitTestVisible={true}
            scalar={10}
            key="root"
            ref={(ref) => {
                if (ref) {
                    setRoot(ref);
                }
            }}
        />;
    }, []);
    return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {/* <LiquidGlass width={150} height={30} borderRadius={15} constrainRef={containerRef} 
            onClick={(e: MouseEvent) => {console.log(e.clientX, e.clientY, e.offsetX, e.offsetY)}}
            children={
            <div
            style={{
            display: 'flex',
            gap: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            }}
            >
                <EditOutlined 
                style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.4)',
                    position: 'absolute',
                    top: '50%',
                    left: '12.5%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    mixBlendMode: 'difference',
                    pointerEvents: 'none',
                    filter: 'contrast(1.2) brightness(1.2)',
                }}/>
                < EllipsisOutlined 
                style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.4)',
                    position: 'absolute',
                    top: '50%',
                    left: '37.5%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    mixBlendMode: 'difference',
                    pointerEvents: 'none',
                    filter: 'contrast(1.2) brightness(1.2)',
                }}/>
                <SelectOutlined 
                style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.4)',
                    position: 'absolute',
                    top: '50%',
                    left: '62.5%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    mixBlendMode: 'difference',
                    pointerEvents: 'none',
                    filter: 'contrast(1.2) brightness(1.2)',
                }}/>
                <PlusSquareOutlined
                style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.4)',
                    position: 'absolute',
                    top: '50%',
                    left: '87.5%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    mixBlendMode: 'difference',
                    pointerEvents: 'none',
                    filter: 'contrast(1.2) brightness(1.2)',
                }}/>
            </div>
        } /> */}
        <EmptyScene root={root}/>
    </div>
    )
}