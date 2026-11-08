import React, { useMemo } from 'react';
import { CertificateData } from '../types';
import { LineArrayRenderer } from './LineArrayRenderer';

interface CertificateViewProps {
  data: CertificateData;
  recipientName?: string;
  id?: string;
  className?: string;
  scale?: number;
}

// Use tightly cropped official ZEISS logo asset without transparent padding
const OFFICIAL_ZEISS_LOGO_URL = '/assets/aistudio/ZEISS_Logo_RGB_b3095ed1_cropped.png';

export const CertificateView: React.FC<CertificateViewProps> = ({
  data,
  recipientName,
  id = 'certificate-node',
  className = '',
  scale = 1,
}) => {
  const nameToRender = (recipientName !== undefined ? recipientName : data.recipientName) || 'Recipient Name';

  // Adaptive font size rule for recipient name (starts at 30pt; reduces to 27pt, then 24pt only if too long)
  const { fontSize: nameFontSize, lineHeight: nameLineHeight } = useMemo(() => {
    if (nameToRender.length > 34) {
      return { fontSize: '24pt', lineHeight: '31.2pt' };
    }
    if (nameToRender.length > 28) {
      return { fontSize: '27pt', lineHeight: '35.1pt' };
    }
    return { fontSize: '30pt', lineHeight: '39pt' };
  }, [nameToRender]);

  // Authoritative font stacks
  const fontLightCondensed =
    '"ZEISS Frutiger Next W1G Light Condensed", "ZEISSFrutigerNextW1G-LtCn", "Arial Narrow", "Roboto Condensed", sans-serif';
  const fontBoldCondensed =
    '"ZEISS Frutiger Next W1G Bold Condensed", "ZEISSFrutigerNextW1G-BoldCn", "Arial Narrow", "Roboto Condensed", sans-serif';
  const fontMediumCondensed =
    '"ZEISS Frutiger Next W1G Medium Condensed", "ZEISSFrutigerNextW1G-MdCn", "Arial Narrow", "Roboto Condensed", sans-serif';
  const fontRegular =
    '"ZEISS Frutiger Next W1G Regular", "ZEISSFrutigerNextW1G-Reg", Arial, "Roboto Condensed", sans-serif';

  return (
    <div
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
      className={className}
    >
      <section
        id={id}
        className="certificate-page"
        style={{
          position: 'relative',
          width: '210mm',
          height: '297mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          color: '#1D1D1F',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
        aria-label="Training certificate"
      >
        {/*
          VERTICAL CERTIFICATE TITLE
          left: 11.5mm; top: 278.5mm; transform: rotate(-90deg); transform-origin: left top;
          Bottom of word is flush aligned with the bottom of the ZEISS logo (259.5mm + 19mm = 278.5mm).
        */}
        <div
          className="vertical-title"
          style={{
            position: 'absolute',
            left: '11.5mm',
            top: '278.5mm',
            transform: 'rotate(-90deg)',
            transformOrigin: '0 0',
            fontFamily: fontLightCondensed,
            fontSize: '72pt',
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: '38pt',
            color: '#929395',
            whiteSpace: 'nowrap',
            width: 'max-content',
            maxWidth: 'none',
            margin: 0,
            padding: 0,
            userSelect: 'none',
          }}
        >
          CERTIFICATE
        </div>

        {/*
          A. Recipient Name
          Position: left: 67.73mm; top: 30.76mm;
          Style: 30pt Bold Condensed, 39pt line-height, white-space: nowrap
        */}
        <div
          className="recipient-name"
          style={{
            position: 'absolute',
            left: '67.73mm',
            top: '30.76mm',
            fontFamily: fontBoldCondensed,
            fontSize: nameFontSize,
            fontWeight: 700,
            lineHeight: nameLineHeight,
            color: '#1D1D1F',
            whiteSpace: 'nowrap',
          }}
        >
          {nameToRender}
        </div>

        {/*
          B. Recipient Institution
          Position: left: 67.73mm; top: 49.11mm;
          Style: 24pt Regular, 28.8pt line-height
          Rendered as two controlled lines.
        */}
        <div
          className="recipient-institution"
          style={{
            position: 'absolute',
            left: '67.73mm',
            top: '49.11mm',
            fontFamily: fontRegular,
            fontSize: '24pt',
            fontWeight: 400,
            lineHeight: '28.8pt',
            color: '#1D1D1F',
            whiteSpace: 'nowrap',
          }}
        >
          <LineArrayRenderer lines={data.institutionLines} />
        </div>

        {/*
          C. Certification Statement
          Position: left: 69.00mm; top: 82.73mm; width: 100mm;
          Style: 16pt Light Condensed, 24pt line-height, white-space: normal, overflow: visible
          Rendered as three explicit lines.
        */}
        <div
          className="certification-statement"
          style={{
            position: 'absolute',
            left: '69.00mm',
            top: '82.73mm',
            width: '100mm',
            fontFamily: fontLightCondensed,
            fontSize: '16pt',
            fontWeight: 300,
            lineHeight: '24pt',
            color: '#1D1D1F',
            whiteSpace: 'normal',
            overflow: 'visible',
          }}
        >
          <LineArrayRenderer lines={data.statementLines} />
        </div>

        {/*
          D. Qualification / Procedure Title
          Position: left: 69.00mm; top: 115.82mm; width: 101mm;
          Style: 16pt Bold Condensed, 24pt line-height
          Trademark rendered with .registered-mark: position: relative; top: -0.35em; font-size: 0.66em;
        */}
        <div
          className="qualification"
          style={{
            position: 'absolute',
            left: '69.00mm',
            top: '115.82mm',
            width: '101mm',
            fontFamily: fontBoldCondensed,
            fontSize: '16pt',
            fontWeight: 700,
            lineHeight: '24pt',
            color: '#1D1D1F',
            whiteSpace: 'normal',
            overflow: 'visible',
          }}
        >
          <LineArrayRenderer lines={data.qualificationLines} hasTrademark={true} />
        </div>

        {/*
          E. Training Location and Date
          Position: left: 69.00mm; top: 148.41mm;
          Style: 12pt Light Condensed, 16pt line-height
          Rendered as two controlled lines.
        */}
        <div
          className="location-date"
          style={{
            position: 'absolute',
            left: '69.00mm',
            top: '148.41mm',
            fontFamily: fontLightCondensed,
            fontSize: '12pt',
            fontWeight: 300,
            lineHeight: '16pt',
            color: '#1D1D1F',
            whiteSpace: 'nowrap',
          }}
        >
          <LineArrayRenderer lines={data.locationLines} />
        </div>

        {/*
          F. Legal Disclaimer
          Position: left: 69.00mm; top: 177.38mm; width: 100mm;
          Style: 8pt Light Condensed, 12.8pt line-height, white-space: normal, overflow: visible
          Rendered as two controlled lines without text clipping or ellipsis.
        */}
        <div
          className="disclaimer"
          style={{
            position: 'absolute',
            left: '69.00mm',
            top: '177.38mm',
            width: '100mm',
            fontFamily: fontLightCondensed,
            fontSize: '8pt',
            fontWeight: 300,
            lineHeight: '12.8pt',
            color: '#1D1D1F',
            whiteSpace: 'normal',
            overflow: 'visible',
          }}
        >
          <LineArrayRenderer lines={data.disclaimerLines} />
        </div>

        {/*
          G. Signature Image
          Position: left: 73.0mm; top: 190.8mm; width: 45.9mm; height: 27.9mm;
          Style: object-fit: contain; object-position: center bottom;
        */}
        {data.signatureImage && (
          <img
            className="signature"
            src={data.signatureImage}
            alt="Authorized signature"
            style={{
              position: 'absolute',
              left: '73.0mm',
              top: '190.8mm',
              width: '45.9mm',
              height: '27.9mm',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              pointerEvents: 'none',
            }}
          />
        )}

        {/*
          H. Signature Line
          Position: left: 69.04mm; top: 215.02mm; width: 52.56mm;
          Style: border-top: 0.25mm solid #4a4a4a;
        */}
        <div
          className="signature-line"
          style={{
            position: 'absolute',
            left: '69.04mm',
            top: '215.02mm',
            width: '52.56mm',
            borderTop: '0.25mm solid #4a4a4a',
          }}
        />

        {/*
          I. Signatory Details
          Position: left: 69.04mm; top: 219.75mm;
          Signatory Name: 10pt Medium Condensed, 14.4pt line-height
          Remaining lines: 9pt Light Condensed, 12.8pt line-height
          White-space: nowrap, no empty line between name and title.
        */}
        <div
          className="signatory"
          style={{
            position: 'absolute',
            left: '69.04mm',
            top: '219.75mm',
            color: '#1D1D1F',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            className="signatory-name"
            style={{
              fontFamily: fontMediumCondensed,
              fontSize: '10pt',
              fontWeight: 500,
              lineHeight: '14.4pt',
              color: '#1D1D1F',
            }}
          >
            {data.signatoryName}
          </div>
          <div
            style={{
              fontFamily: fontLightCondensed,
              fontSize: '9pt',
              fontWeight: 300,
              lineHeight: '12.8pt',
              color: '#1D1D1F',
            }}
          >
            <div>{data.signatoryTitle}</div>
            <div>{data.signatoryDepartment}</div>
            <div>{data.signatoryCompany}</div>
          </div>
        </div>

        {/*
          J. ZEISS Logo
          Position: left: 105mm; top: 259.5mm; width: 19mm; height: 19mm;
          Shifted to the left for visual balance under the signature system.
          Cropped official asset with zero transparent padding.
        */}
        <img
          className="zeiss-logo"
          src={OFFICIAL_ZEISS_LOGO_URL}
          alt="ZEISS"
          style={{
            position: 'absolute',
            left: '105mm',
            top: '259.5mm',
            width: '19mm',
            height: '19mm',
            minWidth: '19mm',
            minHeight: '19mm',
            maxWidth: 'none',
            maxHeight: 'none',
            objectFit: 'contain',
            objectPosition: 'center',
            margin: 0,
            padding: 0,
            transform: 'none',
            userSelect: 'none',
          }}
        />
      </section>
    </div>
  );
};
