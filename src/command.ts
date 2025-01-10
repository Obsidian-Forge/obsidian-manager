import { App, PluginManifest, WorkspaceLeaf } from "obsidian";
import Manager from "./main";
import { ManagerModal } from "./modal/manager-modal";
import { t } from "./lang/inxdex";

const Commands = (app: App, manager: Manager) => {
    manager.addCommand({
        id: 'manager-view',
        name: t('命令_管理面板_描述'),
        hotkeys: [
            {
                modifiers: ['Ctrl'],
                key: 'M',
            }
        ],
        callback: () => { new ManagerModal(app, manager).open() }
    });

    if (manager.settings.COMMAND_ITEM) {
        const plugins: PluginManifest[] = Object.values(manager.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== manager.manifest.id) as PluginManifest[];
        plugins.forEach(plugin => {
            const mp = manager.settings.Plugins.find(mp => mp.id === plugin.id);
            if (mp) {
                manager.addCommand({
                    id: `manager-${mp.id}`,
                    name: `${mp.enabled ? '关闭' : '开启'} ${mp.name} `,
                    callback: async () => {
                        if (mp.enabled) {
                            mp.enabled = false;
                            manager.saveSettings();
                            await manager.appPlugins.disablePlugin(plugin.id);
                            Commands(app, manager);
                            app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
                                if (leaf.getDisplayText() == '插件不再活动') { leaf.detach(); }
                            });
                        } else {
                            mp.enabled = true;
                            manager.saveSettings();
                            await manager.appPlugins.enablePlugin(plugin.id);
                            Commands(app, manager);
                            setTimeout(() => {
                                app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
                                    if (leaf.getDisplayText() == '插件不再活动') { leaf.detach(); }
                                });
                            }, 1000);
                        }
                    }
                });
            }
        });
    }

    if (manager.settings.COMMAND_GROUP) {
        manager.settings.GROUPS.forEach((group) => {
            manager.addCommand({
                id: `manager-${group.id}-enabled`,
                name: `一键开启${group.name}分组`,
                callback: async () => {
                    const filteredPlugins = manager.settings.Plugins.filter(plugin => plugin.group === group.id);
                    filteredPlugins.forEach(async plugin => {
                        if (plugin && !plugin.enabled) {
                            await manager.appPlugins.enablePlugin(plugin.id);
                            plugin.enabled = true;
                            manager.saveSettings();
                        }
                    });
                    Commands(app, manager);
                    app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => { if (leaf.getDisplayText() == '插件不再活动') { leaf.detach(); } });
                }
            });
            manager.addCommand({
                id: `manager-${group.id}-disable`,
                name: `一键禁用${group.name}分组`,
                callback: async () => {
                    const filteredPlugins = manager.settings.Plugins.filter(plugin => plugin.group === group.id);
                    filteredPlugins.forEach(async plugin => {
                        if (plugin && plugin.enabled) {
                            await manager.appPlugins.disablePlugin(plugin.id);
                            plugin.enabled = false;
                            manager.saveSettings();
                        }
                    });
                    Commands(app, manager);
                    setTimeout(() => { app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => { if (leaf.getDisplayText() == '插件不再活动') { leaf.detach(); } }); }, 10);
                }
            });
        });
    }
}

export default Commands