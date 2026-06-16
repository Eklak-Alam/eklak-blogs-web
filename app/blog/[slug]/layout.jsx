export async function generateMetadata({ params }) {
  // Resolve params for Next.js App Router
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    // Fetch directly from the backend API for Server-Side SEO generation
    // Using native fetch for optimal Next.js caching control
    const res = await fetch(`http://localhost:8000/api/v1/posts/${slug}`, { 
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) return { title: 'Post Not Found' };
    
    const data = await res.json();
    const post = data?.data?.post || data?.post;
    
    if (!post) return { title: 'Post Not Found' };

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      alternates: {
        canonical: post.canonicalUrl || `https://blogs-platform.com/blog/${post.slug}`,
      },
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        url: `https://blogs-platform.com/blog/${post.slug}`,
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
        authors: post.author?.name ? [post.author.name] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    console.error("SEO Metadata Error:", error);
    return {
      title: 'Blog Post',
      description: 'Read the latest blog post.',
    };
  }
}

export default async function BlogPostLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let jsonLd = null;

  try {
    const res = await fetch(`http://localhost:8000/api/v1/posts/${slug}`, { 
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      const post = data?.data?.post || data?.post;
      
      if (post) {
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.metaTitle || post.title,
          description: post.metaDescription || post.excerpt,
          image: post.coverImage ? [post.coverImage] : [],
          datePublished: post.publishedAt || post.createdAt,
          dateModified: post.updatedAt,
          author: {
            '@type': 'Person',
            name: post.author?.name || 'Anonymous',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Gaprio',
            logo: {
              '@type': 'ImageObject',
              url: 'https://gaprio.com/logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': post.canonicalUrl || `https://blogs-platform.com/blog/${post.slug}`,
          },
        };
      }
    }
  } catch (err) {
    // Silently ignore, metadata function handles logging
  }

  return (
    <>
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
