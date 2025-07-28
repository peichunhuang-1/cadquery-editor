import * as THREE from 'three';


export default abstract class UIElementBase3D extends THREE.Object3D {
    public visibility: number = 0;
    public parent_id?: string = "root";
    constructor() { super(); }
    // mouse event trigger
    onHover(props: any): void {}
    onLeave(): void {}
    onClick(props: any): void {}
    onRightClick(props: any): void {}
    onDoubleClick(props: any): void {}
    onDragStart(props: any): void {}
    onDragEnd(props: any): void {}
    onDrag(props: any): void {}
    // attention event
    onFocus(props: any): void {}
    onBlur(props: any): void {}
    // hierarchy manage event
    onAttach(props: any): void {}
    onDetach(props: any): void {}
    // remote call process event
    onRPC(props: any): void {}
    pullRequest(props: any): void {}
    // set visibility
    setVisibility(visibility: number): void {};
    icon(): any {};
    // destroy and release event
    abstract dispose(): void;
}