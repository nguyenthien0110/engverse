import TopicDetailClient from "./TopicDetailClient";

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { topicId: string } }) {
  return <TopicDetailClient topicId={params.topicId} />;
}
