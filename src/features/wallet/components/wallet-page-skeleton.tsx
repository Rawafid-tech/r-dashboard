import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@/shared/components/ui";
import { WalletBalanceCardSkeleton } from "@/features/wallet/components/wallet-balance-card";

export function WalletHeroSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export function WalletPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <WalletHeroSkeleton />
      <WalletBalanceCardSkeleton />
      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
