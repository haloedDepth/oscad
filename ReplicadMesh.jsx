import React, { useRef, useLayoutEffect, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { BufferGeometry } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

export default React.memo(function ShapeMeshes({ faces, edges }) {
  const { invalidate } = useThree();

  const body = useRef(new BufferGeometry());
  const lines = useRef(new BufferGeometry());

  useLayoutEffect(() => {
    // Log what we're receiving to help debug
    console.log("[DEBUG] ReplicadMesh received faces:", faces ? Object.keys(faces) : "null");
    console.log("[DEBUG] ReplicadMesh received edges:", edges ? Object.keys(edges) : "null");

    // We use the three helpers to synchronise the buffer geometry with the
    // new data from the parameters
    if (faces) {
      try {
        console.time('[PERF] syncFaces');
        syncFaces(body.current, faces);
        console.timeEnd('[PERF] syncFaces');
      } catch (error) {
        console.error('[ERROR] Error in syncFaces:', error);
      }
    }

    if (edges) {
      try {
        console.time('[PERF] syncLines');
        syncLines(lines.current, edges);
        console.timeEnd('[PERF] syncLines');
      } catch (error) {
        console.error('[ERROR] Error in syncLines:', error);
      }
    } else if (faces) {
      try {
        console.time('[PERF] syncLinesFromFaces');
        syncLinesFromFaces(lines.current, body.current);
        console.timeEnd('[PERF] syncLinesFromFaces');
      } catch (error) {
        console.error('[ERROR] Error in syncLinesFromFaces:', error);
      }
    }

    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [faces, edges, invalidate]);

  useEffect(
    () => () => {
      body.current.dispose();
      lines.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <group>
      <mesh geometry={body.current}>
        {/* the offsets are here to avoid z fighting between the mesh and the lines */}
        <meshStandardMaterial
          color="#5a8296"
          polygonOffset
          polygonOffsetFactor={2.0}
          polygonOffsetUnits={1.0}
        />
      </mesh>
      <lineSegments geometry={lines.current}>
        <lineBasicMaterial color="#3c5a6e" />
      </lineSegments>
    </group>
  );
});