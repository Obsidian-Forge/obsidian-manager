import { moment } from "obsidian";
import zh_cn from './locale/zh_cn';

const localeMap: { [k: string]: Partial<typeof zh_cn> } = {
  'zh-cn': zh_cn,
};

const locale = localeMap[moment.locale()];

export function t(str: keyof typeof zh_cn): string {
  return (locale && locale[str]) || zh_cn[str];
}
