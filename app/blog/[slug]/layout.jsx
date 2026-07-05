// app/blog/[slug]/layout.jsx

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = 'https://eklak.site';
  
  // Using your environment variable here!
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/posts/${slug}`;
  
  try {
    const res = await fetch(apiUrl, { 
      next: { revalidate: 60 } 
    });
    
    if (!res.ok) {
      console.error(`[SEO] API failed with status: ${res.status}`);
      return { title: '404 - Post Not Found' };
    }
    
    const data = await res.json();
    console.log(`[SEO] Full Backend Response:`, JSON.stringify(data).substring(0, 200));

    // Aggressive fallback to find the post object
    // It checks data.data.post, data.post, data.data, or assumes 'data' is the post itself
    const post = data?.data?.post || data?.post || data?.data || (data?.title ? data : null);
    
    if (!post) {
      console.error(`[SEO] Post object still undefined! Look at the terminal log above to see your JSON structure.`);
      return { title: '404 - Post Not Found' };
    }

    const keywords = post.tags ? post.tags.map(tag => tag.name).join(', ') : 'Software Engineering, Full Stack, DevOps, AWS, Next.js';
    const postUrl = post.canonicalUrl || `${baseUrl}/blog/${post.slug || slug}`;

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      keywords: keywords,
      alternates: { canonical: postUrl },
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        url: postUrl,
        siteName: 'Eklak Alam',
        images: post.coverImage ? [
          { url: post.coverImage, width: 1200, height: 630, alt: post.title }
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
        creator: '@your_twitter_handle', 
      },
    };
  } catch (error) {
    console.error("[SEO] Fetch Error:", error.message);
    return {
      title: 'Engineering Blog',
      description: 'Read the latest system architecture and engineering insights.',
    };
  }
}

export default async function BlogPostLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseUrl = 'https://eklak.site';
  
  // Using your environment variable here too!
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/posts/${slug}`;

  let jsonLd = null;

  try {
    const res = await fetch(apiUrl, { 
      next: { revalidate: 60 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // Using the same aggressive extraction for the schema
      const post = data?.data?.post || data?.post || data?.data || (data?.title ? data : null);
      
      if (post) {
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.metaTitle || post.title,
          description: post.metaDescription || post.excerpt,
          image: post.coverImage ? [post.coverImage] : [],
          datePublished: post.publishedAt || post.createdAt,
          dateModified: post.updatedAt || post.createdAt,
          author: { '@type': 'Person', name: 'Eklak Alam', url: baseUrl },
          publisher: {
            '@type': 'Person',
            name: 'Eklak Alam',
            url: baseUrl,
            image: { '@type': 'ImageObject', url: `${baseUrl}/og-image.jpg` },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': post.canonicalUrl || `${baseUrl}/blog/${post.slug || slug}`,
          },
        };
      }
    }
  } catch (err) {
    // Silently ignore here
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