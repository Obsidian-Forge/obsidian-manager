import { App } from "obsidian";
import Manager from "./main";
import { ManagerModal } from "./modal/manager-modal";
import { t } from "./lang/inxdex";

const Commands = (app: App, manager: Manager) => {
    manager.addCommand({
        id: 'manager-view',
        name: t('命令_管理面板_描述'),
        callback: () => { new ManagerModal(app, manager).open() }
    });
}

export default Commands