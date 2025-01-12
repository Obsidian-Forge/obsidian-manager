import * as path from 'path';
import { App, ButtonComponent, DropdownComponent, ExtraButtonComponent, Modal, Notice, PluginManifest, SearchComponent, Setting, ToggleComponent } from 'obsidian';

import { ManagerSettings } from '../settings/data';
import { managerOpen } from '../utils';

import { t } from '../lang/inxdex';
import Manager from 'main';
import { GroupModal } from './group-modal';
import { TagsModal } from './tags-modal';
import { DeleteModal } from './delete-modal';
import Commands from 'src/command';

// ==============================
//          侧边栏 对话框 翻译
// ==============================
export class ManagerModal extends Modal {
    manager: Manager;
    settings: ManagerSettings;
    // this.app.plugins
    appPlugins;
    // this.app.settings
    appSetting;
    // [本地][变量] 插件路径
    basePath: string;
    // [本地][变量] 展示插件列表
    displayPlugins: PluginManifest[] = [];

    // 分组内容
    group = '';
    // 标签内容
    tag = '';
    // 标签内容
    delay = '';
    // 搜索内容
    searchText = '';
    // 编辑模式
    editorMode = false;
    // 仅启用
    onlyEnabled = false;
    // 测试模式
    developerMode = false;

    searchEl: SearchComponent;
    // footEl
    footEl: HTMLDivElement;

    constructor(app: App, manager: Manager) {
        super(app);
        // @ts-ignore 
        this.appSetting = this.app.setting;
        // @ts-ignore
        this.appPlugins = this.app.plugins;
        this.manager = manager;
        this.settings = manager.settings;
        // @ts-ignore
        this.basePath = path.normalize(this.app.vault.adapter.getBasePath());
        // 首次启动运行下 避免有新加入的插件
        manager.synchronizePlugins(Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== manager.manifest.id) as PluginManifest[]);
    }

    public async showHead() {
        //@ts-ignore
        const modalEl: HTMLElement = this.contentEl.parentElement;
        modalEl.addClass('manager-container');
        modalEl.removeChild(modalEl.getElementsByClassName('modal-close-button')[0]);
        this.titleEl.parentElement?.addClass('manager-container__header');
        this.contentEl.addClass('manager-item-container');
        // 添加页尾
        this.footEl = document.createElement("div");
        this.footEl.addClass('manager-food');
        this.modalEl.appendChild(this.footEl);

        // [操作行]
        const actionBar = new Setting(this.titleEl).setClass('manager-bar__action').setName(t('通用_操作_文本'));

        // [操作行] Github
        const githubButton = new ButtonComponent(actionBar.controlEl);
        githubButton.setIcon('github');
        githubButton.setTooltip(t('管理器_GITHUB_描述'));
        githubButton.onClick(() => {
            window.open(this.manager.manifest.authorUrl);
        });
        // [操作行] Github
        const tutorialButton = new ButtonComponent(actionBar.controlEl);
        tutorialButton.setIcon('book-open');
        tutorialButton.setTooltip('教程');
        tutorialButton.onClick(() => {
            window.open('https://www.bilibili.com/video/BV1WyrkYMEce/');
        });

        // [操作行] 重载插件
        const reloadButton = new ButtonComponent(actionBar.controlEl);
        reloadButton.setIcon('refresh-ccw');
        reloadButton.setTooltip(t('管理器_重载插件_描述'));
        reloadButton.onClick(async () => {
            new Notice('重新加载第三方插件');
            await this.appPlugins.loadManifests();
            this.reloadShowData();
        });

        // [操作行] 检查更新
        const updateButton = new ButtonComponent(actionBar.controlEl);
        updateButton.setIcon('rss');
        updateButton.setTooltip(t('管理器_检查更新_描述'));
        updateButton.onClick(async () => {
            try {
                await this.appPlugins.checkForUpdates();
                this.appSetting.open();
                this.appSetting.openTabById('community-plugins');
            } catch (error) {
                console.error('检查更新时出错:', error);  // 处理可能出现的错误
            }
        });

        // [操作行] 一键禁用
        const disableButton = new ButtonComponent(actionBar.controlEl);
        disableButton.setIcon('square');
        disableButton.setTooltip(t('管理器_一键禁用_描述'));
        disableButton.onClick(async () => {
            for (const plugin of this.displayPlugins) {
                if (this.settings.DELAY) {
                    const ManagerPlugin = this.settings.Plugins.find(p => p.id === plugin.id);
                    if (ManagerPlugin && ManagerPlugin.enabled) {
                        await this.appPlugins.disablePlugin(plugin.id);
                        ManagerPlugin.enabled = false;
                        this.manager.saveSettings();
                        this.reloadShowData();
                    }
                } else {
                    if (this.appPlugins.enabledPlugins.has(plugin.id)) {
                        await this.appPlugins.disablePluginAndSave(plugin.id);
                        this.reloadShowData();
                    }
                }
                Commands(this.app, this.manager);
            }
        });

        // [操作行] 一键启用
        const enableButton = new ButtonComponent(actionBar.controlEl)
        enableButton.setIcon('square-check')
        enableButton.setTooltip(t('管理器_一键启用_描述'))
        enableButton.onClick(async () => {
            for (const plugin of this.displayPlugins) {
                if (this.settings.DELAY) {
                    const ManagerPlugin = this.manager.settings.Plugins.find(mp => mp.id === plugin.id);
                    if (ManagerPlugin && !ManagerPlugin.enabled) {
                        await this.appPlugins.enablePlugin(plugin.id);
                        ManagerPlugin.enabled = true;
                        this.manager.saveSettings();
                        this.reloadShowData();
                    }
                } else {
                    if (!this.appPlugins.enabledPlugins.has(plugin.id)) {
                        await this.appPlugins.enablePluginAndSave(plugin.id);
                        this.reloadShowData();
                    }
                }
                Commands(this.app, this.manager);
            }
        });

        // [操作行] 编辑模式
        const editorButton = new ButtonComponent(actionBar.controlEl)
        this.editorMode ? editorButton.setIcon('pen-off') : editorButton.setIcon('pen');
        editorButton.setTooltip(t('管理器_编辑模式_描述'))
        editorButton.onClick(() => {
            this.editorMode = !this.editorMode;
            this.editorMode ? editorButton.setIcon('pen-off') : editorButton.setIcon('pen');
            this.reloadShowData();
        });

        // [操作行] 插件设置
        const settingsButton = new ButtonComponent(actionBar.controlEl)
        settingsButton.setIcon('settings')
        settingsButton.setTooltip(t('管理器_插件设置_描述'))
        settingsButton.onClick(() => {
            this.appSetting.open();
            this.appSetting.openTabById(this.manager.manifest.id);
            this.close();
        });

        // [测试行] 刷新插件
        if (this.developerMode) {
            const testButton = new ButtonComponent(actionBar.controlEl)
            testButton.setIcon('refresh-ccw')
            testButton.setTooltip('刷新插件')
            testButton.onClick(async () => {
                this.close();
                await this.appPlugins.disablePlugin(this.manager.manifest.id);
                await this.appPlugins.enablePlugin(this.manager.manifest.id);
            });
        }

        // [搜索行] 
        const searchBar = new Setting(this.titleEl).setClass('manager-bar__search').setName(t('通用_搜索_文本'));

        // [搜索行] 仅启用
        const onlyEnabled = new ButtonComponent(searchBar.controlEl);
        this.onlyEnabled ? onlyEnabled.setIcon('toggle-right') : onlyEnabled.setIcon('toggle-left');
        onlyEnabled.setTooltip(t('管理器_仅启用_描述'));
        onlyEnabled.onClick(() => {
            this.onlyEnabled = !this.onlyEnabled;
            this.onlyEnabled ? onlyEnabled.setIcon('toggle-right') : onlyEnabled.setIcon('toggle-left');
            this.reloadShowData();
        });

        // [搜索行] 分组选择列表
        const groupCounts = this.settings.Plugins.reduce((acc: { [key: string]: number }, plugin) => { const groupId = plugin.group || ''; acc[groupId] = (acc[groupId] || 0) + 1; return acc; }, { '': 0 });
        const groups = this.settings.GROUPS.reduce((acc: { [key: string]: string }, item) => { acc[item.id] = `${item.name} (${groupCounts[item.id] || 0})`; return acc; }, { '': '无分组' });
        const groupsDropdown = new DropdownComponent(searchBar.controlEl);
        groupsDropdown.addOptions(groups);
        groupsDropdown.setValue(this.group !== '' ? this.group : '');
        groupsDropdown.onChange((value) => {
            this.group = value;
            this.reloadShowData();
        });

        // [搜索行] 标签选择列表
        const tagCounts: { [key: string]: number } = this.settings.Plugins.reduce((acc, plugin) => { plugin.tags.forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; }); return acc; }, {} as { [key: string]: number });
        const tags = this.settings.TAGS.reduce((acc: { [key: string]: string }, item) => { acc[item.id] = `${item.name} (${tagCounts[item.id] || 0})`; return acc; }, { '': '无标签' });
        const tagsDropdown = new DropdownComponent(searchBar.controlEl);
        tagsDropdown.addOptions(tags);
        tagsDropdown.setValue(this.tag);
        tagsDropdown.onChange((value) => {
            this.tag = value;
            this.reloadShowData();
        });

        // [搜索行] 延迟选择列表
        if (this.settings.DELAY) {
            const delayCounts = this.settings.Plugins.reduce((acc: { [key: string]: number }, plugin) => { const delay = plugin.delay || ''; acc[delay] = (acc[delay] || 0) + 1; return acc; }, { '': 0 });
            const delays = this.settings.DELAYS.reduce((acc: { [key: string]: string }, item) => { acc[item.id] = `${item.name} (${delayCounts[item.id] || 0})`; return acc; }, { '': '无延迟' });
            const delaysDropdown = new DropdownComponent(searchBar.controlEl);
            delaysDropdown.addOptions(delays);
            delaysDropdown.setValue(this.delay);
            delaysDropdown.onChange((value) => {
                this.delay = value;
                this.reloadShowData();
            });
        }

        // [搜索行] 搜索框
        this.searchEl = new SearchComponent(searchBar.controlEl);
        this.searchEl.onChange((value: string) => {
            this.searchText = value;
            this.reloadShowData();
        })
    }

    public async showData() {
        const plugins: PluginManifest[] = Object.values(this.appPlugins.manifests);
        plugins.sort((item1, item2) => { return item1.name.localeCompare(item2.name) });
        this.displayPlugins = [];
        for (const plugin of plugins) {
            const ManagerPlugin = this.manager.settings.Plugins.find(mp => mp.id === plugin.id);
            const pluginDir = path.join(this.basePath, plugin.dir ? plugin.dir : '');
            // 插件是否开启
            const isEnabled = this.settings.DELAY ? ManagerPlugin?.enabled : this.appPlugins.enabledPlugins.has(plugin.id);
            if (ManagerPlugin) {
                // [搜索] 仅启用
                if (this.onlyEnabled && !isEnabled) continue;
                // [搜索] 分组
                if (this.group !== '' && ManagerPlugin.group !== this.group) continue;
                // [搜索] 标签
                if (this.tag !== '' && !(ManagerPlugin.tags.includes(this.tag))) continue;
                // [搜索] 标签
                if (this.delay !== '' && ManagerPlugin.delay !== this.delay) continue;
                // [搜索] 标题
                if (this.searchText !== '' &&
                    ManagerPlugin.name.toLowerCase().indexOf(this.searchText.toLowerCase()) == -1 &&
                    ManagerPlugin.desc.toLowerCase().indexOf(this.searchText.toLowerCase()) == -1
                ) continue;
                // [禁用] 自己
                if (plugin.id === this.manager.manifest.id) continue;

                const itemEl = new Setting(this.contentEl);
                itemEl.setClass('manager-item');
                itemEl.nameEl.addClass('manager-item__name-container');
                itemEl.descEl.addClass('manager-item__description-container');

                // [淡化插件]
                if (this.settings.FADE_OUT_DISABLED_PLUGINS && !isEnabled) itemEl.settingEl.addClass('inactive');

                // [批量操作]
                this.displayPlugins.push(plugin);

                // [目录样式]
                if (!this.editorMode) {
                    switch (this.settings.ITEM_STYLE) {
                        case 'alwaysExpand':
                            itemEl.descEl.addClass('manager-display-block')
                            break;
                        case 'neverExpand':
                            itemEl.descEl.addClass('manager-display-none')
                            break;
                        case 'hoverExpand':
                            itemEl.descEl.addClass('manager-display-none')
                            itemEl.settingEl.addEventListener('mouseenter', () => {
                                itemEl.descEl.removeClass('manager-display-none')
                                itemEl.descEl.addClass('manager-display-block')
                            });
                            itemEl.settingEl.addEventListener('mouseleave', () => {
                                itemEl.descEl.removeClass('manager-display-block')
                                itemEl.descEl.addClass('manager-display-none')
                            });
                            break;
                        case 'clickExpand':
                            itemEl.descEl.addClass('manager-display-none')
                            itemEl.settingEl.addEventListener('click', function (event) {
                                const excludedButtons = Array.from(itemEl.controlEl.querySelectorAll('div'));
                                // @ts-ignore
                                if (excludedButtons.includes(event.target)) {
                                    event.stopPropagation();
                                    return;
                                }
                                if (itemEl.descEl.hasClass('manager-display-none')) {
                                    itemEl.descEl.removeClass('manager-display-none')
                                    itemEl.descEl.addClass('manager-display-block')
                                } else {
                                    itemEl.descEl.removeClass('manager-display-block')
                                    itemEl.descEl.addClass('manager-display-none')
                                }
                            });
                            break;
                    }
                }

                // [默认] 分组
                if (ManagerPlugin.group !== '') {
                    const group = createSpan({
                        cls: 'manager-item__name-group'
                    })
                    itemEl.nameEl.appendChild(group);
                    const item = this.settings.GROUPS.find(t => t.id === ManagerPlugin.group);
                    if (item) {
                        const tag = this.manager.createTag(item.name, item.color, this.settings.GROUP_STYLE);
                        if (this.editorMode) tag.onclick = () => { new GroupModal(this.app, this.manager, this, ManagerPlugin).open(); }
                        group.appendChild(tag);
                    }
                }
                // [编辑] 分组
                if (ManagerPlugin.group === '' && this.editorMode) {
                    const group = createSpan({ cls: 'manager-item__name-group' })
                    if (this.editorMode) itemEl.nameEl.appendChild(group);
                    const tag = this.manager.createTag('+', '', '');
                    if (this.editorMode) tag.onclick = () => { new GroupModal(this.app, this.manager, this, ManagerPlugin).open(); }
                    if (this.editorMode) group.appendChild(tag);
                }

                // [默认] 名称
                const title = createSpan({
                    text: ManagerPlugin.name,
                    title: plugin.name,
                    cls: 'manager-item__name-title'
                })
                // [编辑] 名称
                if (this.editorMode) {
                    title.setAttribute('style', 'border-width: 1px;border-style: dashed;')
                    title.setAttribute('contenteditable', 'true');
                    title.addEventListener('input', () => {
                        if (title.textContent) {
                            ManagerPlugin.name = title.textContent;
                            this.manager.saveSettings();
                            Commands(this.app, this.manager);
                        }
                    });
                }
                itemEl.nameEl.appendChild(title);

                // [默认] 版本
                const version = createSpan({
                    text: `[${plugin.version}]`,
                    cls: ['manager-item__name-version'],
                })
                itemEl.nameEl.appendChild(version);

                // [默认] 延迟
                if (this.settings.DELAY && !this.editorMode && ManagerPlugin.delay !== '') {
                    const d = this.settings.DELAYS.find(item => item.id === ManagerPlugin.delay);
                    if (d) {
                        const delay = createSpan({ text: `${d.time}s`, cls: ['manager-item__name-delay'] })
                        itemEl.nameEl.appendChild(delay);
                    }
                }
                // [默认] 描述 
                const desc = createDiv({
                    text: ManagerPlugin.desc,
                    title: plugin.description,
                    cls: ['manager-item__name-desc']
                })

                // [编辑] 描述
                if (this.editorMode) {
                    desc.setAttribute('style', 'border-width: 1px;border-style: dashed')
                    desc.setAttribute('contenteditable', 'true');
                    desc.addEventListener('input', () => {
                        if (desc.textContent) {
                            ManagerPlugin.desc = desc.textContent;
                            this.manager.saveSettings();
                        }
                    });
                }
                itemEl.descEl.appendChild(desc);

                // [默认] 标签组
                const tags = createDiv();
                itemEl.descEl.appendChild(tags);
                ManagerPlugin.tags.map((id: string) => {
                    const item = this.settings.TAGS.find(item => item.id === id);
                    if (item) {
                        const tag = this.manager.createTag(item.name, item.color, this.settings.TAG_STYLE);
                        if (this.editorMode) tag.onclick = () => { new TagsModal(this.app, this.manager, this, ManagerPlugin).open(); }
                        tags.appendChild(tag);
                    }
                });

                // [编辑] 标签组
                if (this.editorMode) {
                    const tag = this.manager.createTag('+', '', '')
                    tag.onclick = () => { new TagsModal(this.app, this.manager, this, ManagerPlugin).open(); }
                    tags.appendChild(tag);
                }

                if (!this.editorMode) {
                    // [按钮] 打开设置
                    if (isEnabled) {
                        const openPluginSetting = new ExtraButtonComponent(itemEl.controlEl)
                        openPluginSetting.setIcon('settings')
                        openPluginSetting.setTooltip(t('管理器_打开设置_描述'))
                        openPluginSetting.onClick(() => {
                            openPluginSetting.setDisabled(true);
                            this.appSetting.open();
                            this.appSetting.openTabById(plugin.id);
                            openPluginSetting.setDisabled(false);
                        });
                    }
                    // [按钮] 打开目录
                    const openPluginDirButton = new ExtraButtonComponent(itemEl.controlEl)
                    openPluginDirButton.setIcon('folder-open')
                    openPluginDirButton.setTooltip(t('管理器_打开目录_描述'))
                    openPluginDirButton.onClick(() => {
                        openPluginDirButton.setDisabled(true);
                        managerOpen(pluginDir);
                        openPluginDirButton.setDisabled(false);
                    });

                    // [按钮] 删除插件
                    const deletePluginButton = new ExtraButtonComponent(itemEl.controlEl)
                    deletePluginButton.setIcon('trash')
                    deletePluginButton.setTooltip(t('管理器_删除插件_描述'))
                    deletePluginButton.onClick(async () => {
                        new DeleteModal(this.app, async () => {
                            await this.appPlugins.uninstallPlugin(plugin.id);
                            await this.appPlugins.loadManifests();
                            this.reloadShowData();
                            // 刷新命令行
                            Commands(this.app, this.manager);
                            // 删除同理
                            this.manager.synchronizePlugins(Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== this.manager.manifest.id) as PluginManifest[]);
                            new Notice('卸载成功');
                        }).open();

                    });

                    // [按钮] 切换状态
                    const toggleSwitch = new ToggleComponent(itemEl.controlEl)
                    toggleSwitch.setTooltip(t('管理器_切换状态_描述'))
                    toggleSwitch.setValue(isEnabled)
                    toggleSwitch.onChange(async () => {
                        if (this.settings.DELAY) {
                            if (toggleSwitch.getValue()) {
                                if (this.settings.FADE_OUT_DISABLED_PLUGINS) itemEl.settingEl.removeClass('inactive');  // [淡化插件]
                                ManagerPlugin.enabled = true;
                                this.manager.saveSettings();
                                await this.appPlugins.enablePlugin(plugin.id);
                            } else {
                                if (this.settings.FADE_OUT_DISABLED_PLUGINS) itemEl.settingEl.addClass('inactive');  // [淡化插件]
                                ManagerPlugin.enabled = false;
                                this.manager.saveSettings();
                                await this.appPlugins.disablePlugin(plugin.id);
                            }
                        } else {
                            if (toggleSwitch.getValue()) {
                                if (this.settings.FADE_OUT_DISABLED_PLUGINS) itemEl.settingEl.removeClass('inactive');  // [淡化插件]
                                await this.appPlugins.enablePluginAndSave(plugin.id);
                            } else {
                                if (this.settings.FADE_OUT_DISABLED_PLUGINS) itemEl.settingEl.addClass('inactive');  // [淡化插件]
                                await this.appPlugins.disablePluginAndSave(plugin.id);
                            }
                        }
                        Commands(this.app, this.manager);
                        this.reloadShowData();
                    })
                }
                // 
                if (this.editorMode) {
                    // [按钮] 还原内容
                    const reloadButton = new ExtraButtonComponent(itemEl.controlEl)
                    reloadButton.setIcon('refresh-ccw')
                    reloadButton.setTooltip(t('管理器_还原内容_描述'))
                    reloadButton.onClick(() => {
                        ManagerPlugin.name = plugin.name;
                        ManagerPlugin.desc = plugin.description;
                        ManagerPlugin.group = '';
                        ManagerPlugin.delay = '';
                        ManagerPlugin.tags = [];
                        this.manager.saveSettings();
                        this.reloadShowData();
                    });
                    // [编辑] 延迟
                    if (this.settings.DELAY) {
                        const delays = this.settings.DELAYS.reduce((acc: { [key: string]: string }, item) => { acc[item.id] = item.name; return acc; }, { '': '无延迟' });
                        const delaysEl = new DropdownComponent(itemEl.controlEl);
                        delaysEl.addOptions(delays);
                        delaysEl.setValue(ManagerPlugin.delay);
                        delaysEl.onChange((value) => {
                            ManagerPlugin.delay = value;
                            this.manager.saveSettings();
                            this.reloadShowData();
                        });
                    }
                }
            }
        }
        // 计算页尾
        this.footEl.innerHTML = this.count();
    }

    public count(): string {
        let totalCount = 0;
        let enabledCount = 0;
        let disabledCount = 0;
        if (this.settings.DELAY) {
            const plugins = this.settings.Plugins;
            totalCount = plugins.length;
            plugins.forEach(plugin => { plugin.enabled ? enabledCount++ : disabledCount++; });
        } else {
            totalCount = Object.keys(this.manager.appPlugins.manifests).length - 1;
            enabledCount = this.manager.appPlugins.enabledPlugins.size - 1;
            disabledCount = totalCount - enabledCount;
        }
        const summary = `[总计] ${totalCount} [启用] ${enabledCount} [禁用] ${disabledCount} `;
        return summary;
    }

    public async reloadShowData() {
        let scrollTop = 0;
        const modalElement: HTMLElement = this.contentEl;
        scrollTop = modalElement.scrollTop;
        modalElement.empty();
        this.showData();
        modalElement.scrollTo(0, scrollTop);
    }

    public async onOpen() {
        await this.showHead();
        await this.showData();
        this.searchEl.inputEl.focus();
        // [功能] ctrl+f聚焦
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'f') {
                if (this.searchEl.inputEl) {
                    this.searchEl.inputEl.focus();
                }
            }
        });
    }

    public async onClose() {
        this.contentEl.empty();
    }
}
