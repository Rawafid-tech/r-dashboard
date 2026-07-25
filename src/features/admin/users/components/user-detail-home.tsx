import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { useAdminMe } from "@/features/admin/auth/hooks/use-admin-me";
import { UsersErrorState } from "@/features/admin/users/components/users-error-state";
import { UserDetailHero } from "@/features/admin/users/components/user-detail-hero";
import { UserDetailSkeleton } from "@/features/admin/users/components/user-detail-skeleton";
import { UserModerationPanel } from "@/features/admin/users/components/user-moderation-panel";
import { UserProfileCard } from "@/features/admin/users/components/user-profile-card";
import { UserTrustPanel } from "@/features/admin/users/components/user-trust-panel";
import { useAdminUser } from "@/features/admin/users/hooks/use-admin-user";
import { AdminRole } from "@/shared/types/enums";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function UserDetailHome() {
  const { t } = useTranslation("admin");
  const { userId } = useParams<{ userId: string }>();
  const { data: admin } = useAdminMe();
  const userQuery = useAdminUser(userId);

  const canModerate = admin?.role === AdminRole.SUPER_ADMIN;

  if (!userId || !UUID_PATTERN.test(userId)) {
    return <Navigate to="/admin/users" replace />;
  }

  const isInitialLoading = userQuery.isLoading && !userQuery.data;
  const isNotFound =
    userQuery.isError &&
    (userQuery.error as { response?: { status?: number } })?.response
      ?.status === 404;

  if (isNotFound) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#user-detail-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("users.detail.skipToContent")}
      </a>

      {isInitialLoading ? <UserDetailSkeleton /> : null}

      {userQuery.isError && !isNotFound ? (
        <UsersErrorState
          onRetry={() => void userQuery.refetch()}
          isRetrying={userQuery.isFetching}
        />
      ) : null}

      {userQuery.data ? (
        <div id="user-detail-main" className="space-y-6">
          <UserDetailHero user={userQuery.data} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <UserProfileCard user={userQuery.data} />
            <UserTrustPanel user={userQuery.data} canModerate={canModerate} />
          </div>

          <UserModerationPanel
            user={userQuery.data}
            canModerate={canModerate}
          />
        </div>
      ) : null}
    </div>
  );
}
