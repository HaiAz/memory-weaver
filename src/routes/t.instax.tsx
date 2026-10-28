import { createFileRoute } from "@tanstack/react-router";
import { InstaxExperience } from "@/components/love/InstaxExperience";

export const Route = createFileRoute("/t/instax")({
  head: () => ({
    meta: [
      { title: "Instax — Chụp, kéo phim & treo kỷ niệm" },
      {
        name: "description",
        content:
          "Bấm chụp từng tấm trượt ra khỏi máy, kéo cả dải phim xuống rồi treo lên dây đèn kẹp gỗ.",
      },
    ],
  }),
  component: () => <InstaxExperience mode="edit" />,
});
