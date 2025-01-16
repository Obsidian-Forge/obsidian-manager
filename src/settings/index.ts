import { App, PluginSettingTab } from 'obsidian';
import Manager from "../main";

import ManagerBasis from './ui/manager-basis';
import ManagerDelay from './ui/manager-delay';

class ManagerSettingTab extends PluginSettingTab {
	manager: Manager;
	app: App;
	contentEl: HTMLDivElement;

	constructor(app: App, manager: Manager) {
		super(app, manager);
		this.manager = manager;
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
			{ text: this.manager.translator.t('设置_基础设置_前缀'), content: () => this.basisDisplay() },
			{ text: this.manager.translator.t('设置_延迟设置_前缀'), content: () => this.delayDisplay() },
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
	delayDisplay() { this.contentEl.empty(); new ManagerDelay(this).display(); }
}

export { ManagerSettingTab };

