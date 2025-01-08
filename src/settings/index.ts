import { App, PluginSettingTab } from 'obsidian';
import I18N from "../main";

import ManagerBasis from './ui/manager-basis';
import ManagerGroup from './ui/manager-group';
import ManagerTag from './ui/manager-tag';
import { t } from 'src/lang/inxdex';
import ManagerDelay from './ui/manager-delay';

class ManagerSettingTab extends PluginSettingTab {
	i18n: I18N;
	app: App;
	contentEl: HTMLDivElement;

	constructor(app: App, i18n: I18N) {
		super(app, i18n);
		this.i18n = i18n;
		this.app = app;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('manager-setting__container');
		const tabsEl = this.containerEl.createEl('div');
		tabsEl.addClass('manager-setting__tabs');
		this.contentEl = this.containerEl.createEl('div');
		this.contentEl.addClass('manager-setting__content');

		const tabItems = [
			{ text: t('设置_基础设置_前缀'), content: () => this.basisDisplay() },
			{ text: t('设置_分组设置_前缀'), content: () => this.groupDisplay() },
			{ text: t('设置_标签设置_前缀'), content: () => this.tagDisplay() },
			{ text: t('设置_延迟设置_前缀'), content: () => this.delayDisplay() }, 
			
		];
		const tabItemsEls: HTMLDivElement[] = [];

		tabItems.forEach((item, index) => {
			const itemEl = tabsEl.createEl('div');
			itemEl.addClass('manager-setting__tabs-item');
			itemEl.textContent = item.text;
			tabItemsEls.push(itemEl);
			if (index === 0) { itemEl.addClass('manager-setting__tabs-item_is-active'); item.content(); }
			itemEl.addEventListener('click', () => {
				tabItemsEls.forEach(tabEl => { tabEl.removeClass('manager-setting__tabs-item_is-active') });
				itemEl.addClass('manager-setting__tabs-item_is-active');
				item.content();
			});
		});
	}
	basisDisplay() { this.contentEl.empty(); new ManagerBasis(this).display(); }
	groupDisplay() { this.contentEl.empty(); new ManagerGroup(this).display(); }
	tagDisplay() { this.contentEl.empty(); new ManagerTag(this).display(); }
	delayDisplay() { this.contentEl.empty(); new ManagerDelay(this).display(); }
}

export { ManagerSettingTab };

