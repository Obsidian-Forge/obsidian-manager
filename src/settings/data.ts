import {  ManagerPlugin, Tag, Type } from '../data/types';

export interface ManagerSettings {
	ITEM_STYLE: string;
	GROUP_STYLE: string;
	TAG_STYLE: string;
	FADE_OUT_DISABLED_PLUGINS: boolean,
	GROUPS: Type[];
	TAGS: Tag[];
	Plugins: ManagerPlugin[];
}

export const DEFAULT_SETTINGS: ManagerSettings = {
	ITEM_STYLE: "alwaysExpand",
	GROUP_STYLE: "a",
	TAG_STYLE: "b",
	FADE_OUT_DISABLED_PLUGINS: true,
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
	Plugins: [],
}
