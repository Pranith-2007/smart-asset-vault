import type { ImageSourcePropType } from 'react-native';

/**
 * Single source of truth for landing-page screenshots.
 * Replace the PNGs in frontend/assets/landing/ (same filenames) and set
 * `placeholder: false` on each entry once it is a real app screenshot.
 * Metro needs static require() paths, so every image is required here.
 */
export type ScreenshotPosition = 'left' | 'right'; // which side the SCREENSHOT sits on (desktop)

export interface LandingScreenshot {
  id: string;
  order: number;
  title: string;
  description: string;
  image: ImageSourcePropType;
  alt: string;
  position: ScreenshotPosition;
  placeholder: boolean;
}

export const heroScreenshot = {
  image: require('../../assets/landing/hero-phone.png') as ImageSourcePropType,
  alt: 'Smart Asset Vault home screen on a smartphone',
  placeholder: true,
};

export const featureScreenshots = ([
  {
    id: 'document-vault', order: 1, position: 'left', placeholder: true,
    title: 'Your Document Vault',
    description: 'Keep Aadhaar, passports, property papers and certificates in one organised place, ready whenever you need them.',
    image: require('../../assets/landing/document-vault.png'),
    alt: 'Document vault screen listing stored documents',
  },
  {
    id: 'blockchain-verification', order: 2, position: 'right', placeholder: true,
    title: 'Blockchain Verification',
    description: 'Each document\'s fingerprint is recorded on the Sepolia test network, so any change to it can be detected.',
    image: require('../../assets/landing/blockchain-verification.png'),
    alt: 'Blockchain verification screen showing a verified document',
  },
  {
    id: 'secure-sharing', order: 3, position: 'left', placeholder: true,
    title: 'Secure Document Sharing',
    description: 'Share only what is needed, with only the people who need it, and stay in control of who can see it.',
    image: require('../../assets/landing/secure-sharing.png'),
    alt: 'Secure sharing screen with access controls',
  },
  {
    id: 'role-access', order: 4, position: 'right', placeholder: true,
    title: 'Role-Based Access',
    description: 'Government and organisation portals each get the access that fits their role, nothing more.',
    image: require('../../assets/landing/role-access.png'),
    alt: 'Role-based access screen showing portal permissions',
  },
] satisfies LandingScreenshot[]).sort((a, b) => a.order - b.order);
