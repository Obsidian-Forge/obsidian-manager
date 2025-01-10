import { App, PluginManifest } from "obsidian";
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

    const plugins: PluginManifest[] = Object.values(manager.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== manager.manifest.id) as PluginManifest[];
    plugins.forEach(plugin => {
        const mp = manager.settings.Plugins.find(mp => mp.id === plugin.id);
        if (mp) {
            const command = manager.addCommand({
                id: `manager-${mp.id}`,
                name: `${mp.name} ${mp.enabled ? '关闭' : '开启'}`,
                callback: async () => {
                    if (mp.enabled) {
                        mp.enabled = false;
                        manager.saveSettings();
                        await manager.appPlugins.disablePlugin(plugin.id);
                        command.name = `${mp.name} 开启`;
                    } else {
                        mp.enabled = true;
                        manager.saveSettings();
                        await manager.appPlugins.enablePlugin(plugin.id);
                        command.name = `${mp.name} 关闭`;
                    }
                }
            });
        }
    });

}

export default Commands