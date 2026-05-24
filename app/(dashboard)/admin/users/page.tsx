import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export default async function AdminUsersPage() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      location: { select: { name: true, state: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle>User Directory ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found in the database.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium">{user.email ?? 'No email'}</p>
                <p className="text-xs text-muted-foreground">
                  Role: {user.role} • Verification: {user.verificationStatus} •
                  {' '}Location: {user.location?.name ?? 'N/A'}, {user.location?.state ?? 'N/A'}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
