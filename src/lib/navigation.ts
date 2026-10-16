import { router } from 'expo-router';

/** Goes back, or home when there is nothing to go back to (for example after opening a link). */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Closes every stacked screen and returns to the tabs, from wherever the user is. */
export function goHome() {
  if (router.canDismiss()) router.dismissAll();
  else router.replace('/');
}
