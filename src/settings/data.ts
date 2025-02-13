import { Delay, ManagerPlugin, Tag, Type } from '../data/types';

export interface ManagerSettings {
	// 筛选
	PERSISTENCE: boolean;
	FILTER_TAG: string;
	FILTER_GROUP: string;
	FILTER_DELAY: string;

	LANGUAGE: string;
	CENTER: boolean;
	ITEM_STYLE: string;
	GROUP_STYLE: string;
	TAG_STYLE: string;
	DELAY: boolean;
	FADE_OUT_DISABLED_PLUGINS: boolean;
	COMMAND_ITEM: boolean;
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
