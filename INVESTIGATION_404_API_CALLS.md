# Investigation: 404 API Calls

## Issue Description
The following API endpoints were reported as returning 404 errors:
- `GET /api/admin/flags/comments?status=open`
- `GET /api/admin/flags/people?status=open`
- `GET /api/admin/moderator-posts/new-count`
- `GET /api/admin/flags/count`
- `GET /api/admin/users/count`
- `GET /api/admin/posts/count`
- `GET /api/messages/unread-count`
- `GET /api/posts/new-count`

## Investigation Results

### Comprehensive Search Conducted
1. ✅ Searched all `.tsx`, `.ts`, `.js`, and `.jsx` files for these endpoint patterns
2. ✅ Checked all `fetch()` calls in components and pages
3. ✅ Reviewed all existing API route handlers
4. ✅ Searched git history and all branches
5. ✅ Checked for dynamic URL construction
6. ✅ Searched for setTimeout/setInterval polling
7. ✅ Checked for admin-related components and pages

### Findings
**NONE of these API endpoints exist in the source code.**

### Existing Similar Endpoints
The following endpoints DO exist and provide similar functionality:
- `/api/notifications` - Returns `unreadMessageCount` and `newPostsCount`
- `/api/messages` - Handles message operations
- `/api/admin/status` - Checks admin status
- `/api/admin/profiles` - Admin profile operations

### Possible Sources of 404 Errors

1. **Browser Extensions**
   - Admin panel extensions
   - Debugging/monitoring tools
   - Analytics extensions

2. **Local Development Code**
   - Uncommitted admin dashboard
   - Local testing scripts
   - Development tools

3. **Cached Code**
   - Old service workers
   - Browser cache with outdated JavaScript
   - CDN cache

4. **External Tools**
   - API monitoring services
   - Load testing tools
   - Security scanning tools

## Recommendations

### For the Developer
1. **Clear browser cache and service workers**
   ```
   - Chrome DevTools > Application > Clear storage
   - Check for active service workers
   ```

2. **Check for local uncommitted changes**
   ```bash
   git status
   git stash list
   ```

3. **Disable browser extensions temporarily**
   - Test in incognito mode
   - Disable admin/developer extensions

4. **Check server logs for request origin**
   - Look at User-Agent headers
   - Check request referrer
   - Review X-Forwarded-For headers

### If Endpoints Are Needed
If these endpoints should exist, they can be implemented as:
- `/api/notifications` can be extended to include admin-specific counts
- Individual count endpoints can be created for admin dashboard features
- Flags and moderation features can be implemented as new admin routes

## Conclusion
The 404 errors are **NOT** caused by code in this repository. The source must be external to the codebase. The developer should investigate their local environment, browser extensions, and any external tools that might be making these requests.
