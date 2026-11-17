import rss from '@astrojs/rss';
import { tatCaBai, duongNgon } from '../../lib/khu';
import { CHU } from '../../lib/i18n';

export async function GET(context) {
  const bai = await tatCaBai('en');
  return rss({
    title: 'Mặt Cắt',
    description: CHU.en.tenDayDu,
    site: context.site,
    items: bai.map((b) => ({
      title: b.data.title,
      pubDate: b.data.date,
      description: b.data.description,
      link: duongNgon('en', `/${b.khu}/${b.slug}/`),
      categories: b.data.tags,
    })),
    customData: '<language>en</language>',
  });
}
