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
  activeSquare: THREE.Mesh | null;
  greySquare: THREE.Mesh | null;
  yellowSquare: THREE.Mesh | null;
  backTrackingLineHorizontal: THREE.Mesh | null;
  backTrackingLineVertical: THREE.Mesh | null;
}
