export type Stall = { id: number; name: string; owner_id: number };

export const useStall = () => {
  const stallsState = useState<Stall[]>("stalls", () => []);
  const stallsLoading = useState<boolean>("stallsLoading", () => true);

  const fetchStalls = async () => {
    stallsLoading.value = true;
    try {
      const res = await $fetch<{ success: boolean; data: Stall[] }>(
        "/api/stalls",
      );
      stallsState.value = res.data ?? [];
    } catch {
      stallsState.value = [];
    } finally {
      stallsLoading.value = false;
    }
  };

  const refreshStalls = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: Stall[] }>(
        "/api/stalls",
      );
      stallsState.value = res.data ?? [];
    } catch {
      // keep current state on error
    }
  };

  return {
    stallsState,
    stallsLoading,
    fetchStalls,
    refreshStalls,
  };
};
