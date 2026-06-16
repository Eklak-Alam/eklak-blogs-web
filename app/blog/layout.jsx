import React from 'react';

export const metadata = {
  title: 'Blog | Gaprio Workspace',
  description: 'Discover cutting-edge ideas, engineering insights, and captivating stories written by our community of experts.',
  openGraph: {
    title: 'Blog | Gaprio Workspace',
    description: 'Discover cutting-edge ideas, engineering insights, and captivating stories written by our community of experts.',
    url: 'https://gaprio.com/blog',
    siteName: 'Gaprio',
    images: [
      {
        url: 'https://gaprio.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Gaprio Workspace',
    description: 'Discover cutting-edge ideas, engineering insights, and captivating stories written by our community of experts.',
    images: ['https://gaprio.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://gaprio.com/blog',
  },
};

export default function BlogLayout({ children }) {
  return <>{children}</>;
}
