import * as THREE from 'three';
import UIElementBase3D from './UIElementBase3D';

import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineSegments2} from 'three/examples/jsm/lines/LineSegments2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { MeshBVH } from 'three-mesh-bvh';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

type point = {
    x: number;
    y: number;
    z: number;
};

type triangle = [number, number, number];

type edge = number[];

type face = {
    triangles: triangle[];
};

export interface MeshElement3DProps {
    points: point[];
    faces: face[];
    edges: edge[];
    vertices: number[];
}

class MeshUIElement3DEdges extends UIElementBase3D {
    wires?: LineSegmentsGeometry;
    static normalEdgeMaterial: LineMaterial = new LineMaterial({
        color: '#222',
        linewidth: 1,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });
    static highlightEdgeMaterial: LineMaterial = new LineMaterial({
        color: '#4ae',
        linewidth: 2,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });
    constructor(props: MeshElement3DProps) {
        super();
        const line_positions: number[] = [];
        for (const edge of props.edges) {
            var p = props.points[edge[0]];
            line_positions.push(p.x, p.y, p.z);
            for (var i = 1; i < edge.length - 1; i++) {
                p = props.points[edge[i]];
                line_positions.push(p.x, p.y, p.z);
                line_positions.push(p.x, p.y, p.z);
            }
            p = props.points[edge[edge.length - 1]];
            line_positions.push(p.x, p.y, p.z);
        }
        this.wires = new LineSegmentsGeometry();
        this.wires.setPositions(line_positions);
        this.wires.boundsTree = new MeshBVH(this.wires);
        const line = new LineSegments2(this.wires, MeshUIElement3DEdges.normalEdgeMaterial);
        line.layers.set(1);
        this.add(line);
    }
    onHover(intersect: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) {
        console.log(intersect.faceIndex);
    }
    dispose() {
        this.wires?.dispose();
        this.parent?.remove(this);
    }
};

export class MeshUIElement3D extends UIElementBase3D {
    geometry: THREE.BufferGeometry;
    positionAttr?: THREE.Float32BufferAttribute;
    static normalFaceMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ 
            color: "#ddd",
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
    });
    static highlightFaceMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
            color: "#4af",
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
    });

    constructor(props: MeshElement3DProps) {
        super();
        const positions: number[] = [];
        for (const face of props.faces) {
            for (const tri of face.triangles) {
                const p1 = props.points[tri[0]];
                const p2 = props.points[tri[1]];
                const p3 = props.points[tri[2]];
                positions.push(p1.x, p1.y, p1.z);
                positions.push(p2.x, p2.y, p2.z);
                positions.push(p3.x, p3.y, p3.z);
            }
        }
        this.positionAttr = new THREE.Float32BufferAttribute(positions, 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', this.positionAttr);
        this.geometry.computeVertexNormals();
        this.geometry.boundsTree = new MeshBVH(this.geometry);
        const mesh = new THREE.Mesh(this.geometry, MeshUIElement3D.normalFaceMaterial);
        mesh.layers.set(1);
        this.add(mesh);
        this.add(new MeshUIElement3DEdges(props));
    }
    onHover(intersect: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) {
        console.log(intersect.faceIndex);
    }
    dispose() {
        this.geometry.dispose();
        this.parent?.remove(this);
    }
}

export class MeshUIElement3DGroup extends THREE.Group {
    setLayerRecursive(object: THREE.Object3D, layer: number) {
        object.layers.set(layer);
        object.children.forEach((child) => this.setLayerRecursive(child, layer));
    }
    Reload() {
        this.setLayerRecursive(this, 1);
    }
    UnLoad() {
        this.setLayerRecursive(this, 2);
    }
    dispose() {

    }
}