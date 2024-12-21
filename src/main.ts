import { Plugin, PluginManifest } from 'obsidian';
import { DEFAULT_SETTINGS, ManagerSettings } from './settings/data';
import { ManagerSettingTab } from './settings';
import { t } from './lang/inxdex';

import { ManagerModal } from './modal/manager-modal';
import Commands from './command';
import { ManagerPlugin } from './data/types';


export default class Manager extends Plugin {
    settings: ManagerSettings;
    managerModal: ManagerModal;
    appPlugins: any;

    async onload() {
        // @ts-ignore
        this.appPlugins = this.app.plugins;

        console.log(`%c ${this.manifest.name} %c v${this.manifest.version} `, `padding: 2px; border-radius: 2px 0 0 2px; color: #fff; background: #5B5B5B;`, `padding: 2px; border-radius: 0 2px 2px 0; color: #fff; background: #409EFF;`);
        Commands(this.app, this);
        await this.loadSettings();

        this.addRibbonIcon('folder-cog', t('通用_管理器_文本'), () => {
            this.managerModal = new ManagerModal(this.app, this);
            this.managerModal.open();
        });

        this.addSettingTab(new ManagerSettingTab(this.app, this));
        const plugins = Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== this.manifest.id);
        plugins.forEach((plugin: PluginManifest) => this.initPlugin(plugin));
        plugins.forEach((plugin: PluginManifest) => this.startPlugin(plugin.id));
    }
    
    async onunload() {
        const plugins = Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== this.manifest.id);
        plugins.forEach(async (pm: PluginManifest) => {
            const plugin = this.settings.Plugins.find(p => p.id === pm.id)
            if (plugin) {
                if (plugin.enabled) {
                    await this.appPlugins.disablePlugin(pm.id);
                    await this.appPlugins.enablePluginAndSave(pm.id);
                }
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async initPlugin(plugin: PluginManifest) {
        const isEnabled = this.appPlugins.enabledPlugins.has(plugin.id);
        if (isEnabled) await this.appPlugins.disablePluginAndSave(plugin.id);
        if (!(this.settings.Plugins.some(p => p.id === plugin.id))) {
            const mp: ManagerPlugin = {
                'id': plugin.id,
                'name': plugin.name,
                'desc': plugin.description,
                'group': '',
                'tags': [],
                'enabled': isEnabled,
                'delay': 0,
            }
            this.settings.Plugins.push(mp);
            this.saveSettings();
        }
    }

    private async startPlugin(id: string) {
        const plugin = this.settings.Plugins.find(p => p.id === id);
        if (plugin && plugin.enabled)
            setTimeout(async () => {
                await this.appPlugins.enablePlugin(id);
            }, plugin.delay * 1000);
    }

}

