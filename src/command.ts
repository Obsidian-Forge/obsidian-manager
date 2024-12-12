import { App } from "obsidian";
import I18N from "./main";
import { ManagerModal } from "./modal/manager-modal";
import { t } from "./lang/inxdex";

const Commands = (app: App, i18n: I18N) => {
    i18n.addCommand({
        id: 'i18n-translate',
        name: t('命令_管理面板_描述'),
        callback: () => { new ManagerModal(app, i18n).open() }
    });
}

export default Commands