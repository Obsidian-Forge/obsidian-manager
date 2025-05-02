import { Delay, ManagerPlugin, Tag, Type } from '../data/types';

export interface ManagerSettings {
	// 持久化
	PERSISTENCE: boolean;
    // 过滤标签
	FILTER_TAG: string;
    // 过滤分组
	FILTER_GROUP: string;
    // 过滤延迟
	FILTER_DELAY: string;

	// 语言
	LANGUAGE: string;
	// 居中
	CENTER: boolean;
    // 样式
	ITEM_STYLE: string;
    // 分组样式
	GROUP_STYLE: string;
    // 标签样式
	TAG_STYLE: string;
    
    // 延迟
	DELAY: boolean;
    // 淡出样式
	FADE_OUT_DISABLED_PLUGINS: boolean;
    // 命令项
	COMMAND_ITEM: boolean;
    // 命令组
	COMMAND_GROUP: boolean;

	GROUPS: Type[];
	TAGS: Tag[];
	DELAYS: Delay[];
	Plugins: ManagerPlugin[];
}

export const DEFAULT_SETTINGS: ManagerSettings = {
	PERSISTENCE: false,
	// 筛选
	FILTER_TAG: "",
	FILTER_GROUP: "",
	FILTER_DELAY: "",

	LANGUAGE: "zh-cn",
	CENTER: false,
	ITEM_STYLE: "alwaysExpand",
	GROUP_STYLE: "a",
	TAG_STYLE: "b",
	DELAY: false,
	FADE_OUT_DISABLED_PLUGINS: true,
	COMMAND_ITEM: false,
	COMMAND_GROUP: false,
	GROUPS: [
		{
			"id": "default",
			"name": "默认组",
			"color": "#A079FF"
		},
	],
	TAGS: [
		{
			"id": "default",
			"name": "默认标签",
			"color": "#A079FF"
		},
	],
	DELAYS: [
		{
			"id": "default",
			"name": "默认延迟",
			"time": 10
		},
	],
	Plugins: [],
}
