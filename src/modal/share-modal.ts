import * as path from "path";
import {
    App,
    ButtonComponent,
    ExtraButtonComponent,
    Modal,
    Notice,
    SearchComponent,
    Setting,
    ToggleComponent,
} from "obsidian";

import { ManagerSettings } from "../settings/data";

import Manager from "main";

interface ExportPluginManifest {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    export: boolean;
}

interface ImportPluginManifest {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
}


// ==============================
//          侧边栏 对话框 翻译
// ==============================
export class ShareModal extends Modal {
    manager: Manager;
    settings: ManagerSettings;
    // this.app.plugins
    appPlugins;
    // this.app.settings
    appSetting;
    // [本地][变量] 导入插件列表
    importPlugins: ImportPluginManifest[] = [];
    // [本地][变量] 导出插件列表
    exportPlugins: ExportPluginManifest[] = [];

    // 搜索内容
    searchText = "";
    // 操作类型
    type = "";
    // 页尾
    footEl: HTMLDivElement;

    constructor(app: App, manager: Manager, plugins: (ImportPluginManifest | ExportPluginManifest)[], type: string) {
        super(app);
        // @ts-ignore
        this.appSetting = this.app.setting;
        // @ts-ignore
        this.appPlugins = this.app.plugins;
        this.manager = manager;
        this.settings = manager.settings;
        this.type = type;
        if (this.type == "export") {
            
        }
        // 自动分类插件类型
        plugins.forEach(plugin => { if (this.isImportPlugin(plugin)) { this.importPlugins.push(plugin); } else { this.exportPlugins.push(plugin); } });
    }

    public async showHead() {
        //@ts-ignore
        const modalEl: HTMLElement = this.contentEl.parentElement;
        modalEl.addClass("manager-container");
        // 靠上
        if (!this.settings.CENTER) modalEl.addClass("manager-container__top");
        modalEl.removeChild(modalEl.getElementsByClassName("modal-close-button")[0]);
        this.titleEl.parentElement?.addClass("manager-container__header");
        this.contentEl.addClass("manager-item-container");
        // 添加页尾
        this.footEl = document.createElement("div");
        this.footEl.addClass("manager-food");
        this.modalEl.appendChild(this.footEl);

        // [操作行]
        const actionBar = new Setting(this.titleEl).setClass("manager-bar__action").setName(this.manager.translator.t("通用_操作_文本") + '[导入]' + '[导出]');
        //  [操作行] 导入
        if (this.type == "export") {
            // [操作行] 导入
            const linkButton = new ButtonComponent(actionBar.controlEl);
            linkButton.setIcon("link");
            linkButton.setTooltip('导入插件');
            linkButton.onClick(() => {
            });
        }
        // [操作行] 导入
        const tutorialButton = new ButtonComponent(actionBar.controlEl);
        tutorialButton.setIcon("file-down");
        tutorialButton.setTooltip('导入插件');
        tutorialButton.onClick(() => {
            this.type = "import";
            this.reloadShowData();
        });

        // [操作行] 导出
        const githubButton = new ButtonComponent(actionBar.controlEl);
        githubButton.setIcon("file-up");
        githubButton.setTooltip('导出插件');
        githubButton.onClick(() => {
            actionBar.setName(this.manager.translator.t("通用_操作_文本"));
            this.type = "export";
            this.reloadShowData();
        });

        // [操作行] 关闭
        const closeButton = new ButtonComponent(actionBar.controlEl);
        closeButton.setIcon("x");
        closeButton.setTooltip('关闭');
        closeButton.onClick(() => {
            actionBar.setName(this.manager.translator.t("通用_操作_文本") + '[导出]');
            this.type = "export";
            this.reloadShowData();
        });
    }

    public async showData() {
        if (this.type == "export") {
            for (const plugin of this.exportPlugins) {
                const itemEl = new Setting(this.contentEl);
                itemEl.setClass("manager-item");
                itemEl.nameEl.addClass("manager-item__name-container");
                itemEl.descEl.addClass("manager-item__description-container");

                // [默认] 名称
                const title = createSpan({ text: plugin.name, cls: "manager-item__name-title", });
                itemEl.nameEl.appendChild(title);

                // [默认] 版本
                const version = createSpan({ text: `[${plugin.version}]`, cls: ["manager-item__name-version"], });
                itemEl.nameEl.appendChild(version);

                // [默认] 描述
                const desc = createDiv({ text: plugin.description, title: plugin.description, cls: ["manager-item__name-desc"], });
                itemEl.descEl.appendChild(desc);

                const shareToggle = new ToggleComponent(itemEl.controlEl);
                shareToggle.setValue(plugin.export);
                shareToggle.onChange((value) => {
                    plugin.export = !value;
                });
            }
            // 计算页尾
            this.footEl.innerHTML = `[${this.manager.translator.t("通用_总计_文本")}] ${this.exportPlugins.length} `;
        }
        if (this.type == "import") {
            for (const plugin of this.importPlugins) {
                const itemEl = new Setting(this.contentEl);
                itemEl.setClass("manager-item");
                itemEl.nameEl.addClass("manager-item__name-container");
                itemEl.descEl.addClass("manager-item__description-container");

                // [默认] 名称
                const title = createSpan({ text: plugin.name, cls: "manager-item__name-title", });
                itemEl.nameEl.appendChild(title);

                // [默认] 版本
                const version = createSpan({ text: `[${plugin.version}]`, cls: ["manager-item__name-version"], });
                itemEl.nameEl.appendChild(version);

                // [默认] 描述
                const desc = createDiv({ text: plugin.description, title: plugin.description, cls: ["manager-item__name-desc"], });
                itemEl.descEl.appendChild(desc);

                // [按钮] 下载插件
                const openPluginDirButton = new ExtraButtonComponent(itemEl.controlEl);
                openPluginDirButton.setIcon("download");
                openPluginDirButton.setTooltip('下载插件');
                openPluginDirButton.onClick(() => { window.open(`obsidian://BPM-plugin-install?id=${plugin.id}&enable=true&version=${plugin.version}`); });
            }
            // 计算页尾
            this.footEl.innerHTML = `[${this.manager.translator.t("通用_总计_文本")}] ${this.importPlugins.length} `;
        }
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
    }

    public async onClose() {
        this.contentEl.empty();
    }

    // 新增类型守卫
    private isImportPlugin(plugin: any): plugin is ImportPluginManifest {
        return 'installLink' in plugin; // 根据实际特征判断
    }

    private isExportPlugin(plugin: any): plugin is ExportPluginManifest {
        return 'enabled' in plugin; // 根据实际特征判断
    }
}
