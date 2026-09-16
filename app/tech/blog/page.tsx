import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function TechBlogRedirect() {
  redirect(`/tech/blog/${defaultLocale}`);
}
