import type { ImageSourcePropType } from 'react-native';

export interface LandingScreenshot {
  id: string;
  order: number;
  position: 'left' | 'right';
  title: string;
  description: string;
  image: ImageSourcePropType;
  alt: string;
  placeholder: boolean;
}

/** Real UI screenshots supplied for the landing-page phone mockups. */
export const heroScreenshot = {
  image: require('../../assets/landing/hero-home.png') as ImageSourcePropType,
  alt: 'Smart Asset Vault home dashboard showing documents, shared items, and attention status',
  placeholder: false,
};

export const featureScreenshots: LandingScreenshot[] = [
  {
    id: 'documents',
    order: 1,
    position: 'left',
    title: 'Find and organize your documents',
    description: 'Browse document and asset records, search quickly, and see useful ownership, tax, and insurance details in one place.',
    image: require('../../assets/landing/documents-list.png') as ImageSourcePropType,
    alt: 'Smart Asset Vault documents screen with search, category filters, and document list',
    placeholder: false,
  },
  {
    id: 'access-history',
    order: 2,
    position: 'right',
    title: 'Keep track of document activity',
    description: 'Review access history and recent document activity to understand when files are viewed or downloaded.',
    image: require('../../assets/landing/access-history.png') as ImageSourcePropType,
    alt: 'Smart Asset Vault access screen showing document activity history',
    placeholder: false,
  },
  {
    id: 'document-detail',
    order: 3,
    position: 'left',
    title: 'Verify integrity and manage access',
    description: 'Open a document, review its blockchain integrity details, and access sharing and permission controls.',
    image: require('../../assets/landing/document-detail.png') as ImageSourcePropType,
    alt: 'Smart Asset Vault document details screen with blockchain integrity and sharing controls',
    placeholder: false,
  },
  {
    id: 'portal-selection',
    order: 4,
    position: 'right',
    title: 'Choose the right workspace',
    description: 'Use the personal vault for your own records or the organisation portal for documents shared with your organisation.',
    image: require('../../assets/landing/portal-selection.png') as ImageSourcePropType,
    alt: 'Smart Asset Vault portal selection screen with Personal Vault and Organisation Portal options',
    placeholder: false,
  },
];
