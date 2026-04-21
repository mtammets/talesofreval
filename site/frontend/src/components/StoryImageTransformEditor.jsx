import { useMemo, useRef, useState } from 'react';

import {
  MAX_IMAGE_ROTATION,
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ROTATION,
  MIN_IMAGE_ZOOM,
  getImageFocusPoint,
  getImageObjectPosition,
  getImageRotation,
  getImageZoom,
} from '../content/siteSettingsDefaults';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundMeta = (value) => Number(value.toFixed(2));

const getMatrixRotation = (transform = '') => {
  if (!transform || transform === 'none') {
    return 0;
  }

  const matrixMatch = transform.match(/^matrix\(([^)]+)\)$/);

  if (!matrixMatch) {
    return 0;
  }

  const [a, b] = matrixMatch[1].split(',').map((value) => Number(value.trim()));

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return 0;
  }

  return Math.atan2(b, a) * (180 / Math.PI);
};

const getAngleFromCenter = (clientX, clientY, centerX, centerY) =>
  Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

const normalizeAngleDelta = (angle) => {
  let nextAngle = angle;

  while (nextAngle > 180) {
    nextAngle -= 360;
  }

  while (nextAngle < -180) {
    nextAngle += 360;
  }

  return nextAngle;
};

const getSingleRotationScale = (rotation) =>
  Number((1 + Math.abs(rotation) / 140).toFixed(4));

function StoryImageTransformEditor({
  mode = 'single',
  image = null,
  src,
  srcSet,
  sizes,
  alt = '',
  ariaHidden,
  className = '',
  imageClassName = '',
  style,
  onChange,
  onActivate,
}) {
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const interactionRef = useRef(null);
  const [activeTool, setActiveTool] = useState('');
  const [intrinsicSize, setIntrinsicSize] = useState({ width: 0, height: 0 });
  const focus = useMemo(() => getImageFocusPoint(image), [image]);
  const zoom = useMemo(() => getImageZoom(image), [image]);
  const rotation = useMemo(() => getImageRotation(image), [image]);
  const focusPosition = useMemo(() => getImageObjectPosition(image), [image]);
  const isGallery = mode === 'gallery';

  const getGalleryMetrics = () => {
    const frame = frameRef.current;
    const parent = frame?.parentElement;

    if (!frame || !parent) {
      return null;
    }

    const parentWidth = parent.clientWidth || 0;
    const parentHeight = parent.clientHeight || 0;

    if (!parentWidth || !parentHeight) {
      return null;
    }

    const computedStyle = window.getComputedStyle(frame);

    return {
      parentWidth,
      parentHeight,
      layoutX: (frame.offsetLeft / parentWidth) * 100,
      layoutY: (frame.offsetTop / parentHeight) * 100,
      layoutWidth: (frame.offsetWidth / parentWidth) * 100,
      rotation: getMatrixRotation(computedStyle.transform),
      bounds: frame.getBoundingClientRect(),
    };
  };

  const getFocusMetrics = () => {
    const bounds = frameRef.current?.getBoundingClientRect();

    if (!bounds || !bounds.width || !bounds.height) {
      return null;
    }

    if (!intrinsicSize.width || !intrinsicSize.height) {
      return null;
    }

    const scale =
      Math.max(
        bounds.width / intrinsicSize.width,
        bounds.height / intrinsicSize.height
      ) * zoom;

    return {
      frameWidth: bounds.width,
      frameHeight: bounds.height,
      renderedWidth: intrinsicSize.width * scale,
      renderedHeight: intrinsicSize.height * scale,
      bounds,
    };
  };

  const startInteraction = (event, tool) => {
    if (!onChange) {
      return;
    }

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const galleryMetrics = isGallery ? getGalleryMetrics() : null;
    const focusMetrics = isGallery ? null : getFocusMetrics();
    const bounds = galleryMetrics?.bounds || focusMetrics?.bounds || frame.getBoundingClientRect();

    if (!bounds.width || !bounds.height) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onActivate?.();
    frame.setPointerCapture?.(event.pointerId);

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const startDistance = Math.max(
      Math.hypot(event.clientX - centerX, event.clientY - centerY),
      1
    );
    const startPointerAngle = getAngleFromCenter(
      event.clientX,
      event.clientY,
      centerX,
      centerY
    );

    interactionRef.current = {
      tool,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startFocusX: focus.focusX,
      startFocusY: focus.focusY,
      startZoom: zoom,
      startRotation: isGallery ? galleryMetrics?.rotation || 0 : rotation,
      startDistance,
      startPointerAngle,
      centerX,
      centerY,
      galleryMetrics,
      focusMetrics,
      hasChanged: false,
      lastPatch: null,
    };
    setActiveTool(tool);
  };

  const updateFocus = (event, interaction) => {
    const metrics = interaction.focusMetrics;

    if (!metrics) {
      return null;
    }

    let nextFocusX = interaction.startFocusX;
    let nextFocusY = interaction.startFocusY;

    if (metrics.renderedWidth > metrics.frameWidth) {
      const minOffsetX = metrics.frameWidth - metrics.renderedWidth;
      const startOffsetX = minOffsetX * (interaction.startFocusX / 100);
      const nextOffsetX = clamp(
        startOffsetX + (event.clientX - interaction.startClientX),
        minOffsetX,
        0
      );
      nextFocusX = roundMeta((nextOffsetX / minOffsetX) * 100);
    }

    if (metrics.renderedHeight > metrics.frameHeight) {
      const minOffsetY = metrics.frameHeight - metrics.renderedHeight;
      const startOffsetY = minOffsetY * (interaction.startFocusY / 100);
      const nextOffsetY = clamp(
        startOffsetY + (event.clientY - interaction.startClientY),
        minOffsetY,
        0
      );
      nextFocusY = roundMeta((nextOffsetY / minOffsetY) * 100);
    }

    return {
      focusX: nextFocusX,
      focusY: nextFocusY,
    };
  };

  const updateGalleryPosition = (event, interaction) => {
    const metrics = interaction.galleryMetrics;

    if (!metrics) {
      return null;
    }

    return {
      layoutX: roundMeta(
        clamp(
          metrics.layoutX + ((event.clientX - interaction.startClientX) / metrics.parentWidth) * 100,
          -20,
          115
        )
      ),
      layoutY: roundMeta(
        clamp(
          metrics.layoutY + ((event.clientY - interaction.startClientY) / metrics.parentHeight) * 100,
          -20,
          115
        )
      ),
      layoutWidth: roundMeta(clamp(metrics.layoutWidth, 12, 100)),
      rotation: roundMeta(clamp(metrics.rotation, MIN_IMAGE_ROTATION, MAX_IMAGE_ROTATION)),
    };
  };

  const updateSize = (event, interaction) => {
    if (isGallery) {
      const metrics = interaction.galleryMetrics;

      if (!metrics) {
        return null;
      }

      const horizontalDelta =
        ((event.clientX - interaction.startClientX) / metrics.parentWidth) * 100;
      const verticalDelta =
        ((event.clientY - interaction.startClientY) / metrics.parentHeight) * 100;
      const nextWidth = clamp(
        metrics.layoutWidth + (horizontalDelta + verticalDelta) / 2,
        12,
        100
      );

      return {
        layoutX: roundMeta(clamp(metrics.layoutX, -20, 115)),
        layoutY: roundMeta(clamp(metrics.layoutY, -20, 115)),
        layoutWidth: roundMeta(nextWidth),
        rotation: roundMeta(clamp(metrics.rotation, MIN_IMAGE_ROTATION, MAX_IMAGE_ROTATION)),
      };
    }

    const distance = Math.max(
      Math.hypot(event.clientX - interaction.centerX, event.clientY - interaction.centerY),
      1
    );
    const nextZoom = clamp(
      interaction.startZoom * (distance / interaction.startDistance),
      MIN_IMAGE_ZOOM,
      MAX_IMAGE_ZOOM
    );

    return {
      zoom: roundMeta(nextZoom),
    };
  };

  const updateRotation = (event, interaction) => {
    const nextPointerAngle = getAngleFromCenter(
      event.clientX,
      event.clientY,
      interaction.centerX,
      interaction.centerY
    );
    const angleDelta = normalizeAngleDelta(nextPointerAngle - interaction.startPointerAngle);
    const nextRotation = clamp(
      interaction.startRotation + angleDelta,
      MIN_IMAGE_ROTATION,
      MAX_IMAGE_ROTATION
    );

    return {
      rotation: roundMeta(nextRotation),
    };
  };

  const finishInteraction = (event) => {
    const interaction = interactionRef.current;

    if (interaction?.hasChanged && interaction.lastPatch) {
      onChange?.(interaction.lastPatch, { commit: true });
    }

    interactionRef.current = null;
    setActiveTool('');
    frameRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const imageTransform = isGallery
    ? `scale(${zoom})`
    : `scale(${Number((zoom * getSingleRotationScale(rotation)).toFixed(4))}) rotate(${rotation}deg)`;

  return (
    <div
      ref={frameRef}
      className={`story-image-transform-editor story-image-transform-editor--${mode} is-editable${activeTool ? ' is-active' : ''} ${className}`.trim()}
      style={style}
      onPointerDown={(event) => {
        if (event.target instanceof Element && event.target.closest('.story-image-transform__handle')) {
          return;
        }

        startInteraction(event, isGallery ? 'move' : 'focus');
      }}
      onPointerMove={(event) => {
        const interaction = interactionRef.current;

        if (!interaction) {
          return;
        }

        event.preventDefault();

        const patch =
          interaction.tool === 'focus'
            ? updateFocus(event, interaction)
            : interaction.tool === 'move'
              ? updateGalleryPosition(event, interaction)
              : interaction.tool === 'resize'
                ? updateSize(event, interaction)
                : updateRotation(event, interaction);

        if (!patch) {
          return;
        }

        interaction.hasChanged = true;
        interaction.lastPatch = patch;
        onChange?.(patch, { commit: false });
      }}
      onPointerUp={finishInteraction}
      onPointerCancel={finishInteraction}
    >
      <div className="story-image-transform__crop">
        <img
          ref={imageRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          aria-hidden={ariaHidden}
          draggable="false"
          className={imageClassName}
          onLoad={(event) => {
            setIntrinsicSize({
              width: event.currentTarget.naturalWidth || 0,
              height: event.currentTarget.naturalHeight || 0,
            });
          }}
          style={{
            objectPosition: focusPosition,
            transform: imageTransform,
            transformOrigin: focusPosition,
          }}
        />
      </div>
      <button
        type="button"
        className="story-image-transform__handle story-image-transform__handle--rotate"
        aria-label="Rotate image"
        onPointerDown={(event) => startInteraction(event, 'rotate')}
      />
      <button
        type="button"
        className="story-image-transform__handle story-image-transform__handle--resize"
        aria-label={isGallery ? 'Resize image' : 'Zoom image'}
        onPointerDown={(event) => startInteraction(event, 'resize')}
      />
    </div>
  );
}

export default StoryImageTransformEditor;
