import React from 'react';

export const metadata = {
  // The template automatically adds "| Eklak Alam" to any individual blog post title!
  title: {
    template: '%s | Eklak Alam',
    default: 'Engineering Blog | Eklak Alam',
  },
  description: 'Dive into system architecture, DevOps pipelines, full-stack engineering, and AI integration. Written by Eklak Alam, a Full Stack & Cloud Engineer building on localhost and deploying to the world.',
  keywords: [
    'Eklak Alam', 
    'Full Stack Engineer', 
    'DevOps', 
    'System Architecture', 
    'Cloud Computing', 
    'Next.js', 
    'Spring Boot', 
    'AWS', 
    'Docker', 
    'Agentic AI'
  ],
  authors: [{ name: 'Eklak Alam', url: 'https://eklak.site' }],
  creator: 'Eklak Alam',
  openGraph: {
    title: 'Engineering Blog | Eklak Alam',
    description: 'Dive into system architecture, DevOps pipelines, full-stack engineering, and AI integration.',
    url: 'https://eklak.site/blog',
    siteName: 'Eklak Alam Portfolio',
    images: [
      {
        url: 'https://eklak.site/og-image.jpg', // Make sure you upload a cool graphic to your public folder!
        width: 1200,
        height: 630,
        alt: 'Eklak Alam Engineering Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Blog | Eklak Alam',
    description: 'Dive into system architecture, DevOps pipelines, full-stack engineering, and AI integration.',
    // Update this with your actual X handle if you have one
    creator: '@your_twitter_handle', 
    images: ['https://eklak.site/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://eklak.site/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BlogLayout({ children }) {
  return <>{children}</>;
}