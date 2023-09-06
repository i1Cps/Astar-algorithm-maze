export interface walls {
    topWall: boolean;
    leftWall: boolean;
    rightWall: boolean;
    bottomWall: boolean;
}

export interface cellObjects {
    topWall: THREE.Mesh | null;
    leftWall: THREE.Mesh | null;
    rightWall: THREE.Mesh | null;
    bottomWall: THREE.Mesh | null;
    greenSquare: THREE.Mesh | null;
    greySquare: THREE.Mesh | null;
    yellowSquare: THREE.Mesh | null;
}
