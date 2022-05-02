import { ban, Ban } from '@pwm/db';

export async function getActiveBans(userId: string): Promise<Ban[] | null> {
  let bans = await ban.findMany({ where: { user_id: userId } });
  bans = bans.filter((b) => {
    if (b.lifetime == true) return true;
    b.created_at.setSeconds(b.created_at.getSeconds() + b.duration);
    if (b.created_at > new Date()) return true;
    return false;
  });
  return bans;
}
