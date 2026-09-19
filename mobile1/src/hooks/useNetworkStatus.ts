/**
 * حالة الشبكة — لمؤشر «دون اتصال» الهادئ واختيار المصدر المحلي/الحي.
 */

import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus(): NetInfoState | null {
  const [state, setState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setState);
    void NetInfo.fetch().then(setState).catch(() => {});
    return unsubscribe;
  }, []);

  return state;
}

export function useIsOffline(): boolean {
  const state = useNetworkStatus();
  return state !== null && state.isConnected === false;
}
