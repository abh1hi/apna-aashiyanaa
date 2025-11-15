import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * A promise-based helper that waits for the initial Firebase auth state to be resolved.
 * This is crucial for handling page reloads, ensuring that we don't redirect
 * a logged-in user from a protected page while Firebase is re-authenticating their session.
 * @returns {Promise<import('firebase/auth').User | null>}
 */
const getInitialUser = () => {
  return new Promise((resolve) => {
    const auth = getAuth();
    // onAuthStateChanged returns an unsubscribe function, which we call
    // immediately after the first state change to make this a one-time check.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * The primary Vue Router navigation guard.
 * It checks the route's meta fields (requiresAuth, requiresGuest) against the user's
 * current authentication state before allowing or redirecting navigation.
 * @param {import('vue-router').RouteLocationNormalized} to - The route being navigated to.
 * @param {import('vue-router').RouteLocationNormalized} from - The route being navigated from.
 * @param {import('vue-router').NavigationGuardNext} next - The function to resolve the hook.
 */
export const authGuard = async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  // Wait for Firebase to confirm the auth state before making any decisions.
  const currentUser = await getInitialUser();

  if (requiresAuth && !currentUser) {
    // If a route requires authentication and the user is not logged in,
    // redirect them to the login page.
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && currentUser) {
    // If a route requires a guest (e.g., login, register) and the user
    // IS logged in, redirect them to their profile.
    next({ name: 'UserProfile' });
  } else {
    // Otherwise, the user is allowed to proceed to the route.
    next();
  }
};
