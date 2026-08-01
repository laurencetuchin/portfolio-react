import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { scrollState } from "../lib/scrollProgress";
import { damp, fovNeedsUpdate, poseForProgress, pointerOffset } from "./cameraMotion";

type CameraRigProps = {
	enablePointer: boolean;
};

/**
 * Flies the camera through the cloud deck as the page scrolls.
 *
 * Reads scroll from the module singleton rather than props/state, so nothing
 * here triggers a React render. All maths lives in cameraMotion.ts.
 */
export default function CameraRig({ enablePointer }: CameraRigProps) {
	const pointer = useRef({ x: 0, y: 0 });

	useFrame((state, delta) => {
		// Guard against tab-restore producing a huge delta that would teleport
		// the camera instead of gliding it.
		const dt = Math.min(delta, 0.1);

		scrollState.current = damp(scrollState.current, scrollState.target, 4, dt);
		const pose = poseForProgress(scrollState.current);

		const targetOffset = pointerOffset(state.pointer.x, state.pointer.y, enablePointer);
		pointer.current.x = damp(pointer.current.x, targetOffset.x, 3, dt);
		pointer.current.y = damp(pointer.current.y, targetOffset.y, 3, dt);

		const { camera } = state;
		camera.position.set(
			pose.x + pointer.current.x,
			pose.y + pointer.current.y,
			pose.z
		);
		camera.rotation.x = pose.rotationX;

		if ("fov" in camera && fovNeedsUpdate(camera.fov, pose.fov)) {
			camera.fov = pose.fov;
			camera.updateProjectionMatrix();
		}
	});

	return null;
}
