import { useEffect, Router, useState, RouterSubscription } from "@hydrophobefireman/ui-lib";
export function useMount(func) {
  return useEffect(func, []);
}

const getPath = () => Router.path;
export function useLocation() {
  const [loc, setLoc] = useState(getPath);

  useMount(() => {
    const current = () => setLoc(getPath);
    RouterSubscription.subscribe(current);
    return () => RouterSubscription.unsubscribe(current);
  });
  return loc;
}
