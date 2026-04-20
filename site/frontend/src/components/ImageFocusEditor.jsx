import { useMemo, useRef, useState } from 'react';

import {
  getImageFocusPoint,
  getImageObjectPosition,
  getImageZoom,
} from '../content/siteSettingsDefaults';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundFocusValue = (value) => Number(clamp(value, 0, 100).toFixed(2));

function ImageFocusEditor({
  image = null,
  imageUrl = '',
  onChange,
  aspectRatio = '1 / 1',
  label = 'Preview',
  helpText = 'Drag the image until the visible view looks right.',
  previewVariant = 'default',
  allowZoom = false,
}) {
  const frameRef = useRef(null);
  const dragStateRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [intrinsicSize, setIntrinsicSize] = useState({ width: 0, height: 0 });
  const focus = useMemo(() => getImageFocusPoint(image), [image]);
  const zoom = useMemo(() => getImageZoom(image), [image]);
  const focusPosition = useMemo(() => getImageObjectPosition(image), [image]);
  const showZoomControls = allowZoom || previewVariant === 'hero';

  const getDragMetrics = () => {
    const bounds = frameRef.current?.getBoundingClientRect();

    if (!bounds || !bounds.width || !bounds.height) {
      return null;
    }

    if (!intrinsicSize.width || !intrinsicSize.height) {
      return null;
    }

    const scale = Math.max(
      bounds.width / intrinsicSize.width,
      bounds.height / intrinsicSize.height
    ) * zoom;

    return {
      frameWidth: bounds.width,
      frameHeight: bounds.height,
      renderedWidth: intrinsicSize.width * scale,
      renderedHeight: intrinsicSize.height * scale,
    };
  };

  const finishDrag = () => {
    dragStateRef.current = null;
    setIsDragging(false);
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="image-focus-editor">
      {label ? (
        <div className="image-focus-editor__header">
          <strong>{label}</strong>
          <span>{isDragging ? 'Release to keep position' : 'Drag image'}</span>
        </div>
      ) : null}
      <div
        ref={frameRef}
        className={`image-focus-editor__frame${isDragging ? ' is-dragging' : ''}`}
        style={{ aspectRatio }}
        onPointerDown={(event) => {
          const metrics = getDragMetrics();

          if (!metrics) {
            return;
          }

          const hasHorizontalOverflow = metrics.renderedWidth - metrics.frameWidth > 0.5;
          const hasVerticalOverflow = metrics.renderedHeight - metrics.frameHeight > 0.5;

          if (!hasHorizontalOverflow && !hasVerticalOverflow) {
            return;
          }

          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          dragStateRef.current = {
            startClientX: event.clientX,
            startClientY: event.clientY,
            startFocusX: focus.focusX,
            startFocusY: focus.focusY,
            ...metrics,
          };
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          if (!isDragging || !dragStateRef.current) {
            return;
          }

          event.preventDefault();
          const {
            startClientX,
            startClientY,
            startFocusX,
            startFocusY,
            ...metrics
          } = dragStateRef.current;

          let nextFocusX = startFocusX;
          let nextFocusY = startFocusY;

          if (metrics.renderedWidth > metrics.frameWidth) {
            const minOffsetX = metrics.frameWidth - metrics.renderedWidth;
            const startOffsetX = minOffsetX * (startFocusX / 100);
            const nextOffsetX = clamp(
              startOffsetX + (event.clientX - startClientX),
              minOffsetX,
              0
            );
            nextFocusX = roundFocusValue((nextOffsetX / minOffsetX) * 100);
          }

          if (metrics.renderedHeight > metrics.frameHeight) {
            const minOffsetY = metrics.frameHeight - metrics.renderedHeight;
            const startOffsetY = minOffsetY * (startFocusY / 100);
            const nextOffsetY = clamp(
              startOffsetY + (event.clientY - startClientY),
              minOffsetY,
              0
            );
            nextFocusY = roundFocusValue((nextOffsetY / minOffsetY) * 100);
          }

          onChange?.({
            focusX: nextFocusX,
            focusY: nextFocusY,
          });
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <img
          className="image-focus-editor__image"
          src={imageUrl}
          alt=""
          draggable="false"
          onLoad={(event) => {
            setIntrinsicSize({
              width: event.currentTarget.naturalWidth || 0,
              height: event.currentTarget.naturalHeight || 0,
            });
          }}
          style={{
            objectPosition: focusPosition,
            transform: `scale(${zoom})`,
            transformOrigin: focusPosition,
          }}
        />
      </div>
      {showZoomControls ? (
        <div className="image-focus-editor__zoom">
          <div className="image-focus-editor__zoom-header">
            <strong>Zoom</strong>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="image-focus-editor__zoom-controls">
            <button
              type="button"
              className="story-admin-button story-admin-button--secondary"
              onClick={() =>
                onChange?.({
                  zoom: Math.max(1, Number((zoom - 0.1).toFixed(2))),
                })
              }
              disabled={zoom <= 1}
            >
              -
            </button>
            <input
              className="image-focus-editor__zoom-slider"
              type="range"
              min="1"
              max="2.5"
              step="0.01"
              value={zoom}
              onChange={(event) =>
                onChange?.({
                  zoom: Number(event.target.value),
                })
              }
            />
            <button
              type="button"
              className="story-admin-button story-admin-button--secondary"
              onClick={() =>
                onChange?.({
                  zoom: Math.min(2.5, Number((zoom + 0.1).toFixed(2))),
                })
              }
              disabled={zoom >= 2.5}
            >
              +
            </button>
            <button
              type="button"
              className="story-admin-button story-admin-button--secondary"
              onClick={() =>
                onChange?.({
                  zoom: 1,
                })
              }
              disabled={zoom === 1}
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}
      {helpText ? <p className="story-admin-help">{helpText}</p> : null}
    </div>
  );
}

export default ImageFocusEditor;
