import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

import {
  getGuideQrFileName,
  getGuideTipOrigin,
  getGuideTipUrl,
} from '../utils/guideTips';

const QR_DARK = '#202533';
const QR_LIGHT = '#f6efe7';

function GuideQrCard({ member }) {
  const tipUrl = useMemo(() => getGuideTipUrl(member, getGuideTipOrigin()), [member]);
  const qrFileName = useMemo(() => getGuideQrFileName(member), [member]);
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const generateQr = async () => {
      setIsGenerating(true);

      try {
        const [svgMarkup, pngDataUrl] = await Promise.all([
          QRCode.toString(tipUrl, {
            type: 'svg',
            margin: 1,
            color: {
              dark: QR_DARK,
              light: QR_LIGHT,
            },
          }),
          QRCode.toDataURL(tipUrl, {
            margin: 1,
            width: 1400,
            color: {
              dark: QR_DARK,
              light: QR_LIGHT,
            },
          }),
        ]);

        if (isCancelled) {
          return;
        }

        setQrPreviewUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`);
        setQrImageUrl(pngDataUrl);
      } catch (_error) {
        if (isCancelled) {
          return;
        }

        setQrPreviewUrl('');
        setQrImageUrl('');
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generateQr();

    return () => {
      isCancelled = true;
    };
  }, [tipUrl]);

  return (
    <section className="guide-qr-card" aria-label="Guide QR code">
      <a
        href={qrImageUrl || undefined}
        download={qrFileName}
        className="guide-qr-card__preview"
        aria-disabled={!qrImageUrl || isGenerating}
        aria-label="Download guide QR code as PNG"
        onClick={(event) => {
          if (!qrImageUrl || isGenerating) {
            event.preventDefault();
          }
        }}
      >
        {qrPreviewUrl ? (
          <img src={qrPreviewUrl} alt="" aria-hidden="true" />
        ) : (
          <div className="guide-qr-card__placeholder" aria-hidden="true" />
        )}
      </a>
    </section>
  );
}

export default GuideQrCard;
