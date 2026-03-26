import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export const useClock = () => {
  const nowRef = ref(now());

  let interval: NodeJS.Timeout;

  onMounted(() => {
    interval = setInterval(() => {
      nowRef.value = now();
    }, 1000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return {
    date: computed(() => nowRef.value.format("dddd, D MMMM YYYY")),
    time: computed(() => nowRef.value.format("HH:mm:ss")),
  };
};
