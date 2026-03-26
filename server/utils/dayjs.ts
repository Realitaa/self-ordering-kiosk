import dayjs from "dayjs";

export function getSessionExpiryDate() {
  const config = useRuntimeConfig();

  return dayjs().add(config.sessionTokenAge, "day").toDate();
}
