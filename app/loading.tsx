import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
