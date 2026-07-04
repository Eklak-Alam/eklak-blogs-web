/**
 * ==========================================
 * REACT QUERY KEY FACTORY
 * ==========================================
 * Enterprise pattern to centralize all cache keys.
 * Prevents typos and makes cache invalidation effortless.
 */
export const queryKeys = {
  // --- AUTHENTICATION ---
  auth: {
    all: ['auth'],
  },

  // --- USERS & PROFILES ---
  users: {
    all: ['users'],
    me: () => [...queryKeys.users.all, 'me'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
    adminStats: () => [...queryKeys.users.all, 'admin-stats'],
  },

  // --- TAXONOMY (Categories & Tags) ---
  categories: {
    all: ['categories'],
    lists: () => [...queryKeys.categories.all, 'list'],
    details: () => [...queryKeys.categories.all, 'detail'],
    detail: (slug) => [...queryKeys.categories.details(), slug],
  },
  
  tags: {
    all: ['tags'],
    lists: () => [...queryKeys.tags.all, 'list'],
  },

  // --- INTERACTIONS (Comments, Likes, Bookmarks) ---
  interactions: {
    all: ['interactions'],
    comments: (postId) => [...queryKeys.interactions.all, 'comments', postId],
    me: (postId) => [...queryKeys.interactions.all, 'me', postId],
  },

  // --- POSTS (Articles & Blogs) ---
  posts: {
    all: ['posts'],
    
    // Public feed
    lists: () => [...queryKeys.posts.all, 'list'],
    list: (filters) => [...queryKeys.posts.lists(), { filters }],
    
    // Author's own dashboard
    myLists: () => [...queryKeys.posts.all, 'my-list'],
    myList: (filters) => [...queryKeys.posts.myLists(), { filters }],
    
    // Admin dashboard
    adminLists: () => [...queryKeys.posts.all, 'admin-list'],
    adminList: (filters) => [...queryKeys.posts.adminLists(), { filters }],
    
    // Single post reading
    details: () => [...queryKeys.posts.all, 'detail'],
    detail: (slug) => [...queryKeys.posts.details(), slug],
    
    // Admin analytics
    adminStats: () => [...queryKeys.posts.all, 'admin-stats'],
  }
};