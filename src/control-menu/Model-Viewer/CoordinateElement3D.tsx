import * as THREE from 'three';
import UIElementBase3D from './UIElementBase3D';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Icon from '@ant-design/icons';

const XAXIS_COLOR = "#911";
const YAXIS_COLOR = "#191";
const ZAXIS_COLOR = "#08b";
const XAXIS_COLOR_HIGHLIGHT = "#f00";
const YAXIS_COLOR_HIGHLIGHT = "#5f5";
const ZAXIS_COLOR_HIGHLIGHT = "#1de";
const AXIS_LENGTH = 1;

export interface CoordinateElement3DProps {
    uuid: string;
    position: THREE.Vector3;
    orientation: THREE.Quaternion;
    isHitTestVisible: boolean;
    parent?: string;
    scalar?: number;
}

class CoordinateAxisLineElement3D extends UIElementBase3D {
    axis: number = 0;
    constructor(props: CoordinateElement3DProps, axis: number) {
        super();
        this.uuid = props.uuid;
        this.axis = axis;
        var direction = new THREE.Vector3();
        direction.setComponent(axis, 1);
        direction = direction.clone().multiplyScalar((props.scalar ?? 1) * AXIS_LENGTH)
        const material = new LineMaterial({ 
            color: axis === 0 ? XAXIS_COLOR : axis === 1 ? YAXIS_COLOR : ZAXIS_COLOR,
            linewidth: 2,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight) });
        const geometry = new LineGeometry();
        geometry.setPositions([0, 0, 0, direction.x, direction.y, direction.z]);
        const line = new Line2(geometry, material);
        if (props.isHitTestVisible) {
            line.layers.set(1);
        }
        this.add(line);
    }
    onHover() {
        (this.children[0] as Line2).material = new LineMaterial({ 
            color: this.axis === 0? XAXIS_COLOR_HIGHLIGHT: this.axis === 1? YAXIS_COLOR_HIGHLIGHT: ZAXIS_COLOR_HIGHLIGHT,
            linewidth: 3,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight) 
        });
    }
    onLeave() {
        (this.children[0] as Line2).material = new LineMaterial({ 
            color: this.axis === 0? XAXIS_COLOR: this.axis === 1? YAXIS_COLOR: ZAXIS_COLOR,
            linewidth: 2,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });
    }
    dispose() {}
}

export class CoordinateElement3D extends UIElementBase3D {
    static CoordinateIcon = () => (
        <svg width="1em" height="1em" viewBox="0 0 120 120" fill="none">
            <line x1="50" y1="50" x2="100" y2="65" stroke="#f5222d" strokeWidth="12" />
            <text x="92" y="54" fill="#f5222d" fontSize="10">X</text>

            <line x1="50" y1="50" x2="50" y2="5" stroke="#52c41a" strokeWidth="12" />
            <text x="52" y="10" fill="#52c41a" fontSize="10">Y</text>

            <line x1="50" y1="50" x2="15" y2="85" stroke="#1890ff" strokeWidth="12" />
            <text x="12" y="85" fill="#1890ff" fontSize="10">Z</text>

            <circle cx="50" cy="50" r="4" fill="#000" />
        </svg>
    );
    static icon = <Icon component={CoordinateElement3D.CoordinateIcon} />;
    constructor(props: CoordinateElement3DProps) {
        super();
        this.add(new CoordinateAxisLineElement3D(props, 0));
        this.add(new CoordinateAxisLineElement3D(props, 1));
        this.add(new CoordinateAxisLineElement3D(props, 2));
        this.position.copy(props.position);
        this.quaternion.copy(props.orientation);
        this.parent_id = props.parent;
        // ipcRenderer.requestTransform(props.uuid);
    }
    icon() {
        return CoordinateElement3D.icon;
    }
    dispose() {
        this.children.forEach((c: any) => c.dispose?.());
        this.parent?.remove(this);
    }
}

export const CoordinateElement3DComponent = forwardRef(({ ...props }: CoordinateElement3DProps, ref) => {
    const [model, setModel] = useState<CoordinateElement3D | null>(null);

    useEffect(() => {
        const element = new CoordinateElement3D(props);
        setModel(element);
        return () => element.dispose();
    }, []);
    useImperativeHandle(ref, () => model, [model]);
    return model ? <primitive object={model} /> : null;
});