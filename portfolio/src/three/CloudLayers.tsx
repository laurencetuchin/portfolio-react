import { Cloud, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MeshBasicMaterial, type Group } from "three";
import { scrollState } from "../lib/scrollProgress";
import { layerOffset } from "./cameraMotion";
import { CLOUD_TEXTURE_URL } from "./cloudTexture";
import type { QualitySettings } from "./quality";

/**
 * Module-level, NOT inline. <Clouds> rebuilds its material class in a useMemo
 * keyed on this reference, so an inline `MeshBasicMaterial` would rebuild it on
 * every render.
 *
 * Basic rather than drei's default MeshLambertMaterial: the puffs should read
 * flat and milky, and it drops the dependency on scene lighting entirely.
 */
const CLOUD_MATERIAL = MeshBasicMaterial;

type LayerConfig = {
	seed: number;
	bounds: [number, number, number];
	position: [number, number, number];
	volume: number;
	opacity: number;
	color: string;
	speed: number;
};

/** Back to front. Colour grades from lilac haze to white for aerial depth. */
const LAYERS: LayerConfig[] = [
	{
		seed: 1,
		bounds: [16, 3, 3],
		position: [0, 1.5, -14],
		volume: 9,
		opacity: 0.3,
		color: "#E9DEFB",
		speed: 0.08,
	},
	{
		seed: 2,
		bounds: [13, 2.5, 3],
		position: [-3, -0.4, -7],
		volume: 7,
		opacity: 0.4,
		color: "#FFF1F4",
		speed: 0.12,
	},
	{
		seed: 3,
		bounds: [11, 2, 2.5],
		position: [4, -1.6, -2],
		volume: 6,
		opacity: 0.5,
		color: "#FFFFFF",
		speed: 0.16,
	},
];

type CloudLayersProps = {
	quality: QualitySettings;
};

export default function CloudLayers({ quality }: CloudLayersProps) {
	const refs = useRef<(Group | null)[]>([]);
	const layers = LAYERS.slice(0, quality.layers);

	useFrame(() => {
		// scrollState.current is damped by CameraRig in the same frame loop;
		// reusing it here keeps the layers locked to the camera rather than
		// smoothing on a second, slightly different curve.
		layers.forEach((layer, index) => {
			const group = refs.current[index];
			if (!group) return;
			group.position.y = layer.position[1] + layerOffset(index, scrollState.current);
		});
	});

	return (
		/*
		 * `texture` MUST be set here, on the parent.
		 *
		 * drei defaults it to a rawcdn.githack.com URL, and CloudProps has no
		 * texture field of its own — so a bare <Cloud>, or this prop going missing
		 * in a refactor, silently hotlinks a third-party CDN at runtime.
		 * src/three/cloudTexture.test.ts guards this.
		 */
		<Clouds
			texture={CLOUD_TEXTURE_URL}
			material={CLOUD_MATERIAL}
			limit={quality.limit}
			frustumCulled
		>
			{layers.map((layer, index) => (
				<Cloud
					key={layer.seed}
					ref={(group: Group | null) => {
						refs.current[index] = group;
					}}
					seed={layer.seed}
					segments={quality.segments}
					bounds={layer.bounds}
					position={layer.position}
					volume={layer.volume}
					opacity={layer.opacity}
					color={layer.color}
					speed={layer.speed}
					growth={3}
					fade={30}
				/>
			))}
		</Clouds>
	);
}
