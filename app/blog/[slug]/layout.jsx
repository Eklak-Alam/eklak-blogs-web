export async function generateMetadata({ params }) {
  // Resolve params for Next.js 15 App Router standard
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = 'https://eklak.site';
  
  try {
    // Fetch directly from the backend API for Server-Side SEO generation
    const res = await fetch(`http://localhost:8000/api/v1/posts/${slug}`, { 
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) return { title: '404 - Post Not Found' };
    
    const data = await res.json();
    const post = data?.data?.post || data?.post;
    
    if (!post) return { title: '404 - Post Not Found' };

    // Dynamically extract keywords if tags exist
    const keywords = post.tags ? post.tags.map(tag => tag.name).join(', ') : 'Software Engineering, Full Stack, DevOps, AWS, Next.js';
    const postUrl = post.canonicalUrl || `${baseUrl}/blog/${post.slug}`;

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      keywords: keywords,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        url: postUrl,
        siteName: 'Eklak Alam',
        images: post.coverImage ? [
          {
            url: post.coverImage,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
        authors: ['Eklak Alam'],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
        creator: '@your_twitter_handle', // Update with your X handle
      },
    };
  } catch (error) {
    console.error("SEO Metadata Error:", error);
    return {
      title: 'Engineering Blog',
      description: 'Read the latest system architecture and engineering insights by Eklak Alam.',
    };
  }
}

export default async function BlogPostLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = 'https://eklak.site';

  let jsonLd = null;

  try {
    const res = await fetch(`http://localhost:8000/api/v1/posts/${slug}`, { 
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      const post = data?.data?.post || data?.post;
      
      if (post) {
        // High-level Schema.org generation for rich Google Snippets
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.metaTitle || post.title,
          description: post.metaDescription || post.excerpt,
          image: post.coverImage ? [post.coverImage] : [],
          datePublished: post.publishedAt || post.createdAt,
          dateModified: post.updatedAt || post.createdAt,
          author: {
            '@type': 'Person',
            name: 'Eklak Alam',
            url: baseUrl,
          },
          publisher: {
            '@type': 'Person',
            name: 'Eklak Alam',
            url: baseUrl,
            image: {
              '@type': 'ImageObject',
              url: `${baseUrl}/og-image.jpg`, // Ensure this image exists in your public folder
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': post.canonicalUrl || `${baseUrl}/blog/${post.slug}`,
          },
        };
      }
    }
  } catch (err) {
    // Silently ignore, the generateMetadata function already logs the error
  }

  return (
    <>
      {/* Injecting JSON-LD safely into the DOM */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}