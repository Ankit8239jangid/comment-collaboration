"use client";

import { CandidateList } from "@/components/comments/CandidateList";
import { CommentsDrawer } from "@/components/comments/CommentsDrawer";

export default function Home() {
  return (
    <>
      <CandidateList />
      <CommentsDrawer />
    </>
  );
}
