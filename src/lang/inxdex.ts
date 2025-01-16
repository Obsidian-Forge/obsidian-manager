import Manager from "main";
import zh_cn from './locale/zh_cn';
import en from "./locale/en";
import ru from "./locale/ru";
import ja from "./locale/ja";
import ko from "./locale/ko";
import fr from "./locale/fr";
import es from "./locale/es";

export class Translator {
	private manager: Manager;
	public language = {
		'zh-cn': '简体中文',
		'en': 'English',
		'ru': 'Русский язык',
		'ja': '日本語',
		'ko': '한국어',
		'fr': 'Français',
		'es': 'Español',
	};

	private localeMap: { [k: string]: Partial<typeof zh_cn> } = {
		'zh-cn': zh_cn,
		'en': en,
		'ru': ru,
		'ja': ja,
		'ko': ko,
		'fr': fr,
		'es': es,
	};

	constructor(manager: Manager) {
		this.manager = manager;
	}

	// 方法用于获取翻译后的字符串
	public t(str: keyof typeof zh_cn): string {
		const language = this.manager.settings.LANGUAGE || 'zh-cn'; // 默认使用 'zh-cn'
		const locale = this.localeMap[language] || zh_cn; // 如果 language 不存在，则使用 zh_cn
		return locale[str] || zh_cn[str]; // 如果 str 在 locale 中不存在，则使用 zh_cn 中的默认值
	}
}

// import { moment } from "obsidian";
// import zh_cn from './locale/zh_cn';
// import en from "./locale/en";
// import ja_jp from "./locale/ja_jp";
// import ko_kr from "./locale/ko_kr";
// import ru_ru from "./locale/ru_ru";

// export const LANGUAGE = {
// 	'zh-cn': '简体中文',
// 	'en': '永不展开'
// }

// const localeMap: { [k: string]: Partial<typeof zh_cn> } = {
// 	'zh-cn': zh_cn,
// 	'en-us': en,
// 	'ja-jp': ja_jp,
// 	'ko-kr': ko_kr,
// 	'ru-ru': ru_ru
// };

// // const locales = moment.locales();
// // console.log(locales);
// // console.log(moment.locale())
// const locale = localeMap[moment.locale()];

// export function t(str: keyof typeof zh_cn): string {
// 	return (locale && locale[str]) || zh_cn[str];
// }
