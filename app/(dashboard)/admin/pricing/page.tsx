import { prisma } from '@/lib/prisma';
import { PriceRuleEditor } from '@/components/admin/PriceRuleEditor';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';

export default async function AdminPricingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('weytin_session_token')?.value;
  if (!token) redirect('/login');

  const payload = await verifyJWT(token);
  if (!payload?.id) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { id: payload.id },
    select: { role: true },
  });
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const rules = await prisma.priceRule.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      product: { select: { name: true, unit: true } },
      location: { select: { name: true, state: true } },
      updater: { select: { email: true } },
    },
    take: 200,
  });

  const mappedRules = rules.map((r) => ({
    id: r.id,
    product_id: r.productId,
    location_id: r.locationId,
    min_price: Number(r.minPrice),
    max_price: Number(r.maxPrice),
    updated_at: r.updatedAt,
    product: { name: r.product.name, unit: r.product.unit },
    location: { name: r.location.name, state: r.location.state },
    updater: { email: r.updater?.email ?? null },
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <p className="text-[10px] font-data uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Pricing Rules</h1>
        <p className="text-muted-foreground mt-1">
          Configure min/max price bounds per product per location. Prices outside these bounds are automatically flagged.
        </p>
      </header>
      <PriceRuleEditor initialRules={mappedRules} />
    </div>
  );
}
