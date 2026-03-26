import dayjs from "dayjs";
import "dayjs/locale/id";

// set locale global
dayjs.locale("id");

// helper function
export default function now() {
  return dayjs();
}
