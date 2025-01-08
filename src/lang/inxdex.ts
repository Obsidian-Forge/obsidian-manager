import { moment } from "obsidian";
import zh_cn from './locale/zh_cn';
import en_gb from "./locale/en_gb";
import en_us from "./locale/en_us";
import ja_jp from "./locale/ja_jp";
import ko_kr from "./locale/ko_kr";
import ru_ru from "./locale/ru_ru";

const localeMap: { [k: string]: Partial<typeof zh_cn> } = {
  'zh-cn': zh_cn,
  'en-us': en_us,
  'en-gb': en_gb,
  'ja-jp': ja_jp,
  'ko-kr': ko_kr,
  'ru-ru': ru_ru
};
// console.log(moment.locale())
const locale = localeMap[moment.locale()];

export function t(str: keyof typeof zh_cn): string {
  return (locale && locale[str]) || zh_cn[str];
}
